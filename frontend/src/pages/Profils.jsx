import SimpleCrudPage from '../components/SimpleCrudPage';
export default function Profils() {
  return <SimpleCrudPage
    title="Profils professionnels"
    subtitle="Profils des participants : informaticien Bac+5, gestionnaire…"
    endpoint="/profils"
    field="libelle"
    fieldLabel="Libellé"
    placeholder="ex : Informaticien Bac+5"
    badgeClass="b-purple"
  />;
}
