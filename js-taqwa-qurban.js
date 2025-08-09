document.addEventListener('DOMContentLoaded', () => {
    console.log('js-taqwa-qurban.js: DOMContentLoaded event fired.');

    const qurbanForm = document.getElementById('qurbanForm');
    const jenisHewanSelect = document.getElementById('jenisHewan');
    const jumlahPekurbanGroup = document.getElementById('jumlahPekurbanGroup');
    const perhitunganResults = document.getElementById('perhitunganResults');
    const qurbanTableBody = document.querySelector('#qurbanTable tbody');
    const tableLoadingMessage = document.getElementById('table-loading-message');
    const printReportButton = document.getElementById('printReportButton');
    const saveButton = document.getElementById('saveButton');
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    const appContainer = document.querySelector('.app-container');
    const summaryResults = document.getElementById('summaryResults');

    let editingId = null;

    // --- Fungsionalitas Toggle Sidebar ---
    if (sidebarToggleBtn && appContainer) {
        sidebarToggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }

    // --- Fungsionalitas Logout ---
    const logoutButtonHeader = document.getElementById('logoutButtonHeader');
    if (logoutButtonHeader) {
        logoutButtonHeader.addEventListener('click', () => {
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
        });
    }

    // --- Logika Perhitungan Kurban ---
    const PERSENTASE_DAGING = 0.35;
    const PERSENTASE_TULANG = 0.25;
    const PERSENTASE_JEROAN = 0.10;

    function hitungPembagianKurban(jenisHewan, beratTotal, jumlahPekurban, jumlahWarga) {
        if (beratTotal <= 0 || jumlahWarga <= 0) {
            return null;
        }

        const beratDaging = beratTotal * PERSENTASE_DAGING;
        const beratTulang = beratTotal * PERSENTASE_TULANG;
        const beratJeroan = beratTotal * PERSENTASE_JEROAN;

        let pembagianPekurban = 0;
        let pembagianWarga = 0;

        if (jenisHewan === 'Sapi') {
            const porsiSapiPerBagian = beratDaging / 7;
            const porsiPekurbanDiambil = porsiSapiPerBagian * jumlahPekurban;
            pembagianPekurban = porsiSapiPerBagian;
            pembagianWarga = beratDaging - porsiPekurbanDiambil;
        } else {
            pembagianPekurban = beratDaging * (1 / 3);
            pembagianWarga = beratDaging * (2 / 3);
        }

        const beratPerWarga = pembagianWarga / jumlahWarga;
        const totalKantong = Math.ceil(pembagianWarga / beratPerWarga);
        
        return {
            beratDaging: beratDaging.toFixed(2),
            beratTulang: beratTulang.toFixed(2),
            beratJeroan: beratJeroan.toFixed(2),
            pembagianPekurban: pembagianPekurban.toFixed(2),
            pembagianWarga: pembagianWarga.toFixed(2),
            beratPerWarga: beratPerWarga.toFixed(2),
            totalKantong: totalKantong,
            jumlahWarga: jumlahWarga
        };
    }

    function renderPerhitungan(data) {
        if (!perhitunganResults) return;
        if (!data || !data.beratTotal) {
            perhitunganResults.innerHTML = `<p class="placeholder-text">Isi formulir untuk melihat hasil perhitungan.</p>`;
            return;
        }
        perhitunganResults.innerHTML = `
            <p><strong>Jenis Hewan:</strong> ${data.jenisHewan}</p>
            <p><strong>Berat Total:</strong> ${data.beratTotal} kg</p>
            <hr>
            <p><strong>Perkiraan Daging Bersih:</strong> ${data.beratDaging} kg</p>
            <p><strong>Perkiraan Jeroan Merah:</strong> ${data.beratJeroan} kg (Dikemas terpisah)</p>
            <p><strong>Perkiraan Tulang:</strong> ${data.beratTulang} kg</p>
            <hr>
            <p><strong>Pembagian per Pekurban:</strong> ${data.pembagianPekurban} kg</p>
            <p><strong>Pembagian untuk Warga:</strong> ${data.pembagianWarga} kg</p>
            <p><strong>Estimasi Daging per Warga:</strong> ${data.beratPerWarga} kg</p>
            <p><strong>Jumlah Kantong Daging:</strong> ${data.totalKantong} kantong</p>
        `;
    }

    function renderTotalSummary() {
        if (!summaryResults) return;
        const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
        
        if (data.length === 0) {
            summaryResults.innerHTML = `<p class="placeholder-text">Belum ada data kurban untuk ditampilkan.</p>`;
            return;
        }

        let totalSapi = 0;
        let totalKambing = 0;
        let totalDagingSapiWarga = 0;
        let totalDagingKambingWarga = 0;

        data.forEach(item => {
            if (item.jenisHewan === 'Sapi') {
                totalSapi++;
                totalDagingSapiWarga += parseFloat(item.pembagianWarga);
            } else if (item.jenisHewan === 'Kambing') {
                totalKambing++;
                totalDagingKambingWarga += parseFloat(item.pembagianWarga);
            }
        });

        summaryResults.innerHTML = `
            <div class="summary-item">
                <i class="fas fa-cow summary-icon-sapi"></i>
                <div>
                    <strong>Sapi:</strong> ${totalSapi} Ekor
                    <p class="summary-text">Total daging untuk warga: ${totalDagingSapiWarga.toFixed(2)} kg</p>
                </div>
            </div>
            <div class="summary-item">
                <i class="fas fa-sheep summary-icon-kambing"></i>
                <div>
                    <strong>Kambing:</strong> ${totalKambing} Ekor
                    <p class="summary-text">Total daging untuk warga: ${totalDagingKambingWarga.toFixed(2)} kg</p>
                </div>
            </div>
            <hr>
            <div class="summary-item">
                <i class="fas fa-boxes summary-icon-total"></i>
                <div>
                    <strong>Total Daging untuk Warga:</strong>
                    <p class="summary-text">${(totalDagingSapiWarga + totalDagingKambingWarga).toFixed(2)} kg</p>
                </div>
            </div>
        `;
    }

    function updateCalculations() {
         const formData = new FormData(qurbanForm);
         const data = Object.fromEntries(formData.entries());
         const beratTotal = parseFloat(data.beratTotal);
         const jumlahPekurban = data.jenisHewan === 'Sapi' ? parseInt(data.jumlahPekurban) : 1;
         const jumlahWarga = parseInt(data.jumlahWarga);

         const perhitungan = hitungPembagianKurban(data.jenisHewan, beratTotal, jumlahPekurban, jumlahWarga);
         renderPerhitungan({ ...data, ...perhitungan, jumlahWarga });
    }

    if (jenisHewanSelect) {
        jenisHewanSelect.addEventListener('change', (e) => {
            const jenis = e.target.value;
            if (jenis === 'Sapi') {
                jumlahPekurbanGroup.style.display = 'block';
            } else {
                jumlahPekurbanGroup.style.display = 'none';
            }
            updateCalculations();
        });
    }

    if (qurbanForm) {
        qurbanForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(qurbanForm);
            const data = Object.fromEntries(formData.entries());
            const beratTotal = parseFloat(data.beratTotal);
            const jumlahPekurban = data.jenisHewan === 'Sapi' ? parseInt(data.jumlahPekurban) : 1;
            const jumlahWarga = parseInt(data.jumlahWarga);

            const perhitungan = hitungPembagianKurban(data.jenisHewan, beratTotal, jumlahPekurban, jumlahWarga);

            if (!perhitungan) {
                Swal.fire('Error', 'Berat hewan dan jumlah warga harus lebih dari 0.', 'error');
                return;
            }

            if (editingId) {
                const existingData = JSON.parse(localStorage.getItem('qurbanData')) || [];
                const newData = existingData.map(item => item.id === editingId ? { ...data, ...perhitungan, id: editingId } : item);
                localStorage.setItem('qurbanData', JSON.stringify(newData));
                Swal.fire('Berhasil!', 'Data kurban berhasil diperbarui.', 'success');
            } else {
                const newData = { ...data, ...perhitungan, id: Date.now() };
                const existingData = JSON.parse(localStorage.getItem('qurbanData')) || [];
                localStorage.setItem('qurbanData', JSON.stringify([...existingData, newData]));
                Swal.fire('Berhasil!', 'Data kurban berhasil disimpan.', 'success');
            }

            resetForm();
            renderTable();
            renderStatistik();
            renderTotalSummary();
        });

        qurbanForm.addEventListener('input', updateCalculations);
    }

    window.resetForm = () => {
        if (qurbanForm) {
            qurbanForm.reset();
            jenisHewanSelect.dispatchEvent(new Event('change'));
            renderPerhitungan(null);
            saveButton.textContent = 'Simpan Data';
            saveButton.classList.remove('btn-secondary');
            saveButton.classList.add('btn-primary');
            editingId = null;
        }
    };

    function renderTable() {
        if (!qurbanTableBody) return;
        const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
        qurbanTableBody.innerHTML = '';

        if (data.length === 0) {
            if(tableLoadingMessage) tableLoadingMessage.style.display = 'block';
            return;
        }

        if(tableLoadingMessage) tableLoadingMessage.style.display = 'none';
        data.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.tanggal}</td>
                <td>${item.jenisHewan}</td>
                <td>${item.beratTotal} kg</td>
                <td>${item.jenisHewan === 'Sapi' ? item.jumlahPekurban : '-'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-secondary" onclick="viewDetails(${item.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-secondary" onclick="editData(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-secondary" onclick="deleteData(${item.id})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            `;
            qurbanTableBody.appendChild(tr);
        });
    }

    function renderStatistik() {
        const statistikChart = document.getElementById('statistikKurbanChart');
        if (!statistikChart) return;

        const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
        if (data.length === 0) {
            statistikChart.innerHTML = `<p class="placeholder-text">Belum ada data untuk ditampilkan.</p>`;
            return;
        }

        const countSapi = data.filter(item => item.jenisHewan === 'Sapi').length;
        const countKambing = data.filter(item => item.jenisHewan === 'Kambing').length;
        const total = countSapi + countKambing;

        const widthSapi = total > 0 ? (countSapi / total) * 100 : 0;
        const widthKambing = total > 0 ? (countKambing / total) * 100 : 0;
        
        statistikChart.innerHTML = `
            <div class="chart-bar-container">
                <div class="chart-item">
                    <span class="chart-label">Sapi</span>
                    <div class="chart-bar" style="width: ${widthSapi}%">${countSapi} Ekor</div>
                </div>
                <div class="chart-item">
                    <span class="chart-label">Kambing</span>
                    <div class="chart-bar kambing" style="width: ${widthKambing}%">${countKambing} Ekor</div>
                </div>
            </div>
        `;
    }

    window.viewDetails = (id) => {
        const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
        const item = data.find(d => d.id === id);
        if (!item) return;

        Swal.fire({
            title: `Detail Kurban ${item.jenisHewan}`,
            html: `
                <div style="text-align:left;line-height:1.8;">
                    <strong>Tanggal:</strong> ${item.tanggal}<br>
                    <strong>Jenis Hewan:</strong> ${item.jenisHewan}<br>
                    <strong>Berat Total:</strong> ${item.beratTotal} kg<br>
                    <strong>Jumlah Pekurban:</strong> ${item.jenisHewan === 'Sapi' ? item.jumlahPekurban : '-'}<br>
                    <hr>
                    <strong>Daging Bersih:</strong> ${item.beratDaging} kg<br>
                    <strong>Jeroan Merah:</strong> ${item.beratJeroan} kg<br>
                    <strong>Tulang:</strong> ${item.beratTulang} kg<br>
                    <hr>
                    <strong>Pembagian per Pekurban:</strong> ${item.pembagianPekurban} kg<br>
                    <strong>Pembagian untuk Warga:</strong> ${item.pembagianWarga} kg<br>
                    <strong>Estimasi Daging per Warga:</strong> ${item.beratPerWarga} kg<br>
                    <strong>Jumlah Kantong Daging:</strong> ${item.totalKantong} kantong
                </div>
            `,
            confirmButtonText: 'Tutup'
        });
    };

    window.editData = (id) => {
        const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
        const item = data.find(d => d.id === id);
        if (!item) return;

        const jumlahPekurbanInput = item.jenisHewan === 'Sapi' ? `
            <div class="swal-form-group" id="swal-jumlahPekurban-group">
                <label for="swal-jumlahPekurban">Jumlah Pekurban (1-7 orang)</label>
                <input id="swal-jumlahPekurban" class="swal-input" type="number" min="1" max="7" value="${item.jumlahPekurban}">
            </div>
        ` : '';

        Swal.fire({
            title: 'Edit Data Kurban',
            customClass: {
                popup: 'swal-card',
                title: 'swal-title',
                confirmButton: 'swal-btn-primary',
                cancelButton: 'swal-btn-secondary'
            },
            html: `
                <form id="swal-qurbanForm" class="swal-form" onsubmit="return false;">
                    <div class="swal-form-group">
                        <label for="swal-tanggal">Tanggal Kurban</label>
                        <input id="swal-tanggal" class="swal-input" type="date" value="${item.tanggal}">
                    </div>
                    <div class="swal-form-group">
                        <label for="swal-jenisHewan">Jenis Hewan</label>
                        <select id="swal-jenisHewan" class="swal-select">
                            <option value="Sapi" ${item.jenisHewan === 'Sapi' ? 'selected' : ''}>Sapi</option>
                            <option value="Kambing" ${item.jenisHewan === 'Kambing' ? 'selected' : ''}>Kambing</option>
                        </select>
                    </div>
                    <div class="swal-form-group">
                        <label for="swal-beratTotal">Berat Hewan (kg)</label>
                        <input id="swal-beratTotal" class="swal-input" type="number" min="1" value="${item.beratTotal}">
                    </div>
                    ${jumlahPekurbanInput}
                    <div class="swal-form-group">
                        <label for="swal-jumlahWarga">Jumlah Warga Penerima</label>
                        <input id="swal-jumlahWarga" class="swal-input" type="number" min="1" value="${item.jumlahWarga}">
                    </div>
                </form>
            `,
            showCancelButton: true,
            confirmButtonText: 'Simpan Perubahan',
            cancelButtonText: 'Batal',
            didOpen: () => {
                const jenisHewanSelectSwal = Swal.getPopup().querySelector('#swal-jenisHewan');
                const jumlahPekurbanGroupSwal = Swal.getPopup().querySelector('#swal-jumlahPekurban-group');
                if (jenisHewanSelectSwal && jumlahPekurbanGroupSwal) {
                    jenisHewanSelectSwal.addEventListener('change', () => {
                        if (jenisHewanSelectSwal.value === 'Sapi') {
                            jumlahPekurbanGroupSwal.style.display = 'block';
                        } else {
                            jumlahPekurbanGroupSwal.style.display = 'none';
                        }
                    });
                }
            },
            preConfirm: () => {
                const popup = Swal.getPopup();
                const tanggal = popup.querySelector('#swal-tanggal').value;
                const jenisHewan = popup.querySelector('#swal-jenisHewan').value;
                const beratTotal = parseFloat(popup.querySelector('#swal-beratTotal').value);
                const jumlahWarga = parseInt(popup.querySelector('#swal-jumlahWarga').value);
                const jumlahPekurban = jenisHewan === 'Sapi' ? parseInt(popup.querySelector('#swal-jumlahPekurban')?.value || 1) : 1;

                if (!tanggal || isNaN(beratTotal) || beratTotal <= 0 || isNaN(jumlahWarga) || jumlahWarga <= 0) {
                    Swal.showValidationMessage('Pastikan semua data terisi dengan benar.');
                    return false;
                }

                const perhitungan = hitungPembagianKurban(jenisHewan, beratTotal, jumlahPekurban, jumlahWarga);
                if (!perhitungan) {
                    Swal.showValidationMessage('Gagal menghitung. Cek kembali berat hewan.');
                    return false;
                }

                const updatedItem = { ...item, ...perhitungan, tanggal, jenisHewan, beratTotal, jumlahPekurban, jumlahWarga };
                const existingData = JSON.parse(localStorage.getItem('qurbanData')) || [];
                const newData = existingData.map(d => d.id === item.id ? updatedItem : d);
                localStorage.setItem('qurbanData', JSON.stringify(newData));

                return true;
            }
        }).then((result) => {
             if (result.isConfirmed) {
                renderTable();
                renderStatistik();
                renderTotalSummary();
                Swal.fire('Berhasil!', 'Data kurban berhasil diperbarui.', 'success');
             }
        });
    };

    window.deleteData = (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data kurban ini akan dihapus permanen!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
                const newData = data.filter(d => d.id !== id);
                localStorage.setItem('qurbanData', JSON.stringify(newData));
                renderTable();
                renderStatistik();
                renderTotalSummary();
                Swal.fire('Dihapus!', 'Data kurban telah dihapus.', 'success');
            }
        });
    };

    if(printReportButton) {
        printReportButton.addEventListener('click', () => {
            const data = JSON.parse(localStorage.getItem('qurbanData')) || [];
            if (data.length === 0) {
                Swal.fire('Peringatan', 'Tidak ada data untuk dicetak.', 'warning');
                return;
            }

            const doc = new window.jspdf.jsPDF();
            doc.setFontSize(18);
            doc.text("Laporan Manajemen Kurban", 14, 22);

            const tableData = data.map((item, index) => [
                index + 1,
                item.tanggal,
                item.jenisHewan,
                `${item.beratTotal} kg`,
                `${item.pembagianWarga} kg`,
                `${item.beratPerWarga} kg`,
                `${item.totalKantong} kantong`
            ]);

            const totalRow = data.reduce((acc, curr) => ({
                pembagianWarga: parseFloat(acc.pembagianWarga) + parseFloat(curr.pembagianWarga)
            }), { pembagianWarga: 0 });

            const finalTableData = [...tableData, ['', '', '', 'Total Daging Warga:', `${totalRow.pembagianWarga.toFixed(2)} kg`, '']];

            doc.autoTable({
                startY: 30,
                head: [['No', 'Tanggal', 'Jenis', 'Berat Total', 'Untuk Warga', 'Estimasi per Warga', 'Total Kantong']],
                body: finalTableData,
                theme: 'striped',
                headStyles: { fillColor: '#2C3E50' },
                styles: { fontSize: 10 },
                columnStyles: {
                    0: { cellWidth: 10 },
                    1: { cellWidth: 25 },
                    2: { cellWidth: 20 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 40 }
                },
            });

            doc.save('Laporan_Kurban.pdf');
        });
    }

    // --- Initialization ---
    renderTable();
    renderStatistik();
    renderTotalSummary();
    if(jenisHewanSelect) jenisHewanSelect.dispatchEvent(new Event('change'));
});