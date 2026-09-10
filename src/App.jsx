import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { Menu, Bell } from "lucide-react";

import ProtectedRoute from "./components/ProtectedRoute";
import AuthExpiryHandler from "./components/AuthExpiryHandler";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import MyEOD from "./pages/MyEOD";
import AdminEOD from "./pages/AdminEOD";
import Analytics from "./pages/Analytics";
import Notifications from "./pages/Notifications";
import Employees from "./pages/Employees";
import Settings from "./pages/Settings";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import { EODProvider } from "./context/EODContext";

import {
  NotificationProvider,
  useNotifications,
} from "./context/NotificationContext";

import { EmployeeProvider } from "./context/EmployeeContext";

/* =========================================================
   GET CURRENT LOGGED-IN EMPLOYEE
========================================================= */

function getCurrentEmployee() {
  try {
    return JSON.parse(
      localStorage.getItem(
        "workpulse_current_employee"
      ) || "null"
    );
  } catch {
    return null;
  }
}

/* =========================================================
   ADMIN GUARD
   Only ADMIN can access admin pages.
========================================================= */

function AdminRoute({ children }) {
  const currentEmployee = getCurrentEmployee();

  /* -------------------------------------------------------
     NOT LOGGED IN
  ------------------------------------------------------- */

  if (!currentEmployee) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* -------------------------------------------------------
     LOGGED IN BUT NOT ADMIN
  ------------------------------------------------------- */

  if (
    String(
      currentEmployee.accountRole || ""
    ).toUpperCase() !== "ADMIN"
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

/* =========================================================
   MOBILE HEADER
========================================================= */

function MobileHeader({
  setIsSidebarOpen,
}) {
  const navigate = useNavigate();

  const {
    getUnreadCount,
  } = useNotifications();

  const currentEmployee =
    getCurrentEmployee();

  const unreadCount = currentEmployee
    ? getUnreadCount(
        currentEmployee.employeeCode
      )
    : 0;

  return (
    <header
      className="
        sticky top-0 z-30
        flex h-16 items-center justify-between
        border-b border-slate-200
        bg-white px-4 shadow-sm
        lg:hidden
      "
    >
      {/* =================================================
          MENU BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          setIsSidebarOpen(true)
        }
        className="
          rounded-lg p-2
          text-slate-600
          transition
          hover:bg-slate-100
        "
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="flex items-center gap-2">
        <img
          src="/src/assets/workpulse-logo.png"
          alt="WorkPulse"
          className="h-9 w-9 object-contain"
        />

        <h1 className="text-lg font-bold text-slate-900">
          WorkPulse
        </h1>
      </div>

      {/* =================================================
          NOTIFICATION
      ================================================= */}

      <button
        type="button"
        onClick={() =>
          navigate("/notifications")
        }
        className="
          relative rounded-lg p-2
          text-slate-600
          transition
          hover:bg-slate-100
        "
        aria-label="Notifications"
      >
        <Bell size={22} />

        {unreadCount > 0 && (
          <span
            className="
              absolute -right-1 -top-1
              flex min-h-[18px] min-w-[18px]
              items-center justify-center
              rounded-full
              bg-[#9B72CF]
              px-1
              text-[10px]
              font-bold
              text-white
            "
          >
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}

/* =========================================================
   MAIN APPLICATION
   This component contains all protected pages.
========================================================= */

function MainApplication({
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="min-h-screen lg:ml-64">

        {/* ===================================================
            MOBILE / TABLET HEADER
        =================================================== */}

        <MobileHeader
          setIsSidebarOpen={
            setIsSidebarOpen
          }
        />

        {/* ===================================================
            PROTECTED APPLICATION ROUTES
        =================================================== */}

        <Routes>

          {/* =================================================
              DASHBOARD
          ================================================= */}

          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* =================================================
              MY EOD
          ================================================= */}

          <Route
            path="/eod"
            element={<MyEOD />}
          />

          {/* =================================================
              ADMIN EOD
              ADMIN ONLY
          ================================================= */}

          <Route
            path="/admin-eod"
            element={
              <AdminRoute>
                <AdminEOD />
              </AdminRoute>
            }
          />

          {/* =================================================
              ANALYTICS
          ================================================= */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* =================================================
              EMPLOYEES
              ADMIN ONLY
          ================================================= */}

          <Route
            path="/employees"
            element={
              <AdminRoute>
                <Employees />
              </AdminRoute>
            }
          />

          {/* =================================================
              SETTINGS
          ================================================= */}

          <Route
            path="/settings"
            element={<Settings />}
          />

          {/* =================================================
              UNKNOWN ROUTE
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>
      </div>
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [
    isSidebarOpen,
    setIsSidebarOpen,
  ] = useState(false);

  return (
    <EODProvider>

      <NotificationProvider>

        <EmployeeProvider>

          <BrowserRouter>

            {/* =================================================
                GLOBAL AUTH EXPIRY HANDLER
            ================================================= */}

            <AuthExpiryHandler />

            <Routes>

              {/* =================================================
                  PUBLIC AUTHENTICATION ROUTES
              ================================================= */}

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              <Route
                path="/forgot-password"
                element={
                  <ForgotPassword />
                }
              />

              {/* =================================================
                  PROTECTED APPLICATION

                  Everything inside this route requires:
                  - JWT token
                  - current employee data
              ================================================= */}

              <Route
                element={
                  <ProtectedRoute />
                }
              >
                <Route
                  path="/*"
                  element={
                    <MainApplication
                      isSidebarOpen={
                        isSidebarOpen
                      }
                      setIsSidebarOpen={
                        setIsSidebarOpen
                      }
                    />
                  }
                />
              </Route>

            </Routes>

          </BrowserRouter>

        </EmployeeProvider>

      </NotificationProvider>

    </EODProvider>
  );
}

export default App;