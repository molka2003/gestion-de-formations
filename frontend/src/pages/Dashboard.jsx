import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function Dashboard({ user }) {
  const [kpis,    setKpis]    = useState({ formations:0, participants:0, formateurs:0, domaines:0, structures:0, profils:0 });
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/formations'),
      api.get('/participants'),
      api.get('/formateurs'),
      api.get('/domaines'),
      api.get('/structures'),
      api.get('/profils'),
    ])
      .then(([f, p, fo, d, s, pr]) => {
        setKpis({
          formations:  f.data.length,
          participants:p.data.length,
          formateurs:  fo.data.length,
          domaines:    d.data.length,
          structures:  s.data.length,
          profils:     pr.data.length,
        });
        setRecents([...f.data].sort((a,b) => b.annee - a.annee || b.id - a.id).slice(0, 6));
        setOffline(false);
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div>
      {/* Welcome */}
      <div style={{
        background:'linear-gradient(135deg,rgba(25,224,176,.1),rgba(85,153,255,.06))',
        border:'1px solid rgba(25,224,176,.18)', borderRadius:'var(--radius-xl)',
        padding:'26px 30px', marginBottom:24, position:'relative', overflow:'hidden',
      }}>
        <div style={{position:'absolute',right:20,top:'50%',transform:'translateY(-50%)',
          fontSize:80,opacity:.05,fontFamily:'var(--font-head)',fontWeight:800}}>GB</div>
        <p style={{fontSize:11,color:'var(--txt-3)',textTransform:'uppercase',letterSpacing:'.09em',fontWeight:600,marginBottom:6}}>
          {greet}
        </p>
        <h2 style={{fontFamily:'var(--font-head)',fontSize:24,fontWeight:800,color:'var(--txt-1)',marginBottom:4}}>
          {user.display}
        </h2>
        <p style={{color:'var(--txt-2)',fontSize:13}}>
          Plateforme de gestion des formations — Centre Excellent Training · Green Building
        </p>
        <span style={{marginTop:10,display:'inline-block'}} className={`badge ${
          user.role==='ADMIN' ? 'b-rose' : user.role==='RESPONSABLE' ? 'b-purple' : 'b-teal'
        }`}>{user.role}</span>
      </div>

      {/* Server offline warning */}
      {offline && !loading && (
        <div className="alert alert-err" style={{marginBottom:20}}>
          ⚠️ <strong>Serveur inaccessible</strong> — Vérifiez que Spring Boot tourne sur&nbsp;
          <code>localhost:8080</code> et que la configuration CORS est correcte.
        </div>
      )}

      {/* KPIs */}
      {loading ? (
        <div className="loading-state">Chargement du tableau de bord…</div>
      ) : (
        <>
          <div className="kpi-grid">
            <div className="kpi-card c-teal">
              <span className="kpi-icon">◈</span>
              <span className="kpi-val">{kpis.formations}</span>
              <span className="kpi-label">Formations</span>
            </div>
            <div className="kpi-card c-blue">
              <span className="kpi-icon">◉</span>
              <span className="kpi-val">{kpis.participants}</span>
              <span className="kpi-label">Participants</span>
            </div>
            <div className="kpi-card c-purple">
              <span className="kpi-icon">◆</span>
              <span className="kpi-val">{kpis.formateurs}</span>
              <span className="kpi-label">Formateurs</span>
            </div>
            <div className="kpi-card c-amber">
              <span className="kpi-icon">◐</span>
              <span className="kpi-val">{kpis.domaines}</span>
              <span className="kpi-label">Domaines</span>
            </div>
            <div className="kpi-card c-rose">
              <span className="kpi-icon">◴</span>
              <span className="kpi-val">{kpis.structures}</span>
              <span className="kpi-label">Structures</span>
            </div>
            <div className="kpi-card c-teal">
              <span className="kpi-icon">◳</span>
              <span className="kpi-val">{kpis.profils}</span>
              <span className="kpi-label">Profils</span>
            </div>
          </div>

          {/* Recent formations */}
          <div className="card">
            <p className="card-title">Formations récentes</p>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr><th>Titre</th><th>Domaine</th><th>Formateur</th><th>Année</th><th>Budget</th></tr>
                </thead>
                <tbody>
                  {recents.map(f => (
                    <tr key={f.id}>
                      <td style={{fontWeight:500}}>{f.titre}</td>
                      <td><span className="badge b-blue">{f.domaine?.libelle || '—'}</span></td>
                      <td style={{color:'var(--txt-2)'}}>
                        {f.formateur ? `${f.formateur.nom} ${f.formateur.prenom}` : '—'}
                      </td>
                      <td>{f.annee}</td>
                      <td style={{color:'var(--green)'}}>
                        {f.budget ? f.budget.toLocaleString('fr-TN') + ' TND' : '—'}
                      </td>
                    </tr>
                  ))}
                  {recents.length === 0 && (
                    <tr className="tbl-empty"><td colSpan={5}>Aucune formation</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
