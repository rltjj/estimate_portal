document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("contactModal");
  const contactBtn = document.querySelector('a[href="#contact"]');
  const closeBtn = document.getElementById("closeModalBtn");

  if (modal) modal.style.display = "block";

  if (contactBtn && modal) {
    contactBtn.addEventListener("click", (e) => {
      e.preventDefault();
      modal.style.display = "block";
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  const openConsent = document.getElementById("openConsent");
  const consentText = document.getElementById("consentText");
  if (openConsent && consentText) {
    openConsent.addEventListener("click", (e) => {
      e.preventDefault();
      consentText.style.display = consentText.style.display === "none" ? "block" : "none";
    });
  }

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
        alert(result.message); 

        contactForm.reset(); 
        modal.style.display = "none";

      } catch (err) {
        alert("문자 전송 중 오류 발생");
        console.error(err);
      }
    });
  }
});
