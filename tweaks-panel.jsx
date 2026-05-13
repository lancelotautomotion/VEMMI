// Tweaks panel — React component loaded via Babel standalone
// Provides: useTweaks, TweaksPanel, TweakSection, TweakRadio

function useTweaks(defaults) {
  const [state, setState] = React.useState(() => {
    try {
      const saved = localStorage.getItem('vemmi-tweaks');
      return saved ? { ...defaults, ...JSON.parse(saved) } : { ...defaults };
    } catch { return { ...defaults }; }
  });

  function setTweak(key, value) {
    setState(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem('vemmi-tweaks', JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return [state, setTweak];
}

function TweaksPanel({ title, children }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos]   = React.useState({ x: 16, y: 88 });
  const dragging = React.useRef(false);

  function onMouseDown(e) {
    if (e.target.tagName === 'BUTTON') return;
    const ox = e.clientX - pos.x, oy = e.clientY - pos.y;
    dragging.current = true;
    function onMove(ev) {
      if (!dragging.current) return;
      setPos({ x: ev.clientX - ox, y: ev.clientY - oy });
    }
    function onUp() {
      dragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const panel = {
    position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
    width: 272, fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
    fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,.22)',
    borderRadius: 10, overflow: 'hidden',
  };
  const header = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(24,36,18,0.97)', backdropFilter: 'blur(12px)',
    color: '#F4F2EC', padding: '9px 14px', cursor: 'grab',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5,
    letterSpacing: '0.15em', userSelect: 'none',
  };
  const body = {
    background: 'rgba(244,242,236,0.98)', backdropFilter: 'blur(12px)',
    padding: '10px 14px 14px', display: open ? 'block' : 'none',
    maxHeight: '72vh', overflowY: 'auto',
  };

  return (
    <div style={panel}>
      <div style={header} onMouseDown={onMouseDown}>
        <span>⚙ {title.toUpperCase()}</span>
        <button
          onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', color: '#8DBF3F', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}
          title={open ? 'Fermer' : 'Ouvrir'}
        >{open ? '−' : '+'}</button>
      </div>
      <div style={body}>{children}</div>
    </div>
  );
}

function TweakSection({ label }) {
  return (
    <div style={{
      fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'rgba(30,42,24,0.4)', margin: '14px 0 6px',
      paddingBottom: 5, borderBottom: '1px solid rgba(30,42,24,0.1)',
    }}>{label}</div>
  );
}

function TweakRadio({ label, value, options, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginBottom: 6,
        fontSize: 12, color: 'rgba(30,42,24,0.72)',
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#8DBF3F' }}>{value}</span>
      </div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: '5px 11px', borderRadius: 5, fontSize: 12, cursor: 'pointer',
            fontWeight: opt.value === value ? 600 : 400,
            color: 'rgba(30,42,24,0.85)',
            background: opt.value === value ? 'rgba(141,191,63,0.15)' : 'transparent',
            border: '1px solid ' + (opt.value === value ? 'rgba(141,191,63,0.7)' : 'rgba(30,42,24,0.16)'),
            transition: 'all .15s',
          }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}
