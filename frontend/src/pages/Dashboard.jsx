import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import StatsShow from "../components/StatsShow";
import UploadDoc from "../components/UploadDoc";
import RecentDocuments from "../components/RecentDocuments";
import Header from "../components/Header";
import FloatingMenu from "../components/FloatingMenu";


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // backend URL from env
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  // endpoints
  const API_ENDPOINTS = {
    UPLOAD_FILE: `${BACKEND_URL}/file`,
    GET_URL: `${BACKEND_URL}/url`,
  };

  const handleFileUpload = () => {
    console.log("Upload File Clicked");
    // call backend: `${BACKEND_URL}/file`
  };

  const handleUrlUpload = () => {
    console.log("Upload URL Clicked");
    // call backend: `${BACKEND_URL}/url`
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
    <div className="min-h-screen bg-secondary">
      <Header/>

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

          <FloatingMenu onFileClick={handleFileUpload} onLinkClick={handleUrlUpload} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
