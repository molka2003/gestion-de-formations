import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { ToastContainer, useToasts } from '../components/Toast';

const MAX_FORMATIONS = 4;
const EMPTY = { nom:'', prenom:'', email:'', tel:'', idStructure:'', idProfil:'' };

function validate(f) {
  const e = {};
  if (!f.nom.trim())    e.nom    = 'Nom obligatoire';
  if (!f.prenom.trim()) e.prenom = 'Prénom obligatoire';
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Email invalide';
  return e;
}

/* Badge quota coloré */
function QuotaBadge({ count }) {
  const cls = count >= MAX_FORMATIONS ? 'b-rose' : count >= MAX_FORMATIONS - 1 ? 'b-amber' : 'b-green';
  return <span className={`badge ${cls}`}>{count} / {MAX_FORMATIONS}</span>;
}

/* Barre de progression quota */
function QuotaBar({ count, max = MAX_FORMATIONS }) {
  const pct   = Math.min((count / max) * 100, 100);
  const color = count >= max ? '#EF4444' : count >= max - 1 ? '#F59E0B' : '#10B981';
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ height: 4, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .4s ease' }} />
      </div>
    </div>
  );
}

export default function Participants() {
  const { toasts, showToast, removeToast } = useToasts();

  const [items,      setItems]      = useState([]);
  const [structures, setStructures] = useState([]);
  const [profils,    setProfils]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [apiErr,     setApiErr]     = useState('');
  const [search,     setSearch]     = useState('');
  const [filterProf, setFilterProf] = useState('');
  const [filterQuota,setFilterQuota]= useState(''); // 'full' | 'available'

  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});

  // Modal détail formations du participant
  const [detailModal, setDetailModal] = useState(null); // { participant, formations }
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, s, pr] = await Promise.all([
        api.get('/participants'), api.get('/structures'), api.get('/profils'),
      ]);
      setItems(p.data); setStructures(s.data); setProfils(pr.data);
      setApiErr('');
    } catch {
      setApiErr('Impossible de charger les données. Vérifiez que le serveur tourne sur le port 8080.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({ nom:item.nom, prenom:item.prenom, email:item.email||'', tel:item.tel||'',
      idStructure:item.structureId||'', idProfil:item.profilId||'' });
    setErrors({}); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditItem(null); };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      nom:form.nom.trim(), prenom:form.prenom.trim(),
      email:form.email.trim()||null, tel:form.tel.trim()||null,
      structure: form.idStructure ? { id:Number(form.idStructure) } : null,
      profil:    form.idProfil    ? { id:Number(form.idProfil) }    : null,
    };
    try {
      if (editItem) await api.put(`/participants/${editItem.id}`, payload);
      else          await api.post('/participants', payload);
      await load(); closeModal();
      showToast(editItem ? 'Participant mis à jour !' : 'Participant créé avec succès !', 'success');
    } catch (err) {
      setErrors({ _global: err.response?.data || 'Erreur serveur.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce participant ?')) return;
    try { await api.delete(`/participants/${id}`); await load(); showToast('Participant supprimé.', 'success'); }
    catch { showToast('Suppression impossible. Ce participant est peut-être inscrit à des formations.', 'error'); }
  };

  const openDetail = async (p) => {
    setDetailLoading(true);
    setDetailModal({ participant: p, formations: [] });
    try {
      const res = await api.get(`/participants/${p.id}`);
      setDetailModal({ participant: p, formations: res.data.formations || [] });
    } catch {
      setDetailModal({ participant: p, formations: [] });
    } finally { setDetailLoading(false); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = `${i.nom} ${i.prenom} ${i.email||''}`.toLowerCase().includes(q);
    const matchProf   = !filterProf  || String(i.profilId) === filterProf;
    const count       = i.formationCount ?? 0;
    const matchQuota  = !filterQuota || (filterQuota==='full' ? count>=MAX_FORMATIONS : count<MAX_FORMATIONS);
    return matchSearch && matchProf && matchQuota;
  });

  const fullCount = items.filter(i => (i.formationCount??0) >= MAX_FORMATIONS).length;

  if (loading) return <div className="loading-state">Chargement des participants…</div>;

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="pg-header">
        <div>
          <h1 className="pg-title">Participants</h1>
          <p className="pg-subtitle">
            {items.length} participant(s) — limite : {MAX_FORMATIONS} formations par participant
            {fullCount > 0 && (
              <span style={{marginLeft:8,background:'#FEE2E2',color:'#EF4444',borderRadius:99,padding:'2px 8px',fontSize:11,fontWeight:700}}>
                🚫 {fullCount} à quota maximum
              </span>
            )}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {apiErr && <div className="alert alert-err">{apiErr}</div>}

      <div className="toolbar">
        <div className="search-wrap">
          <input className="search-input" placeholder="Rechercher par nom, prénom, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sel-filter" value={filterProf} onChange={e => setFilterProf(e.target.value)}>
          <option value="">Tous les profils</option>
          {profils.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
        </select>
        <select className="sel-filter" value={filterQuota} onChange={e => setFilterQuota(e.target.value)}>
          <option value="">Tous les quotas</option>
          <option value="available">Disponibles (&lt; {MAX_FORMATIONS})</option>
          <option value="full">Quota atteint ({MAX_FORMATIONS}/{MAX_FORMATIONS})</option>
        </select>
        <span className="count-chip">{filtered.length} résultat(s)</span>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>#</th><th>Participant</th><th>Email</th><th>Tél</th><th>Structure</th><th>Profil</th><th>Formations</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const count = p.formationCount ?? 0;
              const isFull = count >= MAX_FORMATIONS;
              return (
                <tr key={p.id} style={isFull ? { background:'#FFF5F5' } : undefined}>
                  <td style={{color:'var(--txt-3)'}}>{p.id}</td>
                  <td>
                    <div className="av-cell">
                      <div className="av" style={isFull ? {background:'#FCA5A5',color:'#fff'} : undefined}>{p.nom[0]}</div>
                      <div>
                        <div className="av-name">{p.nom} {p.prenom}</div>
                        <div className="av-sub">{p.tel||''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{color:'var(--txt-2)',fontSize:12}}>{p.email||'—'}</td>
                  <td style={{color:'var(--txt-2)',fontSize:12}}>{p.tel||'—'}</td>
                  <td><span className="badge b-amber">{p.structureLibelle||'—'}</span></td>
                  <td><span className="badge b-purple">{p.profilLibelle||'—'}</span></td>
                  <td>
                    <div style={{display:'flex',flexDirection:'column',gap:2,minWidth:90}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <QuotaBadge count={count} />
                        {isFull && <span style={{fontSize:10,color:'#EF4444',fontWeight:700}}>MAX</span>}
                      </div>
                      <QuotaBar count={count} />
                    </div>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:5}}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openDetail(p)} title="Voir les formations">📋</button>
                      <button className="btn btn-warn btn-sm"      onClick={() => openEdit(p)}>✏ Modifier</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(p.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length===0 && <tr className="tbl-empty"><td colSpan={8}>Aucun participant trouvé</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ── Modal Formulaire ── */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h2 className="modal-title">{editItem?'Modifier':'Ajouter'} un participant</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {errors._global && <div className="alert alert-err">{errors._global}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleChange} placeholder="Ben Amor" className={errors.nom?'err':''} autoFocus />
                  {errors.nom && <span className="err-msg">{errors.nom}</span>}
                </div>
                <div className="form-field">
                  <label>Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Ahmed" className={errors.prenom?'err':''} />
                  {errors.prenom && <span className="err-msg">{errors.prenom}</span>}
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleChange} placeholder="email@greenbuilding.tn" className={errors.email?'err':''} />
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>
                <div className="form-field">
                  <label>Téléphone</label>
                  <input name="tel" value={form.tel} onChange={handleChange} placeholder="+216 XX XXX XXX" />
                </div>
                <div className="form-field">
                  <label>Structure</label>
                  <select name="idStructure" value={form.idStructure} onChange={handleChange}>
                    <option value="">— Sélectionner —</option>
                    {structures.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Profil</label>
                  <select name="idProfil" value={form.idProfil} onChange={handleChange}>
                    <option value="">— Sélectionner —</option>
                    {profils.map(p => <option key={p.id} value={p.id}>{p.libelle}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editItem?'Enregistrer':'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Détail formations ── */}
      {detailModal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && setDetailModal(null)}>
          <div className="modal" style={{maxWidth:520}}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">
                  Formations de {detailModal.participant.nom} {detailModal.participant.prenom}
                </h2>
                <p style={{fontSize:12,color:'var(--txt-3)',marginTop:2}}>
                  Quota : {detailModal.participant.formationCount??0} / {MAX_FORMATIONS} formation(s)
                </p>
              </div>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>

            {/* Quota visuel */}
            <div style={{
              background: (detailModal.participant.formationCount??0)>=MAX_FORMATIONS ? '#FEF2F2' : '#ECFDF5',
              border:`1px solid ${(detailModal.participant.formationCount??0)>=MAX_FORMATIONS?'#FCA5A5':'#6EE7B7'}`,
              borderRadius:10, padding:'12px 16px', marginBottom:16,
              display:'flex', alignItems:'center', gap:12,
            }}>
              <span style={{fontSize:24}}>
                {(detailModal.participant.formationCount??0)>=MAX_FORMATIONS ? '🚫' : '✅'}
              </span>
              <div style={{flex:1}}>
                <p style={{
                  margin:0,fontWeight:700,fontSize:13,
                  color:(detailModal.participant.formationCount??0)>=MAX_FORMATIONS?'#B91C1C':'#065F46'
                }}>
                  {(detailModal.participant.formationCount??0)>=MAX_FORMATIONS
                    ? 'Quota maximum atteint — aucune inscription supplémentaire possible.'
                    : `Peut encore s'inscrire à ${MAX_FORMATIONS-(detailModal.participant.formationCount??0)} formation(s).`
                  }
                </p>
                <div style={{marginTop:6,height:5,background:'#E5E7EB',borderRadius:99,overflow:'hidden'}}>
                  <div style={{
                    height:'100%',borderRadius:99,transition:'width .4s',
                    width:`${Math.min(((detailModal.participant.formationCount??0)/MAX_FORMATIONS)*100,100)}%`,
                    background:(detailModal.participant.formationCount??0)>=MAX_FORMATIONS?'#EF4444':'#10B981',
                  }} />
                </div>
              </div>
            </div>

            {detailLoading
              ? <p style={{color:'var(--txt-3)',fontStyle:'italic',fontSize:13}}>Chargement…</p>
              : detailModal.formations.length === 0
                ? <p style={{color:'var(--txt-3)',fontStyle:'italic',fontSize:13}}>Aucune formation enregistrée.</p>
                : detailModal.formations.map((f, idx) => (
                  <div key={f.id||idx} style={{
                    display:'flex',alignItems:'center',gap:12,
                    padding:'10px 14px',marginBottom:6,
                    background:'var(--bg-raised)',borderRadius:'var(--radius)',
                    border:'1px solid var(--border)',
                  }}>
                    <span style={{
                      width:28,height:28,borderRadius:8,background:'var(--accent-muted)',
                      color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',
                      fontWeight:800,fontSize:12,flexShrink:0,
                    }}>{idx+1}</span>
                    <div style={{flex:1}}>
                      <p style={{margin:0,fontWeight:600,fontSize:13,color:'var(--txt-1)'}}>{f.titre}</p>
                      <p style={{margin:0,fontSize:11,color:'var(--txt-3)'}}>
                        {f.annee} · {f.duree} jour(s)
                        {f.domaine?.libelle && <span style={{marginLeft:6}} className="badge b-blue">{f.domaine.libelle}</span>}
                      </p>
                    </div>
                  </div>
                ))
            }

            <div className="form-footer" style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:8}}>
              <button className="btn btn-secondary" onClick={() => setDetailModal(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
