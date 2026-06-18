import { StudentRegistrationForm } from "./components/StudentRegistrationForm";
import { AdmissionsDashboard } from "./components/AdmissionsDashboard";
import { DocumentManagement } from "./components/DocumentManagement";

export default function Home() {
  return (
    <main className="container">
      <section className="card">
        <h1>School Admissions Portal</h1>
        <p>Register students, manage documents, and review admissions status.</p>
      </section>

      <section className="grid grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <StudentRegistrationForm />
        </div>
        <div className="card">
          <AdmissionsDashboard />
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <DocumentManagement />
      </section>
    </main>
  );
}
