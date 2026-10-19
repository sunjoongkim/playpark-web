import test from 'node:test';
import assert from 'node:assert/strict';
import { storeQuery, decodeStores, visibleStores, badgeLabel, openHoursLabel, selfHoursLabel, readStoreCache, REFRESH_MS, CACHE_KEY } from '../src/js/store-list.mjs';
const store = overrides => ({ storeId: 'PS003', name: '운영 매장', storeState: '운영중', storeType: '무인', ...overrides });

test('Operating unmanned/hybrid stores appear; exclude dev, deleted, closed and staffed records', () => {
  const rows = [store(), store({storeId:'PS005', storeType:'병행'}), store({isDev:true}), store({isDeleted:true}),
    ...['휴업','폐업',undefined].map(storeState => store({storeState})),
    store({storeType:'유인'}), store({storeType:undefined}), store({name:'  '})];
  assert.deepEqual(visibleStores(rows).map(s => s.storeId), ['PS005','PS003']);
});
test('Suspension follows [start, end), including open-ended intervals', () => {
  const record = store({suspension:{enabled:true,startAt:100,endAt:200}});
  assert.equal(visibleStores([record],99).length,1);
  assert.equal(visibleStores([record],100).length,0);
  assert.equal(visibleStores([record],199).length,0);
  assert.equal(visibleStores([record],200).length,1);
  assert.equal(visibleStores([store({suspension:{enabled:true}})],150).length,0);
  assert.equal(visibleStores([store({suspension:{enabled:false,startAt:100,endAt:200}})],150).length,1);
});
test('Firestore projection excludes private fields and targets the actual operating state', () => {
  const query = storeQuery().structuredQuery;
  assert.deepEqual(query.where.fieldFilter.value.arrayValue.values.map(v=>v.stringValue),['운영중','운영준비','준비']);
  assert.equal(query.from[0].collectionId,'stores');
  assert.deepEqual(query.select.fields.map(f=>f.fieldPath), [
    'name','address','detailAddress','storeType','storeState','isDev','isDeleted',
    'operations.openHours','operations.openWeeks','operations.selfHours','operations.selfWeeks',
    'suspension.enabled','suspension.startAt','suspension.endAt'
  ]);
});
test('Firestore REST decoding supports missing/empty fields, timestamps and rejects API errors', () => {
  const rows = [{document:{name:'projects/p/databases/(default)/documents/stores/PS003',fields:{
    name:{stringValue:'장안점'}, isDev:{booleanValue:false},
    operations:{mapValue:{fields:{openHours:{arrayValue:{values:[{stringValue:'0000'},{stringValue:'2400'}]}},selfHours:{arrayValue:{}}}}},
    suspension:{mapValue:{fields:{enabled:{booleanValue:true}, startAt:{nullValue:null},endAt:{timestampValue:'2026-10-19T00:00:00Z'}}}}
  }}},{readTime:'now'}];
  const result = decodeStores(rows)[0];
  assert.equal(result.storeId,'PS003'); assert.equal(result.isDev,false);
  assert.deepEqual(result.operations.selfHours,[]);
  assert.equal(result.suspension.startAt,null);
  assert.equal(result.suspension.endAt,Date.parse('2026-10-19T00:00:00Z'));
  assert.deepEqual(decodeStores([{readTime:'now'}]),[]);
  assert.throws(()=>decodeStores([{error:{message:'denied'}}]));
  assert.throws(()=>decodeStores({error:{message:'denied'}}));
});
test('Labels do not invent 24-hour/night-only claims or unregistered hours', () => {
  assert.equal(openHoursLabel(store()),'매장 문의');
  assert.equal(selfHoursLabel(store()),'예약 페이지 확인');
  assert.equal(badgeLabel(store({storeType:'병행'})),'유·무인 병행');
  const operations={openHours:['0000','2400'],selfHours:['0000-2400'],openWeeks:['월','화','수','목','금','토','일'],selfWeeks:['월','화','수','목','금','토','일']};
  assert.equal(badgeLabel(store({operations})),'24시간 무인');
  assert.equal(badgeLabel(store({operations:{...operations,selfWeeks:['월']}})),'무인 매장');
  assert.equal(openHoursLabel(store({operations:{openHours:['0900','2200']}})),'09:00 ~ 22:00');
  assert.equal(selfHoursLabel(store({operations:{selfHours:['0800-1000','1900-2200']}})),'08:00 ~ 10:00, 19:00 ~ 22:00');
  assert.equal(selfHoursLabel(store({operations:{selfHours:['invalid']}})),'예약 페이지 확인');
});

test('Preparing stores stay visible with a preparing badge and become reservable after opening', () => {
  const dangoo = store({storeId:'PS005',name:'아쿠아랜드(MyPark단구)',storeType:'병행',storeState:'운영준비'});
  assert.equal(visibleStores([dangoo]).length,1);
  assert.equal(badgeLabel(dangoo),'준비중');
  assert.equal(badgeLabel({...dangoo,storeState:'운영중'}),'유·무인 병행');
  assert.equal(visibleStores([{...dangoo,isDev:true}]).length,0);
});
test('Operating stores precede preparing stores regardless of document ID', () => {
  assert.deepEqual(visibleStores([store({storeId:'PS005',storeState:'운영준비'}),store()]).map(s=>s.storeId),['PS003','PS005']);
});

test('Weekly cache is reused before seven days and expires at the exact boundary', () => {
  assert.equal(REFRESH_MS, 604800000);
  const fetchedAt = 1000;
  const cache = {version:1,fetchedAt,stores:[store()]};
  const storage = {getItem:key => { assert.equal(key,CACHE_KEY); return JSON.stringify(cache); }};
  assert.deepEqual(readStoreCache(storage,fetchedAt),cache);
  assert.deepEqual(readStoreCache(storage,fetchedAt+REFRESH_MS-1),cache);
  assert.equal(readStoreCache(storage,fetchedAt+REFRESH_MS),null);
  assert.equal(readStoreCache(storage,fetchedAt-1),null);
});
test('Blocked or corrupt storage falls back to a network query; empty successful caches are valid', () => {
  assert.equal(readStoreCache({getItem(){throw new Error('blocked');}}),null);
  for (const raw of ['{','null',JSON.stringify({version:1,fetchedAt:1000,stores:[{}]}),
    JSON.stringify({version:2,fetchedAt:1000,stores:[]}),JSON.stringify({version:1,fetchedAt:'1000',stores:[]})]) {
    assert.equal(readStoreCache({getItem:()=>raw},1000),null);
  }
  assert.deepEqual(readStoreCache({getItem:()=>JSON.stringify({version:1,fetchedAt:1000,stores:[]})},1000).stores,[]);
});
