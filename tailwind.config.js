/** @type {import('tailwindcss').Config} */
module.exports = {
  // JS가 토글하는 클래스도 스캔 대상에 넣는다 (src/js/main.js)
  content: ["./index.html", "./pages/**/*.html", "./src/js/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "sans-serif"],
      },
      colors: {
        // 프로젝트마다 brand.md를 참고해 여기 값을 교체한다
        brand: {
          DEFAULT: "#CD9F10", // 메인 강조색 (CTA, 링크)
          600:     "#A07E0C", // 호버 / 눌림 상태 (기존 HTML 호환)
          light:   "#FBF1D2", // 틴트 배경 (아이콘 bg 등 드물게)
        },
        ink:    "#16161a", // 기본 텍스트 / 다크 버튼
        muted:  "#6B7280", // 보조 텍스트
        ground: {
          DEFAULT: "#FAFAF7", // 라이트 섹션 배경
          dark:    "#EDEBE2", // 같은 계열의 살짝 어두운 톤 (표 헤더 열 등 구분용)
        },
        night:  "#1C1C24", // 다크 섹션 배경
      },
      maxWidth: {
        container: "72rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      boxShadow: {
        // 반복되는 그림자 조합 (임의값 대신 토큰으로 사용)
        brand:       "0 12px 30px -8px rgba(205, 159, 16, 0.6)",  // 골드 CTA 글로우
        "brand-sm":  "0 8px 20px -6px rgba(205, 159, 16, 0.6)",   // 작은 골드 배지
        card:        "inset 0 1px 1px rgba(255, 255, 255, 0.7), 0 1px 2px rgba(0, 0, 0, 0.04)", // Double-Bezel 안쪽 카드
        lift:        "0 20px 50px -18px rgba(0, 0, 0, 0.28)",     // 카드 호버 부양
        nav:         "0 8px 30px rgba(0, 0, 0, 0.06)",            // 글래스 네비 기본
        "nav-scrolled": "0 12px 40px rgba(0, 0, 0, 0.10)",        // 글래스 네비 스크롤 상태
        phone:       "0 30px 60px -20px rgba(0, 0, 0, 0.3)",      // 폰 목업
      },
    },
  },
  plugins: [],
};
