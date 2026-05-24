// Zdravice.jsx
import React, { useState } from 'react';

const CATS = [
  {key:'mladi',em:'💍',name:'Za mladence'},{key:'roditelji',em:'👨‍👩‍👧',name:'Od roditelja'},
  {key:'kum',em:'🤵',name:'Od kuma'},{key:'prijatelji',em:'🫂',name:'Od prijatelja'},
  {key:'humor',em:'😂',name:'Humoristična'},{key:'kratka',em:'✨',name:'Kratka i elegantna'},
  {key:'bosanska',em:'🎶',name:'Bosanska sevdalinka stil'},{key:'duga',em:'📜',name:'Svečana i duga'},
];
const CAT_PROMPTS = {
  mladi:'za mladence na njihov vjenčani dan, dirljiva i lijepa',
  roditelji:'od roditelja mladenaca, emotivna i zahvalna',
  kum:'od kuma, svečana i s odgovornošću',
  prijatelji:'od najboljeg prijatelja/prijateljice, topla i lična',
  humor:'humoristična i smiješna ali s ukusom, bosanski humor',
  kratka:'kratka, elegantna, maksimalno 4 rečenice',
  bosanska:'u stilu bosanske sevdalinke i narodne poezije, poetična',
  duga:'svečana i duga, 8-10 rečenica',
};

export function Zdravice({ S, showToast }) {
  const [cat, setCat] = useState('mladi');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const gen = async () => {
    setLoading(true);
    const catName = CATS.find(c=>c.key===cat)?.name||cat;
    const prompt = `Napiši originalnu bosansku zdravicu ${CAT_PROMPTS[cat]||'za mladence'}. Mladenci su ${S.wedding.bride||'mlada'} i ${S.wedding.groom||'mladoženja'}${S.wedding.date?`, vjenčanje je ${new Date(S.wedding.date).toLocaleDateString('bs-BA',{day:'numeric',month:'long',year:'numeric'})}`:''}.  Zdravica treba biti na bosanskom jeziku, autentična, bez kliširanih fraza. Vrati SAMO tekst zdravice, bez naslova i bez objašnjenja.`;
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,messages:[{role:'user',content:prompt}]})});
      const d = await r.json();
      const txt = d.content?.find(c=>c.type==='text')?.text||'Greška';
      setResult({cat:catName,txt});
      setHistory(h=>[{cat:catName,txt},...h].slice(0,8));
    } catch { setResult({cat:catName,txt:'Greška u komunikaciji'}); }
    setLoading(false);
  };

  const copy = (txt) => {
    if (navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(txt).then(()=>showToast('Zdravica kopirana ✓','ok'));
    else { const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast('Zdravica kopirana ✓','ok'); }
  };

  return (
    <div className="page">
      <div className="ph"><div><h2>Zdravice 🥂</h2><p>Generiši bosansku zdravicu uz pomoć AI-ja</p></div></div>
      <div className="zdrav-grid">
        {CATS.map(c=>(
          <div key={c.key} className={`zdrav-cat ${cat===c.key?'on':''}`} onClick={()=>setCat(c.key)}>
            <div className="zdrav-cat-em">{c.em}</div>
            <div className="zdrav-cat-name">{c.name}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap'}}>
        <button className="btn bp" onClick={gen} disabled={loading}>🥂 Generiši zdravicu</button>
        {result&&<button className="btn bo" onClick={gen} disabled={loading}>↻ Još jedna</button>}
      </div>
      {loading&&<div style={{display:'flex',gap:5,alignItems:'center',padding:20}}><div className="tdot"/><div className="tdot"/><div className="tdot"/></div>}
      {result&&!loading&&(
        <div className="zdrav-card">
          <div className="zdrav-type">{result.cat}</div>
          <div className="zdrav-text">"{result.txt}"</div>
          <div style={{display:'flex',gap:9,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn bp sm" onClick={()=>copy(result.txt)}>Kopiraj</button>
            <button className="btn bo sm" onClick={gen}>↻ Još jedna</button>
          </div>
        </div>
      )}
      {history.length>1&&(
        <div style={{marginTop:22}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--il)',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:12}}>Prethodne zdravice</div>
          {history.slice(1,5).map((z,i)=>(
            <div key={i} style={{background:'rgba(255,255,255,0.85)',border:'1px solid var(--bor)',borderRadius:12,padding:14,marginBottom:9}}>
              <div style={{fontSize:10,color:'var(--ro)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.8px',marginBottom:7}}>{z.cat}</div>
              <div style={{fontSize:13,fontStyle:'italic',color:'var(--im)',lineHeight:1.55}}>"{z.txt.substring(0,180)}{z.txt.length>180?'…':''}"</div>
              <button className="btn bo sm" style={{marginTop:9}} onClick={()=>copy(z.txt)}>Kopiraj</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default Zdravice;
