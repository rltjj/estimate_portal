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
  loadHTML("header", "/header.html");
  loadHTML("footer", "/footer.html");
});

function initHamburger() {
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");
  if (!hamburgerBtn || !navLinks) return;
  hamburgerBtn.addEventListener("click", () => navLinks.classList.toggle("show"));
}
