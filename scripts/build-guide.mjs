import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const legacy = JSON.parse(readFileSync(join(root, 'data', 'guide-videos.json'), 'utf8'));
const latest = JSON.parse(readFileSync(join(root, 'data', 'guide-videos-v22.json'), 'utf8'));
const htmlPath = join(root, 'pages', 'guide.html');
let html = readFileSync(htmlPath, 'utf8');

if (legacy.length !== 47 || legacy.some((video, index) => video.episode !== index + 1)) {
  throw new Error('이전 영상은 EP01–EP47이 빠짐없이 순서대로 있어야 합니다.');
}
if (latest.length === 0 || latest.some((video, index) => !Number.isInteger(video.episode) ||
  (index > 0 && video.episode <= latest[index - 1].episode))) {
  throw new Error('V2.2 공개 영상의 편수나 번호 순서가 올바르지 않습니다.');
}
const allVideos = [...latest, ...legacy];
if (allVideos.some((video) => !/^[A-Za-z0-9_-]{11}$/.test(video.videoId))) {
  throw new Error('잘못된 YouTube 영상 ID가 있습니다.');
}
if (new Set(allVideos.map((video) => video.videoId)).size !== allVideos.length) {
  throw new Error('중복된 YouTube 영상 ID가 있습니다.');
}
if (allVideos.some((video) => !existsSync(join(root, 'assets', 'images', 'guide', video.thumbnail)))) {
  throw new Error('안내 영상의 썸네일이 누락되었습니다.');
}

const escape = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

function card(video, version) {
  const episode = `EP${String(video.episode).padStart(2, '0')}`;
  const title = escape(video.title);
  const summary = escape(video.steps.slice(0, 2).join(' · '));
  const search = escape([version, episode, `EP${video.episode}`, video.episode, video.title, ...video.steps].join(' '));
  const image = `../assets/images/guide/${escape(video.thumbnail)}`;
  const inner = `
          <span class="guide-card__image-wrap">
            <img src="${image}" alt="" width="480" height="853" loading="lazy" decoding="async" class="guide-card__image" />
            <span class="guide-card__number">${episode}</span>
          </span>
          <span class="guide-card__body">
            <span class="guide-card__eyebrow">플레이파크 ${version} 사용 설명</span>
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

const section = `    <!-- GUIDE_VIDEOS_START: data/guide-videos*.json에서 생성. npm run build:guide -->
    <section id="app-manual" class="guide-section" aria-labelledby="manual-title">
      <div class="guide-container">
        <div class="guide-intro">
          <span class="guide-eyebrow">플레이파크 사용 설명 영상</span>
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
        <p id="guideResultCount" class="guide-result" aria-live="polite">최신 영상부터 살펴보세요.</p>
        <h3 class="guide-group-heading">V2.2 최신 사용 설명</h3>
        <div class="guide-grid">
${latest.map((video) => card(video, '2.2')).join('\n')}
        </div>
        <details id="guideLegacy" class="guide-legacy">
          <summary>이전 V2.0 사용 설명 보기 <span aria-hidden="true">⌄</span></summary>
          <p>이전 버전의 앱 화면입니다. 현재 메뉴와 다를 수 있으니 먼저 V2.2 영상을 확인해 주세요.</p>
          <div class="guide-grid">
${legacy.map((video) => card(video, '2.0')).join('\n')}
          </div>
        </details>
        <p id="guideEmpty" class="guide-empty" hidden>찾는 영상이 없습니다. 다른 단어로 검색해 보세요.</p>
      </div>
    </section>
    <!-- GUIDE_VIDEOS_END -->`;

const newStart = html.indexOf('    <!-- GUIDE_VIDEOS_START');
const newEnd = html.indexOf('    <!-- GUIDE_VIDEOS_END -->');
if (newStart === -1 || newEnd === -1 || newEnd < newStart) {
  throw new Error('교체할 영상 영역을 찾지 못했습니다.');
}
html = html.slice(0, newStart) + section + html.slice(newEnd + '    <!-- GUIDE_VIDEOS_END -->'.length);
html = html.replace(
  /<meta name="description" content="[^"]*" \/>/,
  '<meta name="description" content="플레이파크 V2.2와 이전 버전의 앱 사용 설명 영상 모음. 홈 화면, 경기 기록, 동호회와 커뮤니티 사용법을 영상으로 따라 해보세요." />',
);
html = html.replace(
  /<meta property="og:description" content="[^"]*" \/>/,
  '<meta property="og:description" content="플레이파크 최신 앱 사용 설명 영상을 한곳에서 확인하세요." />',
);
writeFileSync(htmlPath, html, 'utf8');
console.log(`V2.2 ${latest.length}편, V2.0 ${legacy.length}편 안내 목록 생성 완료`);
