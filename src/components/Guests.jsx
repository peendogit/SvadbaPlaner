import React, { useState } from 'react';

const CAT_L = { mladozenjina:'Mladoženjina', mladina:'Mladina', kumovi:'Kumovi', prijatelji:'Prijatelji', kolege:'Kolege' };
const RSVP_B = { confirmed:'byes', pending:'bwait', declined:'bno' };
const RSVP_L = { confirmed:'Potvrdio/la', pending:'Na čekanju', declined:'Otkazao/la' };

const EMPTY = { name:'', phone:'', category:'mladozenjina', rsvp:'pending', menu:'', acc:false, trans:false, note:'' };

export default function Guests({ S, update, showToast }) {
  const [filter, setFilter] = useState('sve');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | guest-id

  const open = (id=null) => {
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
      const g = { ...modal, id, assigned: modal.id ? (s.guests.find(x=>x.id===id)?.assigned||false) : false };
      if (i >= 0) s.guests[i] = g; else s.guests.push(g);
    });
    setModal(null);
    showToast('Gost sačuvan ✓', 'ok');
  };

  const del = (id) => {
    if (!window.confirm('Obrisati gosta?')) return;
    update(s => { s.guests = s.guests.filter(x => x.id !== id); s.rules = s.rules.filter(r => r.g1!==id && r.g2!==id); });
  };

  const exportCSV = () => {
    const rows = S.guests.map(g => [g.name,g.phone||'',g.category,g.rsvp,g.menu||'',g.acc?'Da':'',g.trans?'Da':'',g.note||''].join(','));
    const csv = ['Ime,Telefon,Kategorija,RSVP,Meni,Smještaj,Prevoz,Napomena', ...rows].join('\n');
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv); a.download='gosti.csv'; a.click();
    showToast('Exportovano ✓', 'ok');
  };

  const FILTERS = ['sve','mladozenjina','mladina','kumovi','prijatelji','kolege','confirmed','pending','declined'];
  const FILTER_L = { sve:'Svi', mladozenjina:'Mladoženjina', mladina:'Mladina', kumovi:'Kumovi', prijatelji:'Prijatelji', kolege:'Kolege', confirmed:'✓ Potvrdili', pending:'⏳ Čekanje', declined:'✗ Otkazali' };

  const list = S.guests.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'sve') return true;
    if (['confirmed','pending','declined'].includes(filter)) return g.rsvp === filter;
    return g.category === filter;
  });

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Gosti</h2><p>Lista pozvanica i RSVP</p></div>
        <div className="ph-actions">
          <button className="btn bo sm" onClick={exportCSV}>↓ CSV</button>
          <button className="btn bp" onClick={() => open()}>+ Dodaj gosta</button>
        </div>
      </div>

      <div className="sw3"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pretraži..." /></div>

      <div className="chips">
        {FILTERS.map(f => <button key={f} className={`chip ${filter===f?'on':''}`} onClick={()=>setFilter(f)}>{FILTER_L[f]}</button>)}
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="tw">
          <table>
            <thead><tr><th>Ime</th><th>Kategorija</th><th>RSVP</th><th>Meni</th><th>Extras</th><th>Napomena</th><th></th></tr></thead>
            <tbody>
              {list.map(g => (
                <tr key={g.id}>
                  <td><strong>{g.name}</strong>{g.phone&&<div style={{fontSize:11,color:'var(--il)'}}>{g.phone}</div>}</td>
                  <td><span className="badge bcat">{CAT_L[g.category]||g.category}</span></td>
                  <td><span className={`badge ${RSVP_B[g.rsvp]||''}`}>{RSVP_L[g.rsvp]||g.rsvp}</span></td>
                  <td>{g.menu||<span style={{color:'var(--il)'}}>—</span>}</td>
                  <td style={{fontSize:12}}>{g.acc?'🛎️ ':''}{g.trans?'🚗':''}</td>
                  <td style={{fontSize:12,color:'var(--im)'}}>{g.note}</td>
                  <td><div style={{display:'flex',gap:5}}>
                    <button className="btn bo sm ic" onClick={()=>open(g.id)}>✏</button>
                    <button className="btn bd sm ic" onClick={()=>del(g.id)}>✕</button>
                  </div></td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={7} style={{textAlign:'center',padding:30,color:'var(--il)'}}>Nema gostiju</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="mo open">
          <div className="modal">
            <h3>{modal.id ? 'Uredi gosta' : 'Dodaj gosta'}</h3>
            <div className="fr">
              <div className="fg"><label>Ime i prezime *</label><input value={modal.name||''} onChange={e=>setModal(m=>({...m,name:e.target.value}))} placeholder="Ime Prezime"/></div>
              <div className="fg"><label>Telefon</label><input value={modal.phone||''} onChange={e=>setModal(m=>({...m,phone:e.target.value}))} placeholder="+387..."/></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Kategorija</label>
                <select value={modal.category||'mladozenjina'} onChange={e=>setModal(m=>({...m,category:e.target.value}))}>
                  <option value="mladozenjina">Mladoženjina rodbina</option><option value="mladina">Mladina rodbina</option>
                  <option value="kumovi">Kumovi</option><option value="prijatelji">Prijatelji</option><option value="kolege">Kolege</option>
                </select>
              </div>
              <div className="fg"><label>RSVP</label>
                <select value={modal.rsvp||'pending'} onChange={e=>setModal(m=>({...m,rsvp:e.target.value}))}>
                  <option value="pending">Na čekanju</option><option value="confirmed">Potvrdio/la</option><option value="declined">Otkazao/la</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>Meni</label>
                <select value={modal.menu||''} onChange={e=>setModal(m=>({...m,menu:e.target.value}))}>
                  <option value="">Standardni</option><option value="vegetarijanski">Vegetarijanski</option>
                  <option value="veganski">Veganski</option><option value="djeciji">Dječiji</option>
                  <option value="bezgluten">Bezglutenski</option><option value="halal">Halal</option>
                </select>
              </div>
              <div className="fg" style={{display:'flex',alignItems:'center',gap:13,paddingTop:17}}>
                <label style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:12}}>
                  <input type="checkbox" checked={!!modal.acc} onChange={e=>setModal(m=>({...m,acc:e.target.checked}))}/> Smještaj
                </label>
                <label style={{display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:12}}>
                  <input type="checkbox" checked={!!modal.trans} onChange={e=>setModal(m=>({...m,trans:e.target.checked}))}/> Prevoz
                </label>
              </div>
            </div>
            <div className="fg"><label>Napomena</label><textarea value={modal.note||''} onChange={e=>setModal(m=>({...m,note:e.target.value}))} placeholder="Alergije, posebni zahtjevi..."/></div>
            <div className="mf">
              <button className="btn bo" onClick={()=>setModal(null)}>Otkaži</button>
              <button className="btn bp" onClick={save}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
