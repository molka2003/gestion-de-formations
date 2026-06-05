import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/api';
import { ToastContainer, useToasts } from '../components/Toast';

const MAX_FORMATIONS = 4;
const EMPTY_FORM = {
  titre: '', annee: new Date().getFullYear(), duree: '',
  budget: '', idDomaine: '', idFormateur: '',
};

function validate(f) {
  const e = {};
  if (!f.titre.trim())         e.titre = 'Titre obligatoire';
  if (!f.annee)                e.annee = 'Année obligatoire';
  if (!f.duree || f.duree < 1) e.duree = 'Durée obligatoire (≥ 1 jour)';
  return e;
}

/* Barre de progression quota */
function QuotaBar({ count, max = MAX_FORMATIONS }) {
  const pct   = Math.min((count / max) * 100, 100);
  const color = count >= max ? '#EF4444' : count >= max - 1 ? '#F59E0B' : '#10B981';
  return (
    <div style={{ width: 56 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 2 }}>{count}/{max}</div>
      <div style={{ height: 5, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .4s ease' }} />
      </div>
    </div>
  );
}

/* Bannière d'erreur animée inline */
function InlineError({ message, onClose }) {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 20); return () => clearTimeout(t); }, []);
  if (!message) return null;
  return (
    <div style={{
      display:'flex', alignItems:'flex-start', gap:10,
      background:'#FEF2F2', border:'1px solid #FCA5A5', borderLeft:'4px solid #EF4444',
      borderRadius:10, padding:'10px 14px', marginBottom:14,
      transform: show ? 'translateY(0)' : 'translateY(-8px)',
      opacity: show ? 1 : 0,
      transition:'transform .25s ease, opacity .25s ease',
    }}>
      <span style={{
        width:22,height:22,borderRadius:'50%',background:'#EF4444',color:'#fff',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:11,fontWeight:800,flexShrink:0,marginTop:1,
      }}>✕</span>
      <p style={{ margin:0, fontSize:13, color:'#B91C1C', fontWeight:600, flex:1, lineHeight:1.4 }}>{message}</p>
      {onClose && (
        <button onClick={onClose} style={{
          background:'none',border:'none',cursor:'pointer',color:'#B91C1C',fontSize:16,lineHeight:1,padding:0,flexShrink:0
        }}>✕</button>
      )}
    </div>
  );
}

/* Ligne participant dans le modal */
function ParticipantRow({ participant: p, count, mode, isFlashing, isLoading, onAction }) {
  const isFull     = mode === 'full';
  const isEnrolled = mode === 'enrolled';
  return (
    <div style={{
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'9px 12px',marginBottom:6,
      background: isFlashing ? '#FEF2F2' : isFull ? '#FFF5F5' : 'var(--bg-raised)',
      borderRadius:'var(--radius)',
      border:`1px solid ${isFlashing ? '#FCA5A5' : isFull ? '#FECACA' : 'var(--border)'}`,
      opacity: isFull ? 0.75 : 1,
      transition:'background .3s, border-color .3s',
      animation: isFlashing ? 'shake .4s ease' : 'none',
    }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`}</style>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div className="av" style={{
          width:30,height:30,fontSize:12,flexShrink:0,
          background: isFull ? '#FCA5A5' : undefined,
          color: isFull ? '#fff' : undefined,
        }}>{p.nom[0]}</div>
        <div>
          <span style={{fontWeight:600,fontSize:13,color:isFull?'#9CA3AF':'var(--txt-1)'}}>{p.nom} {p.prenom}</span>
          {p.structureLibelle && <span style={{color:'var(--txt-3)',fontSize:11,marginLeft:6}}>{p.structureLibelle}</span>}
          {p.profilLibelle    && <span style={{color:'var(--txt-3)',fontSize:11,marginLeft:4}}>· {p.profilLibelle}</span>}
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        {!isEnrolled && (
          <>
            <QuotaBar count={count} />
            <span className={`badge ${isFull?'b-rose':count>=3?'b-amber':'b-green'}`}>
              {isFull ? '🚫 Complet' : `${count}/4`}
            </span>
          </>
        )}
        {isEnrolled ? (
          <button className="btn btn-danger btn-sm" onClick={onAction} disabled={isLoading} style={{minWidth:95}}>
            {isLoading ? '…' : '✕ Désinscrire'}
          </button>
        ) : isFull ? (
          <button onClick={onAction} title="Quota maximum atteint" style={{
            minWidth:95,background:'#FEE2E2',color:'#EF4444',border:'1px solid #FCA5A5',
            cursor:'pointer',borderRadius:8,padding:'5px 10px',fontSize:12,fontWeight:600,
          }}>🚫 Quota atteint</button>
        ) : (
          <button className="btn btn-primary btn-sm" onClick={onAction} disabled={isLoading} style={{minWidth:95}}>
            {isLoading ? '…' : '+ Inscrire'}
          </button>
        )}
      </div>
    </div>
  );
}

export default function Formations() {
  const { toasts, showToast, removeToast } = useToasts();

  const [items,      setItems]      = useState([]);
  const [domaines,   setDomaines]   = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [allParts,   setAllParts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [apiErr,     setApiErr]     = useState('');
  const [search,     setSearch]     = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});

  const [partModal,  setPartModal]  = useState(null);
  const [partSearch, setPartSearch] = useState('');
  const [partError,  setPartError]  = useState('');
  const [flashId,    setFlashId]    = useState(null);
  const [addingId,   setAddingId]   = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const errorRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [f, d, fo, p] = await Promise.all([
        api.get('/formations'), api.get('/domaines'),
        api.get('/formateurs'), api.get('/participants'),
      ]);
      setItems(f.data); setDomaines(d.data); setFormateurs(fo.data); setAllParts(p.data);
      setApiErr('');
    } catch {
      setApiErr('Impossible de charger les données. Vérifiez que le serveur tourne sur le port 8080.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({ titre:item.titre,annee:item.annee,duree:item.duree,budget:item.budget??'',idDomaine:item.domaine?.id??'',idFormateur:item.formateur?.id??'' });
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
      titre:form.titre.trim(), annee:Number(form.annee), duree:Number(form.duree),
      budget:form.budget!==''?Number(form.budget):null,
      domaine:   form.idDomaine   ? {id:Number(form.idDomaine)}   : null,
      formateur: form.idFormateur ? {id:Number(form.idFormateur)} : null,
    };
    try {
      if (editItem) await api.put(`/formations/${editItem.id}`, payload);
      else          await api.post('/formations', payload);
      await load(); closeModal();
      showToast(editItem ? 'Formation mise à jour !' : 'Formation créée avec succès !', 'success');
    } catch (err) {
      setErrors({ _global: err.response?.data || 'Erreur serveur.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette formation ?')) return;
    try { await api.delete(`/formations/${id}`); await load(); showToast('Formation supprimée.', 'success'); }
    catch { showToast('Suppression impossible.', 'error'); }
  };

  const openPartModal = (f) => { setPartModal(f); setPartSearch(''); setPartError(''); setFlashId(null); };
  const closePartModal = () => { setPartModal(null); setPartSearch(''); setPartError(''); };

  const refreshPartModal = async (formationId) => {
    const [fRes, pRes] = await Promise.all([api.get(`/formations/${formationId}`), api.get('/participants')]);
    setPartModal(fRes.data);
    setAllParts(pRes.data);
  };

  const addParticipant = async (formationId, participantId, participantCount) => {
    if (participantCount >= MAX_FORMATIONS) {
      setFlashId(participantId);
      setTimeout(() => setFlashId(null), 1200);
      const p    = allParts.find(x => x.id === participantId);
      const name = p ? `${p.nom} ${p.prenom}` : 'Ce participant';
      const msg  = `${name} a déjà atteint le maximum de ${MAX_FORMATIONS} formations. Inscription impossible.`;
      setPartError(msg);
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior:'smooth', block:'nearest' }), 50);
      showToast(msg, 'error');
      return;
    }
    setPartError('');
    setAddingId(participantId);
    try {
      await api.post(`/formations/${formationId}/participants/${participantId}`);
      await refreshPartModal(formationId);
      await load();
      const p    = allParts.find(x => x.id === participantId);
      const name = p ? `${p.nom} ${p.prenom}` : 'Participant';
      showToast(`${name} inscrit(e) avec succès !`, 'success');
    } catch (err) {
      const msg = err.response?.data || 'Inscription impossible.';
      setPartError(msg);
      showToast(msg, 'error');
    } finally { setAddingId(null); }
  };

  const removeParticipant = async (formationId, participantId) => {
    if (!window.confirm('Désinscrire ce participant ?')) return;
    setRemovingId(participantId);
    try {
      await api.delete(`/formations/${formationId}/participants/${participantId}`);
      await refreshPartModal(formationId);
      await load();
      showToast('Participant désinscrit.', 'info');
    } catch {
      showToast('Désinscription impossible.', 'error');
    } finally { setRemovingId(null); }
  };

  const years    = [...new Set(items.map(i => i.annee))].sort((a,b) => b - a);
  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    return (i.titre.toLowerCase().includes(q) || (i.domaine?.libelle||'').toLowerCase().includes(q) ||
      (i.formateur?`${i.formateur.nom} ${i.formateur.prenom}`:'').toLowerCase().includes(q))
      && (!yearFilter || String(i.annee) === yearFilter);
  });

  const enrolled     = partModal?.participants || [];
  const notEnrolled  = allParts.filter(p => !enrolled.some(sp => sp.id === p.id));
  const partFiltered = notEnrolled.filter(p =>
    `${p.nom} ${p.prenom} ${p.structureLibelle||''}`.toLowerCase().includes(partSearch.toLowerCase())
  );
  const partAvailable = partFiltered.filter(p => (p.formationCount??0) < MAX_FORMATIONS);
  const partFull      = partFiltered.filter(p => (p.formationCount??0) >= MAX_FORMATIONS);

  if (loading) return <div className="loading-state">Chargement des formations…</div>;

  return (
    <div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="pg-header">
        <div>
          <h1 className="pg-title">Formations</h1>
          <p className="pg-subtitle">{items.length} formation(s) — max {MAX_FORMATIONS} formations par participant</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {apiErr && <div className="alert alert-err">{apiErr}</div>}

      <div className="toolbar">
        <div className="search-wrap">
          <input className="search-input" placeholder="Rechercher par titre, domaine, formateur…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="sel-filter" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="">Toutes les années</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span className="count-chip">{filtered.length} résultat(s)</span>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>#</th><th>Titre</th><th>Domaine</th><th>Formateur</th><th>Année</th><th>Durée</th><th>Budget</th><th>Participants</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id}>
                <td style={{color:'var(--txt-3)'}}>{f.id}</td>
                <td style={{fontWeight:600,maxWidth:210,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.titre}</td>
                <td><span className="badge b-blue">{f.domaine?.libelle||'—'}</span></td>
                <td style={{color:'var(--txt-2)'}}>
                  {f.formateur
                    ? <span><strong style={{color:'var(--txt-1)'}}>{f.formateur.nom}</strong> {f.formateur.prenom}<br/>
                        <span className={`badge ${f.formateur.type==='INTERNE'?'b-teal':'b-purple'}`} style={{fontSize:10}}>{f.formateur.type}</span></span>
                    : '—'}
                </td>
                <td>{f.annee}</td>
                <td>{f.duree} j</td>
                <td style={{color:'var(--green)'}}>{f.budget!=null ? f.budget.toLocaleString('fr-TN')+' TND' : '—'}</td>
                <td>
                  <button className="btn btn-secondary btn-sm" onClick={() => openPartModal(f)}>
                    👥 {f.participants?.length||0}
                  </button>
                </td>
                <td>
                  <div style={{display:'flex',gap:5}}>
                    <button className="btn btn-warn btn-sm"   onClick={() => openEdit(f)}>✏</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr className="tbl-empty"><td colSpan={9}>Aucune formation trouvée</td></tr>}
          </tbody>
        </table>
      </div>

      {/* ── Modal Formulaire ── */}
      {modal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && closeModal()}>
          <div className="modal wide">
            <div className="modal-head">
              <h2 className="modal-title">{editItem?'Modifier':'Ajouter'} une formation</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {errors._global && <div className="alert alert-err">{errors._global}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field col-2">
                  <label>Titre *</label>
                  <input name="titre" value={form.titre} onChange={handleChange} placeholder="ex : Développement Java EE Avancé" className={errors.titre?'err':''} autoFocus />
                  {errors.titre && <span className="err-msg">{errors.titre}</span>}
                </div>
                <div className="form-field">
                  <label>Année *</label>
                  <input type="number" name="annee" value={form.annee} onChange={handleChange} min="2000" max="2100" className={errors.annee?'err':''} />
                  {errors.annee && <span className="err-msg">{errors.annee}</span>}
                </div>
                <div className="form-field">
                  <label>Durée (jours) *</label>
                  <input type="number" name="duree" value={form.duree} onChange={handleChange} min="1" placeholder="ex : 5" className={errors.duree?'err':''} />
                  {errors.duree && <span className="err-msg">{errors.duree}</span>}
                </div>
                <div className="form-field">
                  <label>Budget (TND)</label>
                  <input type="number" name="budget" value={form.budget} onChange={handleChange} min="0" step="100" placeholder="ex : 4500" />
                </div>
                <div className="form-field">
                  <label>Domaine</label>
                  <select name="idDomaine" value={form.idDomaine} onChange={handleChange}>
                    <option value="">— Sélectionner —</option>
                    {domaines.map(d => <option key={d.id} value={d.id}>{d.libelle}</option>)}
                  </select>
                </div>
                <div className="form-field col-2">
                  <label>Formateur</label>
                  <select name="idFormateur" value={form.idFormateur} onChange={handleChange}>
                    <option value="">— Sélectionner —</option>
                    {formateurs.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.nom} {f.prenom} — {f.type}{f.employeur ? ` (${f.employeur.nomEmployeur})` : ''}
                      </option>
                    ))}
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

      {/* ── Modal Participants ── */}
      {partModal && (
        <div className="modal-backdrop" onClick={e => e.target===e.currentTarget && closePartModal()}>
          <div className="modal wide" style={{maxWidth:680,maxHeight:'90vh',display:'flex',flexDirection:'column'}}>
            <div className="modal-head">
              <div>
                <h2 className="modal-title">Participants — {partModal.titre}</h2>
                <p style={{fontSize:12,color:'var(--txt-3)',marginTop:2}}>
                  {partModal.annee} · {partModal.duree} jour(s) · {enrolled.length} inscrit(s)
                </p>
              </div>
              <button className="modal-close" onClick={closePartModal}>✕</button>
            </div>

            <div style={{overflowY:'auto',flex:1,padding:'0 4px'}}>

              {/* Bannière erreur */}
              <div ref={errorRef}>
                {partError && <InlineError message={partError} onClose={() => setPartError('')} />}
              </div>

              {/* Inscrits */}
              <div style={{fontSize:11,color:'var(--txt-3)',textTransform:'uppercase',letterSpacing:'.07em',fontWeight:700,marginBottom:8}}>
                Participants inscrits ({enrolled.length})
              </div>
              {enrolled.length===0
                ? <p style={{color:'var(--txt-3)',fontStyle:'italic',fontSize:13,marginBottom:12}}>Aucun participant inscrit pour le moment.</p>
                : enrolled.map(p => (
                  <ParticipantRow key={p.id} participant={p} mode="enrolled"
                    isLoading={removingId===p.id} onAction={() => removeParticipant(partModal.id, p.id)} />
                ))
              }

              {/* Ajouter */}
              <div style={{display:'flex',alignItems:'center',gap:10,marginTop:20,marginBottom:8}}>
                <div style={{fontSize:11,color:'var(--txt-3)',textTransform:'uppercase',letterSpacing:'.07em',fontWeight:700,whiteSpace:'nowrap'}}>
                  Ajouter un participant
                </div>
                <input className="search-input" style={{flex:1,fontSize:12,padding:'6px 10px'}}
                  placeholder="Filtrer par nom, structure…"
                  value={partSearch} onChange={e => { setPartSearch(e.target.value); setPartError(''); }} />
              </div>

              {partAvailable.length===0 && partFull.length===0 && (
                <p style={{color:'var(--txt-3)',fontStyle:'italic',fontSize:13}}>Tous les participants sont déjà inscrits ou introuvables.</p>
              )}

              {partAvailable.map(p => (
                <ParticipantRow key={p.id} participant={p} count={p.formationCount??0} mode="add"
                  isFlashing={flashId===p.id} isLoading={addingId===p.id}
                  onAction={() => addParticipant(partModal.id, p.id, p.formationCount??0)} />
              ))}

              {partFull.length>0 && (
                <>
                  <div style={{display:'flex',alignItems:'center',gap:8,margin:'14px 0 8px'}}>
                    <div style={{flex:1,height:1,background:'#FCA5A5'}} />
                    <span style={{fontSize:10,fontWeight:700,color:'#EF4444',textTransform:'uppercase',letterSpacing:'.08em',whiteSpace:'nowrap'}}>
                      🚫 Quota atteint ({partFull.length})
                    </span>
                    <div style={{flex:1,height:1,background:'#FCA5A5'}} />
                  </div>
                  <p style={{fontSize:11,color:'#9CA3AF',fontStyle:'italic',marginBottom:8}}>
                    Ces participants ont déjà atteint la limite de {MAX_FORMATIONS} formations et ne peuvent plus être inscrits.
                  </p>
                  {partFull.map(p => (
                    <ParticipantRow key={p.id} participant={p} count={p.formationCount??0} mode="full"
                      isFlashing={flashId===p.id}
                      onAction={() => addParticipant(partModal.id, p.id, p.formationCount??0)} />
                  ))}
                </>
              )}
            </div>

            <div className="form-footer" style={{borderTop:'1px solid var(--border)',paddingTop:14,marginTop:8}}>
              <button className="btn btn-secondary" onClick={closePartModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
