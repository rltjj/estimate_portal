const urlParams = new URLSearchParams(window.location.search);
const applicationId = urlParams.get('estimateId');

const requirementsContainer = document.querySelector('#requirementsEditor .requirement-list');

if (applicationId) {
    fetch(`/app/controllers/get_requirements_by_application.php?application_id=${applicationId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.requirements && data.requirements.length > 0) {
                data.requirements.forEach(req => {
                    const div = document.createElement('div');
                    div.classList.add('requirement-item');
                    div.textContent = req.value ? `${req.title}: ${req.value}` : req.title;
                    requirementsContainer.appendChild(div);
                });
            } else {
                requirementsContainer.textContent = '요구사항 데이터가 없습니다.';
            }
        })
        .catch(err => {
            console.error(err);
            requirementsContainer.textContent = '요구사항을 불러오는 중 오류가 발생했습니다.';
        });
} else {
    requirementsContainer.textContent = '유효하지 않은 신청 ID입니다.';
}

