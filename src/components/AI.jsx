// AI.jsx
import React, { useState, useRef } from 'react';

export function AI({ S }) {
  const [msgs, setMsgs] = useState([{ role:'ai', text:'Zdravo! Ja sam vaš AI asistent. Mogu pomoći sa pozivnicama, protokolom, playlistom, budžetom i svim ostalim. Kako mogu da pomognem?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const send = async (q) => {
    const msg = q || input.trim(); if (!msg) return;
    setInput(''); setLoading(true);
    setMsgs(m => [...m, { role:'user', text:msg }]);
    try {
      const sys = `Ti si AI asistent za planiranje vjenčanja. Mlada: ${S.wedding.bride}, Mladoženja: ${S.wedding.groom}, Datum: ${S.wedding.date||'nije određen'}, Gostiju: ${S.guests.length}, Budžet: ${S.budget} KM. Odgovaraj na bosanskom.`;
      const r = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:[{role:'user',content:msg}]})});
      const d = await r.json();
      setMsgs(m => [...m, { role:'ai', text:d.content?.find(c=>c.type==='text')?.text||'Greška' }]);
    } catch { setMsgs(m => [...m, { role:'ai', text:'Greška u komunikaciji.' }]); }
    setLoading(false);
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:'smooth'}),100);
  };

  const SUGG = [['Tekst za pozivnicu','Napiši tekst za pozivnicu na bosanskom jeziku'],['Playlist','Predloži redoslijed pjesama za vjenčanje'],['Protokol','Napiši protokol ceremonije vjenčanja'],['3 mj. prije','Koji su najvažniji zadaci 3 mjeseca prije vjenčanja?'],['Budžet savjeti','Daj savjete za smanjenje troškova vjenčanja'],['Zahvalnica','Napiši zahvalnicu za goste nakon vjenčanja']];

  return (
    <div className="page">
      <div className="ph"><div><h2>AI Asistent ✨</h2><p>Pitaj sve o planiranju vjenčanja</p></div></div>
      <div className="ai-wrap">
        <div className="sugg">{SUGG.map(([l,q])=><button key={l} className="sg3" onClick={()=>send(q)}>{l}</button>)}</div>
        <div className="cm">
          {msgs.map((m,i)=>(
            <div key={i} className={`msg ${m.role}`}>
              <div className="cav">{m.role==='ai'?'🌸':'😊'}</div>
              <div className="bbl" dangerouslySetInnerHTML={{__html:m.text.replace(/\n/g,'<br/>')}}/>
            </div>
          ))}
          {loading && <div className="msg ai"><div className="cav">🌸</div><div className="bbl"><div style={{display:'flex',gap:4,alignItems:'center',padding:'2px 0'}}><div className="tdot"/><div className="tdot"/><div className="tdot"/></div></div></div>}
          <div ref={endRef}/>
        </div>
        <div className="cr2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Postavi pitanje..."/>
          <button className="btn bp" onClick={()=>send()}>Pošalji</button>
        </div>
      </div>
    </div>
  );
}
export default AI;
