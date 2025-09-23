// email.js
document.addEventListener('DOMContentLoaded', () => {
  const sendEmailBtn = document.getElementById('sendEmailBtn');
  if (!sendEmailBtn) return;

  sendEmailBtn.addEventListener('click', async () => {
    const companyName = document.getElementById('companyName')?.value.trim();
    const managerName = document.getElementById('managerName')?.value.trim();
    const managerPhone = document.getElementById('managerPhone')?.value.trim();
    const previewArea = document.getElementById('previewArea');

    if (!companyName || !managerName || !managerPhone) {
      alert('회사명, 담당자, 연락처를 모두 입력해주세요.');
      return;
    }

    if (!previewArea || !previewArea.innerHTML.trim()) {
      alert('견적서 내용이 없습니다.');
      return;
    }

    try {
      // 미리보기 영역을 PDF Blob으로 변환
      const opt = {
        margin: 10,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const pdfBlob = await html2pdf().set(opt).from(previewArea).outputPdf('blob');

      // 서버로 전송
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('managerName', managerName);
      formData.append('managerPhone', managerPhone);
      formData.append('pdf', pdfBlob, `${companyName}_견적서.pdf`);

      const res = await fetch('/estimate/public/api/send_email.php', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('서버 오류');
      const result = await res.json();

      if (result.success) {
        alert('이메일 발송 완료!');
      } else {
        alert('이메일 발송 실패: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('이메일 발송 중 오류가 발생했습니다.');
    }
  });
});
