import { useLanguage } from "../context/LanguageContext";
import { FileText, Link2, BookDashed } from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { t } = useLanguage();

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? "bg-accent/10 text-accent font-medium"
        : "text-neutral-600 hover:bg-neutral-100"
    }`;

  return (
    <>
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-neutral-200 z-30 transform transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        <nav className="p-4 space-y-2 mt-4">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={linkClasses}
            onClick={() => setSidebarOpen(false)} // close on mobile
          >
            <BookDashed size={20} />
            {t.dashboard}
          </NavLink>

          {/* Upload File */}
          <NavLink
            to="/uploadfile"
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            <FileText size={20} />
            {t.documents}
          </NavLink>

          {/* Upload URL */}
          <NavLink
            to="/uploadurl"
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            <Link2 size={20} />
            {t.uploadLink}
          </NavLink>

          {/* Analytics */}
          <NavLink
            to="#"
            className={linkClasses}
            onClick={() => setSidebarOpen(false)}
          >
            <FileText size={20} />
            {t.analytics}
          </NavLink>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
