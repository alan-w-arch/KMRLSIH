import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import DocumentStacksSection from "../components/DocumentStacksSection";
import RecentDocuments from "../components/RecentDocuments";
import FloatingMenu from "../components/FloatingMenu";
import SearchDrawer from "../components/SearchDrawer";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const uid = user?.id;
  const [activeItem, setActiveItem] = useState("dashboard");

  const handleFileUpload = () => {
    console.log("Upload File Clicked");
  };

  const handleUrlUpload = () => {
    console.log("Upload URL Clicked");
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await searchDocuments(searchQuery);
      setResults(data.results || []);
    } catch (err) {
      console.error("Search error", err.response?.data || err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[200vh] bg-gray-50 rounded-2xl">
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
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <main
          className="
            min-h-[100vh] overflow-auto
          backdrop-blur-xl
             rounded-xl
            mt-6 mx-3 sm:mx-4 lg:mx-8 p-4 sm:p-6 lg:p-8
          "
        >
          <DocumentStacksSection userId={uid} />

          <div className="mt-10">
            <RecentDocuments />
          </div>

          <FloatingMenu
            onFileClick={handleFileUpload}
            onLinkClick={handleUrlUpload}
          />
        </main>
      </div>

      {/* Search Drawer */}
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
