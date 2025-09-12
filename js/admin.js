const estimateList = document.getElementById('estimateList');
const detailSection = document.getElementById('detailSection');
const detailName = document.getElementById('detailName');
const detailEmail = document.getElementById('detailEmail');
const detailCompany = document.getElementById('detailCompany');
const detailItems = document.getElementById('detailItems');

estimateList.addEventListener('click', (e) => {
  if (e.target.tagName !== 'LI') return;

  const li = e.target;
  const items = li.dataset.items.split(',');

  detailName.textContent = li.dataset.user;
  detailEmail.textContent = li.dataset.email;
  detailCompany.textContent = li.dataset.company;

  detailItems.innerHTML = '';
  items.forEach(item => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.disabled = true;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + item));
    detailItems.appendChild(label);
  });

  estimateList.style.display = 'none';
  detailSection.style.display = 'block';
});

document.getElementById('backBtn').addEventListener('click', () => {
  detailSection.style.display = 'none';
  estimateList.style.display = 'block';
});

document.getElementById('sendEmailBtn').addEventListener('click', () => {
  alert(`견적서 이메일을 ${detailEmail.textContent}에게 전송했습니다! (임시)`);
});
