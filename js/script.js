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
    const params = new URLSearchParams(window.location.search);
    const estimateId = params.get('estimateId');

    const data = {
        userInfo: { company: "(주)성진글로벌", manager: "홍길동", phone: "010-1234-5678" },
        selections: [
            { id: "ci", qty: 1, price: 250000 },
            { id: "homepage", qty: 2, price: 500000 }
        ]
    };

    companyNameInput.value = data.userInfo.company;
    managerInput.value = data.userInfo.manager;
    phoneInput.value = data.userInfo.phone;

    state.selections = {};
    data.selections.forEach(s => state.selections[s.id] = { qty: s.qty, price: s.price });

    let state = {
        items: JSON.parse(JSON.stringify(ITEMS)),
        selections: {}
    };

    function formatWon(n) {
        try {
            const num = Number(n) || 0;
            return '₩' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } catch {
            return '₩' + n;
        }
    }

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
            <div style="font-size:12px;color:var(--muted);margin-top:3px">기본 단가: ${formatWon(item.price)}</div>
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

    // 견적서
    function renderPreview() {
        if (!previewArea) return;
        try {
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
              ${(manager || phone)
                    ? `<div style="font-size:13px;color:var(--muted);margin-top:4px">
                       ${manager ? `담당자: ${manager}<br>` : ''}${phone ? `연락처: ${phone}` : ''}
                     </div>`
                    : ''}
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
          <div class="small-note">
            ※ 관공서·정부 납부등록세/수수료·부가세 등은 전부 별도 청구합니다.<br>
            ※ 기관별 요구 서류·심사 기준이 상이할 수 있으므로 사전 체크리스트로 확정 후 진행합니다.
          </div>
        </div>
      `;
        } catch (err) {
            console.error('[renderPreview error]', err);
            previewArea.innerHTML = '<div class="placeholder">미리보기 생성 중 오류가 발생했습니다.</div>';
        }
    }

    // PDF 생성
    function generatePdf() {
        const invoiceEl = document.getElementById('invoiceForPdf') || previewArea;
        const pdfClone = invoiceEl.cloneNode(true);

        // PDF 전용 상세설명 추가
        const checkedIds = Object.keys(state.selections);
        if (checkedIds.length > 0) {
            const extra = document.createElement('div');
            extra.style.marginTop = '12px';
            extra.innerHTML = `<h4>선택 항목 상세설명</h4>`;

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = '12px';

            const thead = document.createElement('thead');
            thead.innerHTML = `
        <tr>
            <th style="border:1px solid #000;padding:4px;text-align:left">서비스</th>
            <th style="border:1px solid #000;padding:4px;text-align:left">상세설명</th>
        </tr>
    `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            checkedIds.forEach(id => {
                const item = ITEMS.find(x => x.id === id);
                if (!item) return;
                const tr = document.createElement('tr');
                tr.innerHTML = `
            <td style="border:1px solid #000;padding:4px;width:140px">${item.label}</td>
            <td style="border:1px solid #000;padding:4px">${item.description.replace(/\n/g, '<br>')}</td>
        `;
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            extra.appendChild(table);
            pdfClone.appendChild(extra);
        }


        const opt = {
            margin: [10, 10, 10, 10],
            filename: (companyNameInput?.value?.trim() || '견적서') + '_' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(pdfClone).save();
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

    renderChecklist();
    renderPricingEditor();
    updateSummary();
});
