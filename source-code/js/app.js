// (c) diyyo 2025 MIT License
// Elemen UI
const debtForm = document.getElementById('debtForm');
const debtList = document.getElementById('debtList');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const exportBtn = document.getElementById('exportBtn');
const exportSelectedBtn = document.getElementById('exportSelectedBtn');
const importFile = document.getElementById('importFile');
const totalDebtElement = document.getElementById('totalDebt');
const paidDebtElement = document.getElementById('paidDebt');
const unpaidDebtElement = document.getElementById('unpaidDebt');
const selectAll = document.getElementById('selectAll');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const markAsPaidBtn = document.getElementById('markAsPaidBtn');
const markAsUnpaidBtn = document.getElementById('markAsUnpaidBtn');
const addDebtBtn = document.getElementById('addDebtBtn');
const addDebtModal = document.getElementById('addDebtModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const manageDebtorsBtn = document.getElementById('manageDebtorsBtn');
const manageDebtorsModal = document.getElementById('manageDebtorsModal');
const closeDebtorsModalBtn = document.getElementById('closeDebtorsModalBtn');
const newDebtorName = document.getElementById('newDebtorName');
const addDebtorBtn = document.getElementById('addDebtorBtn');
const debtorsList = document.getElementById('debtorsList');
const debtorName = document.getElementById('debtorName');
const debtorDropdownBtn = document.getElementById('debtorDropdownBtn');
const debtorDropdown = document.getElementById('debtorDropdown');
const selectAllDebtors = document.getElementById('selectAllDebtors');
const deleteSelectedDebtorsBtn = document.getElementById('deleteSelectedDebtorsBtn');
const deleteAllDebtorsBtn = document.getElementById('deleteAllDebtorsBtn');
const partialPaymentModal = document.getElementById('partialPaymentModal');
const closePartialPaymentModalBtn = document.getElementById('closePartialPaymentModalBtn');
const cancelPartialPaymentBtn = document.getElementById('cancelPartialPaymentBtn');
const partialPaymentForm = document.getElementById('partialPaymentForm');
const clearPartialAmountBtn = document.getElementById('clearPartialAmountBtn');
const debtorSettingsModal = document.getElementById('debtorSettingsModal');
const closeDebtorSettingsModalBtn = document.getElementById('closeDebtorSettingsModalBtn');
const cancelDebtorSettingsBtn = document.getElementById('cancelDebtorSettingsBtn');
const saveDebtorSettingsBtn = document.getElementById('saveDebtorSettingsBtn');
const debtorSettingsName = document.getElementById('debtorSettingsName');
const debtorSettingsLimit = document.getElementById('debtorSettingsLimit');
const debtorSettingsBlacklist = document.getElementById('debtorSettingsBlacklist');
const clearLimitBtn = document.getElementById('clearLimitBtn');

// Set untuk menyimpan ID yang dipilih
const selectedDebts = new Set();
const selectedDebtors = new Set();

// Utility function untuk mengelola loading state
function setButtonLoading(button, isLoading, loadingText = 'Menyimpan...') {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `
      <i class="fas fa-spinner fa-spin mr-2"></i>
      ${loadingText}
    `;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
      delete button.dataset.originalText;
    }
  }
}

// Wrapper functions untuk tombol yang dibuat secara dinamis
async function deleteSinglePaymentWithLoading(debtId, paymentId) {
    const button = event.target.closest('button');
    setButtonLoading(button, true, 'Menghapus...');
    try {
        await deleteSinglePayment(debtId, paymentId);
    } finally {
        setButtonLoading(button, false);
    }
}

async function editDebtWithLoading(debtId) {
    const button = event.target.closest('button');
    setButtonLoading(button, true, 'Memproses...');
    try {
        await editDebt(debtId);
    } finally {
        setButtonLoading(button, false);
    }
}

async function deleteDebtorWithLoading(debtorId) {
    const button = event.target.closest('button');
    setButtonLoading(button, true, 'Menghapus...');
    try {
        await deleteDebtor(debtorId);
    } finally {
        setButtonLoading(button, false);
    }
}

async function deleteDebtWithLoading(debtId) {
    const button = event.target.closest('button');
    setButtonLoading(button, true, 'Menghapus...');
    try {
        await deleteDebt(debtId);
    } finally {
        setButtonLoading(button, false);
    }
}

// Set untuk menyimpan status hutang yang dipilih
const selectedDebtsStatus = new Set();

// Set tanggal default untuk form
document.getElementById('borrowDate').valueAsDate = new Date();

// Variabel untuk menyimpan popup offline
let offlinePopup = null;

// Variabel untuk menyimpan data hutang yang sedang diedit
let editingDebtData = null;

// Variabel untuk menyimpan data hutang yang sedang dibayar cicilan
let currentPartialPaymentDebt = null;

// Variabel untuk menyimpan data penghutang yang sedang diatur
let currentDebtorSettings = null;

// Variabel untuk menyimpan data hutang yang sudah difilter dan di-sort
let currentDebts = [];
let currentSortField = 'createdAt';
let currentSortDirection = 'desc';

// Variabel untuk pagination
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;

// Fungsi untuk menampilkan popup offline
function showOfflinePopup() {
    if (offlinePopup) return;
    
    const popup = document.createElement('div');
    popup.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-sm w-full z-[60]';
    popup.innerHTML = `
        <div class="text-center">
            <i class="fas fa-wifi-slash text-4xl text-red-500 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Koneksi Internet</h3>
            <p class="text-gray-600">Aplikasi membutuhkan koneksi internet untuk berfungsi. Mohon periksa koneksi Anda.</p>
        </div>
    `;

    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 z-[55]';
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    offlinePopup = { overlay, popup };
}

// Fungsi untuk menutup popup offline
function hideOfflinePopup() {
    if (!offlinePopup) return;
    
    document.body.removeChild(offlinePopup.overlay);
    document.body.removeChild(offlinePopup.popup);
    offlinePopup = null;
}

// Event listener untuk status koneksi
window.addEventListener('online', () => {
    hideOfflinePopup();
    showToast('Terhubung ke internet!');
});

window.addEventListener('offline', () => {
    showOfflinePopup();
});

// Event listener untuk resize window - refresh format currency
let resizeTimeout;
window.addEventListener('resize', () => {
    // Debounce resize event untuk performa yang lebih baik
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        refreshCurrencyDisplay();
    }, 250);
});

// Fungsi untuk refresh tampilan currency setelah resize
function refreshCurrencyDisplay() {
    // Refresh statistics
    if (typeof updateStatistics === 'function') {
        const debts = getCurrentDebts();
        if (debts) {
            updateStatistics(debts);
        }
    }
    
    // Refresh debt list
    if (typeof renderDebtList === 'function') {
        const debts = getCurrentDebts();
        if (debts) {
            renderDebtList(debts);
        }
    }
    
    // Refresh debtor list jika modal terbuka
    if (typeof loadDebtors === 'function' && !document.getElementById('manageDebtorsModal').classList.contains('hidden')) {
        loadDebtors();
    }
}

// Fungsi helper untuk mendapatkan data debts saat ini
function getCurrentDebts() {
    // Coba ambil dari variabel global atau dari DOM
    if (typeof window.currentDebts !== 'undefined') {
        return window.currentDebts;
    }
    
    // Jika tidak ada, return null
    return null;
}

// Format currency
// Fungsi untuk mendeteksi apakah teks muat dalam kontainer
function textFitsInContainer(text, containerWidth, fontSize = 14) {
    // Buat elemen sementara untuk mengukur teks
    const tempElement = document.createElement('span');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontSize = fontSize + 'px';
    tempElement.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    tempElement.textContent = text;
    
    document.body.appendChild(tempElement);
    const textWidth = tempElement.offsetWidth;
    document.body.removeChild(tempElement);
    
    return textWidth <= containerWidth;
}

// Fungsi untuk mendapatkan lebar kontainer yang optimal
function getOptimalContainerWidth() {
    const screenWidth = window.innerWidth;
    
    // Untuk layar kecil (mobile), gunakan lebar yang lebih kecil
    if (screenWidth < 640) {
        return 80; // Mobile
    } else if (screenWidth < 768) {
        return 100; // Small tablet
    } else if (screenWidth < 1024) {
        return 120; // Tablet
    } else if (screenWidth < 1280) {
        return 150; // Desktop
    } else {
        return 200; // Large desktop
    }
}

// Fungsi untuk memformat angka dengan singkatan
function formatNumberWithAbbreviation(amount) {
    if (amount === 0) return '0';
    
    const abbreviations = [
        { value: 1e30, symbol: 'Noniliun' }, // Noniliun
        { value: 1e27, symbol: 'Oktiliun' }, // Oktiliun
        { value: 1e24, symbol: 'Septiliun' }, // Septiliun
        { value: 1e21, symbol: 'Sekstiliun' }, // Sekstiliun
        { value: 1e18, symbol: 'Kuintiliun' }, // Kuintiliun
        { value: 1e15, symbol: 'Kuadraliun' }, // Kuadraliun
        { value: 1e12, symbol: 'Triliun' },  // Triliun
        { value: 1e9, symbol: 'Miliar' },   // Miliar
        { value: 1e6, symbol: 'Juta' },  // Juta
        { value: 1e3, symbol: 'Ribu' }    // Ribu
    ];
    
    for (const { value, symbol } of abbreviations) {
        if (Math.abs(amount) >= value) {
            const divided = amount / value;
            let formatted;
            
            // Untuk angka yang sangat besar, gunakan format yang lebih sederhana
            if (Math.abs(divided) >= 1000) {
                formatted = Math.round(divided).toString();
            } else if (Math.abs(divided) >= 100) {
                formatted = divided.toFixed(1);
            } else if (Math.abs(divided) >= 10) {
                formatted = divided.toFixed(2);
            } else {
                formatted = divided.toFixed(3);
            }
            
            // Hapus trailing zeros dan koma yang tidak perlu
            const cleanFormatted = parseFloat(formatted).toString();
            return cleanFormatted + ' ' + symbol;
        }
    }
    
    // Jika kurang dari 1000, tampilkan angka biasa dengan pemisah ribuan
    return amount.toLocaleString('id-ID');
}

// Fungsi untuk memformat currency dengan format adaptif
function formatCurrency(amount, forceAbbreviate = false, customContainerWidth = null, customFontSize = null) {
    // Jika dipaksa untuk disingkat, langsung gunakan singkatan
    if (forceAbbreviate) {
        const abbreviated = formatNumberWithAbbreviation(amount);
        return 'Rp ' + abbreviated;
    }
    
    // Format lengkap dulu
    const fullFormat = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
    
    // Gunakan custom width atau default
    const containerWidth = customContainerWidth || getOptimalContainerWidth();
    const fontSize = customFontSize || 14;
    
    if (textFitsInContainer(fullFormat, containerWidth, fontSize)) {
        return fullFormat;
    } else {
        // Jika tidak muat, gunakan singkatan
        const abbreviated = formatNumberWithAbbreviation(amount);
        return 'Rp ' + abbreviated;
    }
}

// Fungsi khusus untuk format currency di tabel (dengan lebar lebih kecil)
function formatCurrencyForTable(amount) {
    return formatCurrency(amount, false, 100, 12);
}

// Fungsi khusus untuk format currency di modal (dengan lebar lebih besar)
function formatCurrencyForModal(amount) {
    return formatCurrency(amount, false, 200, 14);
}

// Format tanggal
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Cek status jatuh tempo
function checkDueDate(dueDate) {
    if (!dueDate) return '';
    const today = new Date();
    const due = new Date(dueDate);
    return due < today ? 'text-red-600' : '';
}

// Update statistik
function updateStatistics(debts) {
    let total = 0;
    let paid = 0;
    let unpaid = 0;

    debts.forEach(debt => {
        total += debt.amount;
        
        // Hitung total yang sudah dibayar (termasuk pembayaran cicilan)
        const totalPaid = debt.payments ? Object.values(debt.payments).reduce((sum, payment) => sum + payment.amount, 0) : 0;
        
        if (debt.status === 'paid' || totalPaid >= debt.amount) {
            paid += debt.amount;
        } else {
            unpaid += (debt.amount - totalPaid);
        }
    });

    totalDebtElement.textContent = formatCurrency(total);
    paidDebtElement.textContent = formatCurrency(paid);
    unpaidDebtElement.textContent = formatCurrency(unpaid);
}

// Fungsi untuk menghitung statistik hutang per penghutang
function calculateDebtorStatistics(debts) {
    const statistics = {};
    
    debts.forEach(debt => {
        if (!statistics[debt.debtorName]) {
            statistics[debt.debtorName] = {
                total: 0,
                paid: 0,
                unpaid: 0,
                transactions: []
            };
        }
        
        statistics[debt.debtorName].total += debt.amount;
        
        // Hitung total yang sudah dibayar (termasuk pembayaran cicilan)
        const totalPaid = debt.payments ? Object.values(debt.payments).reduce((sum, payment) => sum + payment.amount, 0) : 0;
        
        // Tambahkan detail transaksi
        const transaction = {
            id: debt.id,
            amount: debt.amount,
            borrowDate: debt.borrowDate,
            dueDate: debt.dueDate,
            status: debt.status,
            notes: debt.notes,
            totalPaid: totalPaid,
            remainingAmount: debt.amount - totalPaid,
            payments: debt.payments || {}
        };
        
        statistics[debt.debtorName].transactions.push(transaction);
        
        if (debt.status === 'paid' || totalPaid >= debt.amount) {
            statistics[debt.debtorName].paid += debt.amount;
        } else {
            statistics[debt.debtorName].unpaid += (debt.amount - totalPaid);
        }
    });
    
    // Sort transactions by borrow date (newest first)
    Object.keys(statistics).forEach(debtorName => {
        statistics[debtorName].transactions.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));
    });
    
    return statistics;
}

// Fungsi untuk menampilkan statistik hutang per penghutang
function showDebtorStatistics(debtorName) {
    const userId = auth.currentUser.uid;
    const debtsRef = database.ref(`debts/${userId}`);
    
    debtsRef.once('value', (snapshot) => {
        const debts = [];
        snapshot.forEach((childSnapshot) => {
            debts.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        const statistics = calculateDebtorStatistics(debts);
        const debtorStats = statistics[debtorName];
        
        if (!debtorStats) {
            showToast('Tidak ada data hutang untuk penghutang ini.', 'error');
            return;
        }
        
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        
        // Generate transaction details HTML
        const transactionDetails = debtorStats.transactions.map(transaction => {
            const statusBadge = transaction.status === 'paid' ? 
                '<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Lunas</span>' :
                '<span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Belum Lunas</span>';
            
            const paymentDetails = Object.keys(transaction.payments).length > 0 ? 
                `<div class="bg-blue-50 rounded-lg p-2 mt-2 text-xs text-gray-600">
                    <div class="font-medium text-blue-700 mb-1">Detail Pembayaran:</div>
                    <div>Total Dibayar: <span class="font-medium text-green-600">${formatCurrency(transaction.totalPaid)}</span></div>
                    <div>Sisa Hutang: <span class="font-medium text-red-600">${formatCurrency(transaction.remainingAmount)}</span></div>
                </div>` : '';
            
            return `
                <div class="border border-gray-200 rounded-lg p-3 mb-3 transaction-detail">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1 text-left">
                            <div class="font-medium text-blue-600">${formatCurrency(transaction.amount)}</div>
                            <div class="text-sm text-gray-600">${formatDate(transaction.borrowDate)}</div>
                        </div>
                        <div class="text-right">
                            ${statusBadge}
                        </div>
                    </div>
                    ${transaction.dueDate ? `<div class="text-xs text-gray-500 mb-1 text-left">Jatuh Tempo: ${formatDate(transaction.dueDate)}</div>` : ''}
                    ${transaction.notes ? `<div class="bg-gray-50 rounded-lg p-2 text-xs text-gray-600 mb-2 text-left">
                        <div class="font-medium text-gray-700 mb-1">Catatan:</div>
                        <div>${transaction.notes}</div>
                    </div>` : ''}
                    ${paymentDetails}
                </div>
            `;
        }).join('');
        
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert debtor-statistics-modal';
        alertBox.style.maxWidth = '600px';
        alertBox.style.maxHeight = '80vh';
        alertBox.style.overflowY = 'auto';
        alertBox.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <div class="text-lg font-medium">Statistik Hutang: ${debtorName}</div>
                <button id="closeDebtorStatsBtn" class="text-gray-500 hover:text-gray-700 text-xl font-bold">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <!-- Summary Statistics -->
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div class="text-2xl font-bold text-blue-600">${formatCurrency(debtorStats.total)}</div>
                        <div class="text-sm text-gray-600">Total Hutang</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-green-600">${formatCurrency(debtorStats.paid)}</div>
                        <div class="text-sm text-gray-600">Lunas</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-red-600">${formatCurrency(debtorStats.unpaid)}</div>
                        <div class="text-sm text-gray-600">Belum Lunas</div>
               
