/* ============================================================
   main.js — PlayPark 사이트 스크립트
   빌드 도구 없이 동작. 모바일 내비 토글, 스크롤 헤더, 숫자 카운트업, 개인정보 토글.
   ============================================================ */
(function () {
  "use strict";

  /* 모바일 내비 토글 */
  var toggle = document.querySelector(".nav__toggle");
  var menu   = document.querySelector(".nav__menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    /* 메뉴 외부 클릭 시 닫기 */
    document.addEventListener("click", function (e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* 스크롤 헤더 */
  var header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", function () {
      header.classList.toggle("is-scrolled", window.scrollY > 10);
    }, { passive: true });
  }

  /* 숫자 카운트업 (소셜 프루프) */
  function animateCount(el) {
    var target = parseFloat(el.dataset.count) || 0;
    var suffix = el.dataset.suffix || "";
    var duration = 1200;
    var start = performance.now();
    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target * 10) / 10;
      el.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* 모션 감소 환경 여부 — reveal·아코디언이 공유 */
  var prefersReduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 스크롤 등장(reveal) — 뷰포트 진입 시 떠오름 */
  var revealEls = document.querySelectorAll("[data-reveal], [data-reveal-group]");
  if (revealEls.length) {
    if (!prefersReduced && "IntersectionObserver" in window) {
      var revObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { revObserver.observe(el); });
    } else {
      /* 모션 비활성/미지원: 즉시 표시 */
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  /* FAQ 아코디언 — height·padding·opacity를 부드럽게 애니메이션 */
  var faqItems = document.querySelectorAll(".faq__item");
  faqItems.forEach(function (item) {
    var summary = item.querySelector("summary");
    var answer = item.querySelector(".faq__answer");
    if (!summary || !answer) return;
    var anim = null;

    summary.addEventListener("click", function (e) {
      /* 모션 감소·미지원 환경은 네이티브 토글에 맡김 */
      if (prefersReduced || typeof answer.animate !== "function") return;
      e.preventDefault();
      if (anim) anim.cancel();

      var pb = getComputedStyle(answer).paddingBottom;
      var opening = !item.open;
      answer.style.overflow = "hidden";

      if (opening) {
        item.open = true;                 /* 먼저 열어 자연 높이를 측정 */
        var endH = answer.offsetHeight;
        anim = answer.animate(
          [{ height: "0px", paddingBottom: "0px", opacity: 0 },
           { height: endH + "px", paddingBottom: pb, opacity: 1 }],
          { duration: 340, easing: "cubic-bezier(.22,1,.36,1)" }
        );
      } else {
        var startH = answer.offsetHeight;
        anim = answer.animate(
          [{ height: startH + "px", paddingBottom: pb, opacity: 1 },
           { height: "0px", paddingBottom: "0px", opacity: 0 }],
          { duration: 280, easing: "cubic-bezier(.4,0,.2,1)" }
        );
      }

      anim.onfinish = function () {
        if (!opening) item.open = false;  /* 닫힘은 애니메이션 끝난 뒤 반영 */
        answer.style.overflow = "";
        answer.style.height = "";
        answer.style.paddingBottom = "";
        anim = null;
      };
      anim.oncancel = function () { anim = null; };
    });
  });

  /* 푸터 연도 자동 채움 */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* 개인정보처리방침 토글 */
  var privacyBtn = document.querySelector(".privacy-toggle-btn");
  var privacyDetail = document.querySelector(".privacy-detail");
  if (privacyBtn && privacyDetail) {
    privacyBtn.addEventListener("click", function () {
      var isOpen = privacyDetail.classList.toggle("is-open");
      privacyBtn.textContent = isOpen ? "개인정보처리방침 전문 접기 ▲" : "개인정보처리방침 전문 보기 ▼";
    });
  }

  /* 문의 폼 제출 처리 (정적 사이트 — 실제 전송은 서버 연동 필요) */
  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var consent = form.querySelector("[name='privacy']");
      if (!consent || !consent.checked) {
        alert("개인정보 수집·이용에 동의해 주세요.");
        return;
      }
      /* TODO: 실제 전송 로직 (Formspree, EmailJS 등) 연동 */
      alert("문의가 접수되었습니다. 영업일 기준 1~2일 내에 담당자가 연락드립니다.");
      form.reset();
    });
  }
})();
