import { useLanguage } from "../context/LanguageContext";
import { FileText, Search, Link2, BookDashed } from "lucide-react";
import { Link } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen, setSearchOpen }) {
  const { t } = useLanguage();

  return (
    <>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <nav className="p-4 space-y-2 mt-4">
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 bg-accent/10 text-accent rounded-lg font-medium"
          >
            <BookDashed size={20} />
            {t.dashboard}
          </a>

          <Link
            to="/uploadfile"
            className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FileText size={20} />
            {t.documents}
          </Link>

          <Link
            to="/uploadurl"
            className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Link2 size={20} />
            {t.uploadLink}
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 w-full text-left px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Search size={20} />
            {t.search}
          </button>

          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FileText size={20} />
            {t.analytics}
          </a>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
