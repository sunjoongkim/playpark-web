# 프로젝트 지침

## 프로젝트 개요
**PlayPark** — 파크골프 종합 앱(스코어 기록 · AI 분석 · 커뮤니티 · 동호회 · 골프장 정보 · 대회 운영)의
마케팅 웹사이트. 운영사는 **(주)7데이즈**. Tailwind CSS 기반 정적 HTML 사이트이며,
목표는 **앱 다운로드 유도**와 **대회 운영 제휴(B2B) 리드 확보**다.

## 기술 스택
- **CSS**: Tailwind CSS v3 + PostCSS **빌드** (`src/css/main.css` → `dist/output.css`). **CDN 방식 아님.**
- **마크업**: 순수 HTML5 (프레임워크 없음)
- **JS**: 바닐라 JavaScript (`src/js/common.js` 공통 + `src/js/components/` 화면별)
- **페이지 전환**: Turbo Drive (CDN, head defer) — 링크 클릭 시 body만 교체, 헤더는 `data-turbo-permanent`로 유지
- **폰트**: Pretendard (CDN) · **아이콘**: Iconify Solar (`<iconify-icon icon="solar:...">`)
- **빌드**: `npm run build` / `npm run watch` / `npm run dev`

## 폴더 구조
```
/
├── dist/
│   └── output.css        # 빌드 산출물 (git 제외, 직접 수정 금지)
├── assets/
│   ├── fonts/            # 로컬 폰트
│   ├── icons/            # SVG 아이콘
│   └── images/           # 이미지
├── src/
│   ├── css/              # main.css(진입점) + base/layout/components/animations.css
│   └── js/
│       ├── common.js     # 전 페이지 공통 동작 (내비·모바일 메뉴·reveal·연도)
│       └── components/   # 화면별 동작 (home.js · guide.js · partnership.js)
├── pages/
│   ├── _template.html    # 새 페이지 만들 때 복사하는 기본 템플릿
│   ├── guide.html        # 활용가이드 (운영 중)
│   ├── about.html        # 회사소개 (운영 중)
│   ├── partnership.html  # 제휴문의 (운영 중)
│   ├── privacy.html      # 개인정보처리방침 (운영 중)
│   └── terms.html        # 이용약관 (운영 중)
├── .claude/
│   ├── rules/            # 프로젝트 규칙 (coding/brand/project)
│   └── skills/           # 디자인 스킬 (taste/soft/output/redesign)
├── tailwind.config.js
├── package.json
└── index.html            # 홈 페이지 (루트 고정)
```

> 운영 중인 페이지는 홈 · 활용가이드 · 회사소개 · 제휴문의 · 개인정보처리방침 · 이용약관이다. 자세한 내용은 project.md 참고.
> `pages/` 하위는 폴더 없이 파일을 평면 구조로 둔다(`pages/guide.html`처럼). 폴더별 `index.html` 방식은 쓰지 않는다.
> 미사용 스텁이던 `services.html`·`contact.html`은 최종 납품 전 정리 과정에서 삭제했다(2026-07-02). 필요해지면 `pages/_template.html`을 복사해 새로 만든다.

## 작업 규칙 (요약 — 상세·근거는 `.claude/rules/coding.md`)
- 스타일은 **Tailwind 유틸리티 클래스**로 작성한다. 인라인 `style`·HTML `<style>` 태그 금지(coding.md §2의 예외만 허용).
- 같은 유틸 조합이 3회 이상 반복되면 `src/css/`의 알맞은 파일(`@layer`)로 추출한다(분류 기준은 coding.md §2-2).
- CSS·JS·파비콘·헤더 내부 링크는 루트 절대 경로를 쓴다(`/dist/output.css`, `/src/js/...`, `/pages/guide.html`, `/#download`). Turbo 영속 헤더가 페이지를 넘나들며 유지되므로 상대 경로는 깨진다.
- 색상·폰트·간격은 임의 hex가 아니라 `tailwind.config.js`의 토큰으로 등록 후 클래스로 쓴다.
- 새 페이지는 `pages/_template.html`을 복사해 `pages/새페이지명.html`로 저장한다.
- 이미지는 `assets/images/`, 아이콘은 `assets/icons/`, 로컬 폰트는 `assets/fonts/`.

## 작업 전 필수 순서 (반드시 준수)
화면(페이지·섹션·컴포넌트)을 만들거나 고치기 전에 **`.claude/rules/coding.md`를 먼저 읽고 그 §0 순서를 따른다.**
핵심만 요약하면:
1. **규칙 읽기** — `.claude/rules/brand.md`·`.claude/rules/project.md`를 Read로 연다.
2. **스킬 읽기** — coding.md §0이 지정한 디자인 스킬을 Read로 연다.
3. **기획 → 승인 → 구현** — 섹션 구성을 먼저 제안하고, 사용자 승인 후 구현한다.

## 우선순위
규칙이 충돌하면 **조직 지침 > `brand.md` > `coding.md` > 스킬 기본값** 순서를 따른다.

## 규칙 파일 (단일 진실 공급원)
세부 규칙은 아래 파일에 있다. 본 CLAUDE.md와 충돌하면 아래 파일이 우선한다.
- **`.claude/rules/coding.md`** — 코딩 규칙(스타일링·CSS 분류·접근성·a11y·SEO·GEO·성능·JS). **코드 작성·수정 전 필독.**
- **`.claude/rules/brand.md`** — 브랜드 규칙(톤·컬러·타이포·비주얼).
- **`.claude/rules/project.md`** — 프로젝트 요구사항(페이지 목록·타깃·콘텐츠 방향).
