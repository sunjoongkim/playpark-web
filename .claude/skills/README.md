# 디자인 스킬 (Supanova)

이 폴더의 스킬들은 PlayPark 사이트의 **디자인 퀄리티 엔진**이다. 제네릭한 AI 템플릿 대신
프리미엄 에이전시 수준의 레이아웃·타이포·모션·한국어 카피를 만들도록 Claude를 가이드한다.

> Based on [taste-skill](https://github.com/Leonxlnx/taste-skill) by [@lexnlin](https://x.com/lexnlin) · Powered by [supanova.dev](https://supanova.dev)

---

## ⚠️ 이 프로젝트에서의 적용 규칙 (먼저 읽기)

스킬 본문은 **Tailwind CDN + 단일 HTML 파일** 출력을 전제로 쓰여 있다.
이 프로젝트는 **PostCSS 빌드 + 멀티 파일** 구조이므로:

- 스킬에서는 **디자인 원칙·레이아웃·모션·타이포 패턴만** 가져온다.
- 기술 적용(스택·파일 위치·CSS 추출·금지 항목)은 **언제나 `.claude/rules/coding.md`가 우선**한다.
- `<script src="https://cdn.tailwindcss.com">`·인라인 `<style>`·단일 파일 출력 지침은 **따르지 않는다.**
- 어떤 스킬을 언제 읽을지는 `coding.md` §0(작업 전 필수 순서)에 정의돼 있다.

---

## 스킬 4종

각 스킬은 해당 폴더의 `SKILL.md`에 있다.

| 스킬 | 역할 | 읽는 시점 |
|------|------|-----------|
| **taste** | 메인 디자인 엔진 — 레이아웃·타이포·컬러·모션·한국어 품질 | 거의 모든 화면 작업 시 (항상) |
| **output** | 출력 완성도 — 플레이스홀더·스켈레톤·미완성 출력 차단 | 거의 모든 화면 작업 시 (항상) |
| **soft** | 프리미엄 에스테틱 — Double-Bezel 카드, 스프링 모션, 글래스 내비, 한국어 타이포 | 새 페이지·히어로 등 비주얼 비중이 큰 작업 |
| **redesign** | 기존 페이지 진단 후 임팩트 순으로 업그레이드 | 기존 페이지를 개선할 때 |

---

## taste 설정값

`taste/SKILL.md` 상단의 4개 값을 조정해 결과 톤을 바꿀 수 있다.

- **DESIGN_VARIANCE** — 레이아웃 실험성 (1-3 정돈된 그리드 / 4-7 오버랩·사이즈 변주 / 8-10 비대칭·여백)
- **MOTION_INTENSITY** — 모션 강도 (1-3 호버 정도 / 4-7 페이드·스무스 스크롤 / 8-10 마그네틱·스프링·스크롤 트리거)
- **VISUAL_DENSITY** — 콘텐츠 밀도 (1-3 럭셔리 여백 / 4-7 일반 / 8-10 촘촘·데이터 중심)
- **LANDING_PURPOSE** — 목적 (conversion / brand / portfolio / saas / ecommerce)

> PlayPark 기본 방향: 라이트 모드 + 골드 포인트, 시니어 포용(큰 글씨·명확한 버튼), 스프링 모션, conversion 중심.
> 구체 값은 `.claude/rules/brand.md`의 톤·컬러·비주얼 규칙이 스킬 기본값보다 우선한다.

---

## 라이선스

원본 [taste](https://github.com/Leonxlnx/taste-skill)의 라이선스를 따른다.
