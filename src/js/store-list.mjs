/** Public store directory. Source: ppscreen-web/lib/types/store.ts and lib/suspension.ts. */
export const STORE_ENDPOINT = 'https://firestore.googleapis.com/v1/projects/ppscreen-d9a7d/databases/(default)/documents:runQuery';
export const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;
export const CACHE_KEY = 'playpark:store-directory:v1';
const RESERVE_URL = 'https://ppscreen.playpark.app/reserve';

// Explicit projection: never fetch owner/staff, door codes, device/IoT or customer data.
export function storeQuery() {
  return { structuredQuery: {
    from: [{ collectionId: 'stores' }],
    where: { fieldFilter: { field: { fieldPath: 'storeState' }, op: 'IN', value: { arrayValue: { values: ['운영중', '운영준비', '준비'].map(stringValue => ({ stringValue })) } } } },
    select: { fields: [
      'name', 'address', 'detailAddress', 'storeType', 'storeState', 'isDev', 'isDeleted',
      'operations.openHours', 'operations.openWeeks', 'operations.selfHours', 'operations.selfWeeks',
      'suspension.enabled', 'suspension.startAt', 'suspension.endAt'
    ].map(fieldPath => ({ fieldPath })) }
  } };
}

export function decodeValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('timestampValue' in value) return Date.parse(value.timestampValue);
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in value) return decodeFields(value.mapValue.fields || {});
  return null;
}
function decodeFields(fields) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}
export function decodeStores(rows) {
  if (!Array.isArray(rows) || rows.some(row => row.error)) throw new Error('Invalid store response');
  return rows.filter(row => row.document).map(({ document }) => ({
    ...decodeFields(document.fields || {}),
    storeId: document.name.split('/').pop()
  }));
}
export function visibleStores(stores, now = Date.now()) {
  return stores.filter(store => {
    const s = store.suspension;
    const suspended = s?.enabled && (s.startAt == null || now >= s.startAt) && (s.endAt == null || now < s.endAt);
    return ['운영중', '운영준비', '준비'].includes(store.storeState) && ['무인', '병행'].includes(store.storeType)
      && !store.isDev && !store.isDeleted && !suspended && typeof store.name === 'string' && store.name.trim();
  }).sort((a, b) => Number(b.storeState === '운영중') - Number(a.storeState === '운영중') || b.storeId.localeCompare(a.storeId, undefined, { numeric: true }));
}
const time = value => /^(?:[01]\d|2[0-3])[0-5]\d$|^2400$/.test(value) ? `${value.slice(0, 2)}:${value.slice(2)}` : null;
export function openHoursLabel(store) {
  const hours = store.operations?.openHours;
  if (!Array.isArray(hours) || hours.length !== 2 || !hours.every(value => typeof value === 'string' && time(value))) return '매장 문의';
  return hours[0] === '0000' && hours[1] === '2400' ? '24시간' : hours.map(time).join(' ~ ');
}
export function selfHoursLabel(store) {
  const hours = store.operations?.selfHours;
  if (!Array.isArray(hours) || !hours.length) return '예약 페이지 확인';
  const labels = hours.map(range => {
    if (typeof range !== 'string') return null;
    const parts = range.split('-');
    return parts.length === 2 && parts.every(time) ? parts.map(time).join(' ~ ') : null;
  });
  return labels.every(Boolean) ? labels.join(', ') : '예약 페이지 확인';
}
export function badgeLabel(store) {
  if (store.storeState !== '운영중') return '준비중';
  if (store.storeType === '병행') return '유·무인 병행';
  const o = store.operations;
  const allDays = ['월', '화', '수', '목', '금', '토', '일'].every(day => o?.openWeeks?.includes(day) && o?.selfWeeks?.includes(day));
  return openHoursLabel(store) === '24시간' && o?.selfHours?.includes('0000-2400') && allDays ? '24시간 무인' : '무인 매장';
}

export function renderStores(list, stores, doc = document) {
  function el(tag, className, text) {
    const node = doc.createElement(tag);
    node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const cards = stores.map(store => {
    const card = el('li', 'card-bezel');
    const preparing = store.storeState !== '운영중';
    const link = el(preparing ? 'div' : 'a', 'group card-bezel-inner flex h-full flex-col p-6');
    if (!preparing) {
      link.href = `${RESERVE_URL}?storeId=${encodeURIComponent(store.storeId)}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `${store.name} 예약하기 (새 창에서 열림)`);
    }
    const badge = el('span', `store-badge${store.storeType === '병행' ? ' store-badge-alt' : ''}`, badgeLabel(store));
    const address = [store.address, store.detailAddress].filter(value => typeof value === 'string' && value.trim()).join(' ');
    const specs = el('dl', 'store-spec');
    const details = preparing ? [['상태', '준비중'], ['예약', '오픈 후 예약 가능']] : [['영업', openHoursLabel(store)], ['무인', selfHoursLabel(store)]];
    for (const [label, value] of details) {
      const row = el('div', '');
      row.append(el('dt', '', label), el('dd', '', value));
      specs.append(row);
    }
    const cta = el('span', preparing ? 'mt-5 text-sm font-bold text-muted' : 'store-card-cta', preparing ? '오픈 준비중' : '예약하기');
    cta.setAttribute('aria-hidden', 'true');
    const icon = el('iconify-icon', '');
    icon.setAttribute('icon', 'solar:arrow-right-up-linear');
    if (!preparing) cta.append(icon);
    link.append(badge, el('h3', 'store-name', store.name), el('p', 'store-address', address || '주소는 예약 페이지에서 확인해 주세요.'), specs, cta);
    card.append(link);
    return card;
  });
  list.setAttribute('data-count', String(stores.length));
  list.replaceChildren(...cards);
}

// A fresh browser cache survives page reloads and tab changes for seven days.
export function readStoreCache(storage, now = Date.now()) {
  try {
    const cache = JSON.parse(storage?.getItem(CACHE_KEY) || 'null');
    if (!cache || cache.version !== 1 || !Number.isFinite(cache.fetchedAt)
      || cache.fetchedAt > now || now - cache.fetchedAt >= REFRESH_MS
      || !Array.isArray(cache.stores) || !cache.stores.every(store => store
        && typeof store.storeId === 'string' && typeof store.name === 'string')) return null;
    return cache;
  } catch {
    return null;
  }
}

export function startStoreDirectory(doc = document, win = window) {
  const list = doc.getElementById('store-list');
  if (!list) return;
  const status = doc.getElementById('store-list-status');
  const retry = doc.getElementById('store-list-retry');
  let pending = false;
  let cached = null;
  let timer;
  let storage;
  try { storage = win.localStorage; } catch { /* Private modes may deny storage access. */ }
  function show(stores) {
    const visible = visibleStores(stores);
    renderStores(list, visible, doc);
    status.textContent = visible.length
      ? '매장 정보는 주 1회 갱신됩니다. 준비중인 매장은 오픈 후 예약이 가능합니다.'
      : '현재 안내 가능한 무인매장이 없습니다. 예약 페이지에서 확인해 주세요.';
    retry.hidden = true;
    list.setAttribute('aria-busy', 'false');
  }
  function schedule(fetchedAt) {
    win.clearTimeout(timer);
    timer = win.setTimeout(refresh, Math.max(1, fetchedAt + REFRESH_MS - Date.now()));
  }
  async function refresh() {
    if (pending || doc.hidden) return;
    const persisted = readStoreCache(storage);
    if (persisted && (!cached || persisted.fetchedAt > cached.fetchedAt)) cached = persisted;
    if (cached && Date.now() >= cached.fetchedAt && Date.now() - cached.fetchedAt < REFRESH_MS) {
      show(cached.stores);
      schedule(cached.fetchedAt);
      return;
    }
    pending = true;
    list.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = win.setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await win.fetch(STORE_ENDPOINT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeQuery()), cache: 'no-store', credentials: 'omit', signal: controller.signal
      });
      if (!response.ok) throw new Error(`Store query failed: ${response.status}`);
      const stores = decodeStores(await response.json());
      cached = { version: 1, fetchedAt: Date.now(), stores };
      try { storage?.setItem(CACHE_KEY, JSON.stringify(cached)); } catch { /* Keep the in-memory cache. */ }
      show(stores);
      schedule(cached.fetchedAt);
    } catch {
      // Expired records must not be presented as current if the weekly refresh fails.
      list.replaceChildren();
      status.textContent = '매장 정보를 불러오지 못했습니다. 다시 시도하거나 예약 페이지에서 확인해 주세요.';
      retry.hidden = false;
    } finally {
      win.clearTimeout(timeout);
      list.setAttribute('aria-busy', 'false');
      pending = false;
    }
  }
  retry.addEventListener('click', refresh);
  doc.addEventListener('visibilitychange', refresh);
  win.addEventListener('online', refresh);
  win.addEventListener('pageshow', refresh);
  refresh();
  return refresh;
}
if (typeof document !== 'undefined') startStoreDirectory();
