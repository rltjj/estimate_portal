let ITEMS = [];
let state = { items: [], selections: {}, subtotal: 0, vat: 0, total: 0 };

document.addEventListener('DOMContentLoaded', () => {
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const currentUserIdInput = document.getElementById('currentUserId');
  const currentApplicationIdInput = document.getElementById('currentApplicationId');
  const companyNameInput = document.getElementById('companyName');
  const managerInput = document.getElementById('managerName');
  const phoneInput = document.getElementById('managerPhone');

  const checklistEl = document.getElementById('checklist');
  const selectedCountEl = document.getElementById('selectedCount');
  const totalAmountEl = document.getElementById('totalAmount');

  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get('estimateId');

  if (!applicationId) {
    alert('applicationId가 없습니다. URL을 확인해주세요.');
    return;
  }
  currentApplicationIdInput.value = applicationId;

  function formatWon(n) {
    return '₩' + (Number(n) || 0).toLocaleString();
  }

  fetch('/app/controllers/get_products.php')
    .then(res => res.json())
    .then(products => {
      ITEMS = products.map(p => ({
        id: String(p.id),
        label: p.name,
        price: parseInt(p.price || 0),
        description: p.description || '-'
      }));
      state.items = JSON.parse(JSON.stringify(ITEMS));

      return fetch(`/app/controllers/get_application_detail.php?id=${applicationId}`);
    })
    .then(res => res.json())
    .then(data => {
      const app = data.application || {};
      const selectedProducts = data.products || [];

      companyNameInput.value = app.company_name || '';
      managerInput.value = app.user_name || '';
      phoneInput.value = app.phone || '';
      currentUserIdInput.value = app.user_id || '';

      selectedProducts.forEach(sel => {
        const idStr = String(sel.product_id);
        state.selections[idStr] = { qty: sel.quantity, price: sel.price };
      });

      ['18', '19'].forEach(id => {
        if (!state.selections[id]) {
          const item = state.items.find(x => x.id === id);
          if (item) state.selections[id] = { qty: 1, price: item.price };
        }
      });

      renderChecklist();
      updateSummary();
    })
    .catch(err => {
      console.error(err);
      alert('상품 또는 신청서 정보를 가져오지 못했습니다.');
    });

  function renderChecklist() {
    checklistEl.innerHTML = '';
    state.items.forEach(item => {
      const idStr = String(item.id);
      const isMandatory = idStr === '18' || idStr === '19';
      const selected = Boolean(state.selections[idStr]);
      const qty = state.selections[idStr]?.qty || 1;

      const div = document.createElement('div');
      div.innerHTML = `
        <label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <div>
            <input type="checkbox" data-id="${idStr}" ${selected ? 'checked' : ''} ${isMandatory ? 'disabled' : ''}>
            ${item.label} 
            ₩ <input type="number" min="0" value="${state.selections[idStr]?.price ?? item.price}" data-price-id="${idStr}" style="width:80px">
          </div>
          <input type="number" min="1" value="${qty}" data-qty-id="${idStr}" style="width:60px">
        </label>`;
      checklistEl.appendChild(div);
    });

    checklistEl.querySelectorAll('input[type="checkbox"]').forEach(cb =>
      cb.addEventListener('change', onCheckToggle)
    );
    checklistEl.querySelectorAll('input[data-qty-id]').forEach(n =>
      n.addEventListener('input', onQtyChange)
    );
    checklistEl.querySelectorAll('input[data-price-id]').forEach(n =>
      n.addEventListener('input', onPriceChange)
    );
  }

  function onCheckToggle(e) {
    const id = e.target.dataset.id;
    const qtyEl = document.querySelector(`[data-qty-id="${id}"]`);
    const priceEl = document.querySelector(`[data-price-id="${id}"]`);
    const item = state.items.find(x => x.id === id);
    if (!item) return;

    if (e.target.checked) {
      state.selections[id] = {
        qty: parseInt(qtyEl.value) || 1,
        price: parseInt(priceEl.value) || item.price
      };
    } else {
      delete state.selections[id];
    }
    updateSummary();
    updatePreview();
  }

  function onQtyChange(e) {
    const id = e.target.dataset.qtyId;
    const qty = parseInt(e.target.value) || 1;
    if (state.selections[id]) state.selections[id].qty = qty;
    updateSummary();
    updatePreview();
  }

  function onPriceChange(e) {
    const id = e.target.dataset.priceId;
    const price = parseInt(e.target.value) || 0;
    if (state.selections[id]) state.selections[id].price = price;
    updateSummary();
    updatePreview();
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
  }

  function updatePreview() {
    const preview = document.getElementById('previewArea');
    const keys = Object.keys(state.selections);
    if (!keys.length) {
      preview.innerHTML = `<div class="placeholder">선택한 항목이 없으면 견적서가 표시되지 않습니다.</div>`;
      return;
    }

    let html = `
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr><th>No</th><th>품목</th><th>단가</th><th>수량</th><th>금액</th></tr></thead><tbody>`;
    keys.forEach((id, idx) => {
      const s = state.selections[id];
      const item = state.items.find(x => x.id === id);
      const line = s.qty * s.price;
      html += `<tr>
        <td>${idx + 1}</td>
        <td>${item.label}</td>
        <td style="text-align:right">${formatWon(s.price)}</td>
        <td style="text-align:right">${s.qty}</td>
        <td style="text-align:right">${formatWon(line)}</td>
      </tr>`;
    });
    html += `</tbody></table><div style="text-align:right;margin-top:8px;font-weight:700">
      합계: ${formatWon(state.total)} (부가세 포함)
    </div>`;
    document.getElementById('previewArea').innerHTML = html;
  }

  async function getEstimateNumber() {
    const appId = currentApplicationIdInput.value;
    const res = await fetch(`/app/controllers/get_new_estimate_number.php?application_id=${encodeURIComponent(appId)}`);
    const data = await res.json();
    if (data.number) return data.number;
    throw new Error(data.error || '견적번호 생성 실패');
  }

  sendEmailBtn?.addEventListener('click', async () => {
    try {
      if (!currentUserIdInput.value) throw new Error('해당 유저 없음');

      document.querySelectorAll('input[type="checkbox"][data-id]').forEach(cb => {
        const id = cb.dataset.id;
        const qtyEl = document.querySelector(`[data-qty-id="${id}"]`);
        const priceEl = document.querySelector(`[data-price-id="${id}"]`);
        const qty = parseInt(qtyEl?.value) || 1;
        const price = parseInt(priceEl?.value) || 0;
        if (cb.checked) {
          state.selections[id] = { qty, price };
        } else {
          delete state.selections[id];
        }
      });

      updateSummary();
      renderChecklist();
      updatePreview();

      const companyName = (companyNameInput.value || '').trim() || '견적서';
      const managerName = (managerInput.value || '').trim();
      const managerPhone = (phoneInput.value || '').trim();

      const template = await fetch(`/pdf_template.html?${Date.now()}`).then(r => r.text());
      const keys = Object.keys(state.selections);
      if (!keys.length) return alert('선택한 상품이 없습니다.');

      let itemRows = '', detailRows = '';
      keys.forEach((id, i) => {
        const s = state.selections[id];
        const item = state.items.find(x => x.id === id);
        const lineTotal = s.qty * s.price;
        itemRows += `
          <tr>
            <td>${i + 1}</td>
            <td>${item.label}</td>
            <td style="text-align:right">${formatWon(s.price)}</td>
            <td style="text-align:right">${s.qty}</td>
            <td style="text-align:right">${formatWon(lineTotal)}</td>
          </tr>`;
        detailRows += `<tr><td>${item.label}</td><td>${item.description}</td></tr>`;
      });

      const today = new Date().toLocaleDateString('ko-KR');
      const estimateNumber = await getEstimateNumber();

      let html = template
        .replaceAll('{{NUM}}', estimateNumber)
        .replaceAll('{{COMPANY}}', companyName)
        .replaceAll('{{MANAGER}}', managerName)
        .replaceAll('{{PHONE}}', managerPhone)
        .replaceAll('{{DATE}}', today)
        .replaceAll('{{ITEM_ROWS}}', itemRows)
        .replaceAll('{{DETAIL_ROWS}}', detailRows)
        .replaceAll('{{SUPPLY}}', formatWon(state.subtotal))
        .replaceAll('{{TAX}}', formatWon(state.vat))
        .replaceAll('{{TOTAL}}', formatWon(state.total));

      const fileName = `${companyName}_견적서_${estimateNumber}.pdf`;
      const pdfBlob = await html2pdf()
        .set({
          margin: [5, 5, 5, 5],
          filename: fileName,
          image: { type: 'jpeg', quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(html)
        .outputPdf('blob');

      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('user_id', currentUserIdInput.value);
      formData.append('application_id', currentApplicationIdInput.value);
      formData.append('companyName', companyName);
      formData.append('pdf', pdfFile);
      formData.append('total_amount', state.total);
      formData.append('estimate_number', estimateNumber);

      const res = await fetch('/app/controllers/send_estimate_email.php', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);

      alert(`이메일 발송 완료!\n모두싸인 링크: ${result.sign_link}`);

      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('발송 오류: ' + err.message);
    }
  });
});
