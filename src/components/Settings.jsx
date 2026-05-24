import React, { useState, useEffect } from 'react';

export default function Settings({ S, update, showToast, navTo }) {
  const [form, setForm] = useState({ ...S.wedding, budget: S.budget || '' });

  useEffect(() => {
    setForm({ ...S.wedding, budget: S.budget || '' });
  }, [S.wedding, S.budget]);

  const set = (k) => (e) => setForm(x => ({ ...x, [k]: e.target.value }));

  const save = () => {
    update(s => {
      Object.assign(s.wedding, form);
      s.wedding.bride = form.bride || 'Mlada';
      s.wedding.groom = form.groom || 'Mladoženja';
      if (form.budget) s.budget = parseFloat(form.budget) || 0;
    });
    showToast('Sve podešavanja sačuvana ✓', 'ok');
    navTo('dashboard');
  };

  return (
    <div className="page">
      <div className="ph">
        <div>
          <h2>Podešavanja</h2>
          <p>Generalije vašeg vjenčanja</p>
        </div>
      </div>

      <div className="sett-grid">

        <div className="sett-sec">
          <h3>👫 Par</h3>
          <div className="fg"><label>Ime mlade</label><input value={form.bride || ''} onChange={set('bride')}  /></div>
          <div className="fg"><label>Ime mladoženje</label><input value={form.groom || ''} onChange={set('groom')}  /></div>
          <div className="fg"><label>Zajedničko prezime</label><input value={form.surname || ''} onChange={set('surname')}  /></div>
        </div>

        <div className="sett-sec">
          <h3>📅 Datum i lokacija</h3>
          <div className="fg"><label>Datum vjenčanja</label><input type="date" value={form.date || ''} onChange={set('date')} /></div>
          <div className="fg"><label>Sat početka</label><input type="time" value={form.time || ''} onChange={set('time')} /></div>
          <div className="fg"><label>Naziv sale / restorana</label><input value={form.venue || ''} onChange={set('venue')}  /></div>
          <div className="fg"><label>Grad</label><input value={form.city || ''} onChange={set('city')}  /></div>
        </div>

        <div className="sett-sec">
          <h3>💌 Matičar / Ceremonija</h3>
          <div className="fg"><label>Ime matičara</label><input value={form.registrar || ''} onChange={set('registrar')}  /></div>
          <div className="fg"><label>Lokacija ceremonije</label><input value={form.ceremony || ''} onChange={set('ceremony')}  /></div>
          <div className="fg"><label>Sat ceremonije</label><input type="time" value={form.ceremonyTime || ''} onChange={set('ceremonyTime')} /></div>
        </div>

        <div className="sett-sec">
          <h3>📞 Kontakti</h3>
          <div className="fg"><label>Kontakt telefon</label><input type="tel" value={form.phone || ''} onChange={set('phone')}  /></div>
          <div className="fg"><label>Email</label><input type="email" value={form.email || ''} onChange={set('email')}  /></div>
          <div className="fg"><label>Website</label><input value={form.web || ''} onChange={set('web')}  /></div>
        </div>

        <div className="sett-sec full">
          <h3>💰 Budžet i planiranje</h3>
          <div className="fr">
            <div className="fg"><label>Ukupni budžet (KM)</label><input type="number" value={form.budget || ''} onChange={set('budget')} placeholder="0" /></div>
            <div className="fg"><label>Planirani broj gostiju</label><input type="number" value={form.guestsPlanned || ''} onChange={set('guestsPlanned')} placeholder="100" /></div>
            <div className="fg"><label>Cijena po gostu (KM)</label><input type="number" value={form.pricePerGuest || ''} onChange={set('pricePerGuest')} placeholder="0" /></div>
          </div>
        </div>

        <div className="sett-sec full">
          <h3>📝 Napomene</h3>
          <div className="fg">
            <label>Opšte napomene</label>
            <textarea value={form.notes || ''} onChange={set('notes')} placeholder="Sve ostalo što želite zapamtiti..." style={{ minHeight: 90 }} />
          </div>
        </div>

      </div>

      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn bp" style={{ padding: '12px 32px', fontSize: 15 }} onClick={save}>
          Sačuvaj sve
        </button>
      </div>

    </div>
  );
}
