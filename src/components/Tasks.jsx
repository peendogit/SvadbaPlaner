// Tasks.jsx
import React, { useState } from 'react';

const TGS = [{key:'12+',l:'12+ mj. prije'},{key:'9-12',l:'9–12 mj.'},{key:'6-9',l:'6–9 mj.'},{key:'3-6',l:'3–6 mj.'},{key:'1-3',l:'1–3 mj.'},{key:'1m',l:'1 mj. prije'},{key:'1w',l:'1 sedmica'},{key:'dan',l:'Dan vjenčanja'}];
const DEFT = [
  {name:'Odaberi i rezerviši salu/restoran',category:'administracija',timeline:'12+'},{name:'Odredi datum vjenčanja',category:'administracija',timeline:'12+'},{name:'Definiši okvirni budžet',category:'administracija',timeline:'12+'},
  {name:'Angažuj fotografa/snimatelja',category:'fotografija',timeline:'9-12'},{name:'Angažuj bend ili DJ-a',category:'muzika',timeline:'9-12'},{name:'Posjeti dizajnere vjenčanica',category:'odjeća',timeline:'9-12'},
  {name:'Naruči vjenčanicu',category:'odjeća',timeline:'6-9'},{name:'Naruči odijelo za mladoženju',category:'odjeća',timeline:'6-9'},{name:'Odaberi i naruči cvijeće i dekoraciju',category:'dekoracija',timeline:'6-9'},
  {name:'Pošalji pozivnice gostima',category:'administracija',timeline:'3-6'},{name:'Naruči vjenčanu tortu',category:'hrana',timeline:'3-6'},{name:'Rezerviši smještaj za goste',category:'administracija',timeline:'3-6'},
  {name:'Finalizuj meni s restoranom',category:'hrana',timeline:'1-3'},{name:'Uradi probu frizure i šminke',category:'odjeća',timeline:'1-3'},
  {name:'Završi listu gostiju i raspored sjedenja',category:'administracija',timeline:'1m'},{name:'Pripremi kovertu za matičara',category:'administracija',timeline:'1m'},
  {name:'Pripremi muzičku listu za bend',category:'muzika',timeline:'1w'},{name:'Potvrdi sve dobavljače',category:'administracija',timeline:'1w'},
  {name:'Jutarnji ručak s najbližima',category:'hrana',timeline:'dan'},{name:'Frizerski salon i šminka',category:'odjeća',timeline:'dan'},
];

export function Tasks({ S, update, showToast }) {
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);

  const genTimeline = () => {
    if (S.tasks.length>0 && !window.confirm('Generisati? Postojeći ostaju.')) return;
    update(s => { DEFT.forEach(t => { if (!s.tasks.find(x=>x.name===t.name)) s.tasks.push({id:Date.now().toString()+Math.random(),done:false,...t,note:''}); }); });
    showToast('Timeline generisan ✓','ok');
  };

  const FILTERS = ['all','administracija','dekoracija','muzika','odjeća','hrana','fotografija'];
  const FL = {all:'Svi',administracija:'Administracija',dekoracija:'Dekoracija',muzika:'Muzika','odjeća':'Odjeća',hrana:'Hrana',fotografija:'Fotografija'};

  const tasks = S.tasks.filter(t => filter==='all'||t.category===filter);

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Zadaci</h2><p>Checklista po vremenskim grupama</p></div>
        <div className="ph-actions">
          <button className="btn bo sm" onClick={genTimeline}>↻ Timeline</button>
          <button className="btn bp" onClick={()=>setModal({id:null,name:'',category:'administracija',timeline:'3-6',note:'',done:false})}>+ Dodaj</button>
        </div>
      </div>
      <div className="chips">{FILTERS.map(f=><button key={f} className={`chip ${filter===f?'on':''}`} onClick={()=>setFilter(f)}>{FL[f]}</button>)}</div>
      <div>
        {TGS.map(g=>{
          const grp=tasks.filter(t=>t.timeline===g.key); if(!grp.length) return null;
          const done=grp.filter(t=>t.done).length;
          return <div key={g.key} className="tgr">
            <div className="tgl">{g.l} <span style={{fontSize:12,color:'var(--il)',fontFamily:'Inter'}}>{done}/{grp.length}</span></div>
            {grp.map(t=>(
              <div key={t.id} className={`task ${t.done?'done':''}`} onClick={()=>update(s=>{const x=s.tasks.find(x=>x.id===t.id);if(x)x.done=!x.done;})}>
                <div className="tcb">{t.done?'✓':''}</div>
                <div style={{flex:1}}><div className="tt">{t.name}</div><div style={{fontSize:11,color:'var(--il)',marginTop:2}}>{t.category}{t.note?' · '+t.note:''}</div></div>
                <div style={{display:'flex',gap:5}} onClick={e=>e.stopPropagation()}>
                  <button className="btn bo sm ic" onClick={()=>setModal({...t})}>✏</button>
                  <button className="btn bd sm ic" onClick={()=>update(s=>{s.tasks=s.tasks.filter(x=>x.id!==t.id);})}>✕</button>
                </div>
              </div>
            ))}
          </div>;
        })}
        {!tasks.length&&<div style={{textAlign:'center',padding:44,color:'var(--il)'}}>
          <div style={{fontSize:34,marginBottom:11}}>📋</div>
          <button className="btn bp" onClick={genTimeline}>Generiši timeline</button>
        </div>}
      </div>
      {modal&&(
        <div className="mo open" onClick={e=>{if(e.target.classList.contains('mo'))setModal(null);}}>
          <div className="modal">
            <h3>Zadatak</h3>
            <div className="fg"><label>Naziv *</label><input value={modal.name||''} onChange={e=>setModal(m=>({...m,name:e.target.value}))} placeholder="Opis zadatka"/></div>
            <div className="fr">
              <div className="fg"><label>Kategorija</label>
                <select value={modal.category||'administracija'} onChange={e=>setModal(m=>({...m,category:e.target.value}))}>
                  {['administracija','dekoracija','muzika','odjeća','hrana','fotografija','ostalo'].map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="fg"><label>Vremenski okvir</label>
                <select value={modal.timeline||'3-6'} onChange={e=>setModal(m=>({...m,timeline:e.target.value}))}>
                  {TGS.map(g=><option key={g.key} value={g.key}>{g.l}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label>Napomena</label><textarea value={modal.note||''} onChange={e=>setModal(m=>({...m,note:e.target.value}))} placeholder="Detalji..."/></div>
            <div className="mf">
              <button className="btn bo" onClick={()=>setModal(null)}>Otkaži</button>
              <button className="btn bp" onClick={()=>{
                if(!modal.name?.trim()){showToast('Unesite naziv','err');return;}
                const id=modal.id||Date.now().toString();
                update(s=>{const i=s.tasks.findIndex(x=>x.id===id);const t={...modal,id};if(i>=0)s.tasks[i]=t;else s.tasks.push(t);});
                setModal(null);showToast('Sačuvano ✓','ok');
              }}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;
