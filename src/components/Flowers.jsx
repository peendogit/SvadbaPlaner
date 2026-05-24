import React, { useEffect, useRef } from 'react';

const EMOJIS = ['🌸','🌺','🌼','🌹','🌷','🏵️','💐','✿','❀','🌻','🍀','🌿'];

export default function Flowers() {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    function spawn() {
      const el = document.createElement('div');
      el.className = 'flower';
      el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      const size = 18 + Math.random() * 22;
      const dur  = 12 + Math.random() * 18;
      const left = Math.random() * 100;
      const delay = Math.random() * -20;
      el.style.cssText = `
        font-size:${size}px;
        left:${left}%;
        animation-duration:${dur}s;
        animation-delay:${delay}s;
        opacity:0.55;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), (dur + Math.abs(delay)) * 1000 + 1000);
    }

    // initial batch
    for (let i = 0; i < 18; i++) spawn();
    const iv = setInterval(spawn, 1800);
    return () => clearInterval(iv);
  }, []);

  return <div className="flower-canvas" ref={ref} />;
}
