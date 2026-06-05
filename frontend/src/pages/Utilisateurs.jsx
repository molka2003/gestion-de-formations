import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

const EMPTY = { login:'', password:'', idRole:'' };

function validate(f, isEdit) {
  const e = {};
  if (!f.login.trim())              e.login    = 'Login obligatoire';
  if (!isEdit && !f.password.trim()) e.password = 'Mot de passe obligatoire';
  if (!isEdit && f.password.length < 8) e.password = 'Minimum 8 caractères';
  if (!f.idRole)                    e.idRole   = 'Rôle obligatoire';
  return e;
}

export default function Utilisateurs() {
  const [items,   setItems]   = useState([]);
  const [roles,   setRoles]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiErr,  setApiErr]  = useState('');
  const [search,  setSearch]  = useState('');

  const [modal,    setModal]    = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [errors,   setErrors]   = useState({});
  const [showPwd,  setShowPwd]  = useState(false);

  const load = useCallback(async () => {
    try {
      const [u, r] = await Promise.all([api.get('/utilisateurs'), api.get('/roles')]);
      setItems(u.data); setRoles(r.data); setApiErr('');
    } catch {
      setApiErr('Impossible de charger les utilisateurs. Vérifiez que le serveur tourne sur le port 8080.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setErrors({}); setShowPwd(false); setModal(true); };
  const openEdit   = (item) => {
    setEditItem(item);
    setForm({ login:item.login, password:'', idRole:item.role?.id||'' });
    setErrors({}); setShowPwd(false); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditItem(null); };

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, !!editItem);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      login: form.login.trim(),
      ...(form.password ? { password: form.password } : {}),
      role: { id: Number(form.idRole) },
    };
    try {
      if (editItem) await api.put(`/utilisateurs/${editItem.id}`, payload);
      else          await api.post('/utilisateurs', payload);
      await load(); closeModal();
    } catch (err) {
      const msg = err.response?.data;
      if (typeof msg === 'string' && msg.includes('login')) {
        setErrors({ login: 'Ce login est déjà utilisé.' });
      } else {
        setErrors({ _global: msg || 'Erreur serveur.' });
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    try { await api.delete(`/utilisateurs/${id}`); await load(); }
    catch { alert('Suppression impossible.'); }
  };

  const roleColors = { ADMIN:'b-rose', RESPONSABLE:'b-purple', UTILISATEUR:'b-teal' };

  const filtered = items.filter(i =>
    `${i.login} ${i.role?.nom||''}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-state">Chargement des utilisateurs…</div>;

  return (
    <div>
      <div className="pg-header">
        <div>
          <h1 className="pg-title">Utilisateurs</h1>
          <p className="pg-subtitle">{items.length} compte(s) — accès réservé à l'administrateur</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Créer un compte</button>
      </div>

      {apiErr && <div className="alert alert-err">{apiErr}</div>}

      <div className="toolbar">
        <div className="search-wrap">
          <input className="search-input" placeholder="Rechercher par login ou rôle…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span className="count-chip">{filtered.length} compte(s)</span>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr><th>#</th><th>Identifiant</th><th>Rôle</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{color:'var(--txt-3)'}}>{u.id}</td>
                <td>
                  <div className="av-cell">
                    <div className="av">{u.login[0].toUpperCase()}</div>
                    <span style={{fontWeight:600}}>{u.login}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${roleColors[u.role?.nom] || 'b-sky'}`}>
                    {u.role?.nom || '—'}
                  </span>
                </td>
                <td>
                  <div style={{display:'flex',gap:5}}>
                    <button className="btn btn-warn btn-sm"   onClick={() => openEdit(u)}>✏ Modifier</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr className="tbl-empty"><td colSpan={4}>Aucun utilisateur trouvé</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <h2 className="modal-title">{editItem ? 'Modifier' : 'Créer'} un compte</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            {errors._global && <div className="alert alert-err">{errors._global}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-field col-2">
                  <label>Identifiant (login) *</label>
                  <input name="login" value={form.login} onChange={handleChange}
                    placeholder="ex : jdupont" className={errors.login?'err':''} autoFocus />
                  {errors.login && <span className="err-msg">{errors.login}</span>}
                </div>
                <div className="form-field col-2">
                  <label>{editItem ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *'}</label>
                  <div style={{position:'relative'}}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      name="password" value={form.password} onChange={handleChange}
                      placeholder="Minimum 8 caractères"
                      className={errors.password?'err':''}
                      style={{width:'100%',paddingRight:44}}
                    />
                    <button type="button" onClick={() => setShowPwd(p=>!p)}
                      style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
                        background:'none',border:'none',color:'var(--txt-3)',cursor:'pointer',fontSize:16}}>
                      {showPwd ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.password && <span className="err-msg">{errors.password}</span>}
                </div>
                <div className="form-field col-2">
                  <label>Rôle *</label>
                  <select name="idRole" value={form.idRole} onChange={handleChange}
                    className={errors.idRole?'err':''}>
                    <option value="">— Sélectionner un rôle —</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                  </select>
                  {errors.idRole && <span className="err-msg">{errors.idRole}</span>}
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
