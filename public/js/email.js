document.addEventListener('DOMContentLoaded', () => {
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  const previewArea = document.getElementById('previewArea');
  const currentUserIdInput = document.getElementById('currentUserId');
  const currentApplicationIdInput = document.getElementById('currentApplicationId');

  // URL에서 estimateId 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const applicationId = urlParams.get('estimateId'); // ?estimateId=3

  if (!applicationId) {
    alert('applicationId가 없습니다. URL을 확인해주세요.');
    return;
  }

  currentApplicationIdInput.value = applicationId; // ★ applicationId input에 넣기

  // applicationId로 사용자 정보 가져오기
  fetch(`/estimate/app/controllers/get_application_detail.php?id=${applicationId}`)
    .then(res => res.json())
    .then(data => {
      console.log('fetch 결과:', data);

      if (!data.application || !data.application.user_id) {
        alert('사용자 정보가 없습니다. 해당 견적서를 확인할 수 없습니다.');
        return;
      }

      const userId = data.application.user_id;
      currentUserIdInput.value = userId; // ★ userId input에 넣기

      const companyNameDefault = data.application.company_name || '견적서';
      const managerNameDefault = data.application.user_name || '';
      const managerPhoneDefault = data.application.phone || '';

      // 버튼 클릭 이벤트 연결
      sendEmailBtn?.addEventListener('click', async () => {
        const companyName = document.getElementById('companyName')?.value.trim() || companyNameDefault;
        const managerName = document.getElementById('managerName')?.value.trim() || managerNameDefault;
        const managerPhone = document.getElementById('managerPhone')?.value.trim() || managerPhoneDefault;

        if (!previewArea || !previewArea.innerHTML.trim()) {
          alert('견적서 내용이 없습니다.');
          return;
        }

        try {
          const pdfBlob = await html2pdf()
            .set({
              margin: 10,
              image: { type: 'jpeg', quality: 0.95 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            })
            .from(previewArea)
            .outputPdf('blob');

          const formData = new FormData();
          formData.append('user_id', userId);
          formData.append('application_id', applicationId);
          formData.append('companyName', companyName);
          formData.append('managerName', managerName);
          formData.append('managerPhone', managerPhone);
          formData.append('pdf', pdfBlob, `${companyName}.pdf`);

          const res = await fetch('/estimate/app/controllers/send_estimate_email.php', {
            method: 'POST',
            body: formData
          });

          const result = await res.json();
          if (!result.success) throw new Error(result.error || '알 수 없는 오류');

          alert(`이메일 발송 완료!\n파일명: ${result.filename}\n견적번호: ${result.estimate_no}`);

          // 브라우저에서도 PDF 다운로드
          const a = document.createElement('a');
          a.href = URL.createObjectURL(pdfBlob);
          a.download = `${companyName}_${result.estimate_no}.pdf`;
          a.click();
          URL.revokeObjectURL(a.href);

        } catch (err) {
          console.error(err);
          alert('이메일 발송 중 오류가 발생했습니다: ' + err.message);
        }
      });
    })
    .catch(err => {
      console.error('사용자 정보 fetch 실패:', err);
      alert('사용자 정보를 가져오지 못했습니다. 콘솔을 확인하세요.');
    });
});
