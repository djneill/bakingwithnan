-- Recipes table

CREATE TABLE IF NOT EXISTS recipes (
    id      INTEGER PRIMARY KEY AUTOINCREMENTM
    name    TEXT    NOT NULL,
    slug    TEXT    NOT NULL UNIQUE,
    dish_image  TEXT,
    card_image1 TEXT NOT NULL,
    card_image2 TEXT,
    card_image3 TEXT,
    card_image4 TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Index for alphabet filtering (first letter of name)

CREATE INDEX IF NOT EXISTS indx_recipes_name ON recipes (name COLLATE NOCASE);

-- Sticky notes for Nan's sayings

CREATE TABLE IF NOT EXISTS sticky_notes (
    id  INTEGER PRIMARY KEY AUTOINCREMENT,
    email   TEXT NOT NULL UNIQUE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Admin users: only two people will ever be in here
CREATE TABLE IF NOT EXISTS admins (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Magic link tokens for passwordless login
CREATE TABLE IF NOT EXISTS magic_links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id    INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    token       TEXT    NOT NULL UNIQUE,          
    expires_at  TEXT    NOT NULL,                
    used        INTEGER NOT NULL DEFAULT 0,      
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_magic_links_token ON magic_links (token);

-- Sessions: created after a magic link is consumed
CREATE TABLE IF NOT EXISTS sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id    INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    session_token TEXT  NOT NULL UNIQUE,
    expires_at  TEXT    NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions (session_token);

-- Seed a few of Nan's sayings
INSERT OR IGNORE INTO sticky_notes (content) VALUES
    ('A pinch of love makes everything better.'),
    ("Never trust a recipe that doesn't smell good."),
    ('The secret ingredient is always butter.');
    ("Put your right hand over your left shoulder, and your left hand over should and squeeze. That's a hug from me!")