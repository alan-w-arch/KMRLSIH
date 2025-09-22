import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import UploadDocPage from "../pages/UploadDocPage";
import UploadUrlPage from "../pages/UploadUrlPage";

export default function AppRoutes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 pt-16 lg:pt-16 ml-0 lg:ml-64 p-4 lg:p-6 min-h-[calc(100vh-8rem)]">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/uploadfile" element={<UploadDocPage />} />
            <Route path="/uploadurl" element={<UploadUrlPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}
