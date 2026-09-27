/* ============================================================
   main.js — 사이트 전역 스크립트 (바닐라, 의존성 없음)

   모든 페이지가 이 파일 하나를 공유한다.
   각 기능은 "해당 요소가 있을 때만" 동작하도록 가드로 감싸므로,
   기능이 없는 페이지에 로드돼도 안전하다.

   ⚠️ 여기서 문자열로 토글하는 Tailwind 클래스(bg-white/90 등)는
      tailwind.config.js의 content에 이 파일이 포함돼 있어야 생성된다.
   ============================================================ */

(function () {
  "use strict";

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var SPRING = "cubic-bezier(0.16,1,0.3,1)";

  /* ----------------------------------------------------------
     EmailJS — 제휴 문의 폼(8)과 소개서 신청 폼(9)이 함께 쓴다.
     public key 는 클라이언트 노출을 전제로 발급된 키다.
     ---------------------------------------------------------- */
  var EMAILJS = {
    serviceId: "service_k454clt",
    templateId: "template_ppqsbsd",
    publicKey: "ktCALr_hZ9pgEFIqU"
  };

  function sendEmail(params) {
    return fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: EMAILJS.serviceId,
        template_id: EMAILJS.templateId,
        user_id: EMAILJS.publicKey,
        template_params: params
      })
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) { throw new Error(t || String(res.status)); });
      }
    });
  }

  /* ----------------------------------------------------------
     1. 플로팅 글래스 내비 — 스크롤 시 배경/그림자 강화
     ---------------------------------------------------------- */
  (function navScroll() {
    var nav = document.getElementById("nav");
    if (!nav) return;

    function onScroll() {
      var scrolled = window.scrollY > 12;
      nav.classList.toggle("shadow-nav", !scrolled);
      nav.classList.toggle("bg-white/70", !scrolled);
      nav.classList.toggle("shadow-nav-scrolled", scrolled);
      nav.classList.toggle("bg-white/90", scrolled);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ----------------------------------------------------------
     2. 모바일 메뉴 오버레이
     ---------------------------------------------------------- */
  (function mobileMenu() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("mobileMenu");
    var closeBtn = document.getElementById("navClose");
    if (!menu) return;

    function openMenu(open) {
      menu.classList.toggle("hidden", !open);
      menu.classList.toggle("flex", open);
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (open && closeBtn) closeBtn.focus();
      else if (!open && toggle) toggle.focus();
    }

    if (toggle) toggle.addEventListener("click", function () { openMenu(true); });
    if (closeBtn) closeBtn.addEventListener("click", function () { openMenu(false); });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { openMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.classList.contains("hidden")) openMenu(false);
    });
  })();

  /* ----------------------------------------------------------
     3. 스크롤 등장 (.reveal → .in)
        지연은 HTML에서 style="--d:120ms" 로 준다.
     ---------------------------------------------------------- */
  (function reveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------
     4. 숫자 카운트업 ([data-count] / [data-suffix])
     ---------------------------------------------------------- */
  (function countUp() {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length || reduce || !("IntersectionObserver" in window)) return;

    function run(el) {
      var target = parseFloat(el.dataset.count) || 0;
      var suffix = el.dataset.suffix || "";
      var start = null;
      var dur = 1200;

      function step(now) {
        if (!start) start = now;
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          run(e.target);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------
     5. 앱 스크린샷 레일 — 무한 루프 자동 슬라이드
        3초마다 한 칸씩 이동하고, 중앙에 가까운 카드일수록 확대한다.
        원본 앞뒤로 한 세트씩 복제해 두고(총 3세트) 스크롤이 멈출 때마다
        가운데 세트로 위치를 보정해 "끝"이 보이지 않게 한다.
     ---------------------------------------------------------- */
  (function screenshotRail() {
    var rail = document.querySelector('[aria-label="앱 스크린샷"]');
    if (!rail || reduce) return;

    var originals = Array.prototype.slice.call(rail.children);
    if (!originals.length) return;

    /* 복제본은 보조기기에서 숨긴다 — 같은 alt가 세 번 읽히지 않도록 */
    originals.forEach(function (card) {
      var pre = card.cloneNode(true);
      var post = card.cloneNode(true);
      [pre, post].forEach(function (clone) {
        clone.setAttribute("data-clone", "");
        clone.setAttribute("aria-hidden", "true");
        clone.removeAttribute("role");
        clone.setAttribute("alt", "");
      });
      rail.insertBefore(pre, originals[0]);
      rail.appendChild(post);
    });

    var cards = Array.prototype.slice.call(rail.children);
    var setCount = originals.length;

    /* offsetLeft는 transform(확대)의 영향을 받지 않아 기준으로 안전하다 */
    function cardCenter(card) {
      return card.offsetLeft - rail.offsetLeft + card.offsetWidth / 2;
    }

    function setWidth() {
      return cards.length > setCount ? cardCenter(cards[setCount]) - cardCenter(cards[0]) : 0;
    }

    /* CSS scroll-smooth를 잠시 꺼서 눈에 안 보이게 순간 이동 */
    function jumpTo(left) {
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = left;
      rail.style.scrollBehavior = "";
    }

    /* 항상 가운데 세트에 머물게 보정 — 같은 그림 위치로 점프라 티가 안 난다 */
    function normalize() {
      var w = setWidth();
      if (!w) return;
      if (rail.scrollLeft < w * 0.5) jumpTo(rail.scrollLeft + w);
      else if (rail.scrollLeft >= w * 1.5) jumpTo(rail.scrollLeft - w);
    }

    /* 중앙에 가까울수록 확대 (1 → 1.08). 카드 폭 1.2배 밖은 기본 크기 */
    function updateScales() {
      var center = rail.scrollLeft + rail.clientWidth / 2;
      cards.forEach(function (card) {
        var w = card.offsetWidth;
        if (!w) return; /* 레이아웃 전이면 건너뛴다 — 0으로 나눠 NaN이 되지 않도록 */
        var d = Math.abs(cardCenter(card) - center);
        var ratio = Math.max(0, 1 - d / (w * 1.2));
        card.style.setProperty("--shot-scale", (1 + ratio * 0.08).toFixed(3));
      });
    }

    var scalePending = false;
    var normTimer = null;
    rail.addEventListener("scroll", function () {
      if (!scalePending) {
        scalePending = true;
        requestAnimationFrame(function () {
          scalePending = false;
          updateScales();
        });
      }
      clearTimeout(normTimer);
      normTimer = setTimeout(normalize, 150);
    }, { passive: true });

    /* 사용자가 손으로 넘겨도 그 자리에서 이어서 진행하도록 현재 중앙 카드를 찾는다 */
    function nearestIndex() {
      var center = rail.scrollLeft + rail.clientWidth / 2;
      var best = 0, bestD = Infinity;
      cards.forEach(function (card, i) {
        var d = Math.abs(cardCenter(card) - center);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }

    function scrollToCard(i) {
      rail.scrollTo({ left: cardCenter(cards[i]) - rail.clientWidth / 2, behavior: "smooth" });
    }

    /* 시작 위치: 가운데 세트의 첫 카드를 화면 중앙에.
       스크립트 실행 시점에 폭이 0일 수 있어(폰트·이미지 레이아웃 전) load·resize에서 다시 잡는다 */
    function layout() {
      if (!rail.clientWidth) return;
      jumpTo(cardCenter(cards[setCount]) - rail.clientWidth / 2);
      updateScales();
    }
    layout();
    window.addEventListener("load", layout);
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 200);
    });

    var paused = false;
    var timer = null;
    function start() {
      if (timer) return;
      timer = setInterval(function () {
        if (paused || document.hidden) return;
        normalize(); /* 보정 후 다음 칸 — 항상 앞으로만 흐른다 */
        scrollToCard(nearestIndex() + 1);
      }, 3000);
    }
    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    /* 마우스를 올리거나 터치 중일 때는 자동 이동을 멈춘다 */
    rail.addEventListener("pointerenter", function () { paused = true; });
    rail.addEventListener("pointerleave", function () { paused = false; });
    rail.addEventListener("touchstart", function () { paused = true; }, { passive: true });
    rail.addEventListener("touchend", function () { paused = false; }, { passive: true });

    /* 섹션이 화면에 보일 때만 돌린다 */
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.25 }).observe(rail);
    } else {
      start();
    }
  })();

  /* ----------------------------------------------------------
     6. FAQ 아코디언 (<details class="faq-item"> + .faq-answer)
        모션 감소 설정이면 네이티브 <details> 동작에 맡긴다.
     ---------------------------------------------------------- */
  (function faq() {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      var summary = item.querySelector("summary");
      var answer = item.querySelector(".faq-answer");
      if (!summary || !answer) return;

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
            [
              { height: "0px", paddingBottom: "0px", opacity: 0 },
              { height: endH + "px", paddingBottom: pb, opacity: 1 },
            ],
            { duration: 340, easing: SPRING }
          );
        } else {
          var startH = answer.offsetHeight;
          anim = answer.animate(
            [
              { height: startH + "px", paddingBottom: pb, opacity: 1 },
              { height: "0px", paddingBottom: "0px", opacity: 0 },
            ],
            { duration: 280, easing: "cubic-bezier(0.4,0,0.2,1)" }
          );
        }

        anim.onfinish = function () {
          if (!opening) item.open = false;
          answer.style.overflow = "";
          answer.style.height = "";
          answer.style.paddingBottom = "";
          anim = null;
        };
        anim.oncancel = function () { anim = null; };
      });
    });
  })();

  /* ----------------------------------------------------------
     7. 유튜브 영상 라이트박스 ([data-video-id] → #videoModal)
     ---------------------------------------------------------- */
  (function videoLightbox() {
    var modal = document.getElementById("videoModal");
    var frame = document.getElementById("videoFrame");
    var closeBtn = document.getElementById("modalClose");
    var triggers = document.querySelectorAll("[data-video-id]");
    if (!modal || !frame || !triggers.length) return;

    var lastFocused = null;

    function openVideo(videoId, isShort) {
      lastFocused = document.activeElement;
      modal.classList.toggle("guide-modal--short", isShort);
      var externalLink = document.getElementById("videoExternalLink");
      if (externalLink) externalLink.href = "https://youtube.com/shorts/" + videoId;
      frame.src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0";
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
      modal.focus();
    }

    function closeVideo() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      frame.src = "";
      modal.classList.remove("guide-modal--short");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    if (closeBtn) closeBtn.addEventListener("click", closeVideo);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeVideo();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) closeVideo();
    });

    triggers.forEach(function (el) {
      el.addEventListener("click", function (e) {
        var videoId = this.getAttribute("data-video-id");
        if (!videoId) return;
        e.preventDefault();
        openVideo(videoId, this.classList.contains("guide-card"));
      });
    });
  })();

  (function guidePendingVideos() {
    var pending = Array.from(document.querySelectorAll("[data-pending-video]"));
    if (!pending.length) return;

    function check(card) {
      if (!card.hasAttribute("data-pending-video")) return;
      var id = card.getAttribute("data-video-id");
      var url = "https://www.youtube.com/oembed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + id) + "&format=json";
      fetch(url, { cache: "no-store" }).then(function (response) {
        if (!response.ok) return;
        card.disabled = false;
        card.classList.remove("guide-card--pending");
        card.removeAttribute("data-pending-video");
        var count = document.getElementById("guidePlayableCount");
        if (count) count.textContent = document.querySelectorAll("[data-guide-item][data-video-id]:not([disabled])").length;
        card.setAttribute("aria-label", card.getAttribute("aria-label").replace("공개 준비 중", "영상 보기"));
        var action = card.querySelector(".guide-card__action");
        if (action) action.textContent = "영상 보기 ↗";
      }).catch(function () { /* 연결 불가 시 준비 중 상태 유지 */ });
    }

    function checkAll() { pending.forEach(check); }
    checkAll();
    window.setInterval(function () { if (!document.hidden) checkAll(); }, 15 * 60 * 1000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) checkAll(); });
  })();

  (function guideVideoSearch() {
    var input = document.getElementById("guideSearch");
    var count = document.getElementById("guideResultCount");
    var empty = document.getElementById("guideEmpty");
    var cards = Array.from(document.querySelectorAll("[data-guide-item]"));
    if (!input || !count || !cards.length) return;

    function update() {
      var query = input.value.trim().toLocaleLowerCase("ko");
      var visible = 0;
      cards.forEach(function (card) {
        var matches = !query || (card.getAttribute("data-guide-search") || "").toLocaleLowerCase("ko").includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      count.textContent = cards.length + "편 중 " + visible + "편 표시";
      if (empty) empty.hidden = visible !== 0;
    }

    input.addEventListener("input", update);
    update();
  })();

  /* ----------------------------------------------------------
     8. 제휴 문의 폼
        - ?type=... 쿼리로 넘어오면 해당 문의 유형을 미리 선택
        - 필드별 인라인 검증 후 EmailJS REST API로 전송
          (기존 playpark_webapp과 동일 서비스/템플릿)
     ---------------------------------------------------------- */
  (function partnershipForm() {
    var form = document.querySelector("form[aria-label='제휴 문의 양식']");
    if (!form) return;

    var TYPE_LABELS = {
      "golf-course": "파크골프장 제휴",
      "club": "동호회·협회",
      "tournament": "대회 운영 시스템",
      "unmanned-store": "무인매장",
      "other": "기타"
    };
    var FIELDS = ["name", "phone", "email", "message"];
    var REQUIRED_MSG = {
      name: "이름을 입력해 주세요.",
      phone: "연락처를 입력해 주세요.",
      email: "이메일을 입력해 주세요.",
      message: "문의하실 내용을 입력해 주세요."
    };
    var EMAIL_FORMAT_MSG = "이메일 주소 형식을 확인해 주세요. (예: example@email.com)";

    var preset = new URLSearchParams(window.location.search).get("type");
    if (preset) {
      var radio = form.querySelector('input[name="type"][value="' + preset + '"]');
      if (radio) radio.checked = true;
    }

    function setError(input, msg) {
      var errId = "error-" + input.name;
      var err = document.getElementById(errId);
      if (!err) {
        err = document.createElement("p");
        err.id = errId;
        err.className = "form-error";
        /* label 안 input 뒤에 붙여 시각적으로 필드 바로 아래 표시 */
        input.insertAdjacentElement("afterend", err);
      }
      err.textContent = msg;
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", errId);
    }

    function clearError(input) {
      var err = document.getElementById("error-" + input.name);
      if (err) err.remove();
      input.removeAttribute("aria-invalid");
      input.removeAttribute("aria-describedby");
    }

    function validateField(input) {
      var value = input.value.trim();
      if (!value) {
        setError(input, REQUIRED_MSG[input.name]);
        return false;
      }
      if (input.type === "email" && input.validity.typeMismatch) {
        setError(input, EMAIL_FORMAT_MSG);
        return false;
      }
      clearError(input);
      return true;
    }

    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("button[type=submit]");
    var sending = false;

    function hideStatus() {
      if (!status) return;
      status.classList.add("hidden");
      status.classList.remove("form-status-success", "form-status-error");
      status.textContent = "";
    }

    function showStatus(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.classList.remove("hidden");
      status.classList.add(ok ? "form-status-success" : "form-status-error");
    }

    FIELDS.forEach(function (name) {
      var input = form.elements[name];
      if (input) input.addEventListener("input", function () { clearError(input); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      hideStatus();

      var firstInvalid = null;
      FIELDS.forEach(function (name) {
        var input = form.elements[name];
        if (input && !validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      var typeInput = form.querySelector("input[name='type']:checked");
      var typeLabel = typeInput ? TYPE_LABELS[typeInput.value] || typeInput.value : "";
      var message = form.elements["message"].value.trim();
      var params = {
        name: form.elements["name"].value.trim(),
        phone: form.elements["phone"].value.trim(),
        organization: "",  /* 기존 템플릿 필드 — 현재 폼에는 소속 입력이 없음 */
        email: form.elements["email"].value.trim(),
        message: typeLabel ? "[문의 유형] " + typeLabel + "\n\n" + message : message
      };

      sending = true;
      var btnHtml = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "전송 중…";
      }

      sendEmail(params)
        .then(function () {
          showStatus("문의가 접수되었습니다. 영업일 기준 1~2일 내에 담당자가 연락드립니다.", true);
          form.reset();
        })
        .catch(function () {
          showStatus("문의 전송에 실패했습니다. 잠시 후 다시 시도하시거나 info@playpark.app로 보내주세요.", false);
        })
        .then(function () {
          sending = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = btnHtml;
          }
        });
    });
  })();

  /* ----------------------------------------------------------
     9. 무인매장 소개서 신청 팝업 (#brochureModal)
        - [data-brochure-open] 으로 열고, 배경 클릭·Esc·닫기 버튼으로 닫는다
          (영상 라이트박스(7)와 같은 hidden↔flex 토글 규약)
        - 휴대폰 번호만 받아 제휴 문의와 같은 EmailJS 템플릿으로 보낸다
     ---------------------------------------------------------- */
  (function brochureModal() {
    var modal = document.getElementById("brochureModal");
    var openers = document.querySelectorAll("[data-brochure-open]");
    if (!modal || !openers.length) return;

    var form = modal.querySelector("form");
    var phone = form.elements["phone"];
    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("button[type=submit]");
    var lastFocused = null;
    var sending = false;

    /* 010-1234-5678 / 01012345678 / 공백·하이픈 혼용까지 허용하고 숫자만 검사한다 */
    var PHONE_RE = /^01[0-9]{8,9}$/;

    function digits(v) {
      return v.replace(/[^0-9]/g, "");
    }

    /* 하이픈 없이 입력해도 메일에는 010-0000-0000 형태로 나가게 맞춘다.
       검증을 통과한 10~11자리 숫자만 들어온다. */
    function formatPhone(d) {
      return d.length === 11
        ? d.slice(0, 3) + "-" + d.slice(3, 7) + "-" + d.slice(7)
        : d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6);
    }

    function hideStatus() {
      status.classList.add("hidden");
      status.classList.remove("form-status-success", "form-status-error");
      status.textContent = "";
    }

    function showStatus(msg, ok) {
      status.textContent = msg;
      status.classList.remove("hidden");
      status.classList.add(ok ? "form-status-success" : "form-status-error");
    }

    function setError(msg) {
      var err = document.getElementById("error-brochure-phone");
      if (!err) {
        err = document.createElement("p");
        err.id = "error-brochure-phone";
        err.className = "form-error";
        phone.insertAdjacentElement("afterend", err);
      }
      err.textContent = msg;
      phone.setAttribute("aria-invalid", "true");
      phone.setAttribute("aria-describedby", err.id);
    }

    function clearError() {
      var err = document.getElementById("error-brochure-phone");
      if (err) err.remove();
      phone.removeAttribute("aria-invalid");
      phone.removeAttribute("aria-describedby");
    }

    function open() {
      lastFocused = document.activeElement;
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.style.overflow = "hidden";
      phone.focus();
    }

    function close() {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.style.overflow = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }

    openers.forEach(function (el) {
      el.addEventListener("click", function () { open(); });
    });

    modal.querySelectorAll("[data-brochure-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });

    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) close();
    });

    phone.addEventListener("input", clearError);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      hideStatus();

      var value = digits(phone.value);
      if (!value) {
        setError("휴대폰 번호를 입력해 주세요.");
        phone.focus();
        return;
      }
      if (!PHONE_RE.test(value)) {
        setError("휴대폰 번호 형식을 확인해 주세요. (예: 010-0000-0000)");
        phone.focus();
        return;
      }
      clearError();

      var params = {
        name: "무인매장 소개서 신청",
        phone: formatPhone(value),
        organization: "",
        email: "",
        message:
          "홈페이지 무인매장 섹션의 '무인매장 소개서 받기'로 접수된 신청입니다.\n\n" +
          "담당자 확인 후 문자로 소개서 다운로드 링크를 보내주세요."
      };

      sending = true;
      var btnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.textContent = "신청 중…";

      sendEmail(params)
        .then(function () {
          showStatus("신청이 접수되었습니다. 담당자가 확인 후 문자로 소개서 링크를 보내드립니다.", true);
          form.reset();
        })
        .catch(function () {
          showStatus("신청 전송에 실패했습니다. 잠시 후 다시 시도하시거나 02-6949-2277로 연락해 주세요.", false);
        })
        .then(function () {
          sending = false;
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnHtml;
        });
    });
  })();

  /* ----------------------------------------------------------
     10. 푸터 저작권 연도
     ---------------------------------------------------------- */
  (function footerYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  })();
})();
