document.addEventListener('DOMContentLoaded', () => {
    console.log('js-taqwa-about.js: DOMContentLoaded event fired.');

    // --- Fungsionalitas Logout (Standard) ---
    const logoutButtonHeader = document.getElementById('logoutButtonHeader');

    function handleLogout() {
        console.log('js-taqwa-about.js: Logout button clicked.');
        Swal.fire({
            title: 'Konfirmasi Logout',
            text: 'Apakah Anda yakin ingin logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('isLoggedIn');
                window.location.href = 'login.html';
            }
        });
    }

    if (logoutButtonHeader) {
        logoutButtonHeader.addEventListener('click', handleLogout);
    }

    // --- Fungsionalitas Tab ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            const activeContent = document.getElementById(tabId);
            if (activeContent) {
                activeContent.classList.add('active');
            }
        });
    });

    // --- Fungsionalitas Khusus Halaman Tentang (Pembaruan Aplikasi dari GitHub) ---
    const currentAppVersionElement = document.getElementById('currentAppVersion');
    const latestAppVersionInfo = document.getElementById('latestAppVersionInfo');
    const updateStatusMessage = document.getElementById('updateStatusMessage');
    const checkForUpdateButton = document.getElementById('checkForUpdateButton');
    const updateAppButton = document.getElementById('updateAppButton');
    const latestVersionNumber = document.getElementById('latestVersionNumber');
    const updateProgressBar = document.getElementById('updateProgressBar');
    const lastUpdatedDateElement = document.getElementById('lastUpdatedDate');

    // **Perbaikan URL: Ganti dengan URL file `version.json` di repositori GitHub Anda**
    const GITHUB_VERSION_URL = 'https://raw.githubusercontent.com/abukaha2025/app-taqwa-update/main/version.json';

    let currentAppVersion = currentAppVersionElement.textContent.trim();

    const lastUpdateDate = new Date();
    const formattedDate = lastUpdateDate.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
    lastUpdatedDateElement.textContent = formattedDate;

    // Fungsi compareVersions yang lebih kokoh
    const compareVersions = (v1, v2) => {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        const maxLength = Math.max(parts1.length, parts2.length);

        for (let i = 0; i < maxLength; i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    };

    const updateUI = (status, message, latestVersion = null, releaseUrl = '#') => {
        updateStatusMessage.textContent = message;
        updateStatusMessage.classList.remove('update-status-ok', 'update-status-available', 'update-status-error');
        updateProgressBar.style.width = '0%';
        checkForUpdateButton.classList.remove('hidden');
        updateAppButton.classList.add('hidden');
        latestAppVersionInfo.classList.add('hidden');

        if (status === 'ok') {
            updateStatusMessage.classList.add('update-status-ok');
            checkForUpdateButton.classList.add('hidden');
        } else if (status === 'available') {
            updateStatusMessage.classList.add('update-status-available');
            latestAppVersionInfo.classList.remove('hidden');
            latestVersionNumber.textContent = latestVersion;
            updateAppButton.href = releaseUrl;
            updateAppButton.classList.remove('hidden');
            checkForUpdateButton.classList.add('hidden');
        } else if (status === 'error') {
            updateStatusMessage.classList.add('update-status-error');
        }
    };

    const checkForUpdates = async () => {
        updateUI('loading', 'Memeriksa versi terbaru...');
        updateProgressBar.style.width = '50%';
        try {
            const response = await fetch(GITHUB_VERSION_URL, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.statusText}`);
            }
            const data = await response.json();
            const latestVersion = data.version;
            const releaseUrl = data.releaseUrl;
            updateProgressBar.style.width = '100%';

            if (compareVersions(latestVersion, currentAppVersion) > 0) {
                updateUI('available', 'Pembaruan tersedia!', latestVersion, releaseUrl);
            } else {
                updateUI('ok', `Aplikasi Anda sudah versi terbaru (${currentAppVersion}).`);
            }

        } catch (error) {
            console.error('Gagal memeriksa pembaruan:', error);
            updateUI('error', 'Gagal memeriksa pembaruan. Silakan coba lagi.');
            updateProgressBar.style.width = '0%';
        }
    };

    checkForUpdateButton.addEventListener('click', checkForUpdates);

    // Sidebar toggle (jika diperlukan)
    const menuToggle = document.getElementById('menuToggle');
    const appContainer = document.querySelector('.app-container');
    if (menuToggle && appContainer) {
        menuToggle.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }

    // Load theme preference
    function applyTheme(themeName) {
        document.body.classList.remove(
            'theme-default', 'dark-mode', 'elegant-dark', 'altaqwa-serenity',
            'ocean-breeze', 'royal-purple', 'forest-green', 'warm-sunset'
        );
        document.body.classList.add(themeName);
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('selectedTheme') || 'theme-default';
        applyTheme(savedTheme);
    }
    loadThemePreference();
});
