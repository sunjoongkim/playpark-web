# 코딩 규칙

> Claude는 이 프로젝트에서 **코드를 작성·수정하기 전에 이 파일을 반드시 읽고 준수**한다.
> `brand.md`(브랜드)·`project.md`(요구사항)와 함께 읽으며, 충돌 시 우선순위는
> **조직 지침 > brand.md > 이 파일(coding.md) > 스킬 기본값** 순이다.

---

## 0. 작업 전 필수 순서

화면(페이지·섹션·컴포넌트)을 만들거나 고치기 전에 **반드시** 아래를 순서대로 수행한다.

1. **규칙 읽기** — `.claude/rules/brand.md`, `.claude/rules/project.md`를 Read로 직접 연다.
   - 두 파일은 PlayPark 기준으로 채워져 있어야 한다(실제 사이트와 동기화된 상태).
   - 만약 `TODO`만 있고 비어 있으면: **기존 사이트(`index.html`·`tailwind.config.js`)가 이미 구현돼 있으면 그 코드에서 브랜드·콘텐츠를 추론해 진행하되, 추론한 핵심 가정을 사용자에게 한 줄로 확인받는다.** 사이트도 비어 있는 백지 상태일 때만 구현을 멈추고 사용자에게 규칙을 채워달라고 요청한다.
2. **스킬 읽기 (작업 규모에 맞게 선택)** — 아래에서 필요한 만큼만 Read로 직접 연다. 읽기로 한 파일은 구현 전에 반드시 읽는다.
   - **항상**: `.claude/skills/taste/SKILL.md`(메인 디자인 엔진) + `.claude/skills/output/SKILL.md`(출력 완성도·플레이스홀더 금지)
   - **새 페이지·히어로 등 비주얼 비중이 큰 작업**: 위에 더해 `.claude/skills/soft/SKILL.md`(프리미엄 에스테틱)
   - **기존 페이지 업그레이드**: `.claude/skills/redesign/SKILL.md`
   - **텍스트·링크·소규모 버그 수정 등 사소한 작업**: 스킬 읽기를 생략해도 된다(brand.md·project.md·본 coding.md만으로 충분).
3. **기획 → 승인 → 구현** — project.md를 바탕으로 섹션 구성을 먼저 제안하고,
   사용자 승인 후 구현으로 넘어간다.

> **스킬 해석 규칙** — 스킬 파일들은 Tailwind **CDN + 단일 HTML 파일** 출력을 전제로 쓰여 있다.
> 이 프로젝트는 **PostCSS 빌드 + 멀티 파일** 구조이므로, 스킬에서는 **디자인 원칙·레이아웃·모션·타이포 패턴만** 취한다.
> 기술 적용(스택·파일 위치·CSS 추출·금지 항목)은 **언제나 본 coding.md가 우선**한다.
> 특히 `<script src="https://cdn.tailwindcss.com">`·인라인 `<style>`·단일 파일 출력 지침은 따르지 않는다(§1·§2 참고).

---

## 1. 기술 스택 (고정)

- **CSS**: Tailwind CSS v3, PostCSS 빌드 (`src/css/main.css` → `dist/output.css`)
- **마크업**: 순수 HTML5 (프레임워크 없음, 정적 사이트)
- **JS**: 바닐라 JavaScript (`src/js/common.js` 공통 + `src/js/components/` 화면별)
- **페이지 전환**: Turbo Drive (jsdelivr CDN, head defer) — 링크 클릭 시 body만 교체해 헤더 재렌더링 없이 전환
- **폰트**: Pretendard (한국어 표준), 필요 시 디스플레이 영문 폰트
- **아이콘**: Iconify Solar (`<iconify-icon icon="solar:...">`)
- **빌드**: `npm run build` / `npm run watch` / `npm run dev`

### 금지

- `<script src="https://cdn.tailwindcss.com">` 태그 추가 금지 (빌드 방식이므로).
- React/Vue 등 프레임워크 도입 금지.
- 커스텀 색상·폰트·간격은 임의 hex가 아니라 `tailwind.config.js`에 등록 후 클래스로 사용.

---

## 2. 스타일링 규칙

### 2-1. Tailwind 유틸리티 우선

- 모든 스타일은 **Tailwind 유틸리티 클래스**로 작성한다.
- `style="..."` **인라인 스타일 금지**. (CSS 변수 주입 등 불가피한 1회성 동적 값은 예외로 하되,
  주석으로 이유를 남긴다. 예: `style="--d:120ms"` 스크롤 등장 지연.)
- HTML 안에 `<style>` 태그 **금지**. 스타일은 항상 `src/css/`로 분리한다.
- 임의값(arbitrary value, `w-[137px]` 등)은 최후의 수단. 디자인 토큰으로 표현 가능하면 토큰을 쓴다.

### 2-2. 반복 패턴은 CSS 파일로 추출

같은 유틸리티 조합이 **3회 이상 반복**되면 `@layer components`에 클래스로 추출한다.
추출 시 아래 분류 기준에 맞는 파일에 넣는다. 한 줄 추가로 끝내지 말고 기존 주석 컨벤션을 따른다.

| 파일 | 담는 것 | 예시 |
|------|---------|------|
| `src/css/base.css` | 리셋, HTML **요소 선택자** 기본값, 전역 상태(`:focus-visible`, 모션 감소). **클래스명 사용 안 함** | `body`, `img`, `a`, `ul[role="list"]` |
| `src/css/layout.css` | 컨테이너·섹션·그리드 등 **레이아웃 골격** 클래스 | `.container-base`, `.section-padding` |
| `src/css/components.css` | 버튼·카드·배지 등 **재사용 UI 컴포넌트** 클래스 | `.btn-primary`, `.btn-secondary` |
| `src/css/animations.css` | keyframes, 스크롤 등장(`.reveal`), 루프 모션(`.marquee`/`.floaty`/`.orb`), 스크롤바 유틸 | `@keyframes`, `.reveal` |

규칙:
- 새 CSS 파일을 만들면 `src/css/main.css`의 `@import`에 등록한다.
- 컴포넌트/레이아웃/유틸 클래스는 `@layer components` 또는 `@layer utilities` 안에 둔다.
- **단, JS가 토글하는 클래스(`.reveal`, `.in` 등)와 keyframes는 `@layer` 밖에 선언**한다.
  Tailwind purge가 제거하지 않도록 하기 위함이며, 이는 `animations.css`의 기존 패턴을 따른다.
- 색상·폰트·간격값은 CSS에 하드코딩하지 말고 `theme('colors.brand.DEFAULT')`처럼 토큰을 참조한다.

### 2-3. 디자인 토큰

- 브랜드 색상·폰트·`maxWidth`·이징 등은 `tailwind.config.js`의 `theme.extend`에서 관리한다.
- 새 색이 필요하면 brand.md를 근거로 config에 등록하고 의미 있는 이름을 준다
  (예: `brand`, `ink`, `muted`, `ground`, `night`). 매직 hex를 클래스에 직접 쓰지 않는다.

---

## 3. HTML / 마크업 규칙

- 시맨틱 태그를 쓴다: `<header> <nav> <main> <section> <article> <footer>`.
  `<div>` 남발 금지. 페이지 본문은 `<main id="main">` 하나로 감싼다.
- 제목 위계는 **h1 → h2 → h3 순서를 건너뛰지 않는다**. 페이지당 `<h1>`은 하나.
- 페이지 추가 시 `pages/_template.html`을 복사해 `pages/새페이지명.html`로 저장한다. 폴더를 만들지 않는다.
- CSS·JS·파비콘·헤더 내부 링크는 루트 절대 경로를 쓴다(`/dist/output.css`, `/src/js/...`, `/pages/guide.html`, `/#download`).
  Turbo 영속 헤더가 페이지를 넘나들며 그대로 유지되므로 그 안의 상대 경로는 깨진다.
- 헤더(`#siteHeader`)·모바일 메뉴(`#mobileMenu`)는 `data-turbo-permanent` 영속 요소다.
  전 페이지에서 마크업을 동일하게 유지한다(활성 메뉴 표시는 common.js의 `updateActiveNav`가 갱신).
- 링크·앵커는 명확한 텍스트를 쓴다("여기 클릭" 금지).

---

## 4. 접근성 (a11y)

- `<html lang="ko">` 지정. 모든 페이지에 "본문 바로가기" skip link 유지.
- **이미지**: 의미 있는 이미지는 `alt` 필수, 장식용은 `alt=""`.
- **아이콘 버튼/링크**: 보이는 텍스트가 없으면 `aria-label`을 단다.
- **인터랙티브 요소**: 클릭 동작은 `<button>`/`<a>`로 구현(클릭 가능한 `<div>` 금지).
  토글은 `aria-expanded`/`aria-controls`, 장식 리스트는 `role="list"`를 유지한다.
- **포커스**: 키보드 포커스 링(`:focus-visible`)을 제거하지 않는다(base.css에 정의됨).
- **명도 대비**: 본문 텍스트는 WCAG AA(4.5:1) 이상. 연한 회색 위 회색 텍스트 금지.
- **모션**: `prefers-reduced-motion` 대응을 유지한다(base.css/animations.css에 정의됨).
  새 애니메이션을 추가하면 reduce 분기도 함께 추가한다.
- 폼 입력에는 연결된 `<label>`을, 상태 안내에는 적절한 `aria-live`를 쓴다.

---

## 5. SEO

각 페이지 `<head>`에 아래를 갖춘다(index.html 패턴 참고).

- `<title>` — 페이지마다 고유하게. `브랜드 — 핵심가치` 형식.
- `<meta name="description">` — 페이지마다 고유, 70~160자 권장.
- **Open Graph**: `og:type` `og:title` `og:description` `og:image` `og:url` `og:locale`(`ko_KR`).
- `<link rel="canonical">` — 페이지의 정규 URL.
- `<link rel="icon">` 파비콘.
- 이미지에 의미 있는 `alt`(SEO와 a11y 공통).
- 시맨틱 마크업과 올바른 제목 위계(§3)가 SEO의 기본이다.
- **구조화 데이터(JSON-LD)**: 적절한 곳에 `Organization`, `WebSite`, `Product`, `FAQPage`,
  `BreadcrumbList` 등을 `<script type="application/ld+json">`로 추가한다. 내용은 실제와 일치해야 한다.
- 내부 링크에 의미 있는 앵커 텍스트를 쓰고, 깨진 링크를 만들지 않는다.

---

## 6. GEO (Generative Engine Optimization)

LLM·AI 검색(ChatGPT, Perplexity, Google AI Overviews 등)에 잘 인용되도록 한다.

- **명확한 답변형 구조**: 핵심 질문에 첫 문장에서 직접 답하고, 근거를 잇는다.
  FAQ 섹션은 `FAQPage` JSON-LD와 함께 질문/답변을 명시적 텍스트로 둔다.
- **사실·수치는 텍스트로**: 가격·통계·기능을 이미지 안에만 넣지 말고 본문 텍스트로 노출한다.
- **개체(Entity) 명확화**: 회사명·제품명·서비스명을 일관되게 표기하고, JSON-LD로 정의한다.
- **출처·신뢰 신호**: 실제 수치, 날짜, 인용 가능한 사실 문장을 제공한다(과장·허위 금지).
- **요약 가능한 단위**: 긴 문단 대신 소제목·리스트·표로 끊어 기계가 추출하기 쉽게 한다.
- `robots`/`sitemap`에서 AI 크롤러를 차단하지 않는다(차단 요구가 있으면 사용자 확인).

---

## 7. 성능

- 이미지는 적정 포맷(WebP/AVIF 우선)과 크기로 최적화하고 `width`/`height` 또는 `aspect-ratio`로
  레이아웃 시프트(CLS)를 막는다. 폴드 아래 이미지는 `loading="lazy"`.
- 외부 리소스는 `preconnect`로 연결을 미리 연다(폰트 CDN 등).
- JS는 가볍게. 무거운 라이브러리 도입 전 사용자와 상의한다.
- 빌드 산출물(`dist/output.css`)은 git에서 제외되므로 직접 수정하지 말고 항상 소스를 고쳐 재빌드한다.

---

## 8. JavaScript

- 전 페이지 공통 동작은 `src/js/common.js`, 화면별 동작은 `src/js/components/화면명.js`에 둔다.
  HTML 안 인라인 `<script>` 블록 금지 — 각 페이지는 head에서 `common.js`(+ 필요 시 자기 화면 파일)를
  절대 경로 + `defer`로 참조한다(`<script src="/src/js/common.js" defer>`).
- **Turbo Drive 생명주기**: 스크립트는 반드시 head+defer로 로드한다(body 스크립트는 Turbo가 방문마다 재실행해 중복 바인딩됨).
  본문 요소 초기화는 실행 시점 1회 + `turbo:load`마다 실행하고, `data-js-bound` 마커로 같은 요소 중복 바인딩을 막는다
  (마커는 common.js의 `turbo:before-cache`에서 일괄 정리). 영속 요소(헤더·모바일 메뉴)는 최초 1회만 바인딩한다.
  가능하면 문서 레벨 이벤트 위임을 써서 재바인딩 자체를 없앤다(guide.js 참고).
- 인라인 `onclick` 등 HTML 핸들러 속성 금지(이벤트 위임/리스너 사용).
- DOM 토글로 상태를 바꿀 때 `aria-expanded` 등 ARIA 속성도 함께 갱신한다.
- IntersectionObserver 기반 `.reveal` 등장 패턴 등 기존 컨벤션을 재사용한다.
- 외부 의존성 없이 바닐라로 해결 가능하면 라이브러리를 추가하지 않는다.

---

## 9. 에셋

- 이미지: `assets/images/`, 아이콘(SVG): `assets/icons/`, 로컬 폰트: `assets/fonts/`.
- 로컬 폰트는 `src/css/base.css`(또는 별도 파일)에서 `@font-face`로 등록한다.
- 파일명은 소문자-케밥(`hero-bg.webp`). 의미 있는 이름을 쓴다.

---

## 10. 마무리 체크리스트

페이지/섹션 작업을 끝내기 전 스스로 점검한다.

- [ ] brand.md·project.md·스킬 3종을 실제로 읽고 반영했는가
- [ ] 인라인 `style`·`<style>` 태그가 없는가
- [ ] 반복 유틸 조합을 알맞은 `src/css/*` 파일로 추출했는가
- [ ] 임의 hex 대신 `tailwind.config.js` 토큰을 썼는가
- [ ] 제목 위계(h1→h2→h3)와 시맨틱 태그가 올바른가
- [ ] 아이콘 버튼에 `aria-label`, 이미지에 `alt`가 있는가
- [ ] `<title>`·`description`·OG·canonical·JSON-LD를 갖췄는가
- [ ] `prefers-reduced-motion` 대응이 유지되는가
- [ ] 플레이스홀더("여기에 내용", `lorem ipsum`, `TODO`)나 미완성 출력이 없는가
- [ ] `npm run build`가 오류 없이 통과하는가
