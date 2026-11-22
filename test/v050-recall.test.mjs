import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, fact, diary } from '../state-v8.js';
import { queryFor, createRetrieval, continuity } from '../recall-v8.js';

test('depth anchors on the user even when regenerating an existing answer', () => {
    const {settings} = newState();
    const rows = ['前问','前答','当前','待重生成'].map((mes,i)=>({mes,is_user:i%2===0,name:i%2?'乙':'甲'}));
    rows.splice(2,0,{is_system:true,mes:'系统'});
    for (const [d,expected] of ['甲: 当前','乙: 前答\n\n甲: 当前','甲: 前问\n\n乙: 前答\n\n甲: 当前'].entries()) {
        assert.equal(queryFor(rows,{...settings,queryDepth:d}).text, expected);
    }
    assert.equal(queryFor(rows.slice(0,1),settings).text,'甲: 前问');
});

test('hybrid pool, independent fallbacks and 80/20 weighting', async t => {
    const state = newState();
    Object.assign(state.settings, {retrievalCount:37,candidateCount:40,recallScoreThreshold:0});
    Object.assign(state.settings.semantic,{enabled:true,endpoint:'https://example.test/embed',model:'e',rerank:true,rerankEndpoint:'https://example.test/rank',rerankModel:'r'});
    state.memories = Array.from({length:45},(_,i)=>fact({id:'m'+i,title:'标题',content:'针线 '+i,importance:5}));
    const pinned = fact({id:'p',title:'常驻',content:'绝对不能送入检索',permanent:true});
    state.memories.push(pinned);
    const requests = []; let failVectors = false, failRank = false;
    t.mock.method(globalThis,'fetch',async (url,init)=>{
        const body=JSON.parse(init.body); requests.push(body);
        if(url.endsWith('/embed')) return failVectors ? new Response('offline',{status:503}) : Response.json({data:body.input.map((_,index)=>({index,embedding:[1,0]}))});
        return failRank ? new Response('offline',{status:503}) : Response.json({results:body.documents.map((_,index)=>({index,relevance_score:.5}))});
    });
    const scope = {account:'test',chat:'test',store:{getJson:async()=>({}),setJson:async()=>{}}};
    const traces = [];
    const rank = createRetrieval(state,scope,entry=>traces.push(entry));
    const first = await rank(state.memories,'针线');
    assert.equal(first.length,37); assert.equal(new Set(first.map(x=>x.memory.id)).size,37);
    assert.equal(first[0].score,.6);
    assert.equal(requests.at(-1).documents.length,37);
    assert(!JSON.stringify(requests).includes(pinned.content));
    failVectors=true;
    assert.equal((await rank(state.memories,'针线'))[0].score,.6);
    assert(traces.some(row=>row.stage==='向量检索' && row.status==='warning'));
    failRank=true;
    assert((await rank(state.memories,'针线')).length>0);
    assert(traces.some(row=>row.stage==='重排' && row.status==='warning'));
    failVectors=false;
    assert((await rank(state.memories,'针线')).length>0);
});

test('strict threshold after top-r; unlimited pinned entries and entire recent diaries', async () => {
    const state = newState();
    const points = [1,2,3,4].map(i=>fact({id:'m'+i,title:'标题',content:'记忆'+i,permanent:i<3}));
    state.memories=points; state.settings.candidateCount=1; state.settings.recallScoreThreshold=.5;
    state.diaries=[1,2,3].map(n=>diary({body:'日记'+n,createdAt:n})); state.diaries[2].needsReview=true;
    const rank=async corpus=>{assert.deepEqual(corpus.map(x=>x.id),['m3','m4']);return [{memory:points[2],score:.5},{memory:points[3],score:.4}];};
    const injected=await continuity(state,'查询',rank,()=>{});
    assert.match(injected,/日记1[\s\S]*日记2[\s\S]*记忆1[\s\S]*记忆2/); assert.doesNotMatch(injected,/记忆3|记忆4|日记3/);
    for (const field of ['retrievalCount','candidateCount']) {
        const saved = state.settings[field]; state.settings[field]=0;
        assert.match(await continuity(state,'查询',()=>assert.fail('disabled recall'),()=>{}),/记忆2/);
        state.settings[field]=saved;
    }
});
