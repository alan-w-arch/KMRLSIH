import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { listDocuments, markViewed } from "../api/services";
import VerticalCard from "./VerticalCard";
import { useAuth } from "../context/AuthContext";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Layers,
  X,
} from "lucide-react";

const getShortName = (name, maxLength = 20) => {
  if (!name) return "Untitled";
  return name.length > maxLength ? name.slice(0, maxLength - 3) + "..." : name;
};

// Summary Drawer Component
const SummaryDrawer = ({ isOpen, onClose, docId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-50/30 backdrop-blur-3xl z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-gray-50 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-green-500">
                Document Summary
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-500 hover:text-green-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium  text-green-500 mb-2">
                    <h3 className="border-b-1 mb-5">Document ID</h3>
                  </div>
                  <p className="text-gray-800">{docId}</p>
                </div>

                {/* Add your summary content here */}
                <div>
                  <div className="text-sm font-medium  text-green-500 mb-2">
                    <h3 className=" border-b-1 mb-5">Summary</h3>
                  </div>
                  <div className="border border-green-200 p-4 text-green-500 rounded-lg">
                    <p className="text-green-500">
                      Summary content will be loaded here for document ID:{" "}
                      {docId}
                    </p>
                    {/* You can add your summary fetching logic here */}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const DocumentStacksSection = ({ userId }) => {
  const { user } = useAuth();
  const [documentStacks, setDocumentStacks] = useState({
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    stack5: [],
    stack6: [],
  });

  const [currentTopIndices, setCurrentTopIndices] = useState({
    stack1: 0,
    stack2: 0,
    stack3: 0,
    stack4: 0,
    stack5: 0,
    stack6: 0,
  });

  const [processingStates, setProcessingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Summary drawer state
  const [summaryDrawer, setSummaryDrawer] = useState({
    isOpen: false,
    docId: null,
  });

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await listDocuments(userId);
        const documents = response.documents || response.data || response;
        if (Array.isArray(documents)) categorizeDocuments(documents);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to fetch documents");
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [userId]);

  const categorizeDocuments = (documents) => {
    const stacks = {
      stack1: [], // all
      stack2: [], // Viewed - Unread
      stack3: [], // High Priority
      stack4: [], // Normal Priority
      stack5: [], // Low/Medium Priority
      stack6: [], // Urgent/Critical
    };

    documents.forEach((doc) => {
      const normalizedDoc = {
        id: doc.id || doc.doc_id,
        title: doc.title || "Untitled Document",
        cloudinaryUrl: doc.cloudinary_url || "#",
        priority: doc.priority || "normal",
        viewed: doc.viewed || false,
        marked_as_read: doc.marked_as_read || false,
      };

      stacks.stack1.push(normalizedDoc); // All documents

      if (normalizedDoc.viewed && !normalizedDoc.marked_as_read) {
        stacks.stack2.push(normalizedDoc);
      }

      // Correctly map priority to stacks
      switch (normalizedDoc.priority.toLowerCase()) {
        case "high":
          stacks.stack3.push(normalizedDoc);
          break;
        case "normal":
          stacks.stack4.push(normalizedDoc);
          break;
        case "low":
          stacks.stack5.push(normalizedDoc);
          break;
        case "urgent":
        case "critical":
          stacks.stack6.push(normalizedDoc);
          break;
        default:
          stacks.stack4.push(normalizedDoc); // fallback to normal
      }
    });

    setDocumentStacks(stacks);
  };

  const handleMarkAsRead = async (stackKey, document) => {
    setProcessingStates((p) => ({ ...p, [stackKey]: true }));
    try {
      if (userId && document.id) await markViewed(userId, document.id);

      setDocumentStacks((prev) => {
        const newStacks = { ...prev };
        const idx = currentTopIndices[stackKey];
        if (newStacks[stackKey][idx]) {
          newStacks[stackKey][idx] = {
            ...newStacks[stackKey][idx],
            marked_as_read: true,
          };
        }
        return newStacks;
      });

      setCurrentTopIndices((prev) => ({
        ...prev,
        [stackKey]: prev[stackKey] + 1,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingStates((p) => ({ ...p, [stackKey]: false }));
    }
  };

  const handleOpenDocument = (document) => {
    if (document.cloudinaryUrl && document.cloudinaryUrl !== "#") {
      window.open(document.cloudinaryUrl, "_blank");
    }
  };

  // Handle summary drawer toggle
  const handleGetSummary = (document) => {
    setSummaryDrawer({
      isOpen: true,
      docId: document.id,
    });
  };

  const closeSummaryDrawer = () => {
    setSummaryDrawer({
      isOpen: false,
      docId: null,
    });
  };

  // Stack Configs
  const stackConfigs = [
    {
      key: "stack3",
      title: "High Priority",
      icon: AlertCircle,
      gradient: "from-red-500 to-red-700",
    },
    {
      key: "stack4",
      title: "Medium Priority",
      icon: Clock,
      gradient: "from-yellow-400 to-yellow-600",
    },
    {
      key: "stack5",
      title: "Low Priority",
      icon: FileText,
      gradient: "from-green-400 to-green-600",
    },
    {
      key: "stack2",
      title: "Viewed - Unread",
      icon: Layers,
      gradient: "from-blue-400 to-blue-600",
    },

    {
      key: "stack1",
      title: "All Documents",
      icon: CheckCircle,
      gradient: "from-neutral-400 to-neutral-600",
    },
  ];

  // Layout: first 3 + next 2
  const firstRow = stackConfigs.slice(0, 3);
  const secondRow = stackConfigs.slice(3);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-96 rounded-2xl bg-neutral-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-600">⚠️ {error}</p>
      </div>
    );
  }

  return (
    <>
      <section className="mb-10 mt-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            Document Dashboard
          </h2>
          <p className="text-gray-500 mt-2">
            Manage and review your documents efficiently
          </p>
        </div>

        {/* First Row (3 stacks) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {firstRow.map((config) => (
            <StackCard
              key={config.key}
              config={config}
              documentStacks={documentStacks}
              currentTopIndices={currentTopIndices}
              handleMarkAsRead={handleMarkAsRead}
              handleOpenDocument={handleOpenDocument}
              handleGetSummary={handleGetSummary}
            />
          ))}
        </div>

        {/* Second Row (2 large stacks) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {secondRow.map((config) => (
            <StackCard
              key={config.key}
              config={config}
              documentStacks={documentStacks}
              currentTopIndices={currentTopIndices}
              handleMarkAsRead={handleMarkAsRead}
              handleOpenDocument={handleOpenDocument}
              handleGetSummary={handleGetSummary}
            />
          ))}
        </div>
      </section>

      {/* Summary Drawer */}
      <SummaryDrawer
        isOpen={summaryDrawer.isOpen}
        onClose={closeSummaryDrawer}
        docId={summaryDrawer.docId}
      />
    </>
  );
};

// Extracted StackCard for reusability
const StackCard = ({
  config,
  documentStacks,
  currentTopIndices,
  handleMarkAsRead,
  handleOpenDocument,
  handleGetSummary,
}) => {
  const currentStack = documentStacks[config.key] || [];
  const currentTopIndex = currentTopIndices[config.key];
  const Icon = config.icon;

  return (
    <div className="rounded-2xl shadow-md hover:shadow-xl border border-gray-200 bg-white flex flex-col transition-shadow duration-300">
      {/* Header */}
      <div
        className={`px-5 py-4 rounded-t-2xl bg-gradient-to-r ${config.gradient} text-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5" />
            <h3 className="font-semibold text-base">{config.title}</h3>
          </div>
          <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs">
            {Math.max(0, currentStack.length - currentTopIndex)}
          </span>
        </div>
      </div>

      {/* Body: Scrollable list with fixed height */}
      <div className="p-4 flex-1 overflow-y-auto max-h-80">
        {currentStack.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No documents available
          </div>
        ) : (
          <ul className="space-y-3">
            {currentStack.slice(currentTopIndex).map((document) => (
              <li
                key={document.id}
                className="border border-gray-200 rounded-xl p-3 flex justify-between items-center hover:bg-gray-50"
              >
                {/* Document info */}
                <div>
                  <h4 className="font-semibold" title={document.title}>
                    {getShortName(document.title, 25)}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Priority: {document.priority} |{" "}
                    {document.marked_as_read ? "Read" : "Unread"}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDocument(document)}
                    className="px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 rounded-lg text-xs transition"
                  >
                    View
                  </button>

                  {!document.marked_as_read && (
                    <button
                      onClick={() => handleGetSummary(document)}
                      className="px-2 py-1 border border-green-200 text-green-700 hover:bg-green-200 hover:text-green-800 rounded-lg text-xs transition"
                    >
                      Get Summary
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentStacksSection;
