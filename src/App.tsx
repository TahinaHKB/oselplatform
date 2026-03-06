import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./page/Register";
import Login from "./page/Login";
import Home from "./page/Home";
import Naviguer from "./page/Navig";
import UsersList from "./page/Message";
import Chat from "./page/Chat";
import NotificationsPage from "./page/Notification";
import { useAuth } from "./component/useAuth";
import Loading from "./component/Loading";
import Stock from "./page/Stock";

function App() {
  const { User, loading } = useAuth();
  if (loading) return <Loading />;

  return (
    <Router>
      <Routes>
        {/* 🔒 Routes protégées */}
        <Route
          path="/home"
          element={User ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/messages"
          element={User ? <UsersList /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/chat/:uid"
          element={User ? <Chat /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/notifications"
          element={
            User ? <NotificationsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/navig"
          element={User ? <Naviguer /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/stock"
          element={User ? <Stock /> : <Navigate to="/login" replace />}
        />

        {/* 🧩 Routes publiques */}
        <Route
          path="/"
          element={User ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/login"
          element={User ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={User ? <Navigate to="/home" replace /> : <Register />}
        />

        {/* ⚠️ Redirection par défaut (route inconnue) */}
        <Route
          path="*"
          element={<Navigate to={User ? "/home" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
