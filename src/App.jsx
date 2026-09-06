import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Menu, Bell } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import MyEOD from "./pages/MyEOD";
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
   AUTHENTICATION GUARD
========================================================= */

function ProtectedRoute({ children }) {
  const currentEmployee = localStorage.getItem(
    "workpulse_current_employee"
  );

  if (!currentEmployee) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/* =========================================================
   MOBILE HEADER
========================================================= */

function MobileHeader({ setIsSidebarOpen }) {
  const navigate = useNavigate();
  const { getUnreadCount } = useNotifications();

  const currentEmployee = JSON.parse(
    localStorage.getItem("workpulse_current_employee") || "null"
  );

  const unreadCount = currentEmployee
    ? getUnreadCount(currentEmployee.employeeCode)
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
      {/* Menu Button */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
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

      {/* Brand */}
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

      {/* Notification */}
      <button
        type="button"
        onClick={() => navigate("/notifications")}
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
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}

/* =========================================================
   MAIN APPLICATION
========================================================= */

function MainApplication({
  isSidebarOpen,
  setIsSidebarOpen,
}) {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Application Area */}
      <div className="min-h-screen lg:ml-64">

        {/* Mobile / Tablet Header */}
        <MobileHeader
          setIsSidebarOpen={setIsSidebarOpen}
        />

        {/* Application Pages */}
        <Routes>

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* My EOD */}
          <Route
            path="/eod"
            element={<MyEOD />}
          />

          {/* Analytics */}
          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* Notifications */}
          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* Employees */}
          <Route
            path="/employees"
            element={<Employees />}
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={<Settings />}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <EODProvider>
      <NotificationProvider>
        <EmployeeProvider>
          <BrowserRouter>

            <Routes>

              {/* ============================================
                  AUTHENTICATION PAGES
                  No Sidebar
              ============================================ */}

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              {/* Public Routes */} 
              <Route path="/login" element={<Login />} /> 
              <Route path="/register" element={<Register />} /> 
              <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ============================================
                  PROTECTED APPLICATION
              ============================================ */}

                <Route
                  path="*"
                  element={
                    <ProtectedRoute>
                      <MainApplication
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                      />
                    </ProtectedRoute>
                  }
                />

              </Routes>

          </BrowserRouter>
        </EmployeeProvider>
      </NotificationProvider>
    </EODProvider>
  );
}

export default App;
