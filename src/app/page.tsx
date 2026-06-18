import { AuthProvider } from "./components/AuthProvider";
import { LoginForm } from "./components/LoginForm";
import { StudentRegistrationForm } from "./components/StudentRegistrationForm";
import { AdmissionsDashboard } from "./components/AdmissionsDashboard";
import { DocumentManagement } from "./components/DocumentManagement";
import { AdminPanel } from "./components/AdminPanel";

export default function Home() {
  return (
    <AuthProvider>
      <main className="container">
        <section className="card">
          <h1>School Admissions Portal</h1>
          <p>Login as admin or staff to register students and manage admissions.</p>
        </section>

        <section className="grid grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <LoginForm />
          </div>
          <div className="card">
            <AdminPanel />
          </div>
        </section>

        <section className="card" style={{ marginTop: 24 }}>
          <StudentRegistrationForm />
        </section>

        <section className="grid grid-2" style={{ marginTop: 24 }}>
          <div className="card">
            <AdmissionsDashboard />
          </div>
          <div className="card">
            <DocumentManagement />
          </div>
        </section>
      </main>
    </AuthProvider>
  );
}
