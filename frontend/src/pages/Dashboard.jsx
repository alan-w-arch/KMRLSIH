import React, { useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import StatsShow from "../components/StatsShow";
import RecentDocuments from "../components/RecentDocuments";
import FloatingMenu from "../components/FloatingMenu";
import SearchDrawer from "../components/SearchDrawer";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeItem, setActiveItem] = useState("dashboard");

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
  };

  const handleUrlUpload = () => {
    console.log("Upload URL Clicked");
  };

  // Example search function
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // fake API call
      setTimeout(() => {
        setResults([
          { title: "Sample Doc", description: "This is a mock search result." },
        ]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Search error", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          toggleSearch={() => {
            setSearchOpen((prev) => !prev);
            setActiveItem("search");
          }}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />

        {/* Main Content */}
        <main className="flex-1 pt-16 lg:pt-16 p-4  min-h-[150vh]  lg:p-6 max-w-full bg-gray-50  overflow-auto">
          <StatsShow />
          <RecentDocuments />
          <FloatingMenu
            onFileClick={handleFileUpload}
            onLinkClick={handleUrlUpload}
          />
        </main>
      </div>

      <SearchDrawer
        isSearchOpen={searchOpen}
        toggleSearch={() => setSearchOpen((prev) => !prev)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearchSubmit={handleSearchSubmit}
        results={results}
        loading={loading}
      />
      {searchOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[40]"
          onClick={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
