# Finanční přehled rodiny

Rodinná aplikace pro sledování příjmů a výdajů — pro web i telefony (instalovatelná PWA).
Tmavý glassmorphism design, více profilů členů rodiny, vlastní kategorie s rozpočtovými
limity, uložené filtry a přizpůsobitelný dashboard.

## Architektura

```
/frontend    React + Vite + TypeScript + Tailwind CSS (PWA)
/api         PHP 8 + MySQL/MariaDB backend (session auth)
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
`api/db_config.php` načítá `api/config.local.php` (v `.gitignore`), podle šablony
`api/config.example.php`.

## Lokální vývoj

Vyžaduje PHP 8+ a MySQL/MariaDB (např. XAMPP) a Node.js 20+.

1. **Databáze** — vytvoř databázi a nahraj schéma:
   ```
   mysql -u root -e "CREATE DATABASE finance_app CHARACTER SET utf8mb4;"
   mysql -u root finance_app < database/schema.sql
   ```
   Výchozí přihlašovací účet: `admin` / `zmente-me` — po prvním přihlášení heslo změň.

2. **Backend** — zkopíruj `api/config.example.php` do `api/config.local.php` a vyplň
   údaje k databázi, pak spusť vestavěný PHP server:
   ```
   cd api
   php -S localhost:8000
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
2. Na server nahraj obsah `frontend/dist/`, celou složku `api/` a `.htaccess` do webové
   složky (např. `/web/finance/`).
3. Na serveru vytvoř `api/config.local.php` podle `api/config.example.php` se skutečnými
   údaji k databázi (tento soubor se necommituje do gitu).
4. Spusť `database/schema.sql` na produkční databázi.
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
