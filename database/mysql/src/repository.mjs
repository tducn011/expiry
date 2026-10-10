import {randomUUID} from 'node:crypto';
import {connect} from './connection.mjs';
import {DomainError,uuid,milli,decimal,metadata,metadataFields,reason,allow,expected,preferences,invalid,localDay,attention,fingerprint} from './domain.mjs';

// Sandbox integration repository. HTTP authentication/provider and UI adapters are external.
export class InventoryRepository {
  constructor(database, {clock=()=>new Date(), hooks={}}={}) { this.database=database; this.clock=clock; this.hooks=hooks; }
  async hook(name,context) { await this.hooks[name]?.(context); }
  principal(owner) { if (!owner) throw new DomainError(401,'AUTH_REQUIRED'); return uuid(owner); }
  async execute(owner,key,operation,payload,work) {
    // InnoDB can deadlock while owner FK S locks become preference row X locks.
    // Failed attempts rollback every write/key, so bounded same-command retry is safe.
    for(let attempt=0;attempt<4;attempt++) {
      try { return await this.executeOnce(owner,key,operation,payload,work); }
      catch(error) {
        if(error.code!=='ER_LOCK_DEADLOCK' || attempt===3) throw error;
        await new Promise(resolve=>setTimeout(resolve,10*(attempt+1)));
      }
    }
  }
  async executeOnce(owner,key,operation,payload,work) {
    this.principal(owner);
    if (typeof key!=='string' || !/^[A-Za-z0-9_-]{8,100}$/.test(key)) invalid();
    const hash=fingerprint(payload), c=await connect(this.database);
    try {
      await c.beginTransaction();
      await this.hook('before_reserve',{c,operation});
      try {
        await c.execute('INSERT INTO api_requests(user_id,idempotency_key,operation,request_hash) VALUES (?,?,?,?)',[owner,key,operation,hash]);
      } catch(error) {
        if (error.code!=='ER_DUP_ENTRY') throw error;
        // Duplicate INSERT already waits for committed winner; saved results never mutate.
        // A locking read would upgrade duplicate-key shared locks and deadlock waiters.
        const [[old]]=await c.execute('SELECT operation,request_hash,response_status,response_body FROM api_requests WHERE user_id=? AND idempotency_key=?',[owner,key]);
        if (!old || old.operation!==operation || old.request_hash!==hash) throw new DomainError(409,'IDEMPOTENCY_KEY_REUSED');
        if (old.response_status===null) throw new DomainError(500,'INCOMPLETE_RESERVATION');
        await c.commit(); return {status:old.response_status,body:old.response_body,replayed:true};
      }
      await this.hook('after_reserve',{c,operation});
      const result=await work(c);
      await this.hook('after_domain',{c,operation});
      await c.execute('UPDATE api_requests SET response_status=?,response_body=CAST(? AS JSON) WHERE user_id=? AND idempotency_key=?',[result.status,JSON.stringify(result.body),owner,key]);
      await this.hook('after_result',{c,operation});
      await c.commit(); return {...result,replayed:false};
    } catch(error) { await c.rollback(); throw error; } finally { await c.end(); }
  }
  async locked(c,owner,id,includeDeleted=false) {
    const [[entry]]=await c.execute(`SELECT * FROM food_entries WHERE id=? AND user_id=? ${includeDeleted?'':'AND deleted_at IS NULL'} FOR UPDATE`,[id,owner]);
    if (!entry) throw new DomainError(404,'ENTRY_NOT_FOUND'); return entry;
  }
  version(entry,version) { if (entry.version!==version) throw new DomainError(409,'VERSION_CONFLICT'); }
  async entry(c,id) { const [[entry]]=await c.execute('SELECT * FROM food_entries WHERE id=?',[id]); return entry; }
  async create(owner,key,input) {
    allow(input,[...metadataFields,'quantity','unit']);
    if (!['piece','g','ml'].includes(input.unit)) invalid();
    const meta=metadata(input), quantity=decimal(milli(input.quantity,input.unit,true));
    const payload={...meta,quantity,unit:input.unit};
    return this.execute(owner,key,'create:food-entry',payload,async c=>{
      const id=randomUUID();
      await c.execute(`INSERT INTO food_entries(id,user_id,${metadataFields.join(',')},remaining_quantity,unit) VALUES (${Array(12).fill('?').join(',')})`,[id,owner,...metadataFields.map(k=>meta[k]),quantity,input.unit]);
      await this.hook('after_entry',{c,id});
      await c.execute("INSERT INTO stock_movements(id,entry_id,kind,quantity_before,quantity_after) VALUES (?,?,'initial',0,?)",[randomUUID(),id,quantity]);
      await this.hook('after_movement',{c,id});
      return {status:201,body:await this.entry(c,id)};
    });
  }
  async mutate(owner,key,id,input,mode) {
    uuid(id); expected(input?.expected_version);
    let payload;
    if (mode==='movement') {
      allow(input,['kind','amount','expected_version','reason']);
      if (!['consume','discard'].includes(input.kind)) invalid();
      payload={...input,amount:decimal(milli(input.amount,'g',true)),reason:reason(input.reason)};
    } else if (mode==='recount') {
      allow(input,['actual_quantity','reason','expected_version']);
      payload={...input,actual_quantity:decimal(milli(input.actual_quantity,'g')),reason:reason(input.reason,true)};
    } else if (mode==='edit') {
      allow(input,[...metadataFields,'expected_version']);
      if (Object.keys(input).length<2) invalid(); payload=input;
    } else {
      allow(input,['expected_version']); payload=input;
    }
    return this.execute(owner,key,`${mode}:${id}`,payload,async c=>{
      const entry=await this.locked(c,owner,id,['remove','restore'].includes(mode));
      this.version(entry,input.expected_version);
      if (mode==='remove' || mode==='restore') {
        if (mode==='remove' && entry.deleted_at!==null) throw new DomainError(409,'ENTRY_ALREADY_DELETED');
        if (mode==='restore' && entry.deleted_at===null) throw new DomainError(409,'ENTRY_NOT_DELETED');
        await c.execute(`UPDATE food_entries SET deleted_at=${mode==='remove'?'UTC_TIMESTAMP(6)':'NULL'},version=version+1,updated_at=UTC_TIMESTAMP(6) WHERE id=? AND user_id=?`,[id,owner]);
        return mode==='remove'?{status:204,body:null}:{status:200,body:await this.entry(c,id)};
      }
      if (mode==='edit') {
        const merged=metadata({...entry,...input});
        if (metadataFields.every(k=>merged[k]===entry[k])) return {status:200,body:entry};
        await c.execute(`UPDATE food_entries SET ${metadataFields.map(k=>`${k}=?`).join(',')},version=version+1,updated_at=UTC_TIMESTAMP(6) WHERE id=? AND user_id=?`,[...metadataFields.map(k=>merged[k]),id,owner]);
        return {status:200,body:await this.entry(c,id)};
      }
      const before=milli(entry.remaining_quantity,entry.unit);
      const qty=milli(mode==='movement'?payload.amount:payload.actual_quantity,entry.unit,mode==='movement');
      if (mode==='movement' && qty>before) throw new DomainError(409,'INSUFFICIENT_QUANTITY');
      const after=mode==='movement'?before-qty:qty;
      if (before===after) return {status:200,body:{entry,movement:null,changed:false}};
      await c.execute('UPDATE food_entries SET remaining_quantity=?,version=version+1,updated_at=UTC_TIMESTAMP(6) WHERE id=? AND user_id=?',[decimal(after),id,owner]);
      await this.hook('after_quantity',{c,id});
      const movement={id:randomUUID(),entry_id:id,kind:mode==='movement'?payload.kind:'adjustment',quantity_before:decimal(before),quantity_after:decimal(after),reason:payload.reason};
      await c.execute('INSERT INTO stock_movements(id,entry_id,kind,quantity_before,quantity_after,reason) VALUES (?,?,?,?,?,?)',Object.values(movement));
      await this.hook('after_movement',{c,id});
      const [[saved]]=await c.execute('SELECT id,entry_id,kind,quantity_before,quantity_after,reason,recorded_at FROM stock_movements WHERE id=?',[movement.id]);
      return {status:201,body:{entry:await this.entry(c,id),movement:saved,changed:true}};
    });
  }
  consume(owner,key,id,input) { return this.mutate(owner,key,id,input,'movement'); }
  recount(owner,key,id,input) { return this.mutate(owner,key,id,input,'recount'); }
  edit(owner,key,id,input) { return this.mutate(owner,key,id,input,'edit'); }
  remove(owner,key,id,input) { return this.mutate(owner,key,id,input,'remove'); }
  restore(owner,key,id,input) { return this.mutate(owner,key,id,input,'restore'); }
  async get(owner,id,history=false) {
    this.principal(owner); uuid(id); const c=await connect(this.database);
    try {
      const [[entry]]=await c.execute(`SELECT * FROM food_entries WHERE id=? AND user_id=? ${history?'':'AND deleted_at IS NULL'}`,[id,owner]);
      if (!entry) throw new DomainError(404,'ENTRY_NOT_FOUND');
      if (!history) return entry;
      const [events]=await c.execute('SELECT id,entry_id,kind,quantity_before,quantity_after,reason,recorded_at FROM stock_movements WHERE entry_id=? ORDER BY recorded_at DESC,id',[id]); return events;
    } finally { await c.end(); }
  }
  async setPreferences(owner,key,input) {
    allow(input,['timezone','attention_lead_days','expected_version']); expected(input.expected_version);
    if (Object.keys(input).length<2) invalid();
    return this.execute(owner,key,'preferences:me',input,async c=>{
      const [[user]]=await c.execute('SELECT * FROM users WHERE id=? FOR UPDATE',[owner]);
      if (!user) throw new DomainError(401,'AUTH_REQUIRED'); this.version(user,input.expected_version);
      const updated=preferences({...user,...input});
      if (user.timezone===updated.timezone && user.attention_lead_days===updated.attention_lead_days) return {status:200,body:{...updated,version:user.version}};
      await c.execute('UPDATE users SET timezone=?,attention_lead_days=?,version=version+1,updated_at=UTC_TIMESTAMP(6) WHERE id=?',[updated.timezone,updated.attention_lead_days,owner]);
      return {status:200,body:{...updated,version:user.version+1}};
    });
  }
  async list(owner,query={},explain=false) {
    this.principal(owner);
    allow(query,['view','lifecycle','attention','page','limit','q','location']);
    const {view='inventory',lifecycle='active',attention:filter,page=1,limit=20,q='',location}=query;
    if (!['inventory','attention','trash'].includes(view) || !['active','depleted','all'].includes(lifecycle) || !Number.isSafeInteger(page) || page<1 || !Number.isSafeInteger(limit) || limit<1 || limit>100 || typeof q!=='string' || q.length>200 || location!==undefined && (typeof location!=='string' || location.length>100) || view==='attention' && lifecycle!=='active' || filter && !['past_date','due_today','soon','unknown','later'].includes(filter)) invalid();
    const c=await connect(this.database);
    try {
      const [[user]]=await c.execute('SELECT timezone,attention_lead_days FROM users WHERE id=?',[owner]);
      if (!user) throw new DomainError(401,'AUTH_REQUIRED');
      const instant=this.clock();
      const day=localDay(instant,user.timezone);
      let where=`user_id=? AND deleted_at IS ${view==='trash'?'NOT ':''}NULL`;
      const args=[day,day,user.attention_lead_days,owner];
      if(view!=='trash' && lifecycle!=='all') where+=` AND remaining_quantity ${lifecycle==='active'?'>':'='} 0`;
      if(q) { where+=" AND name LIKE ? ESCAPE '!'"; args.push('%'+q.replace(/[!%_]/g,c=>'!'+c)+'%'); }
      if(location!==undefined) { where+=' AND storage_location=?'; args.push(location); }
      const cte=`WITH classified AS (SELECT *,CASE WHEN expiry_date IS NULL THEN 'unknown' WHEN expiry_date<? THEN 'past_date' WHEN expiry_date=? THEN 'due_today' WHEN DATEDIFF(expiry_date,?)<=? THEN 'soon' ELSE 'later' END AS attention_status FROM food_entries WHERE ${where})`;
      args.splice(2,0,day);
      const outer=filter?' WHERE attention_status=?':'';
      if(filter) args.push(filter);
      const order=view==='trash'?'deleted_at DESC,id':"CASE attention_status WHEN 'past_date' THEN 0 WHEN 'due_today' THEN 1 WHEN 'soon' THEN 2 WHEN 'unknown' THEN 3 ELSE 4 END,expiry_date IS NULL,expiry_date,created_at,id";
      const sql=`${cte} SELECT * FROM classified${outer} ORDER BY ${order} LIMIT ? OFFSET ?`;
      const paged=[...args,limit,(page-1)*limit];
      if(explain) { const [plan]=await c.query('EXPLAIN FORMAT=JSON '+sql,paged); return {sql,parameters:paged,plan}; }
      const [[{total}]]=await c.query(`${cte} SELECT COUNT(*) total FROM classified${outer}`,args);
      const [items]=await c.query(sql,paged);
      return {items:items.map(({attention_status,...entry})=>({...entry,lifecycle:milli(entry.remaining_quantity,entry.unit)===0n?'depleted':'active',attention:attention(entry,user,instant)})),total:Number(total),page,limit,as_of_date:day};
    } finally { await c.end(); }
  }
}
