async function loadHTML(id, file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to fetch ${file}`);
    document.getElementById(id).innerHTML = await res.text();

    if (id === "header") initHamburger();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadHTML("header", "/estimate/app/views/header.html");
  loadHTML("footer", "/estimate/app/views/footer.html");

  // 모달
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
  if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };

  // 개인정보 수집 펼치기
  const openConsent = document.getElementById("openConsent");
  const consentText = document.getElementById("consentText");
  if (openConsent) {
    openConsent.addEventListener("click", e => {
      e.preventDefault();
      consentText.style.display = consentText.style.display === "none" ? "block" : "none";
    });
  }

  // 카드 클릭 이동
  function bindCardLinks() {
    const serviceCards = document.querySelectorAll(".card.service");
    serviceCards.forEach(card => {
      const link = card.dataset.link;
      if (link) {
        card.addEventListener("click", () => {
          window.location.href = link;
        });
      }
    });
  }
  bindCardLinks();

});

function initHamburger() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  if (!hamburgerBtn || !navLinks) return;
  hamburgerBtn.addEventListener("click", () => navLinks.classList.toggle("show"));
}
