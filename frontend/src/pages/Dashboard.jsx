import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { FileText, Bell, User, Menu, X } from "lucide-react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import StatsShow from "../components/StatsShow";
import UploadDoc from "../components/UploadDoc";
import RecentDocuments from "../components/RecentDocuments";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const { language, setLanguage, t } = useLanguage();

  // backend URL from env
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // endpoints
  const API_ENDPOINTS = {
    UPLOAD_FILE: `${BACKEND_URL}/file`,
    GET_URL: `${BACKEND_URL}/url`,
  };

  // Simulate processing status polling
  const pollProcessingStatus = (fileId) => {
    // In a real implementation, you would poll your backend for status updates
    setTimeout(() => {
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "processed",
                summary: "Document processed and indexed successfully.",
              }
            : f
        )
      );
    }, 3000);
  };

  // Function to get URL (example implementation)
  const getUrl = async (url) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.GET_URL,
        {
          url: url,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Get URL error:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={16} />
            </div>
            <h1 className="text-xl font-heading font-semibold text-primary">
              KMRL Doc Intelligence
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                selectedLanguage === "en"
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-600"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("ml")}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                selectedLanguage === "ml"
                  ? "bg-white text-primary shadow-sm"
                  : "text-neutral-600"
              }`}
            >
              ML
            </button>
          </div>

          <button
            className="relative p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-neutral-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <button
            className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="User menu"
          >
            <User size={20} className="text-neutral-600" />
            <span className="hidden sm:block text-sm font-medium text-neutral-700">
              Alan-W-Arch
            </span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-full">
          {/* Quick Stats */}

          <StatsShow />

          {/* Upload Section */}
          <UploadDoc />

          {/* Recent Documents */}
          <RecentDocuments />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
