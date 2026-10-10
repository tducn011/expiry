#!/usr/bin/env node
/** Parse architecture Mermaid diagrams using an explicitly supplied temporary dependency directory. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const args=process.argv.slice(2);
const modules=args.find(a=>!a.startsWith('--'));
if(!modules){
 process.stderr.write('Usage: node docs/architecture/scripts/check_diagrams.mjs /absolute/path/to/node_modules [--include-legacy]\n');
 process.exit(2);
}
const packageRoot=path.resolve(modules);
const {JSDOM}=await import(pathToFileURL(path.join(packageRoot,'jsdom/lib/api.js')).href);
const dom=new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window=dom.window;globalThis.document=dom.window.document;
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {default:mermaid}=await import(pathToFileURL(path.join(packageRoot,'mermaid/dist/mermaid.esm.mjs')).href);
mermaid.initialize({startOnLoad:false,securityLevel:'strict'});
const docsRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repoRoot=path.resolve(docsRoot,'../..');
const diagrams=[];
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){
 const p=path.join(dir,item.name);
 if(item.isDirectory()&&item.name!=='__pycache__')walk(p);
 else if(item.isFile()&&p.endsWith('.md')){
  const text=fs.readFileSync(p,'utf8');let index=0;
  for(const match of text.matchAll(/```mermaid\n([\s\S]*?)\n```/g))diagrams.push({file:path.relative(repoRoot,p),index:++index,source:match[1]});
 }
}}
walk(docsRoot);
if(args.includes('--include-legacy')){
 const old=path.join(repoRoot,'Expiry_System_Design_2026-10-08/diagrams');
 for(const file of fs.readdirSync(old).filter(p=>p.endsWith('.mmd')))diagrams.push({file:path.relative(repoRoot,path.join(old,file)),index:1,source:fs.readFileSync(path.join(old,file),'utf8')});
}
const results=[];
for(const diagram of diagrams){try{await mermaid.parse(diagram.source);results.push({file:diagram.file,index:diagram.index,status:'PASS'});}catch(error){results.push({file:diagram.file,index:diagram.index,status:'FAIL',error:String(error)});}}
const version=JSON.parse(fs.readFileSync(path.join(packageRoot,'mermaid/package.json'),'utf8')).version;
const report={version,total:results.length,passed:results.filter(r=>r.status==='PASS').length,results,limits:'Syntax parse only; no visual rendering, full UML/DFD semantics or PlantUML grammar validation.'};
process.stdout.write(JSON.stringify(report,null,2)+'\n');
process.exitCode=report.passed===report.total?0:1;
