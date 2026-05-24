import React from 'react';

export default function Dashboard({ S }) {
  const conf = S.guests.filter(g => g.rsvp === 'confirmed').length;
  const pend = S.guests.filter(g => g.rsvp === 'pending').length;
  const decl = S.guests.filter(g => g.rsvp === 'declined').length;
  const tot  = S.guests.length;
  const spent = S.expenses.reduce((a, e) => a + e.amount, 0);
  const doneT = S.tasks.filter(t => t.done).length;
  const pendT = S.tasks.filter(t => !t.done).length;
  const days = S.wedding.date ? Math.ceil((new Date(S.wedding.date) - new Date()) / 86400000) : null;

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Dobrodošli 🌸</h2><p>Pregled vašeg vjenčanja</p></div>
      </div>

      <div className="sgrid">
        <div className="stat sr"><div className="sv2">{tot}</div><div className="sl2">Gostiju</div><div className="ss2">{conf} potvrdili</div></div>
        <div className="stat sgo"><div className="sv2">{spent.toLocaleString('bs')}</div><div className="sl2">KM potrošeno</div><div className="ss2">od {(S.budget||0).toLocaleString('bs')} KM</div></div>
        <div className="stat sg"><div className="sv2">{doneT}</div><div className="sl2">Zadataka ✓</div><div className="ss2">{pendT} preostalo</div></div>
        <div className="stat sst"><div className="sv2">{days !== null ? (days >= 0 ? days : '✓') : '—'}</div><div className="sl2">Dana do vjenčanja</div><div className="ss2">Jedva čekamo!</div></div>
      </div>

      <div className="dg2">
        <div className="card">
          <div className="ct">Sljedeći zadaci</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {S.tasks.filter(t => !t.done).slice(0,4).map(t => (
              <div key={t.id} className="mt2"><span style={{ color:'var(--sd)' }}>○</span>{t.name}</div>
            ))}
            {!S.tasks.filter(t=>!t.done).length && <div style={{ color:'var(--il)', fontSize:13 }}>Nema aktivnih zadataka</div>}
          </div>
        </div>
        <div className="card">
          <div className="ct">Posljednji troškovi</div>
          {S.expenses.slice(-4).reverse().map(e => (
            <div key={e.id} className="ei">
              <div><div style={{ fontSize:13 }}>{e.name}</div><div style={{ fontSize:11, color:'var(--il)' }}>{e.status}</div></div>
              <div style={{ fontSize:13, fontWeight:600, color:'var(--rd)' }}>{e.amount.toLocaleString('bs')} KM</div>
            </div>
          ))}
          {!S.expenses.length && <div style={{ color:'var(--il)', fontSize:13 }}>Nema troškova</div>}
        </div>
        <div className="card sp2">
          <div className="ct">RSVP status</div>
          <div style={{ display:'flex', gap:22, alignItems:'center', flexWrap:'wrap' }}>
            <div style={{ textAlign:'center' }}><div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:600, color:'var(--sd)' }}>{conf}</div><div style={{ fontSize:11, color:'var(--il)' }}>Potvrdili</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:600, color:'var(--go)' }}>{pend}</div><div style={{ fontSize:11, color:'var(--il)' }}>Na čekanju</div></div>
            <div style={{ textAlign:'center' }}><div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:600, color:'var(--dan)' }}>{decl}</div><div style={{ fontSize:11, color:'var(--il)' }}>Otkazali</div></div>
            <div style={{ flex:1, minWidth:150 }}>
              <div style={{ display:'flex', height:13, borderRadius:7, overflow:'hidden', gap:2 }}>
                <div style={{ background:'var(--sl)', width: tot ? `${conf/tot*100}%` : '0%', transition:'width .5s' }} />
                <div style={{ background:'var(--gl)', width: tot ? `${pend/tot*100}%` : '0%', transition:'width .5s' }} />
                <div style={{ background:'var(--bm)', width: tot ? `${decl/tot*100}%` : '0%', transition:'width .5s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
