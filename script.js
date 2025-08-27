// --- ZÁKLADNÍ NASTAVENÍ ---
const formular = document.getElementById('transakci-formular');
const prehledTransakciTbody = document.getElementById('prehled-transakci');
const elPrijmy = document.getElementById('celkove-prijmy');
const elVydaje = document.getElementById('celkove-vydaje');
const elZustatek = document.getElementById('zustatek');
const canvasKategorie = document.getElementById('graf-kategorie');
const selectMesic = document.getElementById('select-mesic');
const selectKategorie = document.getElementById('select-kategorie');
// Prvky pro modální okno
const editModalOverlay = document.getElementById('edit-modal-overlay');
const editForm = document.getElementById('edit-form');
const btnZavritModal = document.getElementById('btn-zavrit-modal');

// --- CENTRÁLNÍ ÚLOŽIŠTĚ ---
let transakce = [];
let aktualneZobrazenyMesic = 'all';
let aktualneZobrazenaKategorie = 'all';

// --- GRAF VÝDAJŮ PODLE KATEGORIÍ (Sloupcový) ---
const grafKategorie = new Chart(canvasKategorie, { type: 'bar', data: { labels: [], datasets: [{ label: 'Výdaje', data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: function(context) { return `${context.dataset.label}: ${context.parsed.x.toLocaleString('cs-CZ')} Kč`; } } }, title: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: function(value) { return value.toLocaleString('cs-CZ') + ' Kč'; } } } } } });

// --- KOMUNIKACE S API ---
async function nacistTransakceZeServeru() { try { const response = await fetch('api/get_transactions.php'); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); const data = await response.json(); transakce = data; aktualizovatPrehled(); } catch (error) { console.error('Chyba při načítání transakcí:', error); alert('Nepodařilo se načíst data ze serveru.'); } }
async function pridatTransakciNaServer(novaTransakce) { try { const response = await fetch('api/add_transaction.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novaTransakce) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); await nacistTransakceZeServeru(); } catch (error) { console.error('Chyba při přidávání transakce:', error); alert('Nepodařilo se uložit transakci na server.'); } }
async function smazatTransakciZeServeru(id) { try { const response = await fetch('api/delete_transaction.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id }) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); await nacistTransakceZeServeru(); } catch (error) { console.error('Chyba při mazání transakce:', error); alert('Nepodařilo se smazat transakci na serveru.'); } }
async function upravitTransakciNaServeru(upravenaTransakce) { try { const response = await fetch('api/update_transaction.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(upravenaTransakce) }); if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); await nacistTransakceZeServeru(); } catch (error) { console.error('Chyba při úpravě transakce:', error); alert('Nepodařilo se upravit transakci na serveru.'); } }

// --- PŘEKRESLOVACÍ FUNKCE ---
function vykreslitVyberKategorie() { const kategorieSet = new Set(transakce.map(t => t.kategorie)); const kategorie = Array.from(kategorieSet).sort(); selectKategorie.innerHTML = ''; selectKategorie.add(new Option('Všechny kategorie', 'all')); kategorie.forEach(kat => { selectKategorie.add(new Option(kat, kat)); }); selectKategorie.value = aktualneZobrazenaKategorie; }
function vykreslitVyberMesice() { const mesiceSet = new Set(transakce.map(t => t.datum.substring(0, 7))); const mesice = Array.from(mesiceSet).sort().reverse(); selectMesic.innerHTML = ''; selectMesic.add(new Option('Všechny transakce', 'all')); mesice.forEach(mesic => { const [rok, m] = mesic.split('-'); const nazvyMesicu = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"]; selectMesic.add(new Option(`${nazvyMesicu[parseInt(m) - 1]} ${rok}`, mesic)); }); selectMesic.value = aktualneZobrazenyMesic; }

function aktualizovatPrehled() {
    vykreslitVyberMesice();
    vykreslitVyberKategorie();
    let filtrovaneTransakce = transakce;
    if (aktualneZobrazenyMesic !== 'all') { filtrovaneTransakce = filtrovaneTransakce.filter(t => t.datum.startsWith(aktualneZobrazenyMesic)); }
    if (aktualneZobrazenaKategorie !== 'all') { filtrovaneTransakce = filtrovaneTransakce.filter(t => t.kategorie === aktualneZobrazenaKategorie); }
    prehledTransakciTbody.innerHTML = '';
    let celkovePrijmy = 0, celkoveVydaje = 0;
    filtrovaneTransakce.sort((a, b) => new Date(b.datum) - new Date(a.datum));
    filtrovaneTransakce.forEach(t => {
        const castkaCislo = parseFloat(t.castka);
        if (t.typ === 'Příjem') celkovePrijmy += castkaCislo; else celkoveVydaje += castkaCislo;
        const novyRadek = `<tr><td>${t.typ}</td><td>${t.popis}</td><td>${t.kategorie}</td><td>${castkaCislo.toFixed(2)} Kč</td><td>${t.datum}</td><td><button class="upravit-btn" data-id="${t.id}">Upravit</button><button class="smazat-btn" data-id="${t.id}">Smazat</button></td></tr>`;
        prehledTransakciTbody.insertAdjacentHTML('beforeend', novyRadek);
    });
    const zustatek = celkovePrijmy - celkoveVydaje;
    elPrijmy.textContent = `${celkovePrijmy.toFixed(2)} Kč`;
    elVydaje.textContent = `${celkoveVydaje.toFixed(2)} Kč`;
    elZustatek.textContent = `${zustatek.toFixed(2)} Kč`;
    elZustatek.style.color = zustatek < 0 ? '#dc3545' : '#28a745';
    const vydaje = filtrovaneTransakce.filter(t => t.typ === 'Výdaj');
    const souhrnKategorii = {};
    vydaje.forEach(vydaj => { const kategorie = vydaj.kategorie; const castka = parseFloat(vydaj.castka); if (souhrnKategorii[kategorie]) { souhrnKategorii[kategorie] += castka; } else { souhrnKategorii[kategorie] = castka; } });
    const kategorieLabels = Object.keys(souhrnKategorii);
    const kategorieData = Object.values(souhrnKategorii);
    grafKategorie.data.labels = kategorieLabels;
    grafKategorie.data.datasets[0].data = kategorieData;
    grafKategorie.data.datasets[0].backgroundColor = generujBarvy(kategorieLabels.length);
    grafKategorie.data.datasets[0].borderColor = generujBarvy(kategorieLabels.length);
    grafKategorie.update();
}

function generujBarvy(pocet) { const barvy = []; const zakladniBarvy = [ '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#5a5c69', '#f8f9fc', '#6f42c1', '#fd7e14' ]; for (let i = 0; i < pocet; i++) { barvy.push(zakladniBarvy[i % zakladniBarvy.length]); } return barvy; }

// --- FUNKCE PRO MODÁLNÍ OKNO ---
function otevritModal(id) {
    const transakceKUprave = transakce.find(t => t.id == id);
    if (!transakceKUprave) return;
    document.getElementById('edit-transakce-id').value = transakceKUprave.id;
    document.getElementById('edit-popis').value = transakceKUprave.popis;
    document.getElementById('edit-castka').value = parseFloat(transakceKUprave.castka);
    document.getElementById('edit-datum').value = transakceKUprave.datum;
    if (transakceKUprave.typ === 'Příjem') { document.getElementById('edit-prijem').checked = true; } else { document.getElementById('edit-vydaj').checked = true; }
    const selectKategorieHlavni = document.getElementById('kategorie');
    const selectKategorieEdit = document.getElementById('edit-kategorie');
    selectKategorieEdit.innerHTML = selectKategorieHlavni.innerHTML;
    selectKategorieEdit.value = transakceKUprave.kategorie;
    editModalOverlay.classList.remove('hidden');
}
function zavritModal() { editModalOverlay.classList.add('hidden'); }

// --- LISTENERY ---
formular.addEventListener('submit', function(event) { event.preventDefault(); const typInput = document.querySelector('input[name="typ_transakce"]:checked'); if (!typInput) { alert('Prosím, vyberte typ transakce.'); return; } const novaTransakce = { typ: typInput.value, popis: document.getElementById('popis').value, kategorie: document.getElementById('kategorie').value, castka: parseFloat(document.getElementById('castka').value), datum: document.getElementById('datum').value }; if (!novaTransakce.popis || !novaTransakce.kategorie || isNaN(novaTransakce.castka) || novaTransakce.castka <= 0 || !novaTransakce.datum) { alert('Prosím, vyplňte všechna pole správně.'); return; } aktualneZobrazenyMesic = novaTransakce.datum.substring(0, 7); pridatTransakciNaServer(novaTransakce); formular.reset(); });
prehledTransakciTbody.addEventListener('click', function(event) {
    const target = event.target;
    if (target.classList.contains('smazat-btn')) { const id = target.getAttribute('data-id'); if (confirm('Opravdu chcete smazat tuto transakci?')) { smazatTransakciZeServeru(id); } }
    else if (target.classList.contains('upravit-btn')) { const id = target.getAttribute('data-id'); otevritModal(id); }
});
selectKategorie.addEventListener('change', function(event) { aktualneZobrazenaKategorie = event.target.value; aktualizovatPrehled(); });
selectMesic.addEventListener('change', function(event) { aktualneZobrazenyMesic = event.target.value; aktualizovatPrehled(); });
editForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const upravenaTransakce = {
        id: document.getElementById('edit-transakce-id').value,
        typ: document.querySelector('input[name="edit_typ_transakce"]:checked').value,
        popis: document.getElementById('edit-popis').value,
        kategorie: document.getElementById('edit-kategorie').value,
        castka: parseFloat(document.getElementById('edit-castka').value),
        datum: document.getElementById('edit-datum').value
    };
    upravitTransakciNaServeru(upravenaTransakce);
    zavritModal();
});
btnZavritModal.addEventListener('click', zavritModal);
editModalOverlay.addEventListener('click', function(event) { if (event.target === editModalOverlay) { zavritModal(); } });

// --- PRVNÍ SPUŠTĚNÍ ---
nacistTransakceZeServeru();