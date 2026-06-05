import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const EMPTY = { nom:'', prenom:'', email:'', tel:'', type:'INTERNE', idEmployeur:'' };

function validate(f) {
  const e = {};
  if (!f.nom.trim())    e.nom    = 'Nom obligatoire';
  if (!f.prenom.trim()) e.prenom = 'Prénom obligatoire';
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Email invalide';
  return e;
}

export default function Formateurs() {
  const [items,     setItems]     = useState([]);
  const [employeurs,setEmployeurs]= useState([]);
  const [loading,   setLoading]   = useState(true);
  const [apiErr,    setApiErr]    = useState('');
  const [search,    setSearch]    = useState('');
  const [typeFilter,setTypeFilter]= useState('TOUS');

  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});

  const load = useCallback(async () => {
    try {
      const [f, e] = await Promise.all([api.get('/formateurs'), api.get('/employeurs')]);
      setItems(f.data); setEmployeurs(e.data); setApiErr('');
    } catch {
      setApiErr('Impossible de charger les données. Vérifiez que le serveur tourne sur le port 8080.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setErrors({}); setModal(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({ nom:item.nom, prenom:item.prenom, email:item.email||'', tel:item.tel||'',
      type:item.type, idEmployeur:item.employeur?.id||'' });
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
      nom: form.nom.trim(), prenom: form.prenom.trim(),
      email: form.email.trim() || null, tel: form.tel.trim() || null,
      type: form.type,
      employeur: form.idEmployeur ? { id: Number(form.idEmployeur) } : null,
    };
    try {
      if (editItem) await api.put(`/formateurs/${editItem.id}`, payload);
      else          await api.post('/formateurs', payload);
      await load(); closeModal();
    } catch (err) {
      setErrors({ _global: err.response?.data || 'Erreur serveur.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce formateur ?')) return;
    try { await api.delete(`/formateurs/${id}`); await load(); }
    catch { alert('Suppression impossible (ce formateur est peut-être lié à des formations).'); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = `${i.nom} ${i.prenom} ${i.email||''}`.toLowerCase().includes(q);
    const matchType   = typeFilter === 'TOUS' || i.type === typeFilter;
    return matchSearch && matchType;
  });

  if (loading) return <div className="loading-state">Chargement des formateurs…</div>;

  return (
    <div>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Formateurs</h1>
          <p className="pg-subtitle">{items.length} formateur(s) — internes et externes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {apiErr && <div className="alert alert-err">{apiErr}</div>}

      <div className="toolbar">
        <div className="search-wrap">
          <input className="search-input" placeholder="Rechercher par nom, prénom, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['TOUS','INTERNE','EXTERNE'].map(t => (
          <button key={t}
            className={`btn btn-sm ${typeFilter===t ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setTypeFilter(t)}>
            {t}
          </button>
        ))}
        <span className="count-chip">{filtered.length} résultat(s)</span>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>#</th><th>Formateur</th><th>Email</th><th>Téléphone</th><th>Type</th><th>Employeur</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id}>
                <td style={{color:'var(--txt-3)'}}>{f.id}</td>
                <td>
                  <div className="av-cell">
                    <div className="av">{f.nom[0]}</div>
                    <div className="av-name">{f.nom} {f.prenom}</div>
                  </div>
                </td>
                <td style={{color:'var(--txt-2)',fontSize:12}}>{f.email || '—'}</td>
                <td style={{color:'var(--txt-2)',fontSize:12}}>{f.tel || '—'}</td>
                <td>
                  <span className={`badge ${f.type==='INTERNE' ? 'b-teal' : 'b-purple'}`}>
                    {f.type}
                  </span>
                </td>
                <td style={{color:'var(--txt-2)'}}>{f.employeur?.nomEmployeur || '—'}</td>
                <td>
                  <div style={{display:'flex', gap:5}}>
                    <button className="btn btn-warn btn-sm"   onClick={() => openEdit(f)}>✏ Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(f.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr className="tbl-empty"><td colSpan={7}>Aucun formateur trouvé</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h2 className="modal-title">{editItem ? 'Modifier' : 'Ajouter'} un formateur</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {errors._global && <div className="alert alert-err">{errors._global}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nom *</label>
                  <input name="nom" value={form.nom} onChange={handleChange}
                    placeholder="Ben Salah" className={errors.nom?'err':''} autoFocus />
                  {errors.nom && <span className="err-msg">{errors.nom}</span>}
                </div>
                <div className="form-field">
                  <label>Prénom *</label>
                  <input name="prenom" value={form.prenom} onChange={handleChange}
                    placeholder="Karim" className={errors.prenom?'err':''} />
                  {errors.prenom && <span className="err-msg">{errors.prenom}</span>}
                </div>
                <div className="form-field">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleChange}
                    placeholder="email@exemple.tn" className={errors.email?'err':''} />
                  {errors.email && <span className="err-msg">{errors.email}</span>}
                </div>
                <div className="form-field">
                  <label>Téléphone</label>
                  <input name="tel" value={form.tel} onChange={handleChange}
                    placeholder="+216 XX XXX XXX" />
                </div>
                <div className="form-field">
                  <label>Type *</label>
                  <select name="type" value={form.type} onChange={handleChange}>
                    <option value="INTERNE">INTERNE — Green Building</option>
                    <option value="EXTERNE">EXTERNE — Autre organisme</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Employeur</label>
                  <select name="idEmployeur" value={form.idEmployeur} onChange={handleChange}>
                    <option value="">— Sélectionner —</option>
                    {employeurs.map(e => <option key={e.id} value={e.id}>{e.nomEmployeur}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
