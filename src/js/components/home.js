/* ============================================================
   components/home.js — 홈(index.html) 전용 동작 (Turbo Drive 대응)
   앱 스크린샷 자동 스크롤 · 숫자 카운트업 · FAQ 아코디언
   body 교체마다 turbo:load에서 재바인딩하며, data-js-bound 마커로
   같은 요소에 중복 바인딩을 막는다(마커 정리는 common.js turbo:before-cache).
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function bound(el) {
    if (el.dataset.jsBound) return true;
    el.dataset.jsBound = "1";
    return false;
  }

  /* 앱 스크린샷 캐러셀 — 3초마다 한 칸씩 자동 이동, 중앙에 가까운 카드일수록 확대 */
  var shotsTimer = null;

  function stopShots() {
    if (shotsTimer) { clearInterval(shotsTimer); shotsTimer = null; }
  }

  function initShots() {
    var shots = document.querySelector('[aria-label="앱 스크린샷"]');
    if (!shots || bound(shots)) return;
    var originals = Array.prototype.slice.call(shots.querySelectorAll(":scope > :not([data-clone])"));
    if (!originals.length) return;

    /* 무한 루프용 복제 — 원본 5장 앞뒤로 한 세트씩 (총 3세트).
       스크린리더·중복 alt 방지를 위해 복제본은 보조기기에서 숨긴다.
       Turbo 캐시 복원 시 이미 복제돼 있으면 건너뛴다. */
    if (!reduce && !shots.querySelector("[data-clone]")) {
      originals.forEach(function (card) {
        var pre = card.cloneNode(true);
        var post = card.cloneNode(true);
        [pre, post].forEach(function (clone) {
          clone.setAttribute("data-clone", "");
          clone.setAttribute("aria-hidden", "true");
          clone.removeAttribute("role");
          clone.setAttribute("alt", "");
        });
        shots.insertBefore(pre, originals[0]);
        shots.appendChild(post);
      });
    }
    var cards = Array.prototype.slice.call(shots.children);
    var setCount = originals.length;

    /* 카드의 스크롤 콘텐츠 내 위치 — offsetLeft는 transform 영향을 받지 않는다 */
    function cardCenter(card) {
      return card.offsetLeft - shots.offsetLeft + card.offsetWidth / 2;
    }

    /* 한 세트의 폭 (카드 5장 + 간격) */
    function setWidth() {
      return cards.length > setCount ? cardCenter(cards[setCount]) - cardCenter(cards[0]) : 0;
    }

    /* CSS scroll-smooth를 잠시 꺼서 눈에 안 보이게 순간 이동 */
    function jumpTo(left) {
      shots.style.scrollBehavior = "auto";
      shots.scrollLeft = left;
      shots.style.scrollBehavior = "";
    }

    /* 항상 가운데 세트 범위에 머물도록 보정 — 같은 그림 위치로 점프라 티가 안 남 */
    function normalize() {
      var S = setWidth();
      if (!S) return;
      if (shots.scrollLeft < S * 0.5) jumpTo(shots.scrollLeft + S);
      else if (shots.scrollLeft >= S * 1.5) jumpTo(shots.scrollLeft - S);
    }

    /* 중앙에 가까울수록 확대 (1 → 1.08). 카드 폭 1.2배 밖은 기본 크기 */
    function updateScales() {
      var center = shots.scrollLeft + shots.clientWidth / 2;
      cards.forEach(function (card) {
        var d = Math.abs(cardCenter(card) - center);
        var ratio = Math.max(0, 1 - d / (card.offsetWidth * 1.2));
        card.style.setProperty("--shot-scale", (1 + ratio * 0.08).toFixed(3)); /* CSS 변수 주입(동적 값) */
      });
    }

    var scalePending = false;
    var normTimer = null;
    function onScroll() {
      if (!scalePending) {
        scalePending = true;
        requestAnimationFrame(function () { scalePending = false; updateScales(); });
      }
      /* 스크롤이 멈추면 가운데 세트로 위치 보정 */
      clearTimeout(normTimer);
      normTimer = setTimeout(normalize, 150);
    }

    /* 현재 중앙에 가장 가까운 카드 인덱스 — 사용자가 손으로 넘겨도 이어서 진행 */
    function nearestIndex() {
      var center = shots.scrollLeft + shots.clientWidth / 2;
      var best = 0, bestD = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs(cardCenter(card) - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }

    function scrollToCard(i) {
      shots.scrollTo({ left: cardCenter(cards[i]) - shots.clientWidth / 2, behavior: "smooth" });
    }

    var paused = false;
    function startShots() {
      if (shotsTimer || reduce) return;
      shotsTimer = setInterval(function () {
        if (paused || document.hidden) return;
        normalize(); /* 가운데 세트로 보정 후 다음 칸 — 항상 앞으로만 흐른다 */
        scrollToCard(nearestIndex() + 1);
      }, 3000);
    }

    if (!reduce) {
      shots.addEventListener("scroll", onScroll, { passive: true });
      /* 시작 위치: 가운데 세트의 첫 카드를 중앙에 */
      jumpTo(cardCenter(cards[setCount]) - shots.clientWidth / 2);
      updateScales();

      /* 마우스 오버·터치 중에는 자동 이동 일시정지 */
      shots.addEventListener("pointerenter", function () { paused = true; });
      shots.addEventListener("pointerleave", function () { paused = false; });
      shots.addEventListener("touchstart", function () { paused = true; }, { passive: true });
      shots.addEventListener("touchend", function () { paused = false; }, { passive: true });

      /* 섹션이 보일 때만 자동 이동 */
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) startShots();
            else stopShots();
          });
        }, { threshold: 0.25 });
        io.observe(shots);
      } else {
        startShots();
      }
    }
  }

  /* 숫자 카운트업 */
  function countUp(el) {
    var target = parseFloat(el.dataset.count) || 0;
    var suffix = el.dataset.suffix || "";
    var start = null, dur = 1200;
    function step(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    if (reduce || !("IntersectionObserver" in window)) return;
    var counters = Array.prototype.filter.call(
      document.querySelectorAll("[data-count]"),
      function (el) { return !bound(el); }
    );
    if (!counters.length) return;
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); co.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* FAQ 아코디언 — 부드러운 height/opacity */
  function initFaq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var summary = item.querySelector("summary");
      var answer = item.querySelector(".faq-answer");
      if (!summary || !answer || bound(item)) return;
      var anim = null;
      summary.addEventListener("click", function (e) {
        if (reduce || typeof answer.animate !== "function") return;
        e.preventDefault();
        if (anim) anim.cancel();
        var pb = getComputedStyle(answer).paddingBottom;
        var opening = !item.open;
        answer.style.overflow = "hidden";
        if (opening) {
          item.open = true;
          var endH = answer.offsetHeight;
          anim = answer.animate(
            [{ height: "0px", paddingBottom: "0px", opacity: 0 }, { height: endH + "px", paddingBottom: pb, opacity: 1 }],
            { duration: 340, easing: "cubic-bezier(0.16,1,0.3,1)" }
          );
        } else {
          var startH = answer.offsetHeight;
          anim = answer.animate(
            [{ height: startH + "px", paddingBottom: pb, opacity: 1 }, { height: "0px", paddingBottom: "0px", opacity: 0 }],
            { duration: 280, easing: "cubic-bezier(0.4,0,0.2,1)" }
          );
        }
        anim.onfinish = function () {
          if (!opening) item.open = false;
          answer.style.overflow = ""; answer.style.height = ""; answer.style.paddingBottom = "";
          anim = null;
        };
        anim.oncancel = function () { anim = null; };
      });
    });
  }

  function init() {
    initShots();
    initCounters();
    initFaq();
  }

  /* head 병합으로 스크립트는 단 1회 실행 — 실행 시점 init + 이후 방문은 turbo:load */
  init();
  document.addEventListener("turbo:load", init);
  /* 페이지를 떠나면 자동 이동 타이머 정리 */
  document.addEventListener("turbo:before-cache", stopShots);
})();
