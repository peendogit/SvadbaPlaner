import React, { useState, useEffect } from 'react';

const NAV = [
  { section: 'Planiranje' },
  { id:'dashboard', label:'Pregled' },
  { id:'guests',    label:'Gosti',            badge:'guests' },
  { id:'seating',   label:'Raspored sjedenja' },
  { section: 'Finansije' },
  { id:'budget',    label:'Budžet' },
  { section: 'Organizacija' },
  { id:'tasks',     label:'Zadaci',           badge:'tasks' },
  { id:'vendors',   label:'Dobavljači' },
  { id:'ai',        label:'AI Asistent ✨' },
  { id:'dan',       label:'📅 Dan vjenčanja' },
  { id:'zdravice',  label:'🥂 Zdravice' },
  { section: 'Sistem' },
  { id:'settings',  label:'⚙ Podešavanja' },
];

export default function Sidebar({ S, page, navTo, sbOpen }) {
  const [days, setDays] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!S.wedding.date) { setCountdown(''); setDays(null); return; }
    const d = Math.ceil((new Date(S.wedding.date) - new Date()) / 86400000);
    setDays(d);
    if (d < 0) setCountdown('Prošlo ✓');
    else if (d === 0) setCountdown('Danas! 🎉');
    else setCountdown(`${d}`);
  }, [S.wedding.date]);

  const MONTHS = ['Januar','Februar','Mart','April','Maj','Juni','Juli','August','Septembar','Oktobar','Novembar','Decembar'];

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${parseInt(d)}. ${MONTHS[parseInt(m)-1]} ${y}`;
  };

  const badge = (key) => {
    if (key === 'guests') return S.guests.length;
    if (key === 'tasks') return S.tasks.filter(t => !t.done).length;
    return null;
  };

  return (
    <aside className={`sb ${sbOpen ? 'open' : ''}`}>
      <div className="sb-head">
        <div className="sb-brand">Svadba<em>.ba</em></div>
        <div className="sb-tag">Wedding Planner</div>
      </div>

      <div className="dw">
        <label>Datum vjenčanja</label>
        <div style={{fontSize:13,color:'var(--ink)',padding:'2px 0',minHeight:20}}>
          {S.wedding.date ? formatDate(S.wedding.date) : <span style={{color:'var(--il)'}}>Unesite u Podešavanjima</span>}
        </div>
        <div className="cd">
          {countdown
            ? days === 0
              ? <small style={{ color:'var(--ro)' }}>Danas! 🎉</small>
              : days < 0
                ? <small>Prošlo ✓</small>
                : <>{countdown}<small>dana preostalo</small></>
            : <small>Odaberite datum</small>
          }
        </div>
      </div>

      <nav className="sb-nav">
        {NAV.map((item, i) => {
          if (item.section) return <div key={i} className="ns">{item.section}</div>;
          const b = item.badge ? badge(item.badge) : null;
          return (
            <div key={item.id} className={`ni ${page === item.id ? 'on' : ''}`} onClick={() => navTo(item.id)}>
              {item.label}
              {b !== null && <span className="nb">{b}</span>}
            </div>
          );
        })}
      </nav>

      <div className="sb-foot">
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ display:'flex' }}>
            <div className="av" style={{ background:'var(--b)', color:'var(--rd)' }}>
              {(S.wedding.bride[0] || 'A').toUpperCase()}
            </div>
            <div className="av" style={{ background:'var(--sl)', color:'var(--sd)' }}>
              {(S.wedding.groom[0] || 'H').toUpperCase()}
            </div>
          </div>
          <div style={{ fontSize:12, color:'var(--im)' }}>
            {S.wedding.bride} & {S.wedding.groom}
          </div>
        </div>
      </div>
    </aside>
  );
}
