/* ============================================================
   components/partnership.js — 제휴문의(pages/partnership.html) 전용 동작 (Turbo Drive 대응)
   문의 폼 검증 + EmailJS 전송 (기존 playpark_webapp과 동일 서비스/템플릿)
   body 교체마다 turbo:load에서 재바인딩 (data-js-bound 마커로 중복 방지)
   ============================================================ */
(function () {
  "use strict";

  /* EmailJS — public key는 클라이언트 노출 전제의 키 */
  var EMAILJS = {
    serviceId: "service_k454clt",
    templateId: "template_ppqsbsd",
    publicKey: "ktCALr_hZ9pgEFIqU"
  };
  var TYPE_LABELS = {
    "golf-course": "파크골프장 제휴",
    "club": "동호회·협회",
    "tournament": "대회 운영 시스템",
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

  function init() {
    var form = document.querySelector("form[aria-label='제휴 문의 양식']");
    if (!form || form.dataset.jsBound) return;
    form.dataset.jsBound = "1";

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
  }

  /* 전환 직전 검증 오류·상태 메시지를 지워 캐시 스냅샷을 깨끗하게 유지 */
  document.addEventListener("turbo:before-cache", function () {
    var form = document.querySelector("form[aria-label='제휴 문의 양식']");
    if (!form) return;
    form.querySelectorAll(".form-error").forEach(function (el) { el.remove(); });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
    });
    var status = form.querySelector("[data-form-status]");
    if (status) {
      status.classList.add("hidden");
      status.classList.remove("form-status-success", "form-status-error");
      status.textContent = "";
    }
  });

  /* head 병합으로 스크립트는 단 1회 실행 — 실행 시점 init + 이후 방문은 turbo:load */
  init();
  document.addEventListener("turbo:load", init);
})();
