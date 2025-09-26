import React, { useState, useEffect } from "react";
import { listDocuments, markViewed } from "../api/services";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Layers,
} from "lucide-react";

// Import the separated components
import StackCard from "./StackCard";
import SummaryDrawer from "./SummaryDrawer";
import DocumentViewerPage from "../pages/DocumentViewerPage";
import { categorizeDocuments, stackConfigs } from "../locales/helpers";

const DocumentStacksSection = ({ userId }) => {
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

  // Document viewer page state
  const [documentViewerPage, setDocumentViewerPage] = useState({
    isOpen: false,
    document: null,
  });

  // Map icon names to actual icon components
  const iconMap = {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Layers,
  };

  // Process stack configs to include actual icon components
  const processedStackConfigs = stackConfigs.map(config => ({
    ...config,
    icon: iconMap[config.icon] || FileText
  }));

  // Fetch documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const response = await listDocuments(userId);
        console.log("Fetched documents:", response);
        const documents = response.data || response;
        
        // Check if the response contains an error
        if (documents && documents.error) {
          console.log("API returned error:", documents.error);
          setError(documents.error);
          // Initialize empty stacks when no documents found
          const emptyStacks = categorizeDocuments([]);
          setDocumentStacks(emptyStacks);
          return;
        }
        
        if (Array.isArray(documents)) {
          const categorizedStacks = categorizeDocuments(documents);
          setDocumentStacks(categorizedStacks);
        } else {
          console.error("Invalid documents format:", documents);
          setError("Invalid documents format received");
          // Initialize empty stacks as fallback
          const emptyStacks = categorizeDocuments([]);
          setDocumentStacks(emptyStacks);
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to fetch documents");
        // Initialize empty stacks on error
        const emptyStacks = categorizeDocuments([]);
        setDocumentStacks(emptyStacks);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [userId]);

  const handleOpenDocument = async (document) => {
    console.log("Opening document:", document);
    
    // Set processing state for this specific document
    setProcessingStates((p) => ({ ...p, [`view_${document.id}`]: true }));
    
    try {
      // Always call markViewed when opening a document
      if (userId && document.id) {
        await markViewed(userId, document.id);
        
        // Update the document in all stacks
        setDocumentStacks((prev) => {
          const newStacks = { ...prev };
          Object.keys(newStacks).forEach((key) => {
            newStacks[key] = newStacks[key].map((doc) => 
              doc.id === document.id 
                ? { ...doc, viewed: true, marked_as_read: true }
                : doc
            );
          });
          return newStacks;
        });
      }
      
      // Open the document in full page view
      setDocumentViewerPage({
        isOpen: true,
        document: document,
      });
      
    } catch (err) {
      console.error("Error marking document as viewed:", err);
    } finally {
      setProcessingStates((p) => ({ ...p, [`view_${document.id}`]: false }));
    }
  };

  // Handle document viewer page toggle
  const closeDocumentViewerPage = () => {
    setDocumentViewerPage({
      isOpen: false,
      document: null,
    });
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

  // Layout: first 3 + next 2
  const firstRow = processedStackConfigs.slice(0, 3);
  const secondRow = processedStackConfigs.slice(3);

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
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
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
              processingStates={processingStates}
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
              processingStates={processingStates}
              handleOpenDocument={handleOpenDocument}
              handleGetSummary={handleGetSummary}
            />
          ))}
        </div>
      </section>

      {/* Document Viewer Page */}
      <DocumentViewerPage
        isOpen={documentViewerPage.isOpen}
        onClose={closeDocumentViewerPage}
        document={documentViewerPage.document}
        userId={userId}
      />

      {/* Summary Drawer */}
      <SummaryDrawer
        isOpen={summaryDrawer.isOpen}
        onClose={closeSummaryDrawer}
        docId={summaryDrawer.docId}
      />
    </>
  );
};

export default DocumentStacksSection;