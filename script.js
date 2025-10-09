const GET_NAMES_URL = "https://n8n.gitstraining.com/webhook-test/71aafe78-3fd2-4673-aead-78c75358fd08"; // Dari Workflow 1 (GET)
const POST_DATA_URL = "https://n8n.gitstraining.com/webhook-test/552443c9-6480-4bad-b7a1-f9f2301b7149"; // Dari Workflow 2 (POST)
const PAY_AMOUNT = 2000; // Nilai pembayaran

// 1. Fungsi untuk mengambil dan membuat daftar anggota secara dinamis
async function loadMembersAndCreateCheckboxes() {
    const listDiv = document.getElementById('anggota-list');
    listDiv.innerHTML = 'Memuat daftar anggota...';

    try {
        const response = await fetch(GET_NAMES_URL);
        const data = await response.json();
        const members = data.members;
        
        listDiv.innerHTML = ''; 

        if (members && members.length > 0) {
            members.forEach(member => {
                const label = document.createElement('label');
                // Menggunakan member.key untuk name (Anggota_A) dan member.display untuk tampilan
                label.innerHTML = `<input type="checkbox" name="${member.key}"> ${member.display} (Rp${PAY_AMOUNT})</label><br>`;
                listDiv.appendChild(label);
            });
        } else {
            listDiv.innerHTML = 'Daftar anggota tidak ditemukan di Sheet.';
        }
    } catch (error) {
        listDiv.innerHTML = 'Gagal terhubung ke server (n8n).';
        console.error('Fetch error (GET):', error);
    }
}

// 2. Fungsi untuk mengirim data pembayaran
function kirimData() {
    const statusPesan = document.getElementById('status-pesan');
    const bendaharaName = document.getElementById('bendahara').value;
    
    if (!bendaharaName) {
        statusPesan.textContent = "Error: Nama Bendahara harus diisi.";
        return;
    }

    statusPesan.textContent = "Mengirim data...";

    const dataAnggota = {};
    const checkboxes = document.querySelectorAll('#anggota-list input[type="checkbox"]');
    
    // Kumpulkan data
    checkboxes.forEach(checkbox => {
        const key = checkbox.name; // Cth: Anggota_A
        // Jika dicentang, nilainya 2000, jika tidak, nilainya string kosong
        dataAnggota[key] = checkbox.checked ? PAY_AMOUNT : "";
    });

    const dataFinal = {
        "timestamp": new Date().toISOString(),
        "bendahara_name": bendaharaName,
        ...dataAnggota 
    };

    // Kirim menggunakan Fetch API ke Webhook POST
    fetch(POST_DATA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataFinal),
    })
    .then(response => {
        if (!response.ok) throw new Error('Gagal mengirim ke n8n.');
        statusPesan.textContent = "✅ Data Pembayaran Berhasil Dikirim! (Baris baru ditambahkan).";
        // Reset form
        document.getElementById('bendahara').value = '';
        checkboxes.forEach(checkbox => checkbox.checked = false);
    })
    .catch((error) => {
        statusPesan.textContent = `❌ Terjadi Kesalahan: ${error.message}`;
        console.error('Error (POST):', error);
    });
}

// Jalankan saat halaman dimuat
loadMembersAndCreateCheckboxes();
