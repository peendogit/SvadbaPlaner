import React, { useState, useRef, useCallback } from 'react';

const TCOLS = { '':'var(--b)', sage:'rgba(138,171,142,.22)', gold:'rgba(201,169,110,.2)', stone:'rgba(176,160,144,.2)' };
let tblCounter = 1;

export default function Seating({ S, update, showToast }) {
  const [rulesOpen, setRulesOpen] = useState(false);
  const [tblModal, setTblModal] = useState(null);
  const [rG1, setRG1] = useState('');
  const [rG2, setRG2] = useState('');
  const [rType, setRType] = useState('together');
  const ghostRef = useRef(null);
  const aDrag = useRef(null);

  // ── conflicts ──
  const getViols = useCallback(() => {
    const v = [];
    S.rules.forEach(r => {
      const g1 = S.guests.find(x => x.id === r.g1);
      const g2 = S.guests.find(x => x.id === r.g2);
      if (!g1||!g2) return;
      const t1 = S.tables.find(t => t.guests.includes(r.g1));
      const t2 = S.tables.find(t => t.guests.includes(r.g2));
      if (r.type==='apart'&&t1&&t2&&t1.id===t2.id) v.push(`⚠ ${g1.name} i ${g2.name} su za istim stolom`);
      if (r.type==='together'&&t1&&t2&&t1.id!==t2.id) v.push(`⚠ ${g1.name} i ${g2.name} su za različitim stolovima`);
    });
    return v;
  }, [S.rules, S.guests, S.tables]);

  const hasConflict = useCallback((gid) => {
    const mt = S.tables.find(t => t.guests.includes(gid));
    if (!mt) return false;
    return S.rules.some(r => {
      if (r.g1!==gid&&r.g2!==gid) return false;
      const o = r.g1===gid?r.g2:r.g1;
      const ot = S.tables.find(t => t.guests.includes(o));
      if (r.type==='apart'&&ot&&ot.id===mt.id) return true;
      if (r.type==='together'&&ot&&ot.id!==mt.id) return true;
      return false;
    });
  }, [S.tables, S.rules]);

  // ── add table ──
  const addTable = (shape) => {
    const id = 't'+Date.now();
    const sz = shape==='round' ? {w:120,h:120} : {w:155,h:90};
    update(s => s.tables.push({ id, shape, name:'Sto '+tblCounter++, capacity:shape==='round'?8:10, guests:[], x:60+Math.random()*180, y:60+Math.random()*130, w:sz.w, h:sz.h, color:'', note:'' }));
  };

  const clearCanvas = () => {
    if (!window.confirm('Resetovati?')) return;
    update(s => { s.tables=[]; s.guests.forEach(g=>g.assigned=false); });
    tblCounter = 1;
  };

  // ── auto assign ──
  const autoAssign = () => {
    const unassigned = S.guests.filter(g=>(g.rsvp==='confirmed'||g.rsvp==='pending')&&!g.assigned);
    if (!unassigned.length) { showToast('Svi gosti su raspoređeni','warn'); return; }
    if (!S.tables.length) { showToast('Dodaj stolove','err'); return; }
    let placed = 0;
    update(s => {
      unassigned.forEach(g => {
        const mustWith = s.rules.filter(r=>(r.g1===g.id||r.g2===g.id)&&r.type==='together').map(r=>r.g1===g.id?r.g2:r.g1);
        let best = null;
        for (const pid of mustWith) {
          const pt = s.tables.find(t=>t.guests.includes(pid)&&t.guests.length<t.capacity);
          if (pt) { best=pt; break; }
        }
        if (!best) best = s.tables.find(t => {
          if (t.guests.length>=t.capacity) return false;
          return !s.rules.some(r=>(r.g1===g.id||r.g2===g.id)&&r.type==='apart'&&t.guests.includes(r.g1===g.id?r.g2:r.g1));
        });
        if (!best) best = s.tables.find(t=>t.guests.length<t.capacity);
        if (best) { best.guests.push(g.id); s.guests.find(x=>x.id===g.id).assigned=true; placed++; }
      });
    });
    const vs = getViols();
    showToast(vs.length ? `Raspoređeno ${placed} gostiju. ${vs.length} konflikt(a).` : `Raspoređeno ${placed} gostiju ✓`, vs.length?'warn':'ok');
  };

  const printSeating = () => {
    const win = window.open('','_blank');
    const rows = S.tables.map(t => {
      const names = t.guests.map(gid=>S.guests.find(x=>x.id===gid)?.name||'').filter(Boolean).join(', ');
      return `<tr><td><strong>${t.name}</strong></td><td>${t.guests.length}/${t.capacity}</td><td>${names||'—'}</td></tr>`;
    }).join('');
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Raspored sjedenja</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:9px 13px;text-align:left}th{background:#f9f0ee}</style></head><body><h1>Raspored sjedenja — ${S.wedding.bride} & ${S.wedding.groom}</h1><table><thead><tr><th>Sto</th><th>Gostiju</th><th>Imena</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    win.print();
  };

  // ── table drag ──
  const startTD = (e, id) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault(); e.stopPropagation();
    const el = document.getElementById('te_'+id);
    const r = el.getBoundingClientRect();
    const cx = e.clientX ?? e.touches[0].clientX;
    const cy = e.clientY ?? e.touches[0].clientY;
    aDrag.current = { type:'t', id, ox:cx-r.left, oy:cy-r.top };
    el.style.zIndex=50; el.style.boxShadow='0 8px 32px rgba(46,38,32,.2)';
    const mv = (ev) => {
      if (!aDrag.current||aDrag.current.type!=='t') return;
      const tc = ev.touches ? ev.touches[0] : ev;
      if (ev.touches) ev.preventDefault();
      const cr = document.getElementById('TC').getBoundingClientRect();
      const t = S.tables.find(x=>x.id===aDrag.current.id); if(!t) return;
      t.x = Math.max(0,tc.clientX-cr.left-aDrag.current.ox);
      t.y = Math.max(0,tc.clientY-cr.top-aDrag.current.oy);
      const tel = document.getElementById('te_'+aDrag.current.id);
      if(tel){tel.style.left=t.x+'px';tel.style.top=t.y+'px';}
    };
    const up = () => {
      const tel = document.getElementById('te_'+aDrag.current?.id);
      if(tel){tel.style.zIndex='';tel.style.boxShadow='';}
      aDrag.current=null;
      update(s=>{}); // trigger re-render to save
      document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up);
      document.removeEventListener('touchmove',mv); document.removeEventListener('touchend',up);
    };
    document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
    document.addEventListener('touchmove',mv,{passive:false}); document.addEventListener('touchend',up);
  };

  // ── resize ──
  const startRS = (e, id) => {
    e.preventDefault(); e.stopPropagation();
    const t = S.tables.find(x=>x.id===id); if(!t) return;
    const sx = e.clientX??e.touches[0].clientX, sy = e.clientY??e.touches[0].clientY;
    const sw=t.w, sh=t.h;
    const mv = (ev) => {
      if(ev.touches)ev.preventDefault();
      const tc=ev.touches?ev.touches[0]:ev;
      t.w=Math.max(80,sw+(tc.clientX-sx)); t.h=Math.max(60,sh+(tc.clientY-sy));
      const inner=document.getElementById('te_'+id)?.querySelector('.ti');
      if(inner){inner.style.width=t.w+'px';inner.style.height=t.h+'px';}
    };
    const up=()=>{update(s=>{});document.removeEventListener('mousemove',mv);document.removeEventListener('mouseup',up);document.removeEventListener('touchmove',mv);document.removeEventListener('touchend',up);};
    document.addEventListener('mousemove',mv);document.addEventListener('mouseup',up);
    document.addEventListener('touchmove',mv,{passive:false});document.addEventListener('touchend',up);
  };

  // ── guest drag ──
  const mkGhost = (name, cx, cy) => {
    const g=document.createElement('div'); g.className='ghost'; g.textContent=name;
    g.style.left=(cx+12)+'px'; g.style.top=(cy-16)+'px';
    document.body.appendChild(g); ghostRef.current=g; return g;
  };
  const hlT=(cx,cy)=>document.querySelectorAll('.te').forEach(el=>{const r=el.getBoundingClientRect();el.style.outline=cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom?'3px solid var(--ro)':'';});
  const clHL=()=>document.querySelectorAll('.te').forEach(el=>el.style.outline='');

  const dropG = (gid, cx, cy) => {
    let dropped=false;
    document.querySelectorAll('.te').forEach(el=>{
      const r=el.getBoundingClientRect();
      if(cx>=r.left&&cx<=r.right&&cy>=r.top&&cy<=r.bottom){
        const tid=el.id.replace('te_','');
        update(s=>{
          const t=s.tables.find(x=>x.id===tid); if(!t)return;
          if(t.guests.includes(gid)){showToast('Gost je već ovdje','warn');return;}
          if(t.guests.length>=t.capacity){showToast('Sto je popunjen!','err');return;}
          const aparts=s.rules.filter(r=>(r.g1===gid||r.g2===gid)&&r.type==='apart');
          const confl=aparts.filter(r=>t.guests.includes(r.g1===gid?r.g2:r.g1));
          if(confl.length){const names=confl.map(r=>s.guests.find(x=>x.id===(r.g1===gid?r.g2:r.g1))?.name||'?');showToast(`⚠ Konflikt sa: ${names.join(', ')}. Ipak dodan.`,'warn');}
          s.tables.forEach(tbl=>tbl.guests=tbl.guests.filter(x=>x!==gid));
          t.guests.push(gid);
          const g=s.guests.find(x=>x.id===gid);if(g){g.assigned=true;showToast(`${g.name} → ${t.name} ✓`,'ok');}
        });
        dropped=true;
      }
    });
  };

  const startGD = (e, gid) => {
    const guest=S.guests.find(x=>x.id===gid); if(!guest||guest.assigned) return;
    e.preventDefault(); e.stopPropagation();
    const cx=e.clientX??e.touches[0].clientX, cy=e.clientY??e.touches[0].clientY;
    const gh=mkGhost(guest.name,cx,cy);
    const mv=(ev)=>{
      if(ev.touches)ev.preventDefault();
      const tc=ev.touches?ev.touches[0]:ev;
      gh.style.left=(tc.clientX+12)+'px'; gh.style.top=(tc.clientY-16)+'px';
      hlT(tc.clientX,tc.clientY);
    };
    const up=(ev)=>{
      gh.remove(); clHL(); ghostRef.current=null;
      const tc=ev.changedTouches?ev.changedTouches[0]:ev;
      dropG(gid,tc.clientX,tc.clientY);
      document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up);
      document.removeEventListener('touchmove',mv); document.removeEventListener('touchend',up);
    };
    document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up);
    document.addEventListener('touchmove',mv,{passive:false}); document.addEventListener('touchend',up);
  };

  const removeTable=(id)=>{
    update(s=>{const t=s.tables.find(x=>x.id===id);if(t)t.guests.forEach(gid=>{const g=s.guests.find(x=>x.id===gid);if(g)g.assigned=false;});s.tables=s.tables.filter(x=>x.id!==id);});
  };
  const rmGFromT=(tid,gid)=>{
    update(s=>{const t=s.tables.find(x=>x.id===tid);if(!t)return;t.guests=t.guests.filter(x=>x!==gid);const g=s.guests.find(x=>x.id===gid);if(g)g.assigned=false;});
  };

  // rules
  const addRule=()=>{
    if(!rG1||!rG2||rG1===rG2){showToast('Odaberi dva različita gosta','err');return;}
    if(S.rules.find(r=>(r.g1===rG1&&r.g2===rG2)||(r.g1===rG2&&r.g2===rG1))){showToast('Pravilo već postoji','warn');return;}
    update(s=>s.rules.push({id:Date.now().toString(),g1:rG1,g2:rG2,type:rType}));
    showToast('Pravilo dodano ✓','ok');
  };
  const delRule=(id)=>update(s=>{s.rules=s.rules.filter(r=>r.id!==id);});

  const viols = getViols();
  const ok = S.guests.filter(g=>g.rsvp==='confirmed'||g.rsvp==='pending');
  const assigned = S.guests.filter(g=>g.assigned).length;
  const totalSeats = S.tables.reduce((a,t)=>a+t.capacity,0);

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Raspored sjedenja</h2><p>Prevuci goste · Klikni sto za uređivanje · Vuci ugao ◢ za resize</p></div>
        <div className="ph-actions">
          <button className="btn bo sm" onClick={()=>addTable('round')}>+ Okrugli sto</button>
          <button className="btn bo sm" onClick={()=>addTable('rect')}>+ Pravougaoni</button>
          <button className="btn bp sm" onClick={autoAssign}>⚡ Auto-rasporedi</button>
          <button className="btn bo sm" onClick={()=>setRulesOpen(true)}>📋 Pravila</button>
          <button className="btn bo sm" onClick={printSeating}>🖨 Štampaj</button>
          <button className="btn bo sm" onClick={clearCanvas}>↺ Resetuj</button>
        </div>
      </div>

      {viols.length > 0 && (
        <div style={{background:'rgba(192,80,80,.08)',border:'1.5px solid var(--dan)',borderRadius:10,padding:'11px 15px',marginBottom:12}}>
          {viols.map((v,i)=><div key={i} style={{fontSize:12,color:'var(--dan)',marginBottom:3}}>{v}</div>)}
        </div>
      )}

      <div className="seat-stats">
        <div className="seat-stat"><div className="seat-stat-v">{assigned}</div><div className="seat-stat-l">Raspoređeno</div></div>
        <div className="seat-stat"><div className="seat-stat-v" style={{color:ok.length-assigned>0?'var(--dan)':'var(--sd)'}}>{ok.length-assigned}</div><div className="seat-stat-l">Neraspoređeno</div></div>
        <div className="seat-stat"><div className="seat-stat-v">{totalSeats}</div><div className="seat-stat-l">Mjesta</div></div>
        <div className="seat-stat"><div className="seat-stat-v">{S.tables.length}</div><div className="seat-stat-l">Stolova</div></div>
        {viols.length>0&&<div className="seat-stat" style={{borderColor:'var(--dan)'}}><div className="seat-stat-v" style={{color:'var(--dan)'}}>{viols.length}</div><div className="seat-stat-l">Konflikata</div></div>}
      </div>

      <div className="slay">
        <div className="sp">
          <div style={{fontSize:11,fontWeight:600,color:'var(--il)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.8px'}}>Neraspoređeni</div>
          {ok.filter(g=>!g.assigned).map(g=>(
            <div key={g.id} className={`dg ${hasConflict(g.id)?'conflict':''}`}
              onMouseDown={e=>startGD(e,g.id)} onTouchStart={e=>startGD(e,g.id)}>
              <span>{g.rsvp==='confirmed'?'✅':'⏳'}</span><span>{g.name}</span>
              {hasConflict(g.id)&&<span style={{color:'var(--dan)',marginLeft:'auto',fontSize:12}}>⚠</span>}
            </div>
          ))}
          {!ok.filter(g=>!g.assigned).length && <div style={{fontSize:12,color:'var(--il)',padding:6}}>Svi raspoređeni ✓</div>}
        </div>

        <div className="sc" id="sCanvas">
          <div className="cdots"/>
          <div id="TC">
            {S.tables.map(t=>{
              const f=t.guests.length;
              const cls=f>=t.capacity?'full':f===0?'empty':'';
              const sh=t.shape==='round'?'t-r':'t-q';
              const bg=TCOLS[t.color||'']||'var(--b)';
              return (
                <div key={t.id} className={`te ${cls}`} id={`te_${t.id}`}
                  style={{left:t.x,top:t.y}}
                  onMouseDown={e=>startTD(e,t.id)} onTouchStart={e=>startTD(e,t.id)}>
                  <button className="tdel" onMouseDown={e=>e.stopPropagation()} onClick={()=>removeTable(t.id)}>×</button>
                  <div className="tres" onMouseDown={e=>startRS(e,t.id)} onTouchStart={e=>startRS(e,t.id)}/>
                  <div className={`ti ${sh}`} style={{width:t.w,height:t.h,background:bg}}
                    onClick={e=>{e.stopPropagation();setTblModal({...t});}}>
                    <div className="tn2">{t.name}</div>
                    <div className="tc3">{f}<span style={{fontSize:11,color:'var(--il)'}}>/{t.capacity}</span></div>
                    {t.note&&<div style={{fontSize:8,color:'var(--il)',textAlign:'center',padding:'0 4px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:t.w-8}}>{t.note}</div>}
                  </div>
                  <div style={{textAlign:'center',padding:'2px 4px'}}>
                    {t.guests.map(gid=>{const g=S.guests.find(x=>x.id===gid);return g?<span key={gid} style={{fontSize:9,color:'var(--im)',display:'inline-block',margin:'1px 2px'}}>{g.name.split(' ')[0]}</span>:null})}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{marginTop:12,display:'flex',gap:16,fontSize:12,color:'var(--il)'}}>
        <span style={{color:'var(--sd)'}}>● Slobodni</span>
        <span style={{color:'var(--ro)'}}>● Popunjeni</span>
        <span style={{color:'var(--il)'}}>● Djelimično</span>
        <span style={{color:'var(--dan)'}}>⚠ Konflikt</span>
      </div>

      {/* TABLE MODAL */}
      {tblModal && (
        <div className="mo open" onClick={e=>{if(e.target.classList.contains('mo'))setTblModal(null);}}>
          <div className="modal">
            <h3>Uredi sto</h3>
            <div className="fr">
              <div className="fg"><label>Naziv stola</label><input value={tblModal.name||''} onChange={e=>setTblModal(m=>({...m,name:e.target.value}))}/></div>
              <div className="fg"><label>Broj mjesta</label><input type="number" value={tblModal.capacity||8} onChange={e=>setTblModal(m=>({...m,capacity:parseInt(e.target.value)||8}))} min={2} max={30}/></div>
            </div>
            <div className="fr">
              <div className="fg"><label>Oblik</label>
                <select value={tblModal.shape||'round'} onChange={e=>setTblModal(m=>({...m,shape:e.target.value}))}>
                  <option value="round">Okrugli</option><option value="rect">Pravougaoni</option>
                </select>
              </div>
              <div className="fg"><label>Boja</label>
                <select value={tblModal.color||''} onChange={e=>setTblModal(m=>({...m,color:e.target.value}))}>
                  <option value="">Zadana</option><option value="sage">Zelena</option><option value="gold">Zlatna</option><option value="stone">Siva</option>
                </select>
              </div>
            </div>
            <div className="fg"><label>Napomena</label><input value={tblModal.note||''} onChange={e=>setTblModal(m=>({...m,note:e.target.value}))} placeholder="npr. Kumovi, Mladoženjina strana..."/></div>
            <div style={{marginTop:12,padding:12,background:'var(--b)',borderRadius:10,fontSize:12,color:'var(--im)'}}>
              <strong>Gosti za ovim stolom:</strong>
              <div style={{marginTop:7,display:'flex',flexWrap:'wrap',gap:5}}>
                {(tblModal.guests || []).map(gid => {
                  const g = S.guests.find(x => x.id === gid);
                  if (!g) return null;
                  const removeG = () => {
                    rmGFromT(tblModal.id, gid);
                    setTblModal(m => ({ ...m, guests: m.guests.filter(x => x !== gid) }));
                  };
                  return (
                    <span key={gid} style={{background:'var(--b)',padding:'3px 9px',borderRadius:20,fontSize:12,display:'inline-flex',alignItems:'center',gap:5}}>
                      {g.name}
                      <span onClick={removeG} style={{cursor:'pointer',color:'var(--dan)',fontWeight:700}}>x</span>
                    </span>
                  );
                })}
                {!tblModal.guests?.length&&<span style={{color:'var(--il)'}}>Nema gostiju</span>}
              </div>
            </div>
            <div className="mf">
              <button className="btn bd sm" onClick={()=>{removeTable(tblModal.id);setTblModal(null);}}>Obriši sto</button>
              <button className="btn bo" onClick={()=>setTblModal(null)}>Otkaži</button>
              <button className="btn bp" onClick={()=>{
                const nc=tblModal.capacity;
                if(nc<(tblModal.guests?.length||0)){showToast('Smanji goste prije nego smanjiš kapacitet','warn');return;}
                update(s=>{const t=s.tables.find(x=>x.id===tblModal.id);if(t)Object.assign(t,{name:tblModal.name,capacity:nc,shape:tblModal.shape,color:tblModal.color,note:tblModal.note});});
                setTblModal(null);showToast('Sto sačuvan ✓','ok');
              }}>Sačuvaj</button>
            </div>
          </div>
        </div>
      )}

      {/* RULES MODAL */}
      {rulesOpen && (
        <div className="mo open" onClick={e=>{if(e.target.classList.contains('mo'))setRulesOpen(false);}}>
          <div className="modal wide">
            <h3>📋 Pravila rasporeda sjedenja</h3>
            <p style={{fontSize:13,color:'var(--il)',marginBottom:16}}>Ko mora biti zajedno ili ne smije biti za istim stolom.</p>
            <div className="fr" style={{alignItems:'flex-end',marginBottom:16}}>
              <div className="fg"><label>Gost 1</label>
                <select value={rG1} onChange={e=>setRG1(e.target.value)}>
                  <option value="">— Odaberi —</option>
                  {S.guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div className="fg"><label>Pravilo</label>
                <select value={rType} onChange={e=>setRType(e.target.value)}>
                  <option value="together">🤝 Mora zajedno</option>
                  <option value="apart">🚫 Ne smije zajedno</option>
                </select>
              </div>
              <div className="fg"><label>Gost 2</label>
                <select value={rG2} onChange={e=>setRG2(e.target.value)}>
                  <option value="">— Odaberi —</option>
                  {S.guests.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{paddingBottom:12}}><button className="btn bp" onClick={addRule}>+ Dodaj</button></div>
            </div>
            {S.rules.map(r=>{
              const g1=S.guests.find(x=>x.id===r.g1);const g2=S.guests.find(x=>x.id===r.g2);if(!g1||!g2)return null;
              return <div key={r.id} className={`rule-item ${r.type==='together'?'rt':'ra'}`}>
                <span style={{fontSize:18}}>{r.type==='together'?'🤝':'🚫'}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{g1.name} & {g2.name}</div>
                  <div style={{fontSize:11,marginTop:2,color:r.type==='together'?'var(--sd)':'var(--dan)'}}>{r.type==='together'?'Mora zajedno sjediti':'Ne smije zajedno sjediti'}</div>
                </div>
                <button className="btn bd sm ic" onClick={()=>delRule(r.id)}>✕</button>
              </div>;
            })}
            {!S.rules.length&&<div style={{textAlign:'center',padding:22,color:'var(--il)',fontSize:13}}>Nema pravila.</div>}
            <div className="mf"><button className="btn bo" onClick={()=>setRulesOpen(false)}>Zatvori</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
