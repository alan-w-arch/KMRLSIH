import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // For now, just redirect to login
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-secondary">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex flex-col">
        <div className="p-6 text-2xl font-heading border-b border-white/20">
          KMRL
        </div>
        <nav className="flex-1 p-4 space-y-4">
          <a href="#" className="block p-2 rounded hover:bg-white/10">
            📄 Documents
          </a>
          <a href="#" className="block p-2 rounded hover:bg-white/10">
            🔍 Search
          </a>
          <a href="#" className="block p-2 rounded hover:bg-white/10">
            ✅ Compliance
          </a>
          <a href="#" className="block p-2 rounded hover:bg-white/10">
            ⚙️ Settings
          </a>
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 bg-accent text-white py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-heading text-primary mb-6">
          Dashboard
        </h1>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white shadow-card rounded-xl">
            <h2 className="text-xl font-heading text-primary">📄 Documents</h2>
            <p className="mt-2 text-gray-600">
              Upload, classify, and view all documents.
            </p>
          </div>

          <div className="p-6 bg-white shadow-card rounded-xl">
            <h2 className="text-xl font-heading text-primary">🔍 Search</h2>
            <p className="mt-2 text-gray-600">
              Search documents with keywords or semantic search.
            </p>
          </div>

          <div className="p-6 bg-white shadow-card rounded-xl">
            <h2 className="text-xl font-heading text-primary">✅ Compliance</h2>
            <p className="mt-2 text-gray-600">
              Track regulatory obligations and deadlines.
            </p>
          </div>

          <div className="p-6 bg-white shadow-card rounded-xl">
            <h2 className="text-xl font-heading text-primary">🔔 Notifications</h2>
            <p className="mt-2 text-gray-600">
              Get alerts for new or urgent documents.
            </p>
          </div>

          <div className="p-6 bg-white shadow-card rounded-xl">
            <h2 className="text-xl font-heading text-primary">⚙️ Settings</h2>
            <p className="mt-2 text-gray-600">
              Manage preferences and account settings.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
