import React, { useState } from 'react';
const DIR=[{id:'d1',name:'Foto Studio Maja',category:'Fotografija',em:'📷',price:'800–1500 KM',rating:5,note:'Fokus na reportažnoj fotografiji'},{id:'d2',name:'Bend "Tamburasi Bosne"',category:'Muzika',em:'🎵',price:'600–1000 KM',rating:4,note:'Tradicijska i moderna muzika'},{id:'d3',name:'Cvijeće "Lala"',category:'Cvijeće',em:'🌸',price:'300–800 KM',rating:5,note:'Dekoracija sale i buketi'},{id:'d4',name:'Frizerski salon "Sanja"',category:'Frizerski',em:'💇',price:'150–300 KM',rating:4,note:'Bridal look ekspert'},{id:'d5',name:'Hotel "Central"',category:'Smještaj',em:'🏨',price:'80–150 KM/noć',rating:4,note:'Grupni popust za goste'},{id:'d6',name:'Torte "Anita"',category:'Torta',em:'🎂',price:'200–500 KM',rating:5,note:'Custom vjenčane torte'}];
const SCOL={razmatranje:'var(--go)',kontaktiran:'var(--im)',ugovoren:'var(--sd)',plaćen:'var(--sd)'};
const CATE={Fotografija:'📷',Muzika:'🎵',Cvijeće:'🌸',Frizerski:'💇',Restoran:'🏛',Prijevoz:'🚗',Torta:'🎂',Ostalo:'📦'};

export default function Vendors({ S, update, showToast }) {
  const [tab, setTab] = useState('moji');
  const [modal, setModal] = useState(null);

  const save = () => {
    if (!modal.name?.trim()) { showToast('Unesite naziv','err'); return; }
    const id = modal.id||Date.now().toString();
    update(s=>{const i=s.vendors.findIndex(x=>x.id===id);const v={...modal,id};if(i>=0)s.vendors[i]=v;else s.vendors.push(v);});
    setModal(null); showToast('Sačuvano ✓','ok');
  };

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Dobavljači</h2><p>Kontakti i status saradnje</p></div>
        <button className="btn bp" onClick={()=>setModal({id:null,name:'',category:'Fotografija',phone:'',price:'',status:'razmatranje',web:'',note:''})}>+ Dodaj</button>
      </div>
      <div className="tabs">
        <button className={`tab ${tab==='moji'?'on':''}`} onClick={()=>setTab('moji')}>Moji dobavljači</button>
        <button className={`tab ${tab==='dir'?'on':''}`} onClick={()=>setTab('dir')}>Direktorij</button>
      </div>
      {tab==='moji' ? (
        !S.vendors.length
          ? <div style={{textAlign:'center',padding:44,color:'var(--il)'}}><div style={{fontSize:34,marginBottom:10}}>🤝</div>Dodajte dobavljače ili pogledajte direktorij</div>
          : <div className="vg">{S.vendors.map(v=>(
              <div key={v.id} className="vc">
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:9}}><span style={{fontSize:25}}>{CATE[v.category]||'📦'}</span><span style={{fontSize:10,fontWeight:700,letterSpacing:'.5px',textTransform:'uppercase',color:SCOL[v.status]||'var(--im)'}}>{v.status}</span></div>
                <div style={{fontWeight:600,fontSize:14}}>{v.name}</div>
                <div style={{fontSize:11,color:'var(--il)',marginTop:2}}>{v.category}</div>
                {v.price&&<div style={{fontSize:13,color:'var(--rd)',marginTop:6,fontWeight:500}}>{v.price}</div>}
                {v.phone&&<div style={{fontSize:12,color:'var(--im)',marginTop:5}}>📞 {v.phone}</div>}
                {v.note&&<div style={{fontSize:12,color:'var(--il)',marginTop:5}}>{v.note}</div>}
                <div style={{display:'flex',gap:7,marginTop:12}}>
                  <button className="btn bo sm" onClick={()=>setModal({...v})}>✏ Uredi</button>
                  <button className="btn bd sm" onClick={()=>{if(!window.confirm('Obrisati?'))return;update(s=>{s.vendors=s.vendors.filter(x=>x.id!==v.id);});}}>✕</button>
                </div>
              </div>
            ))}</div>
      ) : (
        <div className="vg">{DIR.map(v=>(
          <div key={v.id} className="vc">
            <div style={{fontSize:26,marginBottom:9}}>{v.em}</div>
            <div style={{fontWeight:600,fontSize:14}}>{v.name}</div>
            <div style={{fontSize:11,color:'var(--il)',marginTop:2}}>{v.category}</div>
            <div style={{fontSize:13,color:'var(--rd)',marginTop:7,fontWeight:500}}>{v.price}</div>
            <div style={{color:'var(--go)',fontSize:13,marginTop:4}}>{'★'.repeat(v.rating)}{'☆'.repeat(5-v.rating)}</div>
            {v.note&&<div style={{fontSize:12,color:'var(--il)',marginTop:5}}>{v.note}</div>}
            <button className="btn bp sm" style={{marginTop:10}} onClick={()=>{update(s=>s.vendors.push({id:Date.now().toString(),name:v.name,category:v.category,price:v.price,status:'razmatranje',note:v.note,phone:'',web:''}));setTab('moji');showToast(`${v.name} dodan ✓`,'ok');}}>+ Dodaj u moje</button>
          </div>
        ))}</div>
      )}
      {modal&&(
        <div className="mo open" onClick={e=>{if(e.target.classList.contains('mo'))setModal(null);}}>
          <div className="modal">
            <h3>Dobavljač</h3>
            <div className="fr">
              <div className="fg" style={{flex:2}}><label>Naziv *</label><input value={modal.name||''} onChange={e=>setModal(m=>({...m,name:e.target.value}))} placeholder="npr. Foto studio"/></div>
              <div className="fg"><label>Kategorija</label><select value={modal.category||'Fotografija'} onChange={e=>setModal(m=>({...m,category:e.target.value}))}>{Object.keys(CATE).map(c=><option key={c} value={c}>{CATE[c]} {c}</option>)}</select></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Telefon</label><input value={modal.phone||''} onChange={e=>setModal(m=>({...m,phone:e.target.value}))} placeholder="+387..."/></div>
              <div className="fg"><label>Cijena (KM)</label><input value={modal.price||''} onChange={e=>setModal(m=>({...m,price:e.target.value}))} placeholder="npr. 800"/></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Status</label><select value={modal.status||'razmatranje'} onChange={e=>setModal(m=>({...m,status:e.target.value}))}><option value="razmatranje">U razmatranju</option><option value="kontaktiran">Kontaktiran</option><option value="ugovoren">Ugovoren ✓</option><option value="plaćen">Plaćen ✓</option></select></div>
              <div className="fg"><label>Website</label><input value={modal.web||''} onChange={e=>setModal(m=>({...m,web:e.target.value}))} placeholder="www..."/></div>
            </div>
            <div className="fg"><label>Napomena</label><textarea value={modal.note||''} onChange={e=>setModal(m=>({...m,note:e.target.value}))} placeholder="Utisci, dogovor..."/></div>
            <div className="mf"><button className="btn bo" onClick={()=>setModal(null)}>Otkaži</button><button className="btn bp" onClick={save}>Sačuvaj</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
