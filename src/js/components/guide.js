/* ============================================================
   components/guide.js — 활용가이드(pages/guide.html) 전용 동작 (Turbo Drive 대응)
   영상 라이트박스 (YouTube)
   문서 레벨 이벤트 위임만 사용 — body가 교체돼도 재바인딩이 필요 없다.
   ============================================================ */
(function () {
  "use strict";

  function openVideo(videoId) {
    var modal = document.getElementById("videoModal");
    var frame = document.getElementById("videoFrame");
    if (!modal || !frame) return;
    frame.src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0";
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.style.overflow = "hidden";
    modal.focus();
  }

  function closeVideo() {
    var modal = document.getElementById("videoModal");
    var frame = document.getElementById("videoFrame");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (frame) frame.src = "";
    document.body.style.overflow = "";
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-video-id]");
    if (trigger) {
      var videoId = trigger.getAttribute("data-video-id");
      if (videoId) {
        e.preventDefault();
        openVideo(videoId);
      }
      return;
    }
    if (e.target.closest("#modalClose")) { closeVideo(); return; }
    var modal = document.getElementById("videoModal");
    if (modal && e.target === modal) closeVideo();
  });

  document.addEventListener("keydown", function (e) {
    var modal = document.getElementById("videoModal");
    if (e.key === "Escape" && modal && !modal.classList.contains("hidden")) closeVideo();
  });

  /* 전환 직전 모달이 열려 있으면 닫아 캐시 스냅샷을 깨끗하게 유지 */
  document.addEventListener("turbo:before-cache", closeVideo);
})();
