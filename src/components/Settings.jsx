import React, { useState, useEffect } from 'react';

export default function Settings({ S, update, showToast, navTo }) {
  const [form, setForm] = useState({...S.wedding, budget: S.budget||''});
  useEffect(()=>{ setForm({...S.wedding, budget:S.budget||''}); }, [S.wedding, S.budget]);
  const f = (k) => (e) => setForm(x=>({...x,[k]:e.target.value}));

  const save = () => {
    update(s => {
      Object.assign(s.wedding, form);
      s.wedding.bride = form.bride||'Mlada';
      s.wedding.groom = form.groom||'Mladoženja';
      if (form.budget) s.budget = parseFloat(form.budget)||0;
    });
    showToast('Sve podešavanja sačuvana ✓','ok');
    navTo('dashboard');
  };

  return (
    <div className="page">
      <div className="ph">
        <div><h2>Podešavanja</h2><p>Generalije vašeg vjenčanja</p></div>
      </div>
      <div className="sett-grid">
        <div className="sett-sec"><h3>👫 Par</h3>
          <div className="fg"><label>Ime mlade</label><input value={form.bride||''} onChange={f('bride')} placeholder="Amra"/></div>
          <div className="fg"><label>Ime mladoženje</label><input value={form.groom||''} onChange={f('groom')} placeholder="Haris"/></div>
          <div className="fg"><label>Zajedničko prezime</label><input value={form.surname||''} onChange={f('surname')} placeholder="npr. Hodžić"/></div>
        </div>
        <div className="sett-sec"><h3>📅 Datum i lokacija</h3>
          <div className="fg"><label>Datum vjenčanja</label><input type="date" value={form.date||''} onChange={f('date')}/></div>
          <div className="fg"><label>Sat početka</label><input type="time" value={form.time||''} onChange={f('time')}/></div>
          <div className="fg"><label>Naziv sale / restorana</label><input value={form.venue||''} onChange={f('venue')} placeholder="Restoran Stari Grad"/></div>
          <div className="fg"><label>Grad</label><input value={form.city||''} onChange={f('city')} placeholder="Sarajevo"/></div>
        </div>
        <div className="sett-sec"><h3>💌 Matičar / Ceremonija</h3>
          <div className="fg"><label>Ime matičara</label><input value={form.registrar||''} onChange={f('registrar')} placeholder="npr. Suad Begić"/></div>
          <div className="fg"><label>Lokacija ceremonije</label><input value={form.ceremony||''} onChange={f('ceremony')} placeholder="Matičarski ured"/></div>
          <div className="fg"><label>Sat ceremonije</label><input type="time" value={form.ceremonyTime||''} onChange={f('ceremonyTime')}/></div>
        </div>
        <div className="sett-sec"><h3>📞 Kontakti</h3>
          <div className="fg"><label>Kontakt telefon</label><input type="tel" value={form.phone||''} onChange={f('phone')} placeholder="+387 61 ..."/></div>
          <div className="fg"><label>Email</label><input type="email" value={form.email||''} onChange={f('email')} placeholder="svadba@email.com"/></div>
          <div className="fg"><label>Website</label><input value={form.web||''} onChange={f('web')} placeholder="www.amraiharis.ba"/></div>
        </div>
        <div className="sett-sec full"><h3>💰 Budžet i planiranje</h3>
          <div className="fr">
            <div className="fg"><label>Ukupni budžet (KM)</label><input type="number" value={form.budget||''} onChange={f('budget')} placeholder="0"/></div>
            <div className="fg"><label>Planirani broj gostiju</label><input type="number" value={form.guestsPlanned||''} onChange={f('guestsPlanned')} placeholder="100"/></div>
            <div className="fg"><label>Cijena po gostu (KM)</label><input type="number" value={form.pricePerGuest||''} onChange={f('pricePerGuest')} placeholder="0"/></div>
          </div>
        </div>
        <div className="sett-sec full"><h3>📝 Napomene</h3>
          <div className="fg"><label>Opšte napomene</label><textarea value={form.notes||''} onChange={f('notes')} placeholder="Sve ostalo što želite zapamtiti..." style={{minHeight:90}}/></div>
        </div>
      </div>
      <div style={{marginTop:24,display:'flex',justifyContent:'flex-end'}}>
        <button className="btn bp" style={{padding:'12px 32px',fontSize:15}} onClick={save}>Sačuvaj sve</button>
      </div>
    </div>
  );
}
      <div className="sett-grid">
        <div className="sett-sec"><h3>👫 Par</h3>
          <div className="fg"><label>Ime mlade</label><input value={form.bride||''} onChange={f('bride')} placeholder="Amra"/></div>
          <div className="fg"><label>Ime mladoženje</label><input value={form.groom||''} onChange={f('groom')} placeholder="Haris"/></div>
          <div className="fg"><label>Zajedničko prezime</label><input value={form.surname||''} onChange={f('surname')} placeholder="npr. Hodžić"/></div>
        </div>
        <div className="sett-sec"><h3>📅 Datum i lokacija</h3>
          <div className="fg"><label>Datum vjenčanja</label><input type="date" value={form.date||''} onChange={f('date')}/></div>
          <div className="fg"><label>Sat početka</label><input type="time" value={form.time||''} onChange={f('time')}/></div>
          <div className="fg"><label>Naziv sale / restorana</label><input value={form.venue||''} onChange={f('venue')} placeholder="Restoran Stari Grad"/></div>
          <div className="fg"><label>Grad</label><input value={form.city||''} onChange={f('city')} placeholder="Sarajevo"/></div>
        </div>
        <div className="sett-sec"><h3>💌 Matičar / Ceremonija</h3>
          <div className="fg"><label>Ime matičara</label><input value={form.registrar||''} onChange={f('registrar')} placeholder="npr. Suad Begić"/></div>
          <div className="fg"><label>Lokacija ceremonije</label><input value={form.ceremony||''} onChange={f('ceremony')} placeholder="Matičarski ured"/></div>
          <div className="fg"><label>Sat ceremonije</label><input type="time" value={form.ceremonyTime||''} onChange={f('ceremonyTime')}/></div>
        </div>
        <div className="sett-sec"><h3>📞 Kontakti</h3>
          <div className="fg"><label>Kontakt telefon</label><input type="tel" value={form.phone||''} onChange={f('phone')} placeholder="+387 61 ..."/></div>
          <div className="fg"><label>Email</label><input type="email" value={form.email||''} onChange={f('email')} placeholder="svadba@email.com"/></div>
          <div className="fg"><label>Website</label><input value={form.web||''} onChange={f('web')} placeholder="www.amraiharis.ba"/></div>
        </div>
        <div className="sett-sec full"><h3>💰 Budžet i planiranje</h3>
          <div className="fr">
            <div className="fg"><label>Ukupni budžet (KM)</label><input type="number" value={form.budget||''} onChange={f('budget')} placeholder="0"/></div>
            <div className="fg"><label>Planirani broj gostiju</label><input type="number" value={form.guestsPlanned||''} onChange={f('guestsPlanned')} placeholder="100"/></div>
            <div className="fg"><label>Cijena po gostu (KM)</label><input type="number" value={form.pricePerGuest||''} onChange={f('pricePerGuest')} placeholder="0"/></div>
          </div>
        </div>
        <div className="sett-sec full"><h3>📝 Napomene</h3>
          <div className="fg"><label>Opšte napomene</label><textarea value={form.notes||''} onChange={f('notes')} placeholder="Sve ostalo što želite zapamtiti..." style={{minHeight:90}}/></div>
        </div>
      </div>
    </div>
  );
}
