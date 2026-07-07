-- Finanční přehled rodiny — databázové schéma
-- Spustit celé na čisté databázi (např. `finance_app`).

SET NAMES utf8mb4;

CREATE TABLE clenove_rodiny (
    id INT AUTO_INCREMENT PRIMARY KEY,
    uzivatelske_jmeno VARCHAR(50) NOT NULL UNIQUE,
    heslo_hash VARCHAR(255) NOT NULL,
    jmeno VARCHAR(100) NOT NULL,
    barva VARCHAR(20) NOT NULL DEFAULT '#7c5cff',
    vytvoreno DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE kategorie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nazev VARCHAR(100) NOT NULL,
    ikona VARCHAR(10) NOT NULL DEFAULT '💰',
    barva VARCHAR(20) NOT NULL DEFAULT '#7c5cff',
    mesicni_limit DECIMAL(10,2) NULL,
    poradi INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE transakce (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clen_id INT NOT NULL,
    kategorie_id INT NOT NULL,
    typ ENUM('prijem', 'vydaj') NOT NULL,
    popis VARCHAR(255) NOT NULL,
    castka DECIMAL(10,2) NOT NULL,
    datum DATE NOT NULL,
    vytvoreno DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clen_id) REFERENCES clenove_rodiny(id) ON DELETE CASCADE,
    FOREIGN KEY (kategorie_id) REFERENCES kategorie(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE ulozene_filtry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clen_id INT NOT NULL,
    nazev VARCHAR(100) NOT NULL,
    filtr_json JSON NOT NULL,
    vytvoreno DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clen_id) REFERENCES clenove_rodiny(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE rozlozeni_dashboardu (
    clen_id INT PRIMARY KEY,
    rozlozeni_json JSON NOT NULL,
    FOREIGN KEY (clen_id) REFERENCES clenove_rodiny(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Výchozí kategorie
INSERT INTO kategorie (nazev, ikona, barva, poradi) VALUES
    ('Příjem', '💵', '#22c55e', 0),
    ('Potraviny', '🛒', '#f59e0b', 1),
    ('Bydlení', '🏠', '#38bdf8', 2),
    ('Doprava', '🚗', '#a78bfa', 3),
    ('Zábava', '🎬', '#f472b6', 4),
    ('Zdraví', '💊', '#34d399', 5),
    ('Ostatní', '📦', '#94a3b8', 6);

-- Výchozí člen rodiny — heslo je "zmente-me", po prvním přihlášení ho ihned změňte v Nastavení.
-- Hash odpovídá password_hash('zmente-me', PASSWORD_DEFAULT).
INSERT INTO clenove_rodiny (uzivatelske_jmeno, heslo_hash, jmeno, barva) VALUES
    ('admin', '$2y$10$xauaJQcolSjcPVvDQoihSutCwcBkImdG0IRqZ/7mBpULZzqrBZE52', 'Admin', '#7c5cff');
