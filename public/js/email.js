let ITEMS = [];
let state = { items: [], selections: {}, subtotal: 0, vat: 0, total: 0 };

document.addEventListener('DOMContentLoaded', () => {
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const currentUserIdInput = document.getElementById('currentUserId');
  const currentApplicationIdInput = document.getElementById('currentApplicationId');
  const companyNameInput = document.getElementById('companyName');
  const managerInput = document.getElementById('managerName');
  const phoneInput = document.getElementById('managerPhone');

  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get('estimateId');
  if (!applicationId) {
    alert('applicationId가 없습니다. URL을 확인해주세요.');
    return;
  }

  currentApplicationIdInput.value = applicationId;

  function formatWon(n) { return '₩' + (Number(n) || 0).toLocaleString(); }

  fetch('/estimate/app/controllers/get_products.php')
    .then(res => res.json())
    .then(products => {
      ITEMS = products.map(p => ({
        id: String(p.id),
        label: p.name,
        price: parseInt(p.price || 0),
        description: p.description || '-'
      }));
      state.items = JSON.parse(JSON.stringify(ITEMS));

      return fetch(`/estimate/app/controllers/get_application_detail.php?id=${applicationId}`);
    })
    .then(res => res.json())
    .then(data => {
      const application = data.application || {};
      const selectedProducts = data.products || [];

      companyNameInput.value = application.company_name || '';
      managerInput.value = application.user_name || '';
      phoneInput.value = application.phone || '';
      currentUserIdInput.value = application.user_id || '';

      selectedProducts.forEach(sel => {
        const idStr = String(sel.product_id);
        state.selections[idStr] = { qty: sel.quantity, price: sel.price };
      });

      ['18','19'].forEach(id => {
        if (!state.selections[id]) {
          const item = state.items.find(i => i.id === id);
          if (item) state.selections[id] = { qty: 1, price: item.price };
        }
      });
    })
    .catch(err => {
      console.error(err);
      alert('상품 또는 견적서 정보를 가져오지 못했습니다.');
    });

  async function getEstimateNumber() {
    const res = await fetch('/estimate/app/controllers/get_new_estimate_number.php');
    const data = await res.json();
    if (data.number) return data.number;
    throw new Error('견적번호 생성 실패');
  }

  sendEmailBtn?.addEventListener('click', async () => {
    try {
      if (!currentUserIdInput.value) throw new Error('해당 유저 없음');
      const companyName = (companyNameInput.value || '').trim() || '견적서';
      const managerName = (managerInput.value || '').trim();
      const managerPhone = (phoneInput.value || '').trim();

      let html = await (await fetch(`/estimate/app/views/pdf_template.html?${Date.now()}`)).text();

      const keys = Object.keys(state.selections);
      if (!keys.length) { alert('선택한 상품이 없습니다.'); return; }

      let itemRows = '', detailRows = '', subtotal = 0;
      keys.forEach((id, idx) => {
        const s = state.selections[id];
        const item = state.items.find(x => x.id === id);
        if (!item) return;
        const lineTotal = s.qty * s.price;
        subtotal += lineTotal;

        itemRows += `<tr>
          <td>${idx + 1}</td>
          <td>${item.label}</td>
          <td style="text-align:right">${formatWon(s.price)}</td>
          <td style="text-align:right">${s.qty}</td>
          <td style="text-align:right">${formatWon(lineTotal)}</td>
        </tr>`;
        detailRows += `<tr><td>${item.label}</td><td>${item.description}</td></tr>`;
      });

      const vat = Math.round(subtotal * 0.1);
      const total = subtotal + vat;
      state.subtotal = subtotal; state.vat = vat; state.total = total;

      const today = new Date().toLocaleDateString('ko-KR');
      const estimateNumber = await getEstimateNumber();

      html = html
        .replaceAll('{{NUM}}', estimateNumber)
        .replaceAll('{{COMPANY}}', companyName)
        .replaceAll('{{MANAGER}}', managerName)
        .replaceAll('{{PHONE}}', managerPhone)
        .replaceAll('{{DATE}}', today)
        .replaceAll('{{ITEM_ROWS}}', itemRows)
        .replaceAll('{{DETAIL_ROWS}}', detailRows)
        .replaceAll('{{SUPPLY}}', formatWon(subtotal))
        .replaceAll('{{TAX}}', formatWon(vat))
        .replaceAll('{{TOTAL}}', formatWon(total));

      const pdfBlob = await html2pdf()
        .set({
          margin: [5,5,5,5],
          filename: `${companyName}_${estimateNumber}.pdf`,
          image: { type:'jpeg', quality:0.96 },
          html2canvas: { scale:2, useCORS:true },
          jsPDF: { unit:'mm', format:'a4', orientation:'portrait' }
        })
        .from(html)
        .outputPdf('blob');

      const formData = new FormData();
      formData.append('user_id', currentUserIdInput.value);
      formData.append('application_id', applicationId);
      formData.append('companyName', companyName);
      formData.append('managerName', managerName);
      formData.append('managerPhone', managerPhone);
      formData.append('pdf', pdfBlob, `${companyName}_${estimateNumber}.pdf`);

      const res = await fetch('/estimate/app/controllers/send_estimate_email.php', { method:'POST', body: formData });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || '알 수 없는 오류');

      alert(`이메일 발송 완료!\n파일명: ${result.filename}\n견적번호: ${estimateNumber}`);

      const a = document.createElement('a');
      a.href = URL.createObjectURL(pdfBlob);
      a.download = `${companyName}_${estimateNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);

    } catch(err) {
      console.error(err);
      alert('이메일 발송 중 오류가 발생했습니다: ' + err.message);
    }
  });
});
