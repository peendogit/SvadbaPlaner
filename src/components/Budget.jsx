import React, { useState, useEffect, useRef } from 'react';

const BCATS = [
  {key:'sala',label:'Sala i restoran',em:'🏛',pct:.45},{key:'muzika',label:'Muzika',em:'🎵',pct:.12},
  {key:'odjeća',label:'Odjeća i prstenje',em:'👗',pct:.10},{key:'fotografija',label:'Fotografija',em:'📷',pct:.08},
  {key:'dekoracija',label:'Dekoracija',em:'🌸',pct:.07},{key:'prijevoz',label:'Prijevoz',em:'🚗',pct:.03},
  {key:'smještaj',label:'Smještaj',em:'🏨',pct:.05},{key:'ostalo',label:'Ostalo',em:'📦',pct:.10},
];
const COLORS = ['#c97d6e','#8aab8e','#c9a96e','#b0a090','#e8c4bc','#d4e8d6','#eddfc0','#e8e0d8'];
const EMPTY = { name:'', amount:'', category:'sala', status:'kapara', total:'', due:'', note:'' };
const SL = {kapara:'bkap',plaćeno:'bdone',na_čekanju:'bpend'};
const SN = {kapara:'Kapara',plaćeno:'Plaćeno ✓',na_čekanju:'Na čekanju'};

export default function Budget({ S, update, showToast }) {
  const [modal, setModal] = useState(null);
  const [budgetInput, setBudgetInput] = useState(S.budget || '');
  const canvasRef = useRef(null);

  useEffect(() => { setBudgetInput(S.budget || ''); }, [S.budget]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const spent = S.expenses.reduce((a,e)=>a+e.amount, 0);
    ctx.clearRect(0,0,200,200);
    if (!spent) {
      ctx.fillStyle='#ede5df'; ctx.beginPath(); ctx.arc(100,100,80,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#9e8e82'; ctx.font='13px Inter'; ctx.textAlign='center'; ctx.fillText('Nema troškova',100,105);
      return;
    }
    const totals = BCATS.map(c=>({...c,v:S.expenses.filter(e=>e.category===c.key).reduce((a,e)=>a+e.amount,0)})).filter(c=>c.v>0);
    let angle = -Math.PI/2;
    totals.forEach((c,i)=>{
      const slice=(c.v/spent)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(100,100); ctx.arc(100,100,80,angle,angle+slice); ctx.closePath();
      ctx.fillStyle=COLORS[i%COLORS.length]; ctx.fill();
      ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke();
      angle+=slice;
    });
  }, [S.expenses]);

  const spent = S.expenses.reduce((a,e)=>a+e.amount, 0);
  const left = S.budget - spent;
  const pct = S.budget>0 ? Math.min(100,Math.round(spent/S.budget*100)) : 0;
  const f = n => n.toLocaleString('bs')+' KM';

  const totals = BCATS.map(c=>({...c,v:S.expenses.filter(e=>e.category===c.key).reduce((a,e)=>a+e.amount,0)})).filter(c=>c.v>0);
  const warns = BCATS.filter(c=>{ const cs=S.expenses.filter(e=>e.category===c.key).reduce((a,e)=>a+e.amount,0); const sg=Math.round(S.budget*c.pct); return sg>0&&cs>sg; });
  const today = new Date(); today.setHours(0,0,0,0);
  const unpaid = S.expenses.filter(e=>e.status==='kapara'||e.status==='na_čekanju');

  const open = (id=null) => {
    if (id) { const e=S.expenses.find(x=>x.id===id); setModal({...e}); }
    else setModal({...EMPTY,id:null});
  };
  const save = () => {
    const nm=modal.name?.trim(); const amt=parseFloat(modal.amount)||0;
    if(!nm||!amt){showToast('Unesite opis i iznos','err');return;}
    const id=modal.id||Date.now().toString();
    const exp={...modal,id,amount:amt,total:parseFloat(modal.total)||0,date:modal.date||new Date().toISOString().split('T')[0]};
    update(s=>{const i=s.expenses.findIndex(x=>x.id===id);if(i>=0)s.expenses[i]=exp;else s.expenses.push(exp);});
    setModal(null); showToast('Trošak sačuvan ✓','ok');
  };
  const del=(id)=>{if(!window.confirm('Obrisati?'))return;update(s=>{s.expenses=s.expenses.filter(x=>x.id!==id);});};

  const exportBudget=()=>{
    const rows=S.expenses.map(e=>[e.name,e.category,e.amount,e.status,e.date||''].join(','));
    const csv=['Opis,Kategorija,Iznos,Status,Datum',...rows].join('\n');
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);a.download='budzet.csv';a.click();
  };

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Budžet</h2><p>Troškovi i finansijsko planiranje</p></div>
        <div className="ph-actions">
          <button className="btn bo sm" onClick={exportBudget}>↓ Export</button>
          <button className="btn bp" onClick={()=>open()}>+ Dodaj trošak</button>
        </div>
      </div>

      <div className="card" style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:11,color:'var(--il)',marginBottom:3,fontWeight:600,letterSpacing:'.5px',textTransform:'uppercase'}}>Ukupni budžet</div>
            <div style={{display:'flex',alignItems:'baseline',gap:7}}>
              <input type="number" value={budgetInput} onChange={e=>{setBudgetInput(e.target.value);update(s=>{s.budget=parseFloat(e.target.value)||0;});}}
                style={{fontFamily:'Cormorant Garamond,serif',fontSize:28,fontWeight:600,border:'none',outline:'none',background:'transparent',color:'var(--ink)',width:175}} placeholder="0"/>
              <span style={{fontSize:16,color:'var(--il)'}}>KM</span>
            </div>
          </div>
          <div style={{textAlign:'right'}}><div style={{fontSize:11,color:'var(--il)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'}}>Potrošeno</div><div style={{fontFamily:'Cormorant Garamond,serif',fontSize:25,fontWeight:600,color:'var(--ro)'}}>{f(spent)}</div></div>
          <div style={{textAlign:'right'}}><div style={{fontSize:11,color:'var(--il)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px'}}>Ostalo</div><div style={{fontFamily:'Cormorant Garamond,serif',fontSize:25,fontWeight:600,color:'var(--sd)'}}>{f(Math.max(0,left))}</div></div>
        </div>
        <div style={{marginTop:13}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'var(--il)',marginBottom:4}}><span>0 KM</span><span>{pct}%</span><span>{f(S.budget)}</span></div>
          <div className="prog"><div className="pf" style={{width:pct+'%'}}/></div>
        </div>
      </div>

      <div className="bcg" style={{marginBottom:16}}>
        {BCATS.map(c=>{
          const cs=S.expenses.filter(e=>e.category===c.key).reduce((a,e)=>a+e.amount,0);
          const sg=Math.round(S.budget*c.pct); const cp=sg>0?Math.min(100,Math.round(cs/sg*100)):0;
          return <div key={c.key} className="bc">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}><span style={{fontWeight:500,fontSize:13}}>{c.label}</span><span style={{fontSize:20}}>{c.em}</span></div>
            <div style={{fontSize:12,color:'var(--im)'}}>Potrošeno: <strong style={{fontSize:14,color:'var(--ink)'}}>{cs.toLocaleString('bs')} KM</strong>{sg?<><br/>Predviđeno: {sg.toLocaleString('bs')} KM</>:null}</div>
            {sg?<div className="prog" style={{marginTop:7}}><div className="pf" style={{width:cp+'%',background:cs>sg?'var(--dan)':'var(--sg)'}}/></div>:null}
          </div>;
        })}
      </div>

      {/* PIE CHART */}
      <div className="card" style={{marginBottom:16}}>
        <div className="ct">Raspodjela troškova</div>
        <div style={{display:'flex',alignItems:'center',gap:28,flexWrap:'wrap'}}>
          <canvas ref={canvasRef} width={200} height={200} style={{flexShrink:0}}/>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {totals.map((c,i)=>(
              <div key={c.key} style={{display:'flex',alignItems:'center',gap:9,fontSize:12,color:'var(--im)'}}>
                <div style={{width:11,height:11,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                <span>{c.label}: <strong>{c.v.toLocaleString('bs')} KM</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WARNINGS */}
      {warns.length>0&&<div className="budget-warn" style={{marginBottom:16}}>
        {warns.map(c=>{const cs=S.expenses.filter(e=>e.category===c.key).reduce((a,e)=>a+e.amount,0);const sg=Math.round(S.budget*c.pct);return <div key={c.key} className="budget-warn-item">⚠ {c.em} {c.label}: potrošeno {cs.toLocaleString('bs')} KM od predviđenih {sg.toLocaleString('bs')} KM</div>;})}
      </div>}

      {/* UNPAID */}
      <div className="card" style={{marginBottom:16}}>
        <div className="ct">Neplaćeno / na čekanju</div>
        {unpaid.length ? unpaid.map(e=>{
          const due=e.due?new Date(e.due):null; const overdue=due&&due<today;
          const remain=e.total&&e.total>e.amount?e.total-e.amount:0;
          return <div key={e.id} className={`unpaid-item ${overdue?'overdue':''}`}>
            <div><div style={{fontSize:13,fontWeight:500}}>{e.name}</div><div style={{fontSize:11,color:'var(--il)',marginTop:2}}>{e.status}{e.due?` · Rok: ${e.due}`:''}{ overdue?' ⚠ PREKORAČENO':''}</div></div>
            <div style={{textAlign:'right'}}>
              <div style={{fontWeight:600,color:overdue?'var(--dan)':'var(--rd)',fontSize:13}}>{e.amount.toLocaleString('bs')} KM</div>
              {remain?<div style={{fontSize:11,color:'var(--il)'}}>Ostatak: {remain.toLocaleString('bs')} KM</div>:null}
            </div>
          </div>;
        }) : <div style={{color:'var(--il)',fontSize:13}}>Nema neplaćenih stavki 🎉</div>}
      </div>

      {/* ALL EXPENSES */}
      <div className="card">
        <div className="ct">Svi troškovi</div>
        <div className="tw">
          <table>
            <thead><tr><th>Opis</th><th>Kategorija</th><th>Iznos</th><th>Status</th><th>Datum</th><th></th></tr></thead>
            <tbody>
              {S.expenses.map(e=>(
                <tr key={e.id}>
                  <td><strong>{e.name}</strong>{e.note&&<div style={{fontSize:11,color:'var(--il)'}}>{e.note}</div>}</td>
                  <td>{BCATS.find(c=>c.key===e.category)?.em} {e.category}</td>
                  <td style={{fontWeight:600,color:'var(--rd)'}}>{e.amount.toLocaleString('bs')} KM{e.total?<div style={{fontSize:11,color:'var(--il)'}}>od {e.total.toLocaleString('bs')} KM</div>:null}</td>
                  <td><span className={`badge ${SL[e.status]||''}`}>{SN[e.status]||e.status}</span></td>
                  <td style={{fontSize:12}}>{e.due||e.date||''}</td>
                  <td><div style={{display:'flex',gap:5}}>
                    <button className="btn bo sm ic" onClick={()=>open(e.id)}>✏</button>
                    <button className="btn bd sm ic" onClick={()=>del(e.id)}>✕</button>
                  </div></td>
                </tr>
              ))}
              {!S.expenses.length&&<tr><td colSpan={6} style={{textAlign:'center',padding:22,color:'var(--il)'}}>Nema troškova</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="mo open" onClick={e=>{if(e.target.classList.contains('mo'))setModal(null);}}>
          <div className="modal">
            <h3>Dodaj trošak</h3>
            <div className="fr">
              <div className="fg" style={{flex:2}}><label>Opis *</label><input value={modal.name||''} onChange={e=>setModal(m=>({...m,name:e.target.value}))} placeholder="npr. Kapara za bend"/></div>
              <div className="fg"><label>Iznos (KM) *</label><input type="number" value={modal.amount||''} onChange={e=>setModal(m=>({...m,amount:e.target.value}))} placeholder="0"/></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Kategorija</label>
                <select value={modal.category||'sala'} onChange={e=>setModal(m=>({...m,category:e.target.value}))}>
                  {BCATS.map(c=><option key={c.key} value={c.key}>{c.em} {c.label}</option>)}
                </select>
              </div>
              <div className="fg"><label>Status</label>
                <select value={modal.status||'kapara'} onChange={e=>setModal(m=>({...m,status:e.target.value}))}>
                  <option value="kapara">Kapara plaćena</option><option value="plaćeno">Plaćeno ✓</option><option value="na_čekanju">Na čekanju</option>
                </select>
              </div>
            </div>
            <div className="fr">
              <div className="fg"><label>Ukupni ugovoreni iznos</label><input type="number" value={modal.total||''} onChange={e=>setModal(m=>({...m,total:e.target.value}))} placeholder="Ako je kapara..."/></div>
              <div className="fg"><label>Datum dospijeća</label><input type="date" value={modal.due||''} onChange={e=>setModal(m=>({...m,due:e.target.value}))}/></div>
            </div>
            <div className="fg"><label>Napomena</label><textarea value={modal.note||''} onChange={e=>setModal(m=>({...m,note:e.target.value}))} placeholder="Kontakt, uslovi..."/></div>
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
