import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const host = `import { createState, normalizeMemory, assignMessageToAct } from '/core.js';
const state = createState();
const memory = (id,title,content,storyTime) => normalizeMemory({ id,title,content,storyTime,category:'event',importance:4 });
state.memories = [memory('a','北海道约定','两人承诺周末一起去北海道旅游。','2026-09-01'),memory('b','北海道旅行','周末两人一起去了北海道。','2026-09-06'),memory('c','共同出游','两人一起去了北海道。','周末')];
const chat = [{name:'玩家',is_user:true,mes:'还记得北海道的旅行吗？',extra:{}},{name:'林',mes:'我们在那里一起散步。',extra:{}},{name:'玩家',is_user:true,mes:'周末还想再一起出门。',extra:{}}];
chat.forEach((message,index)=>assignMessageToAct(state,message,1,index));
const storage = new Map(); const saved = localStorage.getItem('scene_diary_v032_synthetic_preview');
export const context = { chatId:'synthetic-preview',chat,chatMetadata:{scene_diary:saved ? JSON.parse(saved) : state},mainApi:'openai',name1:'玩家',name2:'林',characterId:0,characters:[{name:'林',chat:'synthetic-preview',avatar:'fake.png'}],accountStorage:{getItem:key=>storage.get(key),setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)},getCharacterCardFields:()=>({description:'合成测试角色'}) };
context.saveMetadata = async()=>localStorage.setItem('scene_diary_v032_synthetic_preview',JSON.stringify(context.chatMetadata.scene_diary));
context.generateRawData = async input => {
const name=input.jsonSchema?.name;
if(name?.endsWith('_maintenance')) return {operations:[{action:'merge',memberIds:['b','c'],targetId:'b',title:'北海道旅行',content:'周末两人一起去了北海道。',category:'event',a:null,b:null,reason:'同一次已发生的旅行'},{action:'link',memberIds:[],targetId:null,title:null,content:null,category:null,a:'a',b:'b',reason:'约定得以兑现'}]};
if(name?.endsWith('_diary')) return {title:'旅行回忆',diary:'今天我们聊起了共同旅行的记忆。'};
if(name?.endsWith('_growth')) return {characterGrowth:'两人愿意一起安排周末活动。'};
return {memories:[{category:'preference',title:'周末出游意向',content:'玩家表达了周末想一起出门的意愿。',people:['玩家'],aliases:[],importance:3,storyTime:null}]}; };
const recovery=new Map();globalThis.SillyTavern={libs:{localforage:{getItem:async key=>recovery.get(key),setItem:async(key,value)=>recovery.set(key,value),removeItem:async key=>recovery.delete(key)}}};
globalThis.fetch=async()=>({ok:true,json:async()=>[{chat_metadata:{scene_diary:JSON.parse(localStorage.getItem('scene_diary_v032_synthetic_preview'))}},...chat]});
globalThis.toastr=Object.fromEntries(['success','error','warning','info'].map(type=>[type,message=>{const notice=document.createElement('p');notice.textContent=type+': '+message;document.querySelector('#notices').prepend(notice);} ]));
`;
const html = `<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>scene&diary v0.3.2 合成数据预览</title><link rel="stylesheet" href="/style.css"><style>body{background:#141c26;color:#eee;font:16px sans-serif;padding:18px}#send_form{margin-top:12px}#notices{font-size:13px}button{min-height:44px}*{box-sizing:border-box}</style><h2>v0.3.2 合成测试预览</h2><p>所有数据和模型响应均为本预览内的合成素材。</p><button onclick="localStorage.removeItem('scene_diary_v032_synthetic_preview');location.reload()">重置合成数据</button><form id="send_form"></form><div id="notices"></div><script type="module">import '/index-preview.js';</script></html>`;
const allowed = new Set(['core.js','memory-system.js','semantic.js','backup.js','model-protocol.js','style.css']);
const server = createServer(async (req,res) => {
try {
const path = new URL(req.url,'http://localhost').pathname.slice(1);
if(path==='mobile'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><meta charset="utf-8"><title>390px 窄屏合成预览</title><body style="background:#111"><iframe title="390px preview" src="/" style="width:390px;height:844px;border:1px solid #ccc"></iframe>');return;}
if(!path){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html);return;}
if(path==='host-context.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(host);return;}
if(path==='index-preview.js'){
let code=await readFile(new URL('index.js',root),'utf8');
code=code.replace(/^import .* from '\.\.\/\.\.\/\.\.\/\.\.\/script.js';/m,'const extension_prompt_roles={SYSTEM:0},extension_prompt_types={NONE:0,IN_CHAT:1};const setExtensionPrompt=()=>{};');
code=code.replace(/^import .* from '\.\.\/\.\.\/\.\.\/st-context.js';/m,"import {context} from '/host-context.js'; const getContext=()=>context;");res.setHeader('Content-Type','text/javascript; charset=utf-8');res.end(code);return;}
if(!allowed.has(path)){res.statusCode=404;res.end('Not found');return;}
res.setHeader('Content-Type',path.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8');res.end(await readFile(new URL(path,root),'utf8'));
}catch(error){res.statusCode=500;res.end(error.message);}
});
server.listen(8765,'127.0.0.1',()=>console.log('Synthetic preview: http://127.0.0.1:8765 (mobile: /mobile)'));
