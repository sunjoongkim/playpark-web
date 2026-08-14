# PlayPark 마케팅 웹사이트

파크골프 종합 앱 **PlayPark**(운영사: (주)7데이즈)의 마케팅 웹사이트입니다.
Tailwind CSS(PostCSS 빌드) 기반 정적 HTML 사이트이며, 프레임워크나 서버 런타임 없이
파일을 그대로 웹 호스팅에 올려 사용합니다.

- 정규 도메인: `https://playpark.app/`
- 문의: info@playpark.app · 02-6949-2277

---

## 기술 스택

| 항목 | 내용 |
|---|---|
| CSS | Tailwind CSS v3 + PostCSS 빌드 (`src/css/main.css` → `dist/output.css`) |
| 마크업 | 순수 HTML5 (프레임워크 없음) |
| JS | 바닐라 JavaScript (`src/js/main.js` 한 파일을 전 페이지가 공유) |
| 폰트 | Pretendard (jsDelivr CDN) |
| 아이콘 | Iconify **Solar** 세트 (`<iconify-icon icon="solar:...">`, CDN) |

> Tailwind는 **CDN 방식이 아니라 빌드 방식**입니다. `<script src="https://cdn.tailwindcss.com">`를
> 추가하지 마세요. 클래스를 새로 쓰면 반드시 재빌드해야 화면에 반영됩니다.

---

## 개발 환경 준비

Node.js 18 이상 권장.

```bash
npm install
npm run dev      # 파일 변경 감지 → dist/output.css 자동 재빌드
```

| 명령어 | 설명 |
|---|---|
| `npm run build` | `src/css/main.css`를 `dist/output.css`로 1회 빌드 (프로덕션, 압축 적용) |
| `npm run watch` | 변경 감지 후 자동 재빌드 |
| `npm run dev` | `watch`와 동일 |

HTML은 빌드 대상이 아니므로 파일을 브라우저로 열거나 임의의 정적 서버(`npx serve` 등)로 확인하면 됩니다.

> ⚠️ `dist/output.css`는 **빌드 산출물**입니다. 직접 수정하지 마세요 — 다음 빌드 때 덮어써집니다.
> 스타일은 항상 `src/css/`를 고치고 재빌드합니다.

---

## 폴더 구조

```
/
├── index.html                # 홈 (루트 고정)
├── pages/                    # 서브 페이지 — 폴더 없이 평면 구조
│   ├── guide.html            # 플레이파크 앱 (메뉴 라벨은 '플레이파크 앱', 파일명은 guide.html)
│   ├── store.html            # 무인매장
│   ├── about.html            # 회사소개
│   ├── partnership.html      # 제휴문의
│   ├── privacy.html          # 개인정보처리방침
│   ├── terms.html            # 이용약관
│   └── sitemap.xml           # 사이트맵 (7개 URL)
├── src/
│   ├── css/
│   │   ├── main.css          # 빌드 진입점 (@import + @tailwind)
│   │   ├── base.css          # 리셋·요소 선택자·전역 상태(:focus-visible, 모션 감소)
│   │   ├── components.css    # 재사용 UI 컴포넌트 (.btn-*, .card-bezel, .compare-* 등)
│   │   └── animations.css    # keyframes · .reveal · .marquee · .hotspot
│   └── js/
│       └── main.js           # 전역 스크립트 (전 페이지 공유)
├── assets/images/            # 사이트가 참조하는 이미지 (WebP + 예외 3개)
│   └── _source/              # WebP 변환 전 원본 PNG/JPG — 배포 제외
├── dist/output.css           # 빌드 산출물 (직접 수정 금지)
├── tailwind.config.js        # 디자인 토큰 (색상·폰트·그림자·이징)
├── postcss.config.js
└── package.json
```

### 페이지 목록

| 페이지 | 경로 | 주요 CTA |
|---|---|---|
| 홈 | `index.html` | 앱 다운로드 / 스크린 파크골프 예약 |
| 플레이파크 앱 | `pages/guide.html` | 앱 다운로드 |
| 무인매장 | `pages/store.html` | 매장 예약하기 / 창업·도입 문의 |
| 회사소개 | `pages/about.html` | 앱 다운로드 |
| 제휴문의 | `pages/partnership.html` | 제휴 문의하기 |
| 개인정보처리방침 | `pages/privacy.html` | — |
| 이용약관 | `pages/terms.html` | — |

### 전역 내비게이션 (7개 페이지 공통)

- 주 메뉴 4개: 플레이파크 앱 · 무인매장 · 회사소개 · 제휴문의
- `lg` 이상 외부 링크 2개: 관리자센터(`ppscreen.playpark.app`) · 대회관리시스템(`league.playpark.app`)
- 데스크톱 CTA 필: 앱 다운로드 → `pages/guide.html#download`

> 네비·모바일 메뉴·홈 히어로의 `앱 다운로드`는 **모두 `pages/guide.html#download`** 를 가리킵니다.
> App Store / Google Play 실제 스토어 링크는 `guide.html` 하단 CTA와 `about.html` 하단 두 곳에만 있습니다.
> 목적지를 바꿀 때는 이 링크들을 함께 옮겨야 합니다.

---

## 코딩 규칙

### 스타일링

1. 모든 스타일은 **Tailwind 유틸리티 클래스**로 작성합니다.
2. 인라인 `style="..."`과 HTML `<style>` 태그를 쓰지 않습니다.
   - 예외: CSS 변수 주입 같은 1회성 동적 값만 허용합니다(`style="--d:120ms"` 스크롤 등장 지연, `style="--hd:400ms"` 핫스팟 펄스 지연).
3. 같은 유틸 조합이 **3회 이상 반복되면** `src/css/`의 알맞은 파일로 추출합니다.

   | 파일 | 담는 것 |
   |---|---|
   | `base.css` | 리셋, HTML **요소 선택자** 기본값, 전역 상태. 클래스명 사용 안 함 |
   | `components.css` | 버튼·카드·배지 등 재사용 UI 컴포넌트 클래스 |
   | `animations.css` | keyframes, 스크롤 등장, 루프 모션, 스크롤바 유틸 |

   > 레이아웃 골격(컨테이너·섹션 여백)은 아직 추출돼 있지 않고 HTML에 인라인으로 반복됩니다 —
   > 컨테이너 `mx-auto max-w-container px-6`, 섹션 여백 `py-24 md:py-32`(스크린샷·히어로 등 일부 예외).
   > 새 섹션을 만들 때는 이 조합을 그대로 맞춰 주세요. 정리한다면 `src/css/layout.css`를 새로 만들어
   > `.container-base` / `.section-padding`으로 추출하고 `main.css`에 `@import`를 추가하는 방향입니다.

4. 컴포넌트/레이아웃 클래스는 `@layer components`(또는 `@layer utilities`) 안에 둡니다.
   **단, JS가 토글하는 클래스(`.reveal`, `.in`)와 keyframes는 `@layer` 밖에** 선언합니다 — purge에 지워지지 않게 하기 위함입니다.
5. 색상·폰트·간격은 임의 hex가 아니라 `tailwind.config.js`의 토큰으로 등록해 클래스로 씁니다.
   CSS 안에서는 `theme('colors.brand.DEFAULT')`로 참조합니다.

### 이미 추출된 컴포넌트 (손으로 다시 쓰지 마세요)

| 용도 | 클래스 |
|---|---|
| 버튼 | `.btn-primary` · `.btn-secondary` · `.btn-secondary-dark` · `.btn-nav` · `.mobile-btn` |
| 네비 링크 | `.nav-link` · `.nav-link-active` · `.mobile-nav-link(-active)` · `.link-external` · `.mobile-link-external` · `.footer-link-external` |
| 카드 | `.card-bezel` + `.card-bezel-inner` (시그니처 Double-Bezel) |
| 섹션 배지 | `.eyebrow` · `.eyebrow-dark` |
| 아이콘 박스 | `.icon-tile` |
| "자세히 보기" 링크 | `.link-arrow` + `.link-arrow-tile` (⚠️ `<a>`에 `group`을 함께 붙여야 화살표가 호버에 반응) |
| 사업 영역 사진 카드 | `.photo-card` · `-media` · `-scrim` · `-plus` |
| 무인매장 전용 | `.compare-*` · `.spec-*` · `.store-*` · `.mode-*` · `.step-num` |

### 경로

- CSS 참조: 루트는 `dist/output.css`, `pages/` 하위는 `../dist/output.css`
- `pages/` 하위는 **폴더 없이 평면 구조**를 유지합니다(`pages/store.html`). canonical·og:url도 같은 평면 경로를 씁니다.
- 새 페이지는 `pages/about.html`을 복사해 만드는 것이 가장 빠릅니다(네비·푸터·메타 구조가 완성돼 있습니다).

### 마크업 · 접근성

시니어(50~70대) 사용자 비중이 높아 접근성 기준을 낮추지 않습니다.

- 시맨틱 태그 사용, 본문은 `<main id="main">` 하나로 감쌉니다. 페이지당 `<h1>`은 하나, 제목 위계(h1→h2→h3)를 건너뛰지 않습니다.
- 모든 페이지에 "본문 바로가기" skip link를 유지합니다.
- 의미 있는 이미지는 `alt` 필수, 장식용은 `alt=""` + `aria-hidden="true"`.
- 텍스트 없는 아이콘 버튼/링크에는 `aria-label`을 답니다.
- 클릭 동작은 `<button>`/`<a>`로 구현합니다(클릭 가능한 `<div>` 금지). 토글은 `aria-expanded`/`aria-controls`를 함께 갱신합니다.
- 본문 명도 대비는 **WCAG AA(4.5:1) 이상**. `src/css/components.css`에 대비 하한이 `⚠️` 주석으로 표시돼 있으니 색을 낮출 때 확인하세요.
- `prefers-reduced-motion` 대응을 유지합니다(`base.css`·`animations.css`). 새 애니메이션을 넣으면 reduce 분기도 함께 추가합니다.

### JavaScript

- **전 페이지가 `src/js/main.js` 하나를 공유합니다**(`<script defer>`). 페이지별 인라인 `<script>`는 만들지 않습니다.
- 각 기능은 "해당 요소가 있을 때만" 동작하는 **요소 존재 가드**로 감싼 즉시실행 함수입니다. 새 기능도 같은 패턴으로 추가하세요.
- 현재 기능: 네비 스크롤 상태 · 모바일 메뉴 · `.reveal` 스크롤 등장 · `[data-count]` 카운트업 · 앱 스크린샷 자동 스크롤 · `.faq-item` 아코디언 · 유튜브 라이트박스 · 제휴폼(유형 프리셀렉트/제출) · `[data-year]` 저작권 연도
- JS가 **문자열로 토글하는 Tailwind 클래스**(`bg-white/90`, `shadow-nav-scrolled` 등)가 빌드에 포함되도록
  `tailwind.config.js`의 `content`에 `src/js/**/*.js`가 들어 있습니다. **이 설정을 지우면 해당 클래스가 purge됩니다.**
- 인라인 `onclick` 등 HTML 핸들러 속성을 쓰지 않습니다(이벤트 리스너 사용).

### 이미지 · 에셋

- HTML이 참조하는 래스터 이미지는 **WebP만** 씁니다. 새 사진은 표시 크기의 2배 폭까지만 리사이즈한 뒤 WebP로 내보냅니다(사진 q80~86, 로고·QR은 무손실).
- 변환 전 원본은 `assets/images/_source/`에 보관합니다. **배포에는 올리지 않습니다.**
- **예외 3개는 원본 포맷을 유지합니다** — `favicon.png`(파비콘 호환) · `og-image.jpg`(SNS 크롤러 호환) · `logo.png`(홈 JSON-LD `Organization.logo` 소비처 호환). 이 셋을 WebP로 바꾸지 마세요.
- 파일명은 소문자-케밥(`store-hero.webp`).
- 레이아웃 시프트(CLS) 방지를 위해 `width`/`height` 또는 `aspect-ratio`를 지정하고, 폴드 아래 이미지는 `loading="lazy"`를 답니다.

### SEO

각 페이지 `<head>`에 고유한 `<title>` · `<meta name="description">` · Open Graph(`og:type/title/description/image/url/locale`) · `<link rel="canonical">` · 파비콘을 갖춥니다.

구조화 데이터(JSON-LD)가 들어 있는 페이지는 3개입니다. 내용은 실제 사실과 일치해야 합니다.

| 페이지 | 스키마 |
|---|---|
| `index.html` | `Organization` · `WebSite` · `MobileApplication` · `Service` |
| `pages/guide.html` | `FAQPage` |
| `pages/store.html` | `Organization` · `Service` · `FAQPage` |

---

## 외부 연동

| 대상 | 주소 | 비고 |
|---|---|---|
| 앱 (iOS) | `apps.apple.com/kr/app/id6736860479` | |
| 앱 (Android) | `play.google.com/store/apps/details?id=com.sevendays.playpark` | |
| 무인매장 예약 | `ppscreen.playpark.app/reserve` | 예약은 전적으로 외부 시스템 담당. **사이트 안에 자체 예약 폼/모달을 만들지 않습니다.** |
| 관리자센터 | `ppscreen.playpark.app` | |
| 대회관리시스템 | `league.playpark.app` | |

외부 링크에는 `target="_blank" rel="noopener"`를 답니다.

---

## 인계 시점 미완료 항목

작업을 이어받을 때 먼저 확인해야 할 항목입니다.

1. **제휴문의 폼 백엔드 미연동** — `pages/partnership.html`의 폼은 현재 서버로 전송하지 않고
   `src/js/main.js`의 `partnershipForm()`이 `alert()` 안내만 띄운 뒤 `form.reset()`을 호출합니다.
   실제 전송 로직을 붙여야 합니다.
   - `?type=<value>#contact`로 들어오면 해당 문의 유형이 자동 선택됩니다.
     값은 `golf-course` · `club` · `tournament` · `unmanned-store` · `other` 5개입니다.
   - 회신 시점 안내 문구("영업일 기준 1~2일")는 `index.html` 마무리 섹션과 `pages/partnership.html` 두 곳에 있습니다. **한쪽만 고치지 마세요.**
2. **분석 도구 미설정** — GA 등 트래킹 스크립트가 아직 없습니다.
3. **매장 사진 없음** — `pages/store.html`의 매장 카드는 텍스트 구성입니다. 사진 확보 시 `assets/images/store-{지점}.webp`로 넣습니다.
4. **매장 정보 재확인 필요** — 운영 매장 4곳(한교밸리·장안·남부터미널·대구 수성)의 주소·룸 수·운영 형태는 2026-08 기준 자료입니다. 배포 전 최신 여부를 확인하세요. 매장이 늘거나 줄면 카드와 FAQ를 함께 고칩니다.

---

## 배포

```bash
npm run build
```

빌드 후 아래를 **제외한** 프로젝트 전체를 웹 호스팅에 업로드합니다.

- `node_modules/`
- `assets/images/_source/`
- `src/` (원한다면 제외 가능 — 브라우저는 `dist/output.css`와 `src/js/main.js`만 참조하므로 `src/css/`는 빼도 동작합니다. `src/js/main.js`는 **반드시 포함**해야 합니다.)

정적 파일이라 별도 서버 런타임이 필요 없습니다.

---

## 문의

- 운영사: (주)7데이즈 (대표 이인규 · 사업자등록번호 439-81-01598)
- 주소: 서울시 동대문구 장한로 110 힐스테이트 장안센트럴 238호
- 이메일: info@playpark.app · 전화: 02-6949-2277
