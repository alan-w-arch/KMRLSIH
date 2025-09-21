import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { FileText, Search, Filter, Eye, Download } from "lucide-react";

function RecentDocuments() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});

  //static files

  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: "Safety Directive - Track Maintenance.pdf",
      type: "pdf",
      size: "2.4 MB",
      uploadDate: "2025-01-15",
      status: "processed",
      priority: "urgent",
      department: "Safety",
      summary:
        "Critical safety protocols for track maintenance during operational hours...",
    },
    {
      id: 2,
      name: "Procurement Guidelines 2025.docx",
      type: "doc",
      size: "1.2 MB",
      uploadDate: "2025-01-14",
      status: "processing",
      priority: "medium",
      department: "Procurement",
      summary:
        "Updated procurement guidelines and vendor evaluation criteria...",
    },
  ]);

  //Priority Color

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  //Status Color

  const getStatusColor = (status) => {
    switch (status) {
      case "processed":
        return "text-green-600 bg-green-50";
      case "processing":
        return "text-yellow-600 bg-yellow-50";
      case "uploading":
        return "text-blue-600 bg-blue-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const filteredFiles = uploadedFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-heading font-semibold text-primary">
            {t.recentDocuments}
          </h2>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                size={16}
              />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent w-full sm:w-auto"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FileText size={48} className="mx-auto mb-4 text-neutral-300" />
              <p>{t.noDocuments}</p>
            </div>
          ) : (
            filteredFiles.map((file) => (
              <div
                key={file.id}
                className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            file.priority
                          )} mt-2`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-primary truncate">
                          {file.name}
                        </h3>
                        <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                          {file.summary}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                          <span>{file.size}</span>
                          <span>{file.uploadDate}</span>
                          <span className="capitalize">{file.department}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        file.status
                      )}`}
                    >
                      {t[file.status] || file.status}
                    </span>

                    {/* Progress bar for uploading files */}
                    {uploadProgress[file.id] !== undefined && (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-300"
                            style={{ width: `${uploadProgress[file.id]}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-500 whitespace-nowrap">
                          {uploadProgress[file.id]}%
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:cursor-not-allowed"
                        disabled={
                          file.status === "uploading" || file.status === "error"
                        }
                        aria-label={t.view}
                      >
                        <Eye
                          size={16}
                          className={`${
                            file.status === "uploading" ||
                            file.status === "error"
                              ? "text-neutral-300"
                              : "text-neutral-600"
                          }`}
                        />
                      </button>
                      <button
                        className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:cursor-not-allowed"
                        disabled={
                          file.status === "uploading" || file.status === "error"
                        }
                        aria-label={t.download}
                      >
                        <Download
                          size={16}
                          className={`${
                            file.status === "uploading" ||
                            file.status === "error"
                              ? "text-neutral-300"
                              : "text-neutral-600"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default RecentDocuments;
