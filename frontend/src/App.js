import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Building2, Eye, EyeOff } from 'lucide-react';
import './App.css';

// Pages
import Dashboard    from './pages/Dashboard';
import Formations   from './pages/Formations';
import Participants from './pages/Participants';
import Formateurs   from './pages/Formateurs';
import Statistiques from './pages/Statistiques';
import Domaines     from './pages/Domaines';
import Profils      from './pages/Profils';
import Structures   from './pages/Structures';
import Employeurs   from './pages/Employeurs';
import Utilisateurs from './pages/Utilisateurs';

/* ── Role-based navigation config ──────────────────────── */
const SECTIONS = [
  {
    label: 'Général',
    items: [
      { path: '/',             label: 'Tableau de bord', icon: '⬡', roles: ['ADMIN','RESPONSABLE','UTILISATEUR'] },
      { path: '/statistiques', label: 'Statistiques',    icon: '◑', roles: ['ADMIN','RESPONSABLE'] },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { path: '/formations',   label: 'Formations',   icon: '◈', roles: ['ADMIN','UTILISATEUR'] },
      { path: '/participants', label: 'Participants',  icon: '◉', roles: ['ADMIN','UTILISATEUR'] },
      { path: '/formateurs',   label: 'Formateurs',   icon: '◆', roles: ['ADMIN','UTILISATEUR'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/utilisateurs', label: 'Utilisateurs', icon: '◎', roles: ['ADMIN'] },
      { path: '/domaines',     label: 'Domaines',     icon: '◐', roles: ['ADMIN'] },
      { path: '/profils',      label: 'Profils',      icon: '◳', roles: ['ADMIN'] },
      { path: '/structures',   label: 'Structures',   icon: '◴', roles: ['ADMIN'] },
      { path: '/employeurs',   label: 'Employeurs',   icon: '◷', roles: ['ADMIN'] },
    ],
  },
];

/* ════════════════════════════════════════════════════════
   UTILITAIRES — Validation du mot de passe
════════════════════════════════════════════════════════ */
function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' };

  let score = 0;
  if (pwd.length >= 12)                   score++;
  if (/[a-z]/.test(pwd))                  score++;
  if (/[A-Z]/.test(pwd))                  score++;
  if (/\d/.test(pwd))                     score++;
  if (/[@#$%^&*!?\-_+=]/.test(pwd))      score++;

  const levels = [
    { label: '',         color: '' },          // 0
    { label: 'Très faible', color: '#e53e3e' },  // 1
    { label: 'Faible',      color: '#ed8936' },  // 2
    { label: 'Moyen',       color: '#ecc94b' },  // 3
    { label: 'Fort',        color: '#48bb78' },  // 4
    { label: 'Très fort',   color: '#38a169' },  // 5
  ];
  return { score, ...levels[score] };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ════════════════════════════════════════════════════════
   LOGIN PAGE — connexion par email + mot de passe
════════════════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const pwdStrength = getPasswordStrength(password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation côté client
    if (!validateEmail(email)) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (password.length < 12) {
      setError('Le mot de passe doit contenir au moins 12 caractères.');
      return;
    }

    setLoading(true);
    try {
      // ✅ Appel au backend — vérification réelle en base de données
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (res.ok) {
        const userData = await res.json();
        onLogin(userData);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Identifiants incorrects.');
      }
    } catch {
      setError('Impossible de contacter le serveur. Vérifiez que le back-end est démarré.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="login-wrap">
        <div className="login-box">
          <div className="login-logo">
            <Building2 size={32} strokeWidth={1.8} />
          </div>
          <h1 className="login-title">Green Building</h1>
          <p className="login-sub">Centre de formation — An Excellent Training</p>

          <form onSubmit={submit}>
            {error && <div className="login-err">{error}</div>}

            {/* ── Email ── */}
            <label className="f-label">Adresse e-mail</label>
            <input
                type="email"
                className={`f-input ${error ? 'is-error' : ''}`}
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="exemple@greenbuilding.tn"
                autoFocus
                autoComplete="email"
                required
            />

            {/* ── Mot de passe + afficher/masquer ── */}
            <label className="f-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                  type={showPwd ? 'text' : 'password'}
                  className={`f-input ${error ? 'is-error' : ''}`}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '2.5rem' }}
                  required
              />
              <button
                  type="button"
                  onClick={() => setShowPwd(p => !p)}
                  style={{
                    position: 'absolute', right: '0.6rem', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: '#6b7280', padding: '0.2rem'
                  }}
                  tabIndex={-1}
                  title={showPwd ? 'Masquer' : 'Afficher'}
              >
                {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>

            {/* ── Indicateur de force du mot de passe ── */}
            {password.length > 0 && (
                <div style={{ marginTop: '0.4rem', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                    {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i <= pwdStrength.score ? pwdStrength.color : '#e2e8f0',
                          transition: 'background 0.3s'
                        }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: pwdStrength.color, fontWeight: 600 }}>
                {pwdStrength.label}
              </span>
                  <span style={{ fontSize: '0.68rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
                (min. 12 car., MAJ, min, chiffre, symbole)
              </span>
                </div>
            )}

            <button
                type="submit"
                className="btn-login-submit"
                disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter →'}
            </button>
          </form>

          {/* ℹ️ Pas d'affichage des mots de passe en clair — pour les infos de démo,
            consulter le README ou demander à l'administrateur */}
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#9ca3af', marginTop: '1rem' }}>
            Pour obtenir vos identifiants, contactez l'administrateur.
          </p>
        </div>
      </div>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN APP
════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser]           = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <LoginPage onLogin={setUser} />;

  const visibleSections = SECTIONS.map(sec => ({
    ...sec,
    items: sec.items.filter(i => i.roles.includes(user.role)),
  })).filter(sec => sec.items.length > 0);

  return (
      <BrowserRouter>
        <div className={`shell ${collapsed ? 'collapsed' : ''}`}>

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <div className="sb-header">
              <div className="sb-logo">
                <Building2 size={22} strokeWidth={1.8} />
              </div>
              {!collapsed && (
                  <div className="sb-brand">
                    <span className="sb-brand-name">Green Building</span>
                  </div>
              )}
            </div>

            <nav className="sb-nav">
              {visibleSections.map(sec => (
                  <React.Fragment key={sec.label}>
                    <span className="sb-section-label">{sec.label}</span>
                    {sec.items.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                          <span className="nl-icon">{item.icon}</span>
                          {!collapsed && <span className="nl-text">{item.label}</span>}
                        </NavLink>
                    ))}
                  </React.Fragment>
              ))}
            </nav>

            <div className="sb-footer">
              <div className="sb-user">
                <div className="sb-avatar">{user.login[0].toUpperCase()}</div>
                {!collapsed && (
                    <div>
                      <span className="sb-uname">{user.display}</span>
                      <span className="sb-urole">{user.role}</span>
                    </div>
                )}
              </div>
              {!collapsed && (
                  <button className="btn-logout" onClick={() => setUser(null)}>
                    ↩ Déconnexion
                  </button>
              )}
            </div>
          </aside>

          {/* ── Main ── */}
          <div className="main-wrap">
            <header className="topbar">
              <button className="tb-toggle" onClick={() => setCollapsed(p => !p)}>
                {collapsed ? '▶' : '◀'}
              </button>
              <span className="tb-title">Gestion de Formation</span>
              <div className="tb-user">
                <div className="tb-avatar">{user.login[0].toUpperCase()}</div>
                <span>{user.display}</span>
              </div>
            </header>

            <main className="page-body">
              <Routes>
                <Route path="/"             element={<Dashboard user={user} />} />
                <Route path="/formations"   element={<Formations />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/formateurs"   element={<Formateurs />} />
                <Route path="/statistiques" element={<Statistiques />} />
                <Route path="/domaines"     element={<Domaines />} />
                <Route path="/profils"      element={<Profils />} />
                <Route path="/structures"   element={<Structures />} />
                <Route path="/employeurs"   element={<Employeurs />} />
                <Route path="/utilisateurs" element={<Utilisateurs />} />
                <Route path="*"             element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
  );
}
