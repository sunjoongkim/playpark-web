import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'data', 'guide-videos.json'), 'utf8'));
const htmlPath = join(root, 'pages', 'guide.html');
let html = readFileSync(htmlPath, 'utf8');

if (data.length !== 47 || data.some((video, index) => video.episode !== index + 1)) {
  throw new Error('안내 영상은 EP01–EP47이 빠짐없이 순서대로 있어야 합니다.');
}
if (data.some((video) => !/^[A-Za-z0-9_-]{11}$/.test(video.videoId))) {
  throw new Error('잘못된 YouTube 영상 ID가 있습니다.');
}
if (new Set(data.map((video) => video.videoId)).size !== data.length) {
  throw new Error('중복된 YouTube 영상 ID가 있습니다.');
}
if (data.some((video) => !existsSync(join(root, 'assets', 'images', 'guide', video.thumbnail)))) {
  throw new Error('준비 썸네일 WebP가 누락되었습니다.');
}

const escape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');
function card(video) {
  const episode = `EP${String(video.episode).padStart(2, '0')}`;
  const title = escape(video.title);
  const summary = escape(video.steps.slice(0, 2).join(' · '));
  const search = escape([episode, `EP${video.episode}`, video.episode, video.title, ...video.steps].join(' '));
  const image = `../assets/images/guide/${escape(video.thumbnail)}`;
  const inner = `
          <span class="guide-card__image-wrap">
            <img src="${image}" alt="" width="480" height="853" loading="lazy" decoding="async" class="guide-card__image" />
            <span class="guide-card__number">${episode}</span>
          </span>
          <span class="guide-card__body">
            <span class="guide-card__eyebrow">플레이파크 2.0 사용 설명</span>
            <strong class="guide-card__title">${title}</strong>
            <span class="guide-card__summary">${summary}</span>
            <span class="guide-card__action">${video.published === false ? '공개 준비 중' : '영상 보기 <span aria-hidden="true">↗</span>'}</span>
          </span>`;
  if (video.published === false) {
    return `        <button class="guide-card guide-card--pending" type="button" disabled data-guide-item data-guide-search="${search}" data-video-id="${video.videoId}" data-pending-video aria-label="${episode} ${title} 공개 준비 중">${inner}
        </button>`;
  }
  return `        <a class="guide-card" href="https://youtube.com/shorts/${video.videoId}" target="_blank" rel="noopener noreferrer" data-guide-item data-guide-search="${search}" data-video-id="${video.videoId}" aria-label="${episode} ${title} 영상 보기">${inner}
        </a>`;
}

const section = `    <!-- GUIDE_VIDEOS_START: data/guide-videos.json에서 생성. npm run build:guide -->
    <section id="app-manual" class="guide-section" aria-labelledby="manual-title">
      <div class="guide-container">
        <div class="guide-intro">
          <span class="guide-eyebrow">플레이파크 2.0 사용 설명</span>
          <h2 id="manual-title">새 영상으로 차근차근 따라 해보세요</h2>
          <p>홈 화면부터 경기 기록, 동호회와 커뮤니티까지. 필요한 사용법을 골라 보세요.</p>
        </div>
        <div class="guide-toolbar">
          <div class="guide-search-wrap">
            <label for="guideSearch">영상 찾기</label>
            <input id="guideSearch" type="search" autocomplete="off" placeholder="예: 스코어, 동호회, EP24" aria-describedby="guideResultCount" />
          </div>
          <a class="guide-playlist" href="https://www.youtube.com/playlist?list=PLKzPdEpjVhekKJzsrL_0VkjC2Gj1pSzVg" target="_blank" rel="noopener noreferrer">전체 재생목록 보기 <span aria-hidden="true">↗</span></a>
        </div>
        <p id="guideResultCount" class="guide-result" aria-live="polite">영상 목록</p>
        <div class="guide-grid">
${data.map(card).join('\n')}
        </div>
        <p id="guideEmpty" class="guide-empty" hidden>찾는 영상이 없습니다. 다른 단어로 검색해 보세요.</p>
      </div>
    </section>
    <!-- GUIDE_VIDEOS_END -->`;

const newStart = html.indexOf('    <!-- GUIDE_VIDEOS_START');
const newEnd = html.indexOf('    <!-- GUIDE_VIDEOS_END -->');
if (newStart !== -1 && newEnd !== -1) {
  html = html.slice(0, newStart) + section + html.slice(newEnd + '    <!-- GUIDE_VIDEOS_END -->'.length);
} else {
  const oldStart = html.indexOf('    <!-- ===== 플팍이와 함께');
  const oldEnd = html.indexOf('    <!-- ===== FAQ ===== -->');
  if (oldStart === -1 || oldEnd === -1 || oldEnd < oldStart) {
    throw new Error('교체할 기존 영상 영역을 찾지 못했습니다.');
  }
  html = html.slice(0, oldStart) + section + '\n\n' + html.slice(oldEnd);
}

if (!html.includes('guide-videos.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="../dist/output.css" />',
    '<link rel="stylesheet" href="../dist/output.css" />\n  <link rel="stylesheet" href="../assets/css/guide-videos.css" />',
  );
}
html = html.replace(
  /<meta name="description" content="[^"]*" \/>/,
  `<meta name="description" content="플레이파크 2.0 앱 사용 설명 영상 모음. 홈 화면, 경기 기록, 동호회와 커뮤니티 사용법을 영상으로 쉽게 따라 해보세요." />`,
);
html = html.replace(
  /<meta property="og:description" content="[^"]*" \/>/,
  `<meta property="og:description" content="플레이파크 2.0 앱 사용 설명 영상을 한곳에서 확인하세요." />`,
);
writeFileSync(htmlPath, html, 'utf8');
console.log(`EP01–EP${String(data.length).padStart(2, '0')} 안내 목록 생성 완료: ${data.length}편`);
