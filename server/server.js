const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'rsvp.db');

app.use(cors());
app.use(express.json());

const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS rsvp (
    id TEXT PRIMARY KEY,
    guest_name TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    group_name TEXT,
    group_token TEXT,
    status TEXT DEFAULT 'pending',
    responded_at TEXT,
    message TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
try { db.exec(`ALTER TABLE rsvp ADD COLUMN group_name TEXT`); } catch {}
try { db.exec(`ALTER TABLE rsvp ADD COLUMN group_token TEXT`); } catch {}

// Pojedinačni RSVP — GET
app.get('/api/rsvp/:token', (req, res) => {
  const token = req.params.token;
  // Provjeri da li je grupni token
  const isGroup = req.query.group === '1';
  if (isGroup) {
    const members = db.prepare('SELECT id, guest_name, status, responded_at, group_name FROM rsvp WHERE group_token = ?').all(token);
    if (!members.length) return res.status(404).json({ error: 'Link nije validan' });
    return res.json({ is_group: true, group_name: members[0].group_name, members });
  }
  const guest = db.prepare('SELECT id, guest_name, status, responded_at FROM rsvp WHERE token = ?').get(token);
  if (!guest) return res.status(404).json({ error: 'Link nije validan' });
  res.json(guest);
});

// Pojedinačni RSVP — POST
app.post('/api/rsvp/:token', (req, res) => {
  const token = req.params.token;
  const isGroup = req.query.group === '1';

  if (isGroup) {
    const { responses } = req.body;
    if (!responses || !Array.isArray(responses)) return res.status(400).json({ error: 'Nevažeći podaci' });
    const members = db.prepare('SELECT id FROM rsvp WHERE group_token = ?').all(token);
    const validIds = new Set(members.map(m => m.id));
    responses.forEach(({ id, status, message }) => {
      if (validIds.has(id) && ['confirmed','declined'].includes(status)) {
        db.prepare(`UPDATE rsvp SET status=?, message=?, responded_at=datetime('now') WHERE id=?`).run(status, message||null, id);
      }
    });
    return res.json({ ok: true });
  }

  const { status, message } = req.body;
  if (!['confirmed', 'declined'].includes(status)) return res.status(400).json({ error: 'Nevažeći status' });
  const guest = db.prepare('SELECT id FROM rsvp WHERE token = ?').get(token);
  if (!guest) return res.status(404).json({ error: 'Link nije validan' });
  db.prepare(`UPDATE rsvp SET status=?, message=?, responded_at=datetime('now') WHERE token=?`).run(status, message||null, token);
  res.json({ ok: true });
});

// GET group token
app.get('/api/group/:groupName', (req, res) => {
  const groupName = decodeURIComponent(req.params.groupName);
  const existing = db.prepare('SELECT group_token FROM rsvp WHERE group_name = ? LIMIT 1').get(groupName);
  if (existing) return res.json({ group_token: existing.group_token });
  res.status(404).json({ error: 'Grupa nije pronađena' });
});

// Admin
app.get('/api/guests', (req, res) => {
  res.json(db.prepare('SELECT * FROM rsvp ORDER BY group_name, created_at').all());
});

app.post('/api/guests', (req, res) => {
  const { id, guest_name, group_name } = req.body;
  if (!id || !guest_name) return res.status(400).json({ error: 'id i guest_name obavezni' });
  const existing = db.prepare('SELECT token, group_token FROM rsvp WHERE id = ?').get(id);
  if (existing) return res.json({ token: existing.token, group_token: existing.group_token });
  const token = crypto.randomBytes(16).toString('hex');
  let group_token = null;
  if (group_name) {
    const existingGroup = db.prepare('SELECT group_token FROM rsvp WHERE group_name = ? LIMIT 1').get(group_name);
    group_token = existingGroup ? existingGroup.group_token : crypto.randomBytes(16).toString('hex');
  }
  db.prepare('INSERT INTO rsvp (id, guest_name, token, group_name, group_token) VALUES (?, ?, ?, ?, ?)').run(id, guest_name, token, group_name||null, group_token);
  res.json({ token, group_token });
});

app.delete('/api/guests/:id', (req, res) => {
  db.prepare('DELETE FROM rsvp WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.get('/api/sync', (req, res) => {
  res.json(db.prepare('SELECT id, status, responded_at FROM rsvp').all());
});

app.listen(PORT, () => console.log('RSVP API radi na portu ' + PORT));
