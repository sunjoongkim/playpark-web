# PlayPark 마케팅 웹사이트

파크골프 종합 앱 **PlayPark**(운영사: (주)7데이즈)의 마케팅 웹사이트입니다.
Tailwind CSS(PostCSS 빌드) 기반 정적 HTML 사이트이며, 프레임워크나 서버 없이 파일을 그대로 웹 호스팅에 올려 사용합니다.

## 기술 스택

- **CSS**: Tailwind CSS v3 + PostCSS 빌드 (`src/css/main.css` → `dist/output.css`)
- **마크업**: 순수 HTML5 (프레임워크 없음)
- **JS**: 바닐라 JavaScript (`src/js/main.js`)
- **폰트**: Pretendard (CDN) · **아이콘**: Iconify Solar

## 폴더 구조

```
/
├── index.html            # 홈 페이지
├── pages/                # 서브 페이지 (guide, about, partnership, privacy, terms)
│   └── _template.html    # 새 페이지 만들 때 복사하는 기본 템플릿
├── assets/images/        # 이미지 (폰트·아이콘은 CDN 사용, 로컬 파일 없음)
├── src/
│   ├── css/              # Tailwind 진입점(main.css) + base/layout/components/animations
│   └── js/                # main.js
├── dist/output.css       # 빌드 산출물 — 직접 수정 금지, 항상 src/css에서 재빌드
├── tailwind.config.js
└── postcss.config.js
```

## 개발 환경 준비

Node.js 18 이상 권장.

```bash
npm install
```

## 자주 쓰는 명령어

| 명령어 | 설명 |
|---|---|
| `npm run build` | `src/css/main.css`를 `dist/output.css`로 1회 빌드 (프로덕션용, 압축 적용) |
| `npm run watch` | 파일 변경을 감지해 자동으로 재빌드 |
| `npm run dev` | `watch`와 동일 |

**주의**: HTML/CSS를 수정한 뒤에는 반드시 `npm run build`(또는 `watch` 실행 상태)로 `dist/output.css`를 최신 상태로 만들어야 화면에 반영됩니다. `dist/output.css`를 직접 손대지 마세요 — 다음 빌드 때 덮어써집니다.

## 새 페이지 추가

1. `pages/_template.html`을 복사해 `pages/새페이지명.html`로 저장 (폴더 없이 평면 구조 유지)
2. CSS 경로는 `../dist/output.css`로 유지
3. `<title>`, `description`, canonical 등 `<head>` 메타 정보를 페이지에 맞게 수정

## 배포

`npm run build`로 `dist/output.css`를 최신화한 뒤, 프로젝트 전체(단 `node_modules/` 제외)를 웹 호스팅에 업로드하면 됩니다. 정적 파일이라 별도 서버 런타임이 필요 없습니다.

## 페이지 목록

| 페이지 | 경로 |
|---|---|
| 홈 | `index.html` |
| 활용가이드 | `pages/guide.html` |
| 회사소개 | `pages/about.html` |
| 제휴문의 | `pages/partnership.html` |
| 개인정보처리방침 | `pages/privacy.html` |
| 이용약관 | `pages/terms.html` |

## 문의

- 운영사: (주)7데이즈
- 이메일: info@playpark.app
- 전화: 02-6949-2277
