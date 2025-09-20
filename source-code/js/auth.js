// (c) diyyo 2025 MIT License
// Provider autentikasi
const googleProvider = new firebase.auth.GoogleAuthProvider();
const githubProvider = new firebase.auth.GithubAuthProvider();

// Elemen UI
const loginSection = document.getElementById('loginSection');
const mainContent = document.getElementById('mainContent');
const googleLoginBtn = document.getElementById('googleLogin');
const githubLoginBtn = document.getElementById('githubLogin');
const logoutBtn = document.getElementById('logoutBtn');

// Variabel untuk idle timeout
let idleTimer = null;
let idleWarningTimer = null;
let countdownTimer = null;
let isIdleWarningShown = false;
let isIdleTimeoutShown = false;
let lastActivity = Date.now();

// Fungsi untuk menampilkan toast
function showToast(message, type = 'success') {
    const toast = Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        style: {
            background: type === 'success' ? '#10B981' : '#EF4444',
            borderRadius: '8px',
            padding: '12px 24px',
            cursor: 'pointer'
        },
        onClick: function() {
            toast.hideToast();
        }
    }).showToast();
}

// Fungsi untuk custom alert
function customConfirm(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert';
        alertBox.innerHTML = `
            <div class="text-lg font-medium mb-4">${message}</div>
            <div class="custom-alert-buttons">
                <button class="custom-alert-button custom-alert-button-cancel">Batal</button>
                <button class="custom-alert-button custom-alert-button-confirm">Ya</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        document.body.appendChild(alertBox);
        
        const cancelBtn = alertBox.querySelector('.custom-alert-button-cancel');
        const confirmBtn = alertBox.querySelector('.custom-alert-button-confirm');
        
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(alertBox);
            resolve(false);
        };
        
        confirmBtn.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(alertBox);
            resolve(true);
        };
    });
}

// Fungsi untuk menampilkan loading state
function showLoadingState() {
    googleLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memuat...';
    githubLoginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memuat...';
    googleLoginBtn.disabled = true;
    githubLoginBtn.disabled = true;
}

// Fungsi untuk mereset loading state
function resetLoadingState() {
    googleLoginBtn.innerHTML = `
        <img src="https://www.google.com/favicon.ico" class="w-5 h-5 mr-2" alt="Google" />
        Login dengan Google
    `;
    githubLoginBtn.innerHTML = `
        <i class="fab fa-github mr-2"></i>
        Login dengan GitHub
    `;
    googleLoginBtn.disabled = false;
    githubLoginBtn.disabled = false;
}

// Fungsi login
async function loginWithProvider(provider) {
    // Simpan referensi tombol dan teks aslinya
    const loginBtn = provider === googleProvider ? googleLoginBtn : githubLoginBtn;
    const originalText = loginBtn.innerHTML;
    
    try {
        // Tampilkan loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memuat...';
        loginBtn.disabled = true;

        // Tunggu proses autentikasi
        await auth.signInWithPopup(provider);
        
        // Reset button state
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        
        showToast('Berhasil login!');
    } catch (error) {
        console.error('Error login:', error);
        
        // Reset button state
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        
        // Jika error adalah popup closed atau dibatalkan, tidak perlu menampilkan pesan error
        if (error.code !== 'auth/popup-closed-by-user' && 
            error.code !== 'auth/cancelled-popup-request' && 
            error.code !== 'auth/popup-blocked') {
            showToast('Gagal login. Silakan coba lagi.', 'error');
        }
    }
}

// Event listeners untuk tombol login
googleLoginBtn.addEventListener('click', () => loginWithProvider(googleProvider));
githubLoginBtn.addEventListener('click', () => loginWithProvider(githubProvider));

// Event listener untuk tombol logout
logoutBtn.addEventListener('click', async () => {
    const confirmed = await customConfirm('Apakah Anda yakin ingin logout?');
    if (!confirmed) return;

    try {
        await auth.signOut();
        showToast('Berhasil logout!');
    } catch (error) {
        console.error('Error logout:', error);
        showToast('Gagal logout. Silakan coba lagi.', 'error');
    }
});

// Fungsi untuk mengecek koneksi database
async function checkDatabaseConnection(userId) {
    try {
        // Coba menulis data test
        const testRef = database.ref(`connection_test/${userId}`);
        await testRef.set({
            timestamp: new Date().toISOString()
        });
        
        // Coba membaca data test
        const snapshot = await testRef.once('value');
        if (snapshot.exists()) {
            // Hapus data test
            await testRef.remove();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking database connection:', error);
        return false;
    }
}

// Fungsi untuk menampilkan popup error database
function showDatabaseErrorPopup() {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
        <div class="text-lg font-medium mb-4">Gagal terhubung ke server!</div>
        <div class="text-sm text-gray-600 mb-4">Akun anda mungkin belum terverifikasi. Jika anda baru saja mendaftar, silahkan hubungi kami. Atau cobalah untuk logout dan login kembali!</div>
        <div class="custom-alert-buttons">
            <button class="custom-alert-button custom-alert-button-confirm">Logout</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);
    
    const logoutBtn = alertBox.querySelector('.custom-alert-button-confirm');
    
    logoutBtn.onclick = async () => {
        document.body.removeChild(overlay);
        document.body.removeChild(alertBox);
        try {
            await auth.signOut();
            showToast('Berhasil logout!');
        } catch (error) {
            console.error('Error logout:', error);
            showToast('Gagal logout. Silakan coba lagi.', 'error');
        }
    };
}

// Fungsi untuk menampilkan popup idle warning
function showIdleWarningPopup() {
    if (isIdleWarningShown || isIdleTimeoutShown) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
        <div class="text-lg font-medium mb-2">Apakah kamu masih disana?</div>
        <p class="text-sm text-gray-600 mb-4">Kami mendeteksi tidak ada aktivitas dari Anda. Untuk keamanan, sesi akan berakhir jika tidak ada respons.</p>
        <div id="countdown" class="text-sm text-red-600 mb-4 hidden">Sesi akan berakhir dalam <span id="countdown-number">5</span> detik</div>
        <div class="custom-alert-buttons">
            <button class="custom-alert-button bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Saya Disini
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);
    isIdleWarningShown = true;
    
    const confirmBtn = alertBox.querySelector('.custom-alert-button');
    const countdownElement = document.getElementById('countdown');
    const countdownNumber = document.getElementById('countdown-number');
    
    confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        document.body.removeChild(alertBox);
        isIdleWarningShown = false;
        if (countdownTimer) clearInterval(countdownTimer);
        resetIdleTimer();
    };
    
    // Mulai timer untuk idle timeout
    startIdleTimeoutTimer(countdownElement, countdownNumber);
}

// Fungsi untuk memulai timer idle timeout
function startIdleTimeoutTimer(countdownElement, countdownNumber) {
    if (idleWarningTimer) clearTimeout(idleWarningTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    
    // Mulai countdown 10 detik sebelum timeout
    idleWarningTimer = setTimeout(() => {
        if (isIdleWarningShown) {
            let count = 10;
            countdownElement.classList.remove('hidden');
            countdownNumber.textContent = count;
            
            countdownTimer = setInterval(() => {
                count--;
                countdownNumber.textContent = count;
                
                if (count <= 0) {
                    clearInterval(countdownTimer);
                    showIdleTimeoutPopup();
                }
            }, 1000);
        }
    }, 20000); // 20 detik sebelum countdown dimulai (total 30 detik)
}

// Fungsi untuk menampilkan popup idle timeout
function showIdleTimeoutPopup() {
    if (isIdleTimeoutShown) return;
    
    // Hapus popup warning jika masih ada
    if (isIdleWarningShown) {
        const warningOverlay = document.querySelector('.custom-alert-overlay');
        const warningBox = document.querySelector('.custom-alert');
        if (warningOverlay && warningBox) {
            document.body.removeChild(warningOverlay);
            document.body.removeChild(warningBox);
        }
        isIdleWarningShown = false;
    }
    
    // Putuskan koneksi database
    database.goOffline();
    
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    const alertBox = document.createElement('div');
    alertBox.className = 'custom-alert';
    alertBox.innerHTML = `
        <div class="text-lg font-medium mb-2">Sesi Anda telah berakhir!</div>
        <p class="text-sm text-gray-600 mb-4">Sesi Anda telah berakhir karena tidak ada aktivitas. Silahkan muat ulang halaman.</p>
        <div class="custom-alert-buttons">
            <button class="custom-alert-button bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                Muat Ulang Halaman
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(alertBox);
    isIdleTimeoutShown = true;
    
    const reloadBtn = alertBox.querySelector('.custom-alert-button');
    
    reloadBtn.onclick = () => {
        window.location.reload();
    };
}

// Fungsi untuk mereset idle timer
function resetIdleTimer() {
    lastActivity = Date.now();
    
    // Jika warning sudah muncul, reset timer timeout
    if (isIdleWarningShown) {
        // Sembunyikan countdown jika sedang aktif
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            countdownElement.classList.add('hidden');
        }
        if (countdownTimer) clearInterval(countdownTimer);
        startIdleTimeoutTimer(countdownElement, document.getElementById('countdown-number'));
        return;
    }
    
    // Jika warning belum muncul, reset timer warning
    if (idleTimer) clearTimeout(idleTimer);
    if (idleWarningTimer) clearTimeout(idleWarningTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    
    // Mulai timer baru (3 menit)
    idleTimer = setTimeout(() => {
        showIdleWarningPopup();
    }, 120000);
}

// Fungsi untuk memulai idle timer
function startIdleTimer() {
    // Reset status
    isIdleWarningShown = false;
    isIdleTimeoutShown = false;
    lastActivity = Date.now();
    
    // Clear semua timer
    if (idleTimer) clearTimeout(idleTimer);
    if (idleWarningTimer) clearTimeout(idleWarningTimer);
    if (countdownTimer) clearInterval(countdownTimer);
    
    // Event listeners untuk aktivitas user
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
        document.addEventListener(event, resetIdleTimer);
    });
    
    // Mulai timer
    resetIdleTimer();
}

// Modifikasi observer untuk status autentikasi
auth.onAuthStateChanged(async (user) => {
    if (user) {
        try {
            // User sudah login
            loginSection.classList.add('hidden');
            mainContent.classList.remove('hidden');

            // Cek koneksi database
            const isConnected = await checkDatabaseConnection(user.uid);
            if (isConnected) {
                showToast('Terhubung ke server!');
                // Load data hutang
                loadDebts();
                // Mulai idle timer
                startIdleTimer();
            } else {
                showDatabaseErrorPopup();
            }
        } catch (error) {
            console.error('Error during auto-login:', error);
            // Reset loading state jika terjadi error
            resetLoadingState();
            showToast('Gagal memuat data. Silakan coba login kembali.', 'error');
        }
    } else {
        // User belum login
        loginSection.classList.remove('hidden');
        mainContent.classList.add('hidden');
        resetLoadingState();
        
        // Hapus event listeners idle timer
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
            document.removeEventListener(event, resetIdleTimer);
        });
        
        // Clear timers
        if (idleTimer) clearTimeout(idleTimer);
        if (idleWarningTimer) clearTimeout(idleWarningTimer);
    }
});

// Tampilkan loading state saat halaman dimuat
showLoadingState(); 