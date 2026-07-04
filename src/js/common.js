/* ============================================================
   common.js — 전 페이지 공통 동작 (Turbo Drive 대응)
   Turbo가 링크 전환 시 <body>만 교체하므로:
   - 영속 요소(#siteHeader·#mobileMenu, data-turbo-permanent)는 최초 1회만 바인딩
   - 본문 요소(활성 메뉴·reveal·연도)는 방문(turbo:load)마다 다시 실행
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var firstVisit = true;

  /* ---------- 영속 요소: 최초 1회 바인딩 (헤더·모바일 메뉴는 교체되지 않음) ---------- */

  /* 플로팅 내비 — 스크롤 시 그림자/배경 강조 */
  var nav = document.getElementById("nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      var s = window.scrollY > 12;
      nav.classList.toggle("shadow-[0_8px_30px_rgba(0,0,0,0.06)]", !s);
      nav.classList.toggle("shadow-[0_12px_40px_rgba(0,0,0,0.12)]", s);
      nav.classList.toggle("bg-white/70", !s);
      nav.classList.toggle("bg-white/90", s);
    }, { passive: true });
  }

  /* 모바일 메뉴 */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  var close = document.getElementById("navClose");
  function openMenu(open) {
    if (!menu) return;
    menu.classList.toggle("hidden", !open);
    menu.classList.toggle("flex", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle) toggle.addEventListener("click", function () { openMenu(true); });
  if (close) close.addEventListener("click", function () { openMenu(false); });
  if (menu) menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { openMenu(false); }); });

  /* ---------- 본문 요소: 방문마다 실행 ---------- */

  /* 메뉴 활성 상태 — 헤더가 영속이므로 페이지별 하드코딩 대신 JS가 갱신 */
  function updateActiveNav() {
    var seg = location.pathname.split("/").filter(Boolean).pop() || "";
    var current = seg.replace(/\.html$/, "");
    document.querySelectorAll("#nav a[href^='/pages/'], #mobileMenu a[href^='/pages/']").forEach(function (a) {
      var page = a.getAttribute("href").split("/").pop().replace(/\.html$/, "");
      var active = page === current;
      a.classList.toggle("text-ink", active);
      a.classList.toggle("text-muted", !active);
      if (a.closest("#nav")) {
        a.classList.toggle("font-bold", active);
        a.classList.toggle("font-medium", !active);
        a.classList.toggle("hover:text-ink", !active);
      }
      if (active) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* 스크롤 등장(reveal) — 첫 로드만 애니메이션, Turbo 전환은 즉시 표시(깜빡임 방지) */
  function initReveal() {
    var reveals = document.querySelectorAll(".reveal:not(.in)");
    if (!reveals.length) return;
    if (!firstVisit || reduce || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* 푸터 연도 */
  function initYear() {
    var yearEl = document.querySelector("[data-year]");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  function initPage() {
    updateActiveNav();
    initReveal();
    initYear();
    firstVisit = false;
  }

  if (window.Turbo) {
    /* turbo:load는 최초 로드와 모든 전환에서 발생 */
    document.addEventListener("turbo:load", initPage);
    /* 캐시 스냅샷에는 리스너가 보존되지 않으므로 바인딩 마커를 지워 재바인딩되게 한다 */
    document.addEventListener("turbo:before-cache", function () {
      document.querySelectorAll("[data-js-bound]").forEach(function (el) {
        delete el.dataset.jsBound;
      });
    });
  } else {
    /* Turbo 미로드(CDN 실패 등) — 일반 페이지 로드로 동작 */
    initPage();
  }
})();
