import React, { useState } from 'react';
const DAN_CATS = {priprema:'🪞',ceremonija:'💒',svadba:'🎊',muzika:'🎵',hrana:'🍽',foto:'📷',ostalo:'📋'};
const PROTOKOL = [{n:'1',title:'Gosti zauzimaju mjesta',note:'30 min prije ceremonije'},{n:'2',title:'Ulazak porodice mladoženje',note:''},{n:'3',title:'Ulazak porodice mlade',note:''},{n:'4',title:'Ulazak kumova',note:''},{n:'5',title:'Ulazak mladoženje s pratnjom',note:''},{n:'6',title:'Ulazak mlade s ocem',note:'Muzika: svečani marš'},{n:'7',title:'Govori matičara',note:'Trajanje: ~10 min'},{n:'8',title:'Zavjeti i izmjena prstenja',note:''},{n:'9',title:'Proglašenje supružnicima',note:''},{n:'10',title:'Prvi bračni poljubac',note:''},{n:'11',title:'Čestitke i fotografisanje',note:'~20 min'},{n:'12',title:'Izlazak mladenaca',note:'Bacanje riže/latica'}];
const EMPTY = {id:null,time:'',cat:'priprema',title:'',note:'',person:'',done:false};

export default function DanVjencanja({ S, update, showToast }) {
  const [tab, setTab] = useState('timeline');
  const [modal, setModal] = useState(null);

  const genDan = () => {
    if ((S.danItems||[]).length>0 && !window.confirm('Generisati? Postojeće ostaju.')) return;
    const def = [{time:'07:00',cat:'priprema',title:'Buđenje i doručak mladenaca',note:''},{time:'08:00',cat:'priprema',title:'Frizura i šminka mlade',note:'Frizerski salon'},{time:'09:30',cat:'priprema',title:'Oblačenje mlade',note:'Uz majku i drugarice'},{time:'10:00',cat:'foto',title:'Fotografisanje u kući mlade',note:''},{time:'10:30',cat:'priprema',title:'Dolazak mladoženje po mladu',note:''},{time:'11:00',cat:'ceremonija',title:'Odlazak na matičarski ured',note:''},{time:'11:30',cat:'ceremonija',title:'Civilna ceremonija',note:S.wedding.registrar?`Matičar: ${S.wedding.registrar}`:''},{time:'12:00',cat:'foto',title:'Fotografisanje ispred matičarskog ureda',note:''},{time:'13:00',cat:'foto',title:'Fotografisanje na lokacijama',note:''},{time:'15:00',cat:'svadba',title:'Dolazak gostiju u salu',note:S.wedding.venue||''},{time:'15:30',cat:'svadba',title:'Svečani ulazak mladenaca',note:'Prva pjesma, uvodni ples'},{time:'16:00',cat:'hrana',title:'Hladno predjelo',note:''},{time:'17:00',cat:'muzika',title:'Nastup benda / DJ',note:''},{time:'18:00',cat:'hrana',title:'Toplo jelo',note:''},{time:'19:00',cat:'svadba',title:'Govori i zdravice',note:''},{time:'20:00',cat:'svadba',title:'Rezanje vjenčane torte',note:''},{time:'21:00',cat:'muzika',title:'Nastavak žurke',note:''},{time:'00:00',cat:'hrana',title:'Ponoćni obrok',note:''}];
    update(s => {
      if (!s.danItems) s.danItems = [];
      def.forEach(d => { if (!s.danItems.find(x=>x.title===d.title)) s.danItems.push({...d,id:Date.now().toString()+Math.random(),done:false}); });
      s.danItems.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    });
    showToast('Raspored dana generisan ✓','ok');
  };

  const save = () => {
    if (!modal.title?.trim()) { showToast('Unesite opis','err'); return; }
    const id = modal.id||Date.now().toString();
    update(s => {
      if (!s.danItems) s.danItems = [];
      const i = s.danItems.findIndex(x=>x.id===id);
      const item = {...modal,id};
      if(i>=0) s.danItems[i]=item; else s.danItems.push(item);
      s.danItems.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
    });
    setModal(null); showToast('Sačuvano ✓','ok');
  };

  const items = S.danItems || [];
  const done = items.filter(d=>d.done).length;
  const contacts = [];
  if (S.wedding.phone) contacts.push({em:'💍',name:S.wedding.bride+' & '+S.wedding.groom,role:'Mladenci',phone:S.wedding.phone});
  S.vendors.filter(v=>v.phone).forEach(v=>contacts.push({em:DAN_CATS[v.category?.toLowerCase()]||'📦',name:v.name,role:v.category,phone:v.phone}));

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Dan vjenčanja 📅</h2><p>Minutni raspored, protokol i kontakti</p></div>
        <div className="ph-actions">
          <button className="btn bo sm" onClick={genDan}>↻ Generiši raspored</button>
          <button className="btn bp" onClick={()=>setModal({...EMPTY})}>+ Dodaj stavku</button>
        </div>
      </div>
      <div className="tabs">
        {[['timeline','Raspored dana'],['protokol','Protokol ceremonije'],['kontakti','Kontakti']].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?'on':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab==='timeline' && (
        !items.length
          ? <div style={{textAlign:'center',padding:44,color:'var(--il)'}}><div style={{fontSize:36,marginBottom:12}}>📅</div><p style={{marginBottom:16}}>Generišite predložak rasporeda</p><button className="btn bp" onClick={genDan}>↻ Generiši raspored</button></div>
          : <>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
                <div style={{flex:1,background:'var(--bm)',borderRadius:4,height:7,overflow:'hidden'}}><div style={{height:'100%',background:'var(--sg)',borderRadius:4,width:`${items.length?Math.round(done/items.length*100):0}%`,transition:'width .5s'}}/></div>
                <span style={{fontSize:12,color:'var(--il)'}}>{done}/{items.length} završeno</span>
              </div>
              <div className="day-wrap">
                {items.map(d=>(
                  <div key={d.id} className="tline-item">
                    <div className="tline-time"><span>{d.time||'—'}</span></div>
                    <div className="tline-dot"/>
                    <div className={`tline-card ${d.done?'done-tl':''}`} onClick={()=>update(s=>{const x=s.danItems?.find(x=>x.id===d.id);if(x)x.done=!x.done;})}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:9}}>
                        <div className="tline-cb">{d.done?'✓':''}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,color:'var(--ro)',marginBottom:3}}>{DAN_CATS[d.cat]||'📋'} {d.cat}</div>
                          <div className="tline-title">{d.title}</div>
                          {d.note&&<div className="tline-sub">{d.note}</div>}
                          {d.person&&<div style={{fontSize:11,color:'var(--sd)',marginTop:3}}>👤 {d.person}</div>}
                        </div>
                        <div onClick={e=>e.stopPropagation()} style={{display:'flex',gap:5,flexShrink:0}}>
                          <button className="btn bo sm ic" onClick={()=>setModal({...d})}>✏</button>
                          <button className="btn bd sm ic" onClick={()=>update(s=>{s.danItems=s.danItems?.filter(x=>x.id!==d.id);})}>✕</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
      )}

      {tab==='protokol' && (
        <div className="day-wrap">
          <div style={{background:'var(--b)',border:'1px solid var(--pt)',borderRadius:13,padding:18,marginBottom:18}}>
            <div style={{fontSize:12,color:'var(--im)',marginBottom:4,fontWeight:600}}>📍 Lokacija ceremonije</div>
            <div style={{fontSize:14}}>{S.wedding.ceremony||'Nije uneseno — idite na Podešavanja'}</div>
            {S.wedding.ceremonyTime&&<div style={{fontSize:12,color:'var(--ro)',marginTop:4}}>🕐 {S.wedding.ceremonyTime}h</div>}
            {S.wedding.registrar&&<div style={{fontSize:12,color:'var(--il)',marginTop:4}}>👤 Matičar: {S.wedding.registrar}</div>}
          </div>
          {PROTOKOL.map(p=>(
            <div key={p.n} className="tline-item">
              <div className="tline-time"><span style={{fontSize:14,fontWeight:700,color:'var(--ro)'}}>{p.n}.</span></div>
              <div className="tline-dot"/>
              <div className="tline-card"><div className="tline-title">{p.title}</div>{p.note&&<div className="tline-sub">{p.note}</div>}</div>
            </div>
          ))}
        </div>
      )}

      {tab==='kontakti' && (
        contacts.length
          ? <div className="contact-grid">{contacts.map((c,i)=>(
              <div key={i} className="contact-card">
                <div style={{fontSize:26,flexShrink:0}}>{c.em}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                  <div style={{fontSize:11,color:'var(--il)',marginTop:2}}>{c.role}</div>
                  <div style={{marginTop:4}}><a href={`tel:${c.phone}`} style={{fontSize:12,color:'var(--ro)',textDecoration:'none',fontWeight:500}}>📞 {c.phone}</a></div>
                </div>
              </div>
            ))}</div>
          : <div style={{textAlign:'center',padding:44,color:'var(--il)'}}><div style={{fontSize:36,marginBottom:12}}>📞</div><p>Dodajte dobavljače sa brojevima telefona ili kontakt telefon u Podešavanjima</p></div>
      )}

      {modal&&(
        <div className="mo open" onClick={e=>{if(e.target.classList.contains('mo'))setModal(null);}}>
          <div className="modal">
            <h3>{modal.id?'Uredi stavku':'Dodaj stavku'}</h3>
            <div className="fr">
              <div className="fg"><label>Sat</label><input type="time" value={modal.time||''} onChange={e=>setModal(m=>({...m,time:e.target.value}))}/></div>
              <div className="fg"><label>Kategorija</label>
                <select value={modal.cat||'priprema'} onChange={e=>setModal(m=>({...m,cat:e.target.value}))}>
                  {Object.entries(DAN_CATS).map(([k,v])=><option key={k} value={k}>{v} {k}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label>Opis *</label><input value={modal.title||''} onChange={e=>setModal(m=>({...m,title:e.target.value}))} placeholder="npr. Frizura i šminka"/></div>
            <div className="fg"><label>Detalji / napomena</label><textarea value={modal.note||''} onChange={e=>setModal(m=>({...m,note:e.target.value}))} placeholder="Ko je odgovoran, gdje..."/></div>
            <div className="fg"><label>Odgovorna osoba</label><input value={modal.person||''} onChange={e=>setModal(m=>({...m,person:e.target.value}))} placeholder="npr. Kuma Amela"/></div>
            <div className="mf"><button className="btn bo" onClick={()=>setModal(null)}>Otkaži</button><button className="btn bp" onClick={save}>Sačuvaj</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
