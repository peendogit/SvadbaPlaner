import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';
const CAT_L = { mladozenjina:'Mladoženjina', mladina:'Mladina', kumovi:'Kumovi', prijatelji:'Prijatelji', kolege:'Kolege' };
const RSVP_B = { confirmed:'byes', pending:'bwait', declined:'bno' };
const RSVP_L = { confirmed:'Potvrdio/la', pending:'Na čekanju', declined:'Otkazao/la' };
const FILTERS = ['sve','mladozenjina','mladina','kumovi','prijatelji','kolege','confirmed','pending','declined'];
const FILTER_L = { sve:'Svi', mladozenjina:'Mladoženjina', mladina:'Mladina', kumovi:'Kumovi', prijatelji:'Prijatelji', kolege:'Kolege', confirmed:'✓ Potvrdili', pending:'⏳ Čekanje', declined:'✗ Otkazali' };
const EMPTY = { name:'', phone:'', category:'mladozenjina', rsvp:'pending', menu:'', acc:false, trans:false, note:'' };

function Toggle({ checked, onChange, label, icon }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display:'flex', alignItems:'center', gap:8, cursor:'pointer',
        padding:'9px 14px', borderRadius:10, flex:1,
        border:`2px solid ${checked ? 'var(--ro)' : 'var(--bor)'}`,
        background: checked ? 'var(--b)' : 'white',
        transition:'all .17s', userSelect:'none',
      }}
    >
      <span style={{fontSize:18}}>{icon}</span>
      <span style={{fontSize:13, fontWeight:500, color: checked ? 'var(--rd)' : 'var(--im)'}}>{label}</span>
      <div style={{
        marginLeft:'auto', width:18, height:18, borderRadius:5,
        border:`2px solid ${checked ? 'var(--ro)' : 'var(--bor)'}`,
        background: checked ? 'var(--ro)' : 'transparent',
        display:'flex', alignItems:'center', justifyContent:'center',
        color:'white', fontSize:11, fontWeight:700, transition:'all .17s',
      }}>
        {checked ? '✓' : ''}
      </div>
    </div>
  );
}

export default function Guests({ S, update, showToast }) {
  const [filter, setFilter] = useState('sve');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [tokens, setTokens] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(null);

  // Sync statuses from API
  const syncStatuses = useCallback(async () => {
    try {
      const r = await fetch(`${API}/sync`);
      if (!r.ok) return;
      const data = await r.json();
      // Update tokens map
      const r2 = await fetch(`${API}/guests`);
      if (r2.ok) {
        const guests = await r2.json();
        const tMap = {};
        guests.forEach(g => { tMap[g.id] = g.token; });
        setTokens(tMap);
      }
      // Update rsvp statuses in state
      if (data.length > 0) {
        update(s => {
          data.forEach(({ id, status }) => {
            const g = s.guests.find(x => x.id === id);
            if (g && status !== 'pending') g.rsvp = status;
          });
        });
      }
    } catch {}
  }, [update]);

  useEffect(() => {
    syncStatuses();
    const iv = setInterval(syncStatuses, 30000); // auto-sync svakih 30s
    return () => clearInterval(iv);
  }, [syncStatuses]);

  const generateLink = async (guest) => {
    try {
      const r = await fetch(`${API}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: guest.id, guest_name: guest.name }),
      });
      const data = await r.json();
      const token = data.token;
      setTokens(t => ({ ...t, [guest.id]: token }));
      const link = `${window.location.origin}/rsvp/${token}`;
      copyToClipboard(link);
      setLinkCopied(guest.id);
      setTimeout(() => setLinkCopied(null), 3000);
      showToast(`Link kopiran za ${guest.name} ✓`, 'ok');
    } catch {
      showToast('Greška pri generisanju linka', 'err');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  const manualSync = async () => {
    setSyncing(true);
    await syncStatuses();
    setSyncing(false);
    showToast('Statusi ažurirani ✓', 'ok');
  };

  const open = (id = null) => {
    if (id) {
      const g = S.guests.find(x => x.id === id);
      setModal({ ...g });
    } else {
      setModal({ ...EMPTY, id: null });
    }
  };

  const save = () => {
    if (!modal.name?.trim()) { showToast('Unesite ime', 'err'); return; }
    const id = modal.id || Date.now().toString();
    update(s => {
      const i = s.guests.findIndex(x => x.id === id);
      const g = { ...modal, id, assigned: modal.id ? (s.guests.find(x => x.id === id)?.assigned || false) : false };
      if (i >= 0) s.guests[i] = g; else s.guests.push(g);
    });
    setModal(null);
    showToast('Gost sačuvan ✓', 'ok');
  };

  const del = (id) => {
    if (!window.confirm('Obrisati gosta?')) return;
    update(s => {
      s.guests = s.guests.filter(x => x.id !== id);
      s.rules = s.rules.filter(r => r.g1 !== id && r.g2 !== id);
    });
    // Obriši i iz API baze
    fetch(`${API}/guests/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const exportCSV = () => {
    const rows = S.guests.map(g => [g.name, g.phone || '', g.category, g.rsvp, g.menu || '', g.acc ? 'Da' : '', g.trans ? 'Da' : '', g.note || ''].join(','));
    const csv = ['Ime,Telefon,Kategorija,RSVP,Meni,Smještaj,Prevoz,Napomena', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = 'gosti.csv';
    a.click();
    showToast('Exportovano ✓', 'ok');
  };

  const list = S.guests.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'sve') return true;
    if (['confirmed', 'pending', 'declined'].includes(filter)) return g.rsvp === filter;
    return g.category === filter;
  });

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Gosti</h2><p>Lista pozvanica i RSVP</p></div>
        <div className="ph-actions">
          <button className="btn bo sm" onClick={manualSync} disabled={syncing}>
            {syncing ? '↻ ...' : '↻ Sync'}
          </button>
          <button className="btn bo sm" onClick={exportCSV}>↓ CSV</button>
          <button className="btn bp" onClick={() => open()}>+ Dodaj gosta</button>
        </div>
      </div>

      <div className="sw3">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pretraži..." />
      </div>

      <div className="chips">
        {FILTERS.map(f => (
          <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
            {FILTER_L[f]}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Ime</th><th>Kategorija</th><th>RSVP</th>
                <th>Meni</th><th>Extras</th><th>RSVP Link</th><th></th>
              </tr>
            </thead>
            <tbody>
              {list.map(g => (
                <tr key={g.id}>
                  <td>
                    <strong>{g.name}</strong>
                    {g.phone && <div style={{ fontSize: 11, color: 'var(--il)' }}>{g.phone}</div>}
                  </td>
                  <td><span className="badge bcat">{CAT_L[g.category] || g.category}</span></td>
                  <td><span className={`badge ${RSVP_B[g.rsvp] || ''}`}>{RSVP_L[g.rsvp] || g.rsvp}</span></td>
                  <td>{g.menu || <span style={{ color: 'var(--il)' }}>—</span>}</td>
                  <td style={{ fontSize: 12 }}>{g.acc ? '🛎️ ' : ''}{g.trans ? '🚗' : ''}</td>
                  <td>
                    <button
                      className="btn bo sm"
                      onClick={() => generateLink(g)}
                      style={{ fontSize: 11, padding: '5px 10px' }}
                      title="Generiši i kopiraj RSVP link"
                    >
                      {linkCopied === g.id ? '✓ Kopirano!' : tokens[g.id] ? '🔗 Link' : '+ Link'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button className="btn bo sm ic" onClick={() => open(g.id)}>✏</button>
                      <button className="btn bd sm ic" onClick={() => del(g.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--il)' }}>Nema gostiju</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--il)' }}>
        💡 Klikni "+ Link" pored gosta, kopiraj i pošalji na Viber. Gost klika i potvrđuje dolazak. Status se automatski ažurira svakih 30 sekundi.
      </div>

      {modal && (
        <div className="mo open" onClick={e => { if (e.target.classList.contains('mo')) setModal(null); }}>
          <div className="modal">
            <h3>{modal.id ? 'Uredi gosta' : 'Dodaj gosta'}</h3>

            <div className="fr">
              <div className="fg">
                <label>Ime i prezime *</label>
                <input value={modal.name || ''} onChange={e => setModal(m => ({ ...m, name: e.target.value }))} />
              </div>
              <div className="fg">
                <label>Telefon</label>
                <input value={modal.phone || ''} onChange={e => setModal(m => ({ ...m, phone: e.target.value }))} />
              </div>
            </div>

            <div className="fr">
              <div className="fg">
                <label>Kategorija</label>
                <select value={modal.category || 'mladozenjina'} onChange={e => setModal(m => ({ ...m, category: e.target.value }))}>
                  <option value="mladozenjina">Mladoženjina rodbina</option>
                  <option value="mladina">Mladina rodbina</option>
                  <option value="kumovi">Kumovi</option>
                  <option value="prijatelji">Prijatelji</option>
                  <option value="kolege">Kolege</option>
                </select>
              </div>
              <div className="fg">
                <label>RSVP</label>
                <select value={modal.rsvp || 'pending'} onChange={e => setModal(m => ({ ...m, rsvp: e.target.value }))}>
                  <option value="pending">Na čekanju</option>
                  <option value="confirmed">Potvrdio/la</option>
                  <option value="declined">Otkazao/la</option>
                </select>
              </div>
            </div>

            <div className="fg">
              <label>Meni</label>
              <select value={modal.menu || ''} onChange={e => setModal(m => ({ ...m, menu: e.target.value }))}>
                <option value="">Standardni</option>
                <option value="vegetarijanski">Vegetarijanski</option>
                <option value="veganski">Veganski</option>
                <option value="djeciji">Dječiji</option>
                <option value="bezgluten">Bezglutenski</option>
                <option value="halal">Halal</option>
              </select>
            </div>

            <div className="fg">
              <label style={{ marginBottom: 8, display: 'block' }}>Posebni zahtjevi</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <Toggle checked={!!modal.acc} onChange={v => setModal(m => ({ ...m, acc: v }))} label="Smještaj" icon="🛎️" />
                <Toggle checked={!!modal.trans} onChange={v => setModal(m => ({ ...m, trans: v }))} label="Prevoz" icon="🚗" />
              </div>
            </div>

            <div className="fg">
              <label>Napomena</label>
              <textarea value={modal.note || ''} onChange={e => setModal(m => ({ ...m, note: e.target.value }))} placeholder="Alergije, posebni zahtjevi..." />
            </div>

            <div className="mf">
              <button className="btn bo" onClick={() => setModal(null)}>Otkaži</button>
              <button className="btn bp" onClick={save}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
