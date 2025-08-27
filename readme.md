# Finanční přehled - Jednoduchá webová aplikace

Jednoduchá "single-page" webová aplikace pro sledování osobních příjmů a výdajů. Umožňuje přidávat, mazat a filtrovat transakce, sledovat měsíční limit a vizualizovat data v přehledném grafu.

<img width="1631" height="820" alt="Image" src="https://github.com/user-attachments/assets/bac82bf0-e692-4222-8efe-e2da6aeaf5a6" />
---

## Klíčové funkce

*   **Správa transakcí:** Přidávání příjmů a výdajů s popisem, částkou a datem.
*   **Dynamický přehled:** Automatický výpočet celkových příjmů, výdajů a aktuálního zůstatku.
*   **Vizuální graf:** Koláčový graf pro rychlý přehled poměru příjmů a výdajů ve vybraném období.
*   **Měsíční filtrování:** Možnost zobrazit transakce pro konkrétní měsíc nebo všechny najednou.
*   **Sledování limitu:** Nastavení měsíčního limitu na výdaje a vizuální indikace jeho plnění.
*   **Trvalé uložení dat:** Všechna data jsou ukládána lokálně v prohlížeči pomocí `LocalStorage`, takže po obnovení stránky nezmizí.
*   **Responzivní design:** Aplikace je navržena tak, aby byla použitelná na desktopu i na menších obrazovkách.

---

## Použité technologie

*   **HTML5:** Pro základní strukturu a sémantiku stránky.
*   **CSS3:** Pro veškerý styling, rozložení (Flexbox, Grid) a vizuální efekty.
*   **JavaScript (ES6+):** Pro veškerou logiku aplikace, manipulaci s DOM, výpočty a interaktivitu.
*   **Chart.js:** Knihovna pro snadné a rychlé vytváření interaktivních grafů.
*   **Synology Web Station:** Pro hostování aplikace na vlastním NAS serveru.

---

## Jak spustit projekt

### Lokální spuštění

Projekt nevyžaduje žádnou instalaci. Stačí otevřít soubor `index.html` v jakémkoliv moderním webovém prohlížeči.

### Nasazení na server (např. Synology NAS)

1.  Ujistěte se, že máte nainstalovaný a spuštěný balíček **Web Station**.
2.  Zkopírujte všechny soubory projektu (`index.html`, `style.css`, `script.js`, `README.md`) do podsložky ve sdílené složce `/web` (např. `/web/finance/`).
3.  Nastavte správná oprávnění pro skupinu `http` na složku `/web` (čtení/zápis).
4.  Aplikace bude dostupná na lokální adrese `http://<IP_ADRESA_NASU>/finance/`.

---

Vytvořeno jako součást výukového projektu o základech webového vývoje.