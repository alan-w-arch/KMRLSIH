import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UploadDocPage from "../pages/UploadDocPage";
import UploadUrlPage from "../pages/UploadUrlPage";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";
import ProfileSettings from "../pages/ProfileSettings";

export default function AppRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Route (Login Page) */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      {/* Private Routes - With Layout */}
      <Route
        path="/*"
        element={
          user ? (
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

              {/* Main Content */}
              <div className="flex-1 flex flex-col overflow-auto">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 pt-16 lg:pt-16 ml-0 lg:ml-64 p-4 lg:p-6 min-h-[calc(100vh-8rem)]">
                  <Routes>
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="uploadfile"
                      element={
                        <ProtectedRoute>
                          <UploadDocPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="uploadurl"
                      element={
                        <ProtectedRoute>
                          <UploadUrlPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="profile-settings"
                      element={
                        <ProtectedRoute>
                          <ProfileSettings />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </main>

                <Footer />
              </div>
            </div>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}
