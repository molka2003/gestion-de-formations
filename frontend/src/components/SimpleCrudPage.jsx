import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

/**
 * Generic CRUD page for single-field entities (Domaine, Profil, Structure, Employeur).
 * Props:
 *   title, subtitle, endpoint, field, fieldLabel, placeholder, badgeClass
 */
export default function SimpleCrudPage({
  title, subtitle = '', endpoint, field = 'libelle',
  fieldLabel = 'Libellé', placeholder = '', badgeClass = 'b-teal',
}) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiErr,  setApiErr]  = useState('');
  const [search,  setSearch]  = useState('');

  const [modal,   setModal]   = useState(false);
  const [editId,  setEditId]  = useState(null);
  const [value,   setValue]   = useState('');
  const [valErr,  setValErr]  = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api.get(endpoint);
      setItems(res.data);
      setApiErr('');
    } catch {
      setApiErr('Impossible de charger les données. Vérifiez que le serveur tourne sur le port 8080.');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditId(null); setValue(''); setValErr(''); setModal(true); };
  const openEdit   = (item) => { setEditId(item.id); setValue(item[field]); setValErr(''); setModal(true); };
  const closeModal = () => { setModal(false); setEditId(null); setValue(''); setValErr(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim()) { setValErr(`${fieldLabel} est obligatoire.`); return; }
    const body = { [field]: value.trim() };
    try {
      if (editId) await api.put(`${endpoint}/${editId}`, body);
      else        await api.post(endpoint, body);
      await load();
      closeModal();
    } catch {
      setValErr('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Confirmer la suppression ?')) return;
    try { await api.delete(`${endpoint}/${id}`); await load(); }
    catch { alert('Suppression impossible (cet élément est peut-être utilisé).'); }
  };

  const filtered = items.filter(i =>
    (i[field] || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">{title}</h1>
          {subtitle && <p className="pg-subtitle">{subtitle}</p>}
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Ajouter</button>
      </div>

      {apiErr && <div className="alert alert-err">{apiErr}</div>}

      <div className="toolbar">
        <div className="search-wrap">
          <input
            className="search-input"
            placeholder={`Rechercher…`}
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="count-chip">{filtered.length} élément(s)</span>
      </div>

      {loading ? (
        <div className="loading-state">Chargement…</div>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th style={{width:60}}>#</th><th>{fieldLabel}</th><th style={{width:160}}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td style={{color:'var(--txt-3)'}}>{item.id}</td>
                  <td><span className={`badge ${badgeClass}`}>{item[field]}</span></td>
                  <td>
                    <div style={{display:'flex', gap:6}}>
                      <button className="btn btn-warn btn-sm"   onClick={() => openEdit(item)}>✏ Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>🗑 Suppr.</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="tbl-empty"><td colSpan={3}>Aucun élément trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h2 className="modal-title">{editId ? 'Modifier' : 'Ajouter'} — {title}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label>{fieldLabel} *</label>
                <input
                  autoFocus
                  value={value}
                  placeholder={placeholder}
                  onChange={e => { setValue(e.target.value); setValErr(''); }}
                  className={valErr ? 'err' : ''}
                />
                {valErr && <span className="err-msg">{valErr}</span>}
              </div>
              <div className="form-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
