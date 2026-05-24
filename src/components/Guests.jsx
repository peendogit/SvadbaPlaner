import React, { useState, useEffect, useCallback } from 'react';

const API = '/api';
const CAT_L = { mladozenjina:'Mladoženjina', mladina:'Mladina', kumovi:'Kumovi', prijatelji:'Prijatelji', kolege:'Kolege' };
const RSVP_B = { confirmed:'byes', pending:'bwait', declined:'bno' };
const RSVP_L = { confirmed:'Potvrdio/la', pending:'Na čekanju', declined:'Otkazao/la' };
const FILTERS = ['sve','mladozenjina','mladina','kumovi','prijatelji','kolege','confirmed','pending','declined'];
const FILTER_L = { sve:'Svi', mladozenjina:'Mladoženjina', mladina:'Mladina', kumovi:'Kumovi', prijatelji:'Prijatelji', kolege:'Kolege', confirmed:'✓ Potvrdili', pending:'⏳ Čekanje', declined:'✗ Otkazali' };
const EMPTY = { name:'', phone:'', category:'mladozenjina', rsvp:'pending', menu:'', acc:false, trans:false, note:'', group:'' };

function Toggle({ checked, onChange, label, icon }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      display:'flex', alignItems:'center', gap:8, cursor:'pointer',
      padding:'9px 14px', borderRadius:10, flex:1,
      border:`2px solid ${checked ? 'var(--ro)' : 'var(--bor)'}`,
      background: checked ? 'var(--b)' : 'white',
      transition:'all .17s', userSelect:'none',
    }}>
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
  const [groupTokens, setGroupTokens] = useState({});
  const [syncing, setSyncing] = useState(false);
  const [linkCopied, setLinkCopied] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const syncStatuses = useCallback(async () => {
    try {
      const r = await fetch(`${API}/sync`);
      if (!r.ok) return;
      const data = await r.json();
      const r2 = await fetch(`${API}/guests`);
      if (r2.ok) {
        const guests = await r2.json();
        const tMap = {};
        const gMap = {};
        guests.forEach(g => {
          tMap[g.id] = g.token;
          if (g.group_name) gMap[g.group_name] = g.token;
        });
        setTokens(tMap);
        setGroupTokens(gMap);
      }
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
    const iv = setInterval(syncStatuses, 30000);
    return () => clearInterval(iv);
  }, [syncStatuses]);

  const generateLink = async (guest) => {
    try {
      // Ako gost ima grupu, registruj sve članove grupe
      if (guest.group) {
        const groupMembers = S.guests.filter(g => g.group === guest.group);
        // Registruj sve članove
        for (const member of groupMembers) {
          await fetch(`${API}/guests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: member.id, guest_name: member.name, group_name: guest.group }),
          });
        }
        // Uzmi token prvog člana kao grupni token
        const r = await fetch(`${API}/group/${encodeURIComponent(guest.group)}`);
        if (r.ok) {
          const data = await r.json();
          const link = `${window.location.origin}/rsvp/group/${encodeURIComponent(guest.group)}?t=${data.token}`;
          copyToClipboard(link);
          setGroupTokens(gt => ({ ...gt, [guest.group]: data.token }));
          setLinkCopied(guest.id);
          setTimeout(() => setLinkCopied(null), 3000);
          showToast(`Link kopiran za grupu "${guest.group}" ✓`, 'ok');
        }
      } else {
        // Pojedinačni gost
        const r = await fetch(`${API}/guests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: guest.id, guest_name: guest.name }),
        });
        const data = await r.json();
        const link = `${window.location.origin}/rsvp/${data.token}`;
        setTokens(t => ({ ...t, [guest.id]: data.token }));
        copyToClipboard(link);
        setLinkCopied(guest.id);
        setTimeout(() => setLinkCopied(null), 3000);
        showToast(`Link kopiran za ${guest.name} ✓`, 'ok');
      }
    } catch {
      showToast('Greška pri generisanju linka', 'err');
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
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
      setModal({ ...S.guests.find(x => x.id === id) });
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
    fetch(`${API}/guests/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const exportCSV = () => {
    const rows = S.guests.map(g => [g.name, g.phone||'', g.category, g.rsvp, g.menu||'', g.acc?'Da':'', g.trans?'Da':'', g.group||'', g.note||''].join(','));
    const csv = ['Ime,Telefon,Kategorija,RSVP,Meni,Smještaj,Prevoz,Grupa,Napomena', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csv);
    a.download = 'gosti.csv'; a.click();
    showToast('Exportovano ✓', 'ok');
  };

  // Grupiši goste za prikaz
  const buildDisplay = () => {
    let list = S.guests.filter(g => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()) &&
          !(g.group && g.group.toLowerCase().includes(search.toLowerCase()))) return false;
      if (filter === 'sve') return true;
      if (['confirmed','pending','declined'].includes(filter)) return g.rsvp === filter;
      return g.category === filter;
    });

    // Pronađi grupe
    const groups = {};
    const singles = [];
    list.forEach(g => {
      if (g.group) {
        if (!groups[g.group]) groups[g.group] = [];
        groups[g.group].push(g);
      } else {
        singles.push(g);
      }
    });
    return { groups, singles };
  };

  const { groups, singles } = buildDisplay();
  const allGroups = Object.keys(groups);

  // Existing group names for autocomplete
  const existingGroups = [...new Set(S.guests.filter(g => g.group).map(g => g.group))];

  const toggleGroup = (name) => setExpandedGroups(e => ({ ...e, [name]: !e[name] }));

  const renderGuestRow = (g, isGroupMember = false) => (
    <tr key={g.id} style={isGroupMember ? { background:'rgba(249,240,238,0.4)' } : {}}>
      <td>
        <div style={{display:'flex', alignItems:'center', gap:6}}>
          {isGroupMember && <span style={{color:'var(--il)', fontSize:11}}>└</span>}
          <div>
            <strong>{g.name}</strong>
            {g.phone && <div style={{fontSize:11, color:'var(--il)'}}>{g.phone}</div>}
          </div>
        </div>
      </td>
      <td><span className="badge bcat">{CAT_L[g.category]||g.category}</span></td>
      <td><span className={`badge ${RSVP_B[g.rsvp]||''}`}>{RSVP_L[g.rsvp]||g.rsvp}</span></td>
      <td>{g.menu||<span style={{color:'var(--il)'}}>—</span>}</td>
      <td style={{fontSize:12}}>{g.acc?'🛎️ ':''}{g.trans?'🚗':''}</td>
      <td>
        {!isGroupMember && (
          <button className="btn bo sm" onClick={() => generateLink(g)}
            style={{fontSize:11, padding:'5px 10px'}}>
            {linkCopied === g.id ? '✓ Kopirano!' : tokens[g.id] ? '🔗 Link' : '+ Link'}
          </button>
        )}
      </td>
      <td>
        <div style={{display:'flex', gap:5}}>
          <button className="btn bo sm ic" onClick={() => open(g.id)}>✏</button>
          <button className="btn bd sm ic" onClick={() => del(g.id)}>✕</button>
        </div>
      </td>
    </tr>
  );

  const renderGroupRow = (groupName, members) => {
    const expanded = expandedGroups[groupName] !== false; // default expanded
    const confirmed = members.filter(m => m.rsvp === 'confirmed').length;
    const pending = members.filter(m => m.rsvp === 'pending').length;
    const declined = members.filter(m => m.rsvp === 'declined').length;
    const hasLink = !!groupTokens[groupName];

    return (
      <React.Fragment key={`group-${groupName}`}>
        <tr style={{background:'var(--b)', cursor:'pointer'}} onClick={() => toggleGroup(groupName)}>
          <td colSpan={2}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:12}}>{expanded ? '▼' : '▶'}</span>
              <span style={{fontWeight:600, fontSize:13}}>👨‍👩‍👧 {groupName}</span>
              <span style={{fontSize:11, color:'var(--il)'}}>({members.length} članova)</span>
            </div>
          </td>
          <td>
            <div style={{display:'flex', gap:5, flexWrap:'wrap'}}>
              {confirmed > 0 && <span className="badge byes">{confirmed} ✓</span>}
              {pending > 0 && <span className="badge bwait">{pending} ⏳</span>}
              {declined > 0 && <span className="badge bno">{declined} ✗</span>}
            </div>
          </td>
          <td colSpan={2}></td>
          <td>
            <button className="btn bo sm" onClick={(e) => { e.stopPropagation(); generateLink(members[0]); }}
              style={{fontSize:11, padding:'5px 10px'}}>
              {linkCopied === members[0]?.id ? '✓ Kopirano!' : hasLink ? '🔗 Link' : '+ Link'}
            </button>
          </td>
          <td></td>
        </tr>
        {expanded && members.map(m => renderGuestRow(m, true))}
      </React.Fragment>
    );
  };

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

      <div className="card" style={{padding:0, overflow:'hidden'}}>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Ime</th><th>Kategorija</th><th>RSVP</th>
                <th>Meni</th><th>Extras</th><th>RSVP Link</th><th></th>
              </tr>
            </thead>
            <tbody>
              {allGroups.map(name => renderGroupRow(name, groups[name]))}
              {singles.map(g => renderGuestRow(g))}
              {allGroups.length === 0 && singles.length === 0 && (
                <tr><td colSpan={7} style={{textAlign:'center', padding:30, color:'var(--il)'}}>Nema gostiju</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{marginTop:12, fontSize:12, color:'var(--il)'}}>
        💡 Dodaj više članova porodice sa istim nazivom grupe — generiše se jedan link za sve. Klikni na grupu da sakriješ/prikazeš članove.
      </div>

      {modal && (
        <div className="mo open" onClick={e => { if (e.target.classList.contains('mo')) setModal(null); }}>
          <div className="modal">
            <h3>{modal.id ? 'Uredi gosta' : 'Dodaj gosta'}</h3>

            <div className="fr">
              <div className="fg">
                <label>Ime i prezime *</label>
                <input value={modal.name||''} onChange={e => setModal(m => ({...m, name:e.target.value}))} />
              </div>
              <div className="fg">
                <label>Telefon</label>
                <input value={modal.phone||''} onChange={e => setModal(m => ({...m, phone:e.target.value}))} />
              </div>
            </div>

            <div className="fg">
              <label>Grupa porodice / para (opcionalno)</label>
              <input
                value={modal.group||''}
                onChange={e => setModal(m => ({...m, group:e.target.value}))}
                placeholder="npr. Porodica Hodžić"
                list="groupSuggestions"
              />
              <datalist id="groupSuggestions">
                {existingGroups.map(g => <option key={g} value={g} />)}
              </datalist>
              {modal.group && (
                <div style={{fontSize:11, color:'var(--sd)', marginTop:4}}>
                  ✓ Jedan RSVP link za cijelu grupu "{modal.group}"
                </div>
              )}
            </div>

            <div className="fr">
              <div className="fg">
                <label>Kategorija</label>
                <select value={modal.category||'mladozenjina'} onChange={e => setModal(m => ({...m, category:e.target.value}))}>
                  <option value="mladozenjina">Mladoženjina rodbina</option>
                  <option value="mladina">Mladina rodbina</option>
                  <option value="kumovi">Kumovi</option>
                  <option value="prijatelji">Prijatelji</option>
                  <option value="kolege">Kolege</option>
                </select>
              </div>
              <div className="fg">
                <label>RSVP</label>
                <select value={modal.rsvp||'pending'} onChange={e => setModal(m => ({...m, rsvp:e.target.value}))}>
                  <option value="pending">Na čekanju</option>
                  <option value="confirmed">Potvrdio/la</option>
                  <option value="declined">Otkazao/la</option>
                </select>
              </div>
            </div>

            <div className="fg">
              <label>Meni</label>
              <select value={modal.menu||''} onChange={e => setModal(m => ({...m, menu:e.target.value}))}>
                <option value="">Standardni</option>
                <option value="vegetarijanski">Vegetarijanski</option>
                <option value="veganski">Veganski</option>
                <option value="djeciji">Dječiji</option>
                <option value="bezgluten">Bezglutenski</option>
                <option value="halal">Halal</option>
              </select>
            </div>

            <div className="fg">
              <label style={{marginBottom:8, display:'block'}}>Posebni zahtjevi</label>
              <div style={{display:'flex', gap:10}}>
                <Toggle checked={!!modal.acc} onChange={v => setModal(m => ({...m, acc:v}))} label="Smještaj" icon="🛎️" />
                <Toggle checked={!!modal.trans} onChange={v => setModal(m => ({...m, trans:v}))} label="Prevoz" icon="🚗" />
              </div>
            </div>

            <div className="fg">
              <label>Napomena</label>
              <textarea value={modal.note||''} onChange={e => setModal(m => ({...m, note:e.target.value}))} placeholder="Alergije, posebni zahtjevi..." />
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
