import React, { useState, useEffect } from 'react';
import api from '../api/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#19e0b0','#5599ff','#b085f5','#f5a623','#f56565','#48bb78','#38bdf8','#f97316'];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border-md)',
      borderRadius:8, padding:'10px 14px', boxShadow:'0 8px 32px rgba(0,0,0,.5)',
    }}>
      {label && <p style={{fontSize:12,color:'var(--txt-3)',marginBottom:6}}>{label}</p>}
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color||'var(--txt-1)',fontSize:14,fontWeight:600}}>
          {p.name} : <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function Statistiques() {
  const [formData,  setFormData]  = useState([]);
  const [partData,  setPartData]  = useState([]);
  const [profilData,setProfilData]= useState([]);
  const [domData,   setDomData]   = useState([]);
  const [totalParticipantsDistinct, setTotalParticipantsDistinct] = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [apiErr,    setApiErr]    = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/statistiques/formations-par-annee'),
      api.get('/statistiques/participants-par-annee'),
      api.get('/statistiques/repartition-profil'),
      api.get('/formations'),
      api.get('/statistiques/total-participants')
    ]).then(([fa, pa, pr, fo, tp]) => {
      setFormData(Object.entries(fa.data).map(([a,c]) => ({ annee:a, Formations:c })));
      setPartData(Object.entries(pa.data).map(([a,c]) => ({ annee:a, Participants:c })));
      setProfilData(Object.entries(pr.data).map(([n,v]) => ({ name:n, value:v })));
      setTotalParticipantsDistinct(tp.data);

      const byDom = {};
      (fo.data||[]).forEach(f => {
        const d = f.domaine?.libelle || 'Sans domaine';
        byDom[d] = (byDom[d]||0)+1;
      });
      setDomData(Object.entries(byDom).map(([n,v])=>({name:n, Formations:v})).sort((a,b)=>b.Formations-a.Formations));
      setApiErr('');
    }).catch(() => {
      setApiErr('Impossible de charger les statistiques. Vérifiez que le serveur tourne sur le port 8080.');
    }).finally(() => setLoading(false));
  }, []);

  const totalF = formData.reduce((s,d)=>s+d.Formations,0);
  const cy     = String(new Date().getFullYear());
  const fyThis = formData.find(d=>d.annee===cy)?.Formations||0;

  if (loading) return <div className="loading-state">Chargement des statistiques…</div>;

  return (
    <div>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Statistiques</h1>
          <p className="pg-subtitle">Tableau de bord analytique — Centre Excellent Training</p>
        </div>
      </div>

      {apiErr && <div className="alert alert-err">{apiErr}</div>}

      {/* KPIs */}
      <div className="kpi-grid" style={{marginBottom:24}}>
        <div className="kpi-card c-teal">
          <span className="kpi-icon">◈</span>
          <span className="kpi-val">{totalF}</span>
          <span className="kpi-label">Formations totales</span>
        </div>
        <div className="kpi-card c-blue">
          <span className="kpi-icon">👥</span>
          <span className="kpi-val">{totalParticipantsDistinct}</span>
          <span className="kpi-label">Participants distincts</span>
        </div>
        <div className="kpi-card c-purple">
          <span className="kpi-icon">◑</span>
          <span className="kpi-val">{fyThis}</span>
          <span className="kpi-label">Formations {cy}</span>
        </div>
        <div className="kpi-card c-amber">
          <span className="kpi-icon">◎</span>
          <span className="kpi-val">{profilData.length}</span>
          <span className="kpi-label">Profils distincts</span>
        </div>
      </div>

      {/* Charts row 1 */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16}}>
        <div className="card">
          <p className="card-title">Évolution des formations par année</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={formData}>
              <defs>
                <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#19e0b0" stopOpacity={0.28}/>
                  <stop offset="95%" stopColor="#19e0b0" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="annee" tick={{fill:'var(--txt-3)',fontSize:12}} axisLine={false} />
              <YAxis allowDecimals={false} tick={{fill:'var(--txt-3)',fontSize:12}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="Formations" stroke="#19e0b0" strokeWidth={2.5}
                fill="url(#gF)" dot={{r:4,fill:'#19e0b0',strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="card-title">Inscriptions par année</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={partData}>
              <defs>
                <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#5599ff" stopOpacity={0.28}/>
                  <stop offset="95%" stopColor="#5599ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="annee" tick={{fill:'var(--txt-3)',fontSize:12}} axisLine={false} />
              <YAxis allowDecimals={false} tick={{fill:'var(--txt-3)',fontSize:12}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="Participants" stroke="#5599ff" strokeWidth={2.5}
                fill="url(#gP)" dot={{r:4,fill:'#5599ff',strokeWidth:0}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16}}>
        <div className="card">
          <p className="card-title">Répartition par profil</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={profilData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={90} innerRadius={44}
                paddingAngle={3}
                label={({name,percent})=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}
                labelLine={{stroke:'var(--txt-3)',strokeWidth:1}}>
                {profilData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip content={<Tip/>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="card-title">Formations par domaine</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={domData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false}/>
              <XAxis type="number" allowDecimals={false} tick={{fill:'var(--txt-3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="name" width={150} tick={{fill:'var(--txt-3)',fontSize:11}} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="Formations" radius={[0,4,4,0]}>
                {domData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Profil detail table */}
      <div className="card">
        <p className="card-title">Détail des inscriptions par profil</p>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Profil</th><th>Inscriptions</th><th>Répartition</th></tr></thead>
            <tbody>
              {[...profilData].sort((a,b)=>b.value-a.value).map((p,i)=>{
                const total = profilData.reduce((s,x)=>s+x.value,0);
                const pct   = total ? ((p.value/total)*100).toFixed(1) : 0;
                return (
                  <tr key={i}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],flexShrink:0}}/>
                        {p.name}
                      </div>
                    </td>
                    <td style={{fontWeight:700,color:COLORS[i%COLORS.length]}}>{p.value}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{flex:1,height:6,background:'var(--bg-raised)',borderRadius:3,overflow:'hidden'}}>
                          <div style={{width:`${pct}%`,height:'100%',background:COLORS[i%COLORS.length],borderRadius:3,transition:'width .4s'}}/>
                        </div>
                        <span style={{fontSize:12,color:'var(--txt-2)',minWidth:36}}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}