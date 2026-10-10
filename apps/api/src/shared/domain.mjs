import { createHash } from 'node:crypto';
export class DomainError extends Error {
  constructor(status, code) { super(code); this.status=status; this.code=code; }
}
export const invalid = () => { throw new DomainError(422,'VALIDATION_ERROR'); };
export const uuid = value => {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)) invalid();
  return value;
};
export function milli(value, unit, positive=false) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,8})(\.\d{1,3})?$/.test(value)) invalid();
  const [whole,fraction=''] = value.split('.');
  const amount = BigInt(whole)*1000n + BigInt(fraction.padEnd(3,'0'));
  if (positive && amount===0n || unit==='piece' && amount%1000n!==0n) invalid();
  return amount;
}
export const decimal = value => `${value/1000n}.${String(value%1000n).padStart(3,'0')}`;
export function date(value) {
  if (value===null) return null;
  if (typeof value!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value<'1000-01-01' || value>'9999-12-31') invalid();
  const parsed=new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10)!==value) invalid();
  return value;
}
function text(value, max, nullable=false) {
  if (nullable && value===null) return null;
  if (typeof value!=='string' || [...value].length>max || !nullable && value.trim().length===0) invalid();
  return value;
}
export const metadataFields=['name','storage_location','expiry_date','date_certainty','date_source','date_label_type','opened_on','note'];
export function metadata(value) {
  const m={name:value.name,storage_location:value.storage_location===undefined?'unspecified':value.storage_location,expiry_date:value.expiry_date??null,date_certainty:value.date_certainty===undefined?'unknown':value.date_certainty,date_source:value.date_source===undefined?'unknown':value.date_source,date_label_type:value.date_label_type===undefined?'unspecified':value.date_label_type,opened_on:value.opened_on??null,note:value.note??null};
  m.name=text(m.name,200).trim(); m.storage_location=text(m.storage_location,100).trim(); text(m.note,1000,true); date(m.expiry_date); date(m.opened_on);
  if (!['known','estimated','unknown'].includes(m.date_certainty) || !['printed_label','user_entered','user_estimate','unknown'].includes(m.date_source) || !['use_by','best_before','unspecified'].includes(m.date_label_type)) invalid();
  if (m.date_certainty==='unknown' && (m.expiry_date!==null || m.date_source!=='unknown' || m.date_label_type!=='unspecified')) invalid();
  if (m.date_certainty==='estimated' && (m.expiry_date===null || m.date_source!=='user_estimate')) invalid();
  if (m.date_certainty==='known' && (m.expiry_date===null || !['printed_label','user_entered'].includes(m.date_source))) invalid();
  return m;
}
export function reason(value, required=false) {
  if (value==null && !required) return null;
  text(value,500,true); if (required && (value===null || !value.trim())) invalid(); return value;
}
export function allow(value, keys) {
  if (!value || Object.getPrototypeOf(value)!==Object.prototype || Object.keys(value).some(k=>!keys.includes(k))) invalid();
}
export function expected(value) { if (!Number.isSafeInteger(value) || value<1 || value>2147483647) invalid(); return value; }
export function preferences(value) {
  if (typeof value.timezone!=='string') invalid();
  try { new Intl.DateTimeFormat('en-US',{timeZone:value.timezone}); } catch { invalid(); }
  if (!Number.isInteger(value.attention_lead_days) || value.attention_lead_days<0 || value.attention_lead_days>30) invalid();
  return {timezone:value.timezone,attention_lead_days:value.attention_lead_days};
}
export function localDay(instant,timezone) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(instant));
  const p=Object.fromEntries(parts.map(p=>[p.type,p.value])); return `${p.year}-${p.month}-${p.day}`;
}
export function attention(entry,user,instant) {
  const as_of_date=localDay(instant,user.timezone);
  if (entry.deleted_at!==null || milli(entry.remaining_quantity,entry.unit)===0n) return null;
  const delta=entry.expiry_date===null ? null : Math.round((Date.parse(`${entry.expiry_date}T00:00:00Z`)-Date.parse(`${as_of_date}T00:00:00Z`))/86400000);
  const status=delta===null?'unknown':delta<0?'past_date':delta===0?'due_today':delta<=user.attention_lead_days?'soon':'later';
  return {status,as_of_date,reason_code:`RECORDED_DATE_${status.toUpperCase()}`};
}
export function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
  return value;
}
export const fingerprint=value=>createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
