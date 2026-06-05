import SimpleCrudPage from '../components/SimpleCrudPage';
export default function Structures() {
  return <SimpleCrudPage
    title="Structures"
    subtitle="Directions centrales et directions régionales"
    endpoint="/structures"
    field="libelle"
    fieldLabel="Libellé"
    placeholder="ex : Direction Régionale Tunis"
    badgeClass="b-amber"
  />;
}
