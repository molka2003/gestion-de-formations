import React, { useState, useCallback, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   TOAST — système de notifications non-bloquantes
   Usage :
     const { toasts, showToast } = useToasts();
     <ToastContainer toasts={toasts} />
     showToast('Participant inscrit !', 'success');
     showToast('Quota atteint.', 'error');
     showToast('Attention...', 'warning');
───────────────────────────────────────────────────────────────── */

const ICONS = {
  success : '✓',
  error   : '✕',
  warning : '⚠',
  info    : 'ℹ',
};

const COLORS = {
  success : { bg:'#ECFDF5', border:'#10B981', icon:'#059669', bar:'#059669' },
  error   : { bg:'#FEF2F2', border:'#F87171', icon:'#EF4444', bar:'#EF4444' },
  warning : { bg:'#FFFBEB', border:'#FBBF24', icon:'#D97706', bar:'#D97706' },
  info    : { bg:'#EFF6FF', border:'#60A5FA', icon:'#3B82F6', bar:'#3B82F6' },
};

const DURATION = 4000; // ms

function ToastItem({ id, message, type = 'info', onRemove }) {
  const c = COLORS[type] || COLORS.info;
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));
    const out = setTimeout(() => dismiss(), DURATION);
    return () => clearTimeout(out);
  }, []); // eslint-disable-line

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 300);
  };

  return (
    <div
      onClick={dismiss}
      style={{
        display       : 'flex',
        alignItems    : 'flex-start',
        gap           : 12,
        background    : c.bg,
        border        : `1px solid ${c.border}`,
        borderLeft    : `4px solid ${c.border}`,
        borderRadius  : 12,
        padding       : '12px 16px',
        boxShadow     : '0 4px 12px rgba(0,0,0,.1)',
        cursor        : 'pointer',
        position      : 'relative',
        overflow      : 'hidden',
        transform     : visible && !leaving ? 'translateX(0)' : 'translateX(110%)',
        opacity       : leaving ? 0 : 1,
        transition    : 'transform .3s cubic-bezier(.34,1.56,.64,1), opacity .25s ease',
        maxWidth      : 360,
        minWidth      : 260,
        userSelect    : 'none',
      }}
    >
      {/* Icon bubble */}
      <span style={{
        width:28, height:28, borderRadius:'50%',
        background: c.border, color:'#fff',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:13, fontWeight:700, flexShrink:0, marginTop:1,
      }}>
        {ICONS[type]}
      </span>

      {/* Text */}
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontSize:13.5, fontWeight:600, color:'#111827', lineHeight:1.4 }}>
          {message}
        </p>
        <p style={{ margin:'2px 0 0', fontSize:11, color:'#6B7280' }}>
          Cliquer pour fermer
        </p>
      </div>

      {/* Progress bar */}
      <span style={{
        position    : 'absolute',
        bottom      : 0, left:0,
        height      : 3,
        background  : c.bar,
        borderRadius: 2,
        animation   : `toast-bar ${DURATION}ms linear forwards`,
      }} />

      <style>{`
        @keyframes toast-bar {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
}

/* ── Container ───────────────────────────────────────────── */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position   : 'fixed',
      top        : 20,
      right      : 20,
      zIndex     : 9999,
      display    : 'flex',
      flexDirection : 'column',
      gap        : 10,
      pointerEvents : 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents:'all' }}>
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

/* ── Hook ────────────────────────────────────────────────── */
let _nextId = 1;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const ref = useRef(toasts);
  ref.current = toasts;

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = _nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  return { toasts, showToast, removeToast: remove };
}
