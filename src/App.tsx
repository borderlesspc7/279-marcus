import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ToastContainer } from "./components/ui/Toast/ToastContainer";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
