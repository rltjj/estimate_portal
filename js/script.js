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

    // 데이터
    const ITEMS = [
        { id: 'ci', label: 'CI 제작', price: 250000, description: "기업 아이덴티티 디자인 및 로고 제작을 통한 기업의 정체성과 신뢰성 확보\n직접적 가점은 없으나, 사업계획서·IR·홍보물·R&D 과제 신청서 등 제출자료에서 일관된 기업 이미지 제시.\n중소벤처기업부 「정책자금 운용요령」은 “기업 신뢰도 및 시장성”을 평가 항목으로 포함.\n최종 ai/eps 포함.\n예상 기간 : 2주(샘플 5안, 택 1)" },
        { id: 'homepage', label: '홈페이지 제작', price: 500000, description: "홈페이지 디자인 및 개발. 디지털 기반 경영 필수 요건, 해외 수출기업은 필수. 수출바우처, 수출보험, 중진공 수출금융 신청 시 필수. 온라인 비즈니스 인증(예: K-비즈 플랫폼) 연계. 산업통상자원부 “수출지원기반활용사업” 가이드라인(2024)은 홈페이지·영문 웹페이지 보유 여부를 심사 항목으로 명시." },
        { id: 'domain', label: '도메인 등록', price: 30000, description: "상호·브랜드 법적 보호. 직접 가점은 없으나, 브랜드 상표권·수출 바우처 사업에서 요구됨. 한국인터넷진흥원(KISA) 정책: 공공기관·지자체 수출 지원사업에서 공식 도메인을 보유해야 사업참여 인정. " },
        { id: 'server', label: '서버 사용/관리', price: 50000, description: "안정적 정보보안 체계. 정부 과제 참여 시 정보보안 관리체계(ISMS) 요구 가능. 서버관리 안정성은 기술보증기금·R&D 과제 심사 시 가산점 요인. 과학기술정보통신부 「정보보호 관리체계(ISMS) 인증 제도」. 트래픽/백업 포함, 월 단위" },
        { id: 'trademark', label: '상표권', price: 900000, description: "브랜드 자산 보호, 기술탈취 방지. IP 담보대출 가능 (특허·상표를 담보로 보증·대출). IP 기반 기업평가(IP 평가보증) 신청 가능. 특허청/신용보증기금 「IP금융 활성화 제도」: 등록 상표 보유 기업은 평가·담보로 정책자금 이용 가능. 등록·발급은 스케줄에 따름" },
        { id: 'patent', label: '특허(일반형)', price: 3500000, description: "정책자금·보증과의 연결\n기술보증기금(KIBO):보증 상담·심사에 특허 등 기술자료 반영, 투자연계·IP 보증 등 상품 운용\nIP 담보대출/보증: 특허의 가치평가를 토대로 보증비율 상향·보증료 감면 등 우대 상품 활용 가능/ \nKIPO 통계: IP 담보대출은 민간은행 확대로 대출잔액 급증, 평균 금리 2%대 사례 등 정책 확산" },
        { id: 'venture', label: '벤처기업 확인', price: 10000000, description: "세제·보증·판로 우대의 허브 \n벤처 확인 기업은 조세감면·자금조달·금융·기술인력 지원 종합 우대 대상.\n창업 후 벤처확인을 받은 기업은 법인세·취득세·재산세·등록면서세 감면 제도가 운용(요건 충족 필요)." },
        { id: 'startup_check', label: '창업기업 확인', price: 100000, description: "공공조달 시범구매제도 등에서 설립 7년 이하 요건과 함께 우선구매/수의계약 특례 적용 대상\n세제 연계: 조세특례제한법상 창업중소기업 법인세 50~100% 감면(5년) 요건 판단과 연계" },
        { id: 'sme_check', label: '중소기업 확인', price: 50000, description: "정부지원사업·정책자금 신청 시 기본 자격 증명서로 광범위하게 활용. 공공조달 진입에서 업체 구분·우대 제도 적용의 전제가 되는 경우가 다수. 중소기업제품 공공구매, 직접생산확인, 시범구매 등 각종 판로지원 제도의 기본 요건" },
        { id: 'women_enterprise', label: '여성기업 확인', price: 200000, description: "공공구매 의무비율(가점·우대 근거)\n공공기관은 물품·용역 5% 이상, 공사 3% 이상을 여성기업 제품으로 구매해야 함(법률 및 시행령) → 여성기업은 공공조달에서 우선구매·가산점 등 실질 우위." },
        { id: 'cert_package', label: '인증 패키지', price: 300000, description: "벤처, 이노비즈, 메인비즈, ISO 통합 인증\n각종 인증 가점이 누적 → 정부과제 선정률, 보증심사 통과율 상승. 중소벤처기업부 “정책자금 평가항목표”(2024) → “인증 보유 현황”이 평가항목." },
        { id: 'iso9001', label: 'ISO 9001', price: 3500000, description: "조달/납품 실무 효과\n다수의 공공·대기어 PQ/입찰 자격·평가 항목에서 품질/환경체계 요건으로 활용(공고별 명시). 조달청 적격심사 '기술인증·정책지원' 항목 가점 신설·정비 등 인증계열 가점트렌드" },
        { id: 'iso14001', label: 'ISO 14001', price: 350000, description: "조달/납품 실무 효과\n다수의 공공·대기어 PQ/입찰 자격·평가 항목에서 품질/환경체계 요건으로 활용(공고별 명시). 조달청 적격심사 '기술인증·정책지원' 항목 가점 신설·정비 등 인증계열 가점트렌드" },
        { id: 'mainbiz', label: '메인비즈', price: 3000000, description: "정책우대\n정부지원 참여 가점, 정책자금 한도 우대·보증 우대 등(협회 고지). 조달 연계 적격심사 신인도 평가에서 가점 부여(공고별 기준 적용, 조달청 세부기준 참조)." },
        { id: 'innobiz', label: '이노비즈', price: 3500000, description: "정책/보증 우대\n중기부 정책자금·KIBO 보증 등 우대연계 제도 존재(협회/정부 안내).\n조달 연계\n적격심사 가산점 부여 운영(제조/비제조 차등 사례 고지: 공고별 상이)" },
        { id: 'business_plan', label: '사업계획서', price: 1500000, description: "모든 정책자금 심사의 핵심 자료\n정책자금 심사 시 가장 중요한 서류. 금융기관 신용평가, 투자자 심사에서도 결정적 역할. 중진공 「정책자금 신청지침」(2025) → “사업계획서 적정성”은 필수 심사항목." },
        { id: 'company_profile', label: '회사소개서/IR', price: 1200000, description: "투자자·금융기관 커뮤니케이션 도구\nIR 자료는 모태펀드·정책펀드·창투사 매칭 투자에 필요. 정책금융기관 투자 심사 가점. 한국벤처투자 모태펀드 운용지침(2024)." },
        { id: 'video_youtube', label: '영상/유튜브', price: 1500000, description: "홍보·브랜드 신뢰성 강화\n 직접적 가점은 없으나, 투자자·기관 심사 시 기업 신뢰성 제고. ESG·사회적 가치 홍보에 강점. 중소기업 ESG 경영 가이드라인(2023) → “기업 홍보·투명성”은 ESG 가점 요소." }
    ];

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
