document.addEventListener('DOMContentLoaded', () => {
  const checklistEl = document.getElementById('checklist');
  const selectedCountEl = document.getElementById('selectedCount');
  const totalAmountEl = document.getElementById('totalAmount');
  const previewArea = document.getElementById('previewArea');
  const resetBtn = document.getElementById('resetBtn');
  const pricingEditor = document.getElementById('pricingEditor');
  const companyNameInput = document.getElementById('companyName');
  const managerInput = document.getElementById('managerName');
  const phoneInput = document.getElementById('managerPhone');
  const downloadPdfBtn = document.getElementById('downloadPdfBtn');

  let ITEMS = [];
  let state = {
    items: [],
    selections: {},
    subtotal: 0,
    vat: 0,
    total: 0
  };

  function formatWon(n) {
    return '₩' + (Number(n) || 0).toLocaleString();
  }

  // DB에서 상품 불러오기
  fetch('get_products.php')
    .then(res => res.json())
    .then(data => {
      ITEMS = data.map(p => ({
        id: String(p.id),
        label: p.name,
        price: parseInt(p.price || 0),
        description: p.description || '-'
      }));
      state.items = JSON.parse(JSON.stringify(ITEMS));
      renderChecklist();
      renderPricingEditor();
      updateSummary();
    })
    .catch(() => alert('상품 불러오기 실패'));

  function renderChecklist() {
    checklistEl.innerHTML = '';
    state.items.forEach(item => {
      const div = document.createElement('div');
      div.innerHTML = `
        <label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div>
            <input type="checkbox" data-id="${item.id}"> ${item.label} (${formatWon(item.price)})
          </div>
          <input type="number" min="1" value="1" data-qty-id="${item.id}" style="width:60px">
        </label>`;
      checklistEl.appendChild(div);
    });

    checklistEl.querySelectorAll('input[type="checkbox"]').forEach(cb =>
      cb.addEventListener('change', onCheckToggle)
    );
    checklistEl.querySelectorAll('input[type="number"]').forEach(n =>
      n.addEventListener('input', onQtyChange)
    );
  }

  function renderPricingEditor() {
    pricingEditor.innerHTML = '';
    state.items.forEach(item => {
      const div = document.createElement('div');
      div.style.marginBottom = '4px';
      div.innerHTML = `
        ${item.label}: <input type="number" min="0" value="${item.price}" data-edit-price="${item.id}" style="width:80px">
      `;
      pricingEditor.appendChild(div);
    });

    pricingEditor.querySelectorAll('[data-edit-price]').forEach(input => {
      input.addEventListener('input', e => {
        const id = e.target.dataset.editPrice;
        const item = state.items.find(x => x.id === id);
        if (!item) return;
        item.price = parseInt(e.target.value) || 0;
        if (state.selections[id]) state.selections[id].price = item.price;
        updateSummary();
      });
    });
  }

  function onCheckToggle(e) {
    const id = e.target.dataset.id;
    const qtyEl = document.querySelector(`[data-qty-id="${id}"]`);
    const item = state.items.find(x => x.id === id);
    if (!item) return;
    if (e.target.checked) {
      state.selections[id] = { qty: parseInt(qtyEl.value) || 1, price: item.price };
    } else {
      delete state.selections[id];
    }
    updateSummary();
  }

  function onQtyChange(e) {
    const id = e.target.dataset.qtyId;
    const qty = parseInt(e.target.value) || 1;
    if (state.selections[id]) state.selections[id].qty = qty;
    updateSummary();
  }

  function calcSubtotal() {
    return Object.values(state.selections).reduce((sum, s) => sum + s.qty * s.price, 0);
  }

  function updateSummary() {
    const keys = Object.keys(state.selections);
    const subtotal = calcSubtotal();
    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    state.subtotal = subtotal;
    state.vat = vat;
    state.total = total;

    selectedCountEl.textContent = keys.length;
    totalAmountEl.textContent = formatWon(total);

    renderPreview(subtotal, vat, total);
    downloadPdfBtn.disabled = keys.length === 0;
  }

  function renderPreview(subtotal, vat, total) {
    if (!previewArea) return;
    const keys = Object.keys(state.selections);
    if (!keys.length) {
      previewArea.innerHTML = '<div class="placeholder">선택한 항목이 없으면 견적서가 표시되지 않습니다.</div>';
      return;
    }

    const company = (companyNameInput.value || '').trim();
    const manager = (managerInput.value || '').trim();
    const phone = (phoneInput.value || '').trim();

    let rows = '';
    keys.forEach((id, idx) => {
      const s = state.selections[id];
      const item = state.items.find(x => x.id === id);
      const lineTotal = s.qty * s.price;
      rows += `<tr>
        <td>${idx + 1}</td>
        <td>${item.label}</td>
        <td style="text-align:right">${formatWon(s.price)}</td>
        <td style="text-align:right">${s.qty}</td>
        <td style="text-align:right">${formatWon(lineTotal)}</td>
      </tr>`;
    });

    previewArea.innerHTML = `
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th>No</th>
            <th>품목</th>
            <th>단가</th>
            <th>수량</th>
            <th>금액</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
          <tr>
            <td colspan="4" style="text-align:right"><b>공급가액</b></td>
            <td style="text-align:right" class="subtotal">${formatWon(subtotal)}</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:right"><b>세액(10%)</b></td>
            <td style="text-align:right" class="vat">${formatWon(vat)}</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:right"><b>합계</b></td>
            <td style="text-align:right" class="total-row">${formatWon(total)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // DB에서 견적번호 받아오기
  async function fetchEstimateNumber() {
    const res = await fetch('get_new_estimate_number.php');
    const data = await res.json();
    if (data.number) return data.number;
    else throw new Error('견적번호 생성 실패');
  }

  async function generatePdf() {
    try {
      const estimateNumber = await fetchEstimateNumber();
      let html = await (await fetch('pdf_template.html')).text();

      const company = (companyNameInput.value || '').trim();
      const manager = (managerInput.value || '').trim();
      const phone = (phoneInput.value || '').trim();
      const keys = Object.keys(state.selections);

      let itemRows = '';
      let detailRows = '';

      keys.forEach((id, idx) => {
        const s = state.selections[id];
        const item = state.items.find(x => x.id === id);
        const lineTotal = s.qty * s.price;

        itemRows += `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.label}</td>
            <td style="text-align:right">${formatWon(s.price)}</td>
            <td style="text-align:right">${s.qty}</td>
            <td style="text-align:right">${formatWon(lineTotal)}</td>
          </tr>`;

        detailRows += `
          <tr>
            <td>${item.label}</td>
            <td>${item.description}</td>
          </tr>`;
      });

      const today = new Date().toLocaleDateString('ko-KR');

      html = html
        .replace('{{NUM}}', estimateNumber)
        .replace('{{COMPANY}}', company || '견적서')
        .replace('{{MANAGER}}', manager)
        .replace('{{PHONE}}', phone)
        .replace('{{DATE}}', today)
        .replace('{{ITEM_ROWS}}', itemRows)
        .replace('{{DETAIL_ROWS}}', detailRows)
        .replace('{{SUPPLY}}', formatWon(state.subtotal))
        .replace('{{TAX}}', formatWon(state.vat))
        .replace('{{TOTAL}}', formatWon(state.total));

      html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${company || '견적서'}_${estimateNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(html).save();

    } catch (err) {
      alert(err.message);
    }
  }

  resetBtn.addEventListener('click', () => {
    if (confirm('초기화하시겠습니까?')) {
      state.items = JSON.parse(JSON.stringify(ITEMS));
      state.selections = {};
      renderChecklist();
      renderPricingEditor();
      updateSummary();
    }
  });

  downloadPdfBtn.addEventListener('click', generatePdf);

  [companyNameInput, managerInput, phoneInput].forEach(input => {
    input.addEventListener('input', updateSummary);
  });
});
