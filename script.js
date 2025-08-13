// --- ZÁKLADNÍ NASTAVENÍ ---
const formular = document.getElementById('transakcni-formular');
const prehledTransakciTbody = document.getElementById('prehled-transakci');
const elPrijmy = document.getElementById('celkove-prijmy');
const elVydaje = document.getElementById('celkove-vydaje');
const elZustatek = document.getElementById('zustatek');
const canvasGraf = document.getElementById('financni-graf');
const vstupLimit = document.getElementById('vstup-limit');
const btnUlozitLimit = document.getElementById('btn-ulozit-limit');
const stavLimituBox = document.getElementById('stav-limitu-box');
const selectMesic = document.getElementById('select-mesic');

// --- POMOCNÉ FUNKCE ---
function ulozitTransakce() { localStorage.setItem('financniTransakce', JSON.stringify(transakce)); }
function nacistTransakce() { const data = localStorage.getItem('financniTransakce'); return data ? JSON.parse(data) : []; }
function ulozitLimit() { localStorage.setItem('financniLimit', mesicniLimit); }
function nacistLimit() { const data = localStorage.getItem('financniLimit'); return data ? parseFloat(data) : 0; }

// --- CENTRÁLNÍ ÚLOŽIŠTĚ ---
let transakce = nacistTransakce();
let mesicniLimit = nacistLimit();
let aktualneZobrazenyMesic = 'all';

// --- GRAF (Jednoduchá koláčová verze) ---
const mujGraf = new Chart(canvasGraf, {
    type: 'doughnut',
    data: {
        labels: ['Příjmy', 'Výdaje'],
        datasets: [{
            label: 'Přehled financí',
            data: [0, 0],
            backgroundColor: ['rgba(40, 167, 69, 0.7)', 'rgba(220, 53, 69, 0.7)'],
            borderColor: ['rgba(40, 167, 69, 1)', 'rgba(220, 53, 69, 1)'],
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true
    }
});


// --- VYKRESLENÍ VÝBĚRU MĚSÍCE ---
function vykreslitVyberMesice() {
    const mesiceSet = new Set(transakce.map(t => t.datum.substring(0, 7)));
    const mesice = Array.from(mesiceSet).sort().reverse();
    selectMesic.innerHTML = '';
    selectMesic.add(new Option('Všechny transakce', 'all'));
    mesice.forEach(mesic => {
        const [rok, m] = mesic.split('-');
        const nazvyMesicu = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];
        selectMesic.add(new Option(`${nazvyMesicu[parseInt(m) - 1]} ${rok}`, mesic));
    });
    selectMesic.value = aktualneZobrazenyMesic;
}

// --- HLAVNÍ FUNKCE PRO PŘEKRESLENÍ ---
function aktualizovatPrehled() {
    vykreslitVyberMesice();
    let filtrovaneTransakce = (aktualneZobrazenyMesic === 'all')
        ? transakce
        : transakce.filter(t => t.datum.startsWith(aktualneZobrazenyMesic));
    
    prehledTransakciTbody.innerHTML = '';
    let celkovePrijmy = 0, celkoveVydaje = 0;

    filtrovaneTransakce.forEach(t => {
        if (t.typ === 'Příjem') celkovePrijmy += t.castka; else celkoveVydaje += t.castka;
        const novyRadek = `<tr><td>${t.typ}</td><td>${t.popis}</td><td>${t.castka.toFixed(2)} Kč</td><td>${t.datum}</td><td><button class="smazat-btn" data-id="${t.id}">Smazat</button></td></tr>`;
        prehledTransakciTbody.insertAdjacentHTML('beforeend', novyRadek);
    });
    
    const zustatek = celkovePrijmy - celkoveVydaje;
    elPrijmy.textContent = `${celkovePrijmy.toFixed(2)} Kč`;
    elVydaje.textContent = `${celkoveVydaje.toFixed(2)} Kč`;
    elZustatek.textContent = `${zustatek.toFixed(2)} Kč`;
    elZustatek.style.color = zustatek < 0 ? '#dc3545' : '#28a745';
    
    // Aktualizace dat v jednoduchém grafu
    mujGraf.data.datasets[0].data = [celkovePrijmy, celkoveVydaje];
    mujGraf.update();
    
    vstupLimit.value = mesicniLimit > 0 ? mesicniLimit : '';
    aktualizovatStavLimitu();
}

// --- Ostatní funkce a listenery ---
function aktualizovatStavLimitu() {
    if (mesicniLimit > 0) {
        const dnes = new Date();
        const vydajeTentoMesic = transakce.filter(t => t.typ === 'Výdaj' && new Date(t.datum).getFullYear() === dnes.getFullYear() && new Date(t.datum).getMonth() === dnes.getMonth()).reduce((soucet, t) => soucet + t.castka, 0);
        const zbyva = mesicniLimit - vydajeTentoMesic;
        stavLimituBox.style.display = 'block';
        if (zbyva >= 0) {
            stavLimituBox.innerHTML = `<div class="souhrn-popisek">V limitu</div><div class="souhrn-hodnota">${zbyva.toFixed(2)} Kč</div>`;
            stavLimituBox.className = 'souhrn-polozka stav-limitu limit-ok';
        } else {
            stavLimituBox.innerHTML = `<div class="souhrn-popisek">Limit překročen o</div><div class="souhrn-hodnota">${Math.abs(zbyva).toFixed(2)} Kč</div>`;
            stavLimituBox.className = 'souhrn-polozka stav-limitu limit-prekrocen';
        }
    } else {
        stavLimituBox.style.display = 'none';
    }
}

selectMesic.addEventListener('change', function(event) {
    aktualneZobrazenyMesic = event.target.value;
    aktualizovatPrehled();
});

btnUlozitLimit.addEventListener('click', function() {
    const novaHodnota = parseFloat(vstupLimit.value);
    if (!isNaN(novaHodnota) && novaHodnota >= 0) {
        mesicniLimit = novaHodnota;
        ulozitLimit();
        alert('Limit byl úspěšně uložen.');
        aktualizovatPrehled();
    } else { alert('Zadejte prosím platné kladné číslo jako limit.'); }
});

formular.addEventListener('submit', function(event) {
    event.preventDefault();
    const typ = document.querySelector('input[name="typ_transakce"]:checked').value;
    const popis = document.getElementById('popis').value;
    const castka = parseFloat(document.getElementById('castka').value); 
    const datum = document.getElementById('datum').value;
    if (!popis || isNaN(castka) || castka <= 0 || !datum) {
        alert('Prosím, vyplňte všechna pole správně.'); return;
    }
    transakce.push({ id: Date.now(), typ, popis, castka, datum });
    ulozitTransakce();
    aktualneZobrazenyMesic = datum.substring(0, 7);
    aktualizovatPrehled();
    formular.reset();
});

function smazatTransakci(id) {
    transakce = transakce.filter(t => t.id !== Number(id));
    ulozitTransakce();
    aktualizovatPrehled();
}

prehledTransakciTbody.addEventListener('click', function(event) {
    if (event.target.classList.contains('smazat-btn')) {
        smazatTransakci(event.target.getAttribute('data-id'));
    }
});

aktualizovatPrehled();