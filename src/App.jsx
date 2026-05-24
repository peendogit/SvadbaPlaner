import React, { useState, useEffect, useCallback, useRef } from 'react';
import Flowers from './components/Flowers';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './components/Dashboard';
import Guests from './components/Guests';
import Seating from './components/Seating';
import Budget from './components/Budget';
import Tasks from './components/Tasks';
import Vendors from './components/Vendors';
import AI from './components/AI';
import DanVjencanja from './components/DanVjencanja';
import Zdravice from './components/Zdravice';
import Settings from './components/Settings';

const INITIAL = {
  wedding: { bride:'Amra', groom:'Haris', date:'', surname:'', time:'', venue:'', city:'', registrar:'', ceremony:'', ceremonyTime:'', phone:'', email:'', web:'', guestsPlanned:0, pricePerGuest:0, notes:'' },
  guests: [], expenses: [], tasks: [], vendors: [], tables: [], rules: [], danItems: [], budget: 0,
};

function load() {
  try { const s = localStorage.getItem('svadba5'); return s ? { ...INITIAL, ...JSON.parse(s) } : INITIAL; }
  catch { return INITIAL; }
}

export default function App() {
  const [S, setS] = useState(load);
  const [page, setPage] = useState('dashboard');
  const [sbOpen, setSbOpen] = useState(false);
  const [toast, setToast] = useState({ msg:'', type:'', show:false });
  const toastTimer = useRef(null);
  const rippleRef = useRef(null);

  // persist
  useEffect(() => { try { localStorage.setItem('svadba5', JSON.stringify(S)); } catch {} }, [S]);

  const showToast = useCallback((msg, type='') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, type, show: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3200);
  }, []);

  const update = useCallback((fn) => setS(prev => { const next = { ...prev }; fn(next); return next; }), []);

  const navTo = (id) => { setPage(id); setSbOpen(false); };

  // ripple on mousemove
  useEffect(() => {
    let last = 0;
    const handler = (e) => {
      const now = Date.now();
      if (now - last < 120) return;
      last = now;
      if (!rippleRef.current) return;
      const r = document.createElement('div');
      r.className = 'ripple';
      const size = 60 + Math.random() * 40;
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - size/2}px;top:${e.clientY - size/2}px;`;
      rippleRef.current.appendChild(r);
      setTimeout(() => r.remove(), 1300);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const pages = { dashboard: Dashboard, guests: Guests, seating: Seating, budget: Budget, tasks: Tasks, vendors: Vendors, ai: AI, dan: DanVjencanja, zdravice: Zdravice, settings: Settings };
  const PageComp = pages[page] || Dashboard;

  return (
    <>
      <Flowers />
      <div className="ripple-container" ref={rippleRef} />

      {/* TOPBAR mobile */}
      <div className="topbar">
        <button className={`hb ${sbOpen ? 'open' : ''}`} onClick={() => setSbOpen(o => !o)}>
          <span/><span/><span/>
        </button>
        <div className="topbar-logo">Svadba<em>.ba</em></div>
      </div>

      <div className="app-shell">
        <Sidebar S={S} page={page} navTo={navTo} sbOpen={sbOpen} />
        <div className={`ov ${sbOpen ? 'vis' : ''}`} onClick={() => setSbOpen(false)} />
        <main className="main">
          <PageComp S={S} update={update} showToast={showToast} />
        </main>
      </div>

      <Toast msg={toast.msg} type={toast.type} show={toast.show} />
    </>
  );
}
