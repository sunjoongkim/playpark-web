/** @type {import('tailwindcss').Config} */
module.exports = {
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
          600: "#A07E0C", // 호버 / 눌림 상태 (기존 HTML 호환)
          light: "#FBF1D2", // 틴트 배경 (아이콘 bg 등 드물게)
        },
        ink: "#16161a", // 기본 텍스트 / 다크 버튼
        muted: "#6B7280", // 보조 텍스트
        ground: {
          DEFAULT: "#FAFAF7", // 라이트 섹션 배경
          dark: "#EDEBE2", // 같은 계열의 살짝 어두운 톤 (표 헤더 열 등 구분용)
        },
        night: "#1C1C24", // 다크 섹션 배경
      },
      maxWidth: {
        container: "72rem",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
