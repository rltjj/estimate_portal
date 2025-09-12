document.getElementById('googleLogin').addEventListener('click', () => {
    alert('Google 로그인 성공! (임시)');
    redirectAfterLogin('user');
});

document.getElementById('naverLogin').addEventListener('click', () => {
    alert('Naver 로그인 성공! (임시)');
    redirectAfterLogin('user');
});

document.getElementById('emailLogin').addEventListener('click', () => {
    const email = document.getElementById('email').value;
    if (!email) { alert('이메일을 입력하세요.'); return; }

    //일단 임시로 관리자 역할 트리거 나중에 수정하기
    const role = (email === 'admin@example.com') ? 'admin' : 'user';
    alert(`로그인 성공! (${role})`);
    redirectAfterLogin(role);
});

function redirectAfterLogin(role) {
    if (role === 'admin') {
        window.location.href = '/admin.html';
    } else {
        window.location.href = '/customer.html';
    }
}
