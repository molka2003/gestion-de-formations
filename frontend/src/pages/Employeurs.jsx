import SimpleCrudPage from '../components/SimpleCrudPage';
export default function Employeurs() {
  return <SimpleCrudPage
    title="Employeurs"
    subtitle="Organismes employeurs des formateurs externes"
    endpoint="/employeurs"
    field="nomEmployeur"
    fieldLabel="Nom de l'employeur"
    placeholder="ex : Oracle Consulting"
    badgeClass="b-teal"
  />;
}
