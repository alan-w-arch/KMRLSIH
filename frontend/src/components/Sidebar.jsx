import { useLanguage } from "../context/LanguageContext";
import { FileText, Search } from "lucide-react";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
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
            <FileText size={20} />
            {t.dashboard}
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FileText size={20} />
            {t.documents}
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Search size={20} />
            {t.search}
          </a>
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
