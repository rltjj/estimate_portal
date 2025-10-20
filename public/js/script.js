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
    let state = { items: [], selections: {} };

    function formatWon(n) {
        const num = Number(n) || 0;
        return '₩' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // 데이터 불러오기
    fetch('/app/controllers/get_products.php')
      .then(res => res.json())
      .then(data => {
          ITEMS = data.map(p => ({
              id: p.id,
              label: p.name,
              price: parseInt(p.price) || 0,
              description: p.description || ''
          }));
          state.items = JSON.parse(JSON.stringify(ITEMS));
          renderChecklist();
          renderPricingEditor();
          updateSummary();
      })
      .catch(err => console.error('[DB fetch error]', err));

    // 체크리스트
    function renderChecklist() {
        if (!checklistEl) return;
        checklistEl.innerHTML = '';
        state.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'item';
            row.innerHTML = `
            <label style="display:flex;align-items:center;gap:8px;width:100%">
                <input type="checkbox" data-id="${item.id}">
                <div>
                    <div style="font-weight:600">${item.label}</div>
                    <div style="font-size:12px;color:var(--muted);margin-top:3px">
                        기본 단가: ${formatWon(item.price)}
                    </div>
                </div>
                <div class="meta">
                    <div class="price" data-price-id="${item.id}">${formatWon(item.price)}</div>
                    <input type="number" min="1" value="1" data-qty-id="${item.id}">
                </div>
            </label>
            `;
            checklistEl.appendChild(row);
        });

        checklistEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.addEventListener('change', onCheckToggle);
        });
        checklistEl.querySelectorAll('input[type="number"]').forEach(n => {
            n.addEventListener('input', onQtyChange);
        });
    }

    // 가격 수정
    function renderPricingEditor() {
        if (!pricingEditor) return;
        pricingEditor.innerHTML = '';
        state.items.forEach(item => {
            const el = document.createElement('div');
            el.style.display = 'flex';
            el.style.justifyContent = 'space-between';
            el.style.alignItems = 'center';
            el.style.gap = '8px';
            el.innerHTML = `
            <div style="min-width:160px">${item.label}</div>
            <input type="number" min="0" value="${item.price}" data-edit-price="${item.id}" style="width:120px">
            `;
            pricingEditor.appendChild(el);
        });

        pricingEditor.querySelectorAll('[data-edit-price]').forEach(input => {
            input.addEventListener('input', e => {
                const id = e.target.getAttribute('data-edit-price');
                const v = parseInt(e.target.value) || 0;
                const item = state.items.find(x => x.id === id);
                if (item) item.price = Math.max(0, v);
                const priceCell = document.querySelector(`[data-price-id="${id}"]`);
                if (priceCell) priceCell.textContent = formatWon(item.price);
                if (state.selections[id]) {
                    state.selections[id].price = item.price;
                    updateSummary();
                }
            });
        });
    }

    // 체크박스
    function onCheckToggle(e) {
        const id = e.target.getAttribute('data-id');
        const qtyEl = document.querySelector(`[data-qty-id="${id}"]`);
        const item = state.items.find(x => x.id === id);
        if (!item) return;
        const price = item.price;
        if (e.target.checked) {
            const qty = Math.max(1, parseInt(qtyEl?.value) || 1);
            state.selections[id] = { qty, price };
        } else {
            delete state.selections[id];
        }
        updateSummary();
    }

    function onQtyChange(e) {
        const id = e.target.getAttribute('data-qty-id');
        const qty = Math.max(1, parseInt(e.target.value) || 1);
        e.target.value = qty;
        if (state.selections[id]) {
            state.selections[id].qty = qty;
        }
        updateSummary();
    }

    // 미리보기
    function updateSummary() {
        const keys = Object.keys(state.selections);
        let total = 0;
        keys.forEach(id => {
            const s = state.selections[id];
            total += (s.qty * s.price);
        });
        if (selectedCountEl) selectedCountEl.textContent = String(keys.length);
        if (totalAmountEl) totalAmountEl.textContent = formatWon(total);
        renderPreview();
        if (downloadPdfBtn) downloadPdfBtn.disabled = keys.length === 0;
    }

    function renderPreview() {
        if (!previewArea) return;
        const keys = Object.keys(state.selections);
        if (keys.length === 0) {
            previewArea.innerHTML = '<div class="placeholder">선택한 항목이 없습니다.</div>';
            return;
        }

        const company = (companyNameInput?.value || '').trim();
        const manager = (managerInput?.value || '').trim();
        const phone = (phoneInput?.value || '').trim();
        const today = new Date().toLocaleDateString('ko-KR');

        let rows = '';
        let subtotal = 0;
        keys.forEach(id => {
            const item = state.items.find(x => x.id === id);
            if (!item) return;
            const s = state.selections[id];
            const lineTotal = s.qty * s.price;
            subtotal += lineTotal;
            rows += `
            <tr>
                <td>${item.label}</td>
                <td class="right">${s.qty}</td>
                <td class="right">${formatWon(s.price)}</td>
                <td class="right">${formatWon(lineTotal)}</td>
            </tr>
            `;
        });

        previewArea.innerHTML = `
        <div id="invoiceForPdf">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div class="company">${company || '견적서'}</div>
                    ${(manager || phone) ? `<div style="font-size:13px;color:var(--muted);margin-top:4px">
                    ${manager ? `담당자: ${manager}<br>` : ''}${phone ? `연락처: ${phone}` : ''}
                    </div>` : ''}
                    <div style="font-size:13px;color:var(--muted);margin-top:4px">발행일: ${today}</div>
                </div>
            </div>
            <table class="invoice-items">
                <thead>
                    <tr><th>서비스</th><th class="right">수량</th><th class="right">단가</th><th class="right">금액</th></tr>
                </thead>
                <tbody>
                    ${rows}
                    <tr>
                        <td colspan="2"></td>
                        <td class="right"><b>합계</b></td>
                        <td class="right total-row">${formatWon(subtotal)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        `;
    }

    // PDF 생성
    function generatePdf() {
        const invoiceEl = document.getElementById('invoiceForPdf') || previewArea;
        html2pdf().set({
            margin: [10,10,10,10],
            filename: (companyNameInput?.value?.trim() || '견적서') + '_' + new Date().toISOString().slice(0,10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(invoiceEl.cloneNode(true)).save();
    }

    // 초기화
    function resetAll() {
        state.items = JSON.parse(JSON.stringify(ITEMS));
        state.selections = {};
        renderChecklist();
        renderPricingEditor();
        updateSummary();
    }

    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', generatePdf);
    if (resetBtn) resetBtn.addEventListener('click', () => { if (confirm('초기화하시겠습니까?')) resetAll(); });
    if (companyNameInput) companyNameInput.addEventListener('input', renderPreview);
    if (managerInput) managerInput.addEventListener('input', renderPreview);
    if (phoneInput) phoneInput.addEventListener('input', renderPreview);
});
