import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { paths } from "./paths";
import { RegisterPage } from "../pages/Register/Register";
import LoginPage from "../pages/Login/Login";
import ClientLoginPage from "../pages/ClientLogin/ClientLogin";
import { TrialExpired } from "../pages/TrialExpired/TrialExpired";
import { ClientProfile as ClientSelfProfile } from "../pages/ClientProfile/ClientProfile";
import ProtectedRoutes from "./ProtectedRoutes";
import AdminRoutes from "./AdminRoutes";
import { DashboardLayout } from "../components/layout/DashboardLayout/DashboardLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { ClientList } from "../pages/Clients/ClientList";
import { ClientForm } from "../pages/Clients/ClientForm";
import { ClientProfile } from "../pages/Clients/ClientProfile";
import { Agenda } from "../pages/Agenda/Agenda";
import { DietCalculator } from "../pages/Diet/DietCalculator";
import { DietList } from "../pages/Diet/DietList";
import { DietDetail } from "../pages/Diet/DietDetail";
import { ImportTacoFoods } from "../pages/Admin/ImportTacoFoods";
import { AppointmentRequests } from "../pages/Admin/AppointmentRequests";
import { Financeiro } from "../pages/Financeiro/Financeiro";
import { RequestAppointment } from "../pages/Appointments/RequestAppointment";
import { MyAppointments } from "../pages/Appointments/MyAppointments";
import { MyDiets } from "../pages/Diet/MyDiets";
import { MyDietDetail } from "../pages/Diet/MyDietDetail";
import { RequestSubstitution } from "../pages/Diet/RequestSubstitution";
import { MySubstitutions } from "../pages/Diet/MySubstitutions";
import { FoodManagement } from "../pages/Food/FoodManagement";

export default function AppRoutes() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={paths.login} replace />} />
        <Route path={paths.login} element={<LoginPage />} />
        <Route path={paths.clientLogin} element={<ClientLoginPage />} />
        <Route path={paths.register} element={<RegisterPage />} />
        <Route path={paths.trialExpired} element={<TrialExpired />} />

        {/* Rotas protegidas com DashboardLayout */}
        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        {/* Rotas apenas para Admin */}
        <Route
          path={paths.clientes}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <ClientList />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.clientesNew}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <ClientForm />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.clientesProfile}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <ClientProfile />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.agenda}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <Agenda />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.calculadora}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <DietCalculator />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.dietas}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <DietList />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.dietaDetail}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <DietDetail />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        {/* Rotas apenas para Admin */}
        <Route
          path={paths.financeiro}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <Financeiro />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.importTaco}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <ImportTacoFoods />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        <Route
          path={paths.appointmentRequests}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <AppointmentRequests />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        {/* Rotas para Clientes (role user) */}
        <Route
          path={paths.solicitarConsulta}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <RequestAppointment />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.minhasConsultas}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <MyAppointments />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.minhasDietas}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <MyDiets />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.minhaDietaDetail}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <MyDietDetail />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.solicitarSubstituicao}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <RequestSubstitution />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        <Route
          path={paths.minhasSubstituicoes}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <MySubstitutions />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
        {/* Rotas apenas para Admin */}
        <Route
          path={paths.foodManagement}
          element={
            <AdminRoutes>
              <DashboardLayout>
                <FoodManagement />
              </DashboardLayout>
            </AdminRoutes>
          }
        />
        {/* Rota para perfil do cliente */}
        <Route
          path={paths.clientePerfil}
          element={
            <ProtectedRoutes>
              <DashboardLayout>
                <ClientSelfProfile />
              </DashboardLayout>
            </ProtectedRoutes>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
