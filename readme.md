# Finanční přehled rodiny

Rodinná aplikace pro sledování příjmů a výdajů — pro web i telefony (instalovatelná PWA).
Tmavý glassmorphism design, více profilů členů rodiny, vlastní kategorie s rozpočtovými
limity, uložené filtry a přizpůsobitelný dashboard.

## Architektura

```
/frontend    React + Vite + TypeScript + Tailwind CSS (PWA)
/public      Document root webu — jediná veřejně dostupná složka
  /api       PHP 8 endpointy volané frontendem (session auth)
/inc         DB připojení, config, sdílené knihovny — MIMO /public,
             tedy nedosažitelné přes HTTP bez ohledu na konfiguraci webserveru
/database    schema.sql — databázové schéma + výchozí data
```

Frontend komunikuje s API přes `/api/*` (v produkci stejná doména, v lokálním vývoji
přes Vite proxy — viz `frontend/vite.config.ts`).

### Databáze

- `clenove_rodiny` — účty členů rodiny (jméno, heslo, barva avataru)
- `kategorie` — kategorie transakcí (ikona, barva, volitelný měsíční limit)
- `transakce` — jednotlivé příjmy/výdaje, vázané na člena a kategorii
- `ulozene_filtry` — pojmenované kombinace filtrů uložené per člen
- `rozlozeni_dashboardu` — viditelnost a pořadí widgetů na dashboardu per člen

### Backend (PHP)

Session-based přihlášení (`password_hash`/`password_verify`). Každý chráněný endpoint
(`clenove.php`, `kategorie.php`, `transakce.php`, `filtry.php`, `rozlozeni.php`) vyžaduje
platnou session — jinak vrací `401`. Přihlašovací údaje k databázi se nikdy necommitují:
`inc/db_config.php` načítá `inc/config.local.php` (v `.gitignore`), podle šablony
`inc/config.example.php`. Soubory v `inc/` leží mimo `public/`, takže nejsou dosažitelné
přes HTTP ani při chybné konfiguraci webserveru.

## Lokální vývoj

Vyžaduje PHP 8+ a MySQL/MariaDB (např. XAMPP) a Node.js 20+.

1. **Databáze** — vytvoř databázi a nahraj schéma:
   ```
   mysql -u root -e "CREATE DATABASE finance_app CHARACTER SET utf8mb4;"
   mysql -u root finance_app < database/schema.sql
   ```
   Výchozí přihlašovací účet: `admin` / `zmente-me` — po prvním přihlášení heslo změň.

2. **Backend** — zkopíruj `inc/config.example.php` do `inc/config.local.php` a vyplň
   údaje k databázi, pak spusť vestavěný PHP server s document rootem v `public/`:
   ```
   php -S localhost:8000 -t public
   ```

3. **Frontend** — Vite dev server proxuje `/api` na `http://localhost:8000`:
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Aplikace poběží na `http://localhost:5173`.

## Nasazení na Synology (Web Station)

1. `cd frontend && npm run build` — vygeneruje `frontend/dist`.
2. Na server nahraj obsah `frontend/dist/` do `public/` (vedle `api/` a `.htaccess`,
   které tam už jsou) a celou složku `inc/`.
3. V DSM Web Station nastav document root webu na `.../finance/public` (ne na kořen
   repozitáře — `inc/` a `database/` musí zůstat mimo document root).
4. Na serveru vytvoř `inc/config.local.php` podle `inc/config.example.php` se skutečnými
   údaji k databázi (tento soubor se necommituje do gitu).
5. Spusť `database/schema.sql` na produkční databázi.
5. Ověř, že `.htaccess` přesměrovává vše mimo `/api` a existující soubory na `index.html`
   (SPA routing) — viz komentář v souboru.

## Klíčové funkce

- Přihlášení pro každého člena rodiny zvlášť, s vlastním avatarem a barvou.
- Přehled příjmů/výdajů, koláčový graf podle kategorií a trend graf za posledních 6 měsíců.
- Filtrování podle období, kategorie a člena rodiny; uložené filtry pro rychlý přístup.
- Vlastní kategorie s ikonou, barvou a volitelným měsíčním rozpočtovým limitem
  (s vizuálním ukazatelem čerpání).
- Přizpůsobitelný dashboard — viditelnost a pořadí widgetů se ukládá per člen.
- Instalovatelná PWA s offline podporou (manifest + service worker).

## Použité technologie

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Chart.js, React Router, vite-plugin-pwa
- **Backend:** PHP 8 (mysqli, prepared statements), MySQL/MariaDB
- **Hosting:** Synology NAS (Web Station)
