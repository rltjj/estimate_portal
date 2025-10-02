document.addEventListener("DOMContentLoaded", () => {
  // 모달 요소
  const modal = document.getElementById("contactModal");
  const contactBtn = document.querySelector('a[href="#contact"]');
  const closeBtn = document.getElementById("closeModalBtn");

  // 모달 열기
  if (contactBtn && modal) {
    contactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "block";
    });
  }

  // 모달 닫기
  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  // 개인정보 동의 펼치기
  const openConsent = document.getElementById("openConsent");
  const consentText = document.getElementById("consentText");
  if (openConsent && consentText) {
    openConsent.addEventListener("click", (e) => {
      e.preventDefault();
      consentText.style.display = consentText.style.display === "none" ? "block" : "none";
    });
  }

  // SMS 폼 전송
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = {
        message: document.getElementById("message").value,
        phone: document.getElementById("phone").value
      };

      try {
        const res = await fetch("/estimate/app/controllers/send-sms.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });

        const result = await res.json();
        alert(result.message); // 성공 메시지

        contactForm.reset(); // 폼 초기화
        modal.style.display = "none"; // 모달 닫기

      } catch (err) {
        alert("문자 전송 중 오류 발생");
        console.error(err);
      }
    });
  }
});
