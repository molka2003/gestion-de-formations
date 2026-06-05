// ── Domaines.jsx ────────────────────────────────────────────
import SimpleCrudPage from '../components/SimpleCrudPage';
export default function Domaines() {
  return <SimpleCrudPage
    title="Domaines de formation"
    subtitle="Domaines thématiques : informatique, finance, management…"
    endpoint="/domaines"
    field="libelle"
    fieldLabel="Libellé"
    placeholder="ex : Informatique & Numérique"
    badgeClass="b-blue"
  />;
}
