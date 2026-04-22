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
import { useAuth } from "./component/useAuth";
import Loading from "./component/Loading";
import Stock from "./page/Stock";
import HolisticDemo from "./page/Scan";
import WelcomNewUser from "./page/WelcomNewUser";
import AdminPage from "./page/AdminPage";
import VerifyEmail from "./page/VerifyEmail";
import ListOrder from "./page/ListOrder";
import OrderDetail from "./page/OrderDetail";
function App() {
  const { User, emailVerified, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <Router>
      <Routes>
        {/* 🔒 Routes protégées */}
        <Route
          path="/home"
          element={
            User && emailVerified ? <Home /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/order"
          element={
            User && emailVerified ? (
              <ListOrder />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/orders/:id"
          element={
            User && emailVerified ? (
              <OrderDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/navig"
          element={
            User && emailVerified ? (
              <Naviguer />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/stock"
          element={
            User && emailVerified ? <Stock /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/scan"
          element={
            User && emailVerified ? (
              <HolisticDemo />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/welcom"
          element={
            User && emailVerified ? (
              <WelcomNewUser />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/request"
          element={
            User && emailVerified ? (
              <AdminPage menu="request" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/user"
          element={
            User && emailVerified ? (
              <AdminPage menu="user" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/setting"
          element={
            User && emailVerified ? (
              <AdminPage menu="setting" />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 🧩 Routes publiques */}
        <Route
          path="/"
          element={User ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

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
