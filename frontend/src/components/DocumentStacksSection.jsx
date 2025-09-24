import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { listDocuments, markViewed } from '../api/services'; // Adjust import path as needed
import VerticalCard from './VerticalCard';
import { useAuth } from '../context/AuthContext';

const DocumentStacksSection = ({ userId }) => {
  const { user } = useAuth();
  const [documentStacks, setDocumentStacks] = useState({
    stack1: [], // Stack 4 from right - All documents
    stack2: [], // Stack 3 from right - Viewed but not marked as read
    stack3: [], // Stack 2 from right - High priority documents
    stack4: [], // Stack 1 from right - Normal priority documents
    stack5: [], // Additional stack for medium priority
    stack6: []  // Additional stack for urgent/critical priority
  });

  const [currentTopIndices, setCurrentTopIndices] = useState({
    stack1: 0, stack2: 0, stack3: 0, stack4: 0, stack5: 0, stack6: 0
  });
  
  const [processingStates, setProcessingStates] = useState({
    stack1: false, stack2: false, stack3: false, stack4: false, stack5: false, stack6: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch and categorize documents
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const response = await listDocuments(userId);
        const documents = response.documents || response.data || response;
        
        if (Array.isArray(documents)) {
          categorizeDocuments(documents);
        } else {
          console.error('Invalid documents data:', response);
          setError('Invalid document data received');
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [userId]);

  const categorizeDocuments = (documents) => {
    const stacks = {
      stack1: [], // All documents
      stack2: [], // Viewed but not marked as read
      stack3: [], // High priority
      stack4: [], // Normal priority
      stack5: [], // Medium priority (if exists)
      stack6: []  // Urgent/Critical priority (if exists)
    };

    documents.forEach(doc => {
      // Normalize document structure
      const normalizedDoc = {
        id: doc.id || doc.doc_id,
        title: doc.title || doc.document_title || doc.name || 'Untitled Document',
        type: getFileType(doc.file_type || doc.type || doc.extension),
        uploadDate: formatDate(doc.upload_date || doc.created_at || new Date()),
        status: determineStatus(doc),
        cloudinaryUrl: doc.cloudinary_url || doc.file_url || doc.url || '#',
        thumbnailUrl: doc.thumbnail_url,
        size: formatFileSize(doc.file_size || doc.size),
        priority: doc.priority || 'normal',
        viewed: doc.viewed || false,
        marked_as_read: doc.marked_as_read || doc.is_read || false
      };

      // Add to "All documents" stack
      stacks.stack1.push(normalizedDoc);

      // Categorize based on priority and status
      if (normalizedDoc.viewed && !normalizedDoc.marked_as_read) {
        // Stack 3 from right - Viewed but not marked as read
        stacks.stack2.push(normalizedDoc);
      } else if (normalizedDoc.priority === 'high') {
        // Stack 2 from right - High priority
        stacks.stack3.push(normalizedDoc);
      } else if (normalizedDoc.priority === 'normal') {
        // Stack 1 from right - Normal priority
        stacks.stack4.push(normalizedDoc);
      } else if (normalizedDoc.priority === 'medium') {
        // Medium priority
        stacks.stack5.push(normalizedDoc);
      } else if (normalizedDoc.priority === 'urgent' || normalizedDoc.priority === 'critical') {
        // Urgent/Critical priority
        stacks.stack6.push(normalizedDoc);
      }
    });

    // Sort by upload date (newest first)
    Object.keys(stacks).forEach(stackKey => {
      stacks[stackKey].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    });

    setDocumentStacks(stacks);
  };

  const determineStatus = (doc) => {
    if (doc.marked_as_read || doc.is_read) return 'read';
    if (doc.viewed) return 'viewed';
    return 'unread';
  };

  const getFileType = (fileType) => {
    if (!fileType) return 'DOC';
    const type = fileType.toUpperCase();
    if (type.includes('PDF')) return 'PDF';
    if (type.includes('DOC') || type.includes('DOCX')) return 'DOC';
    if (type.includes('XLS') || type.includes('XLSX')) return 'XLS';
    if (type.includes('PPT') || type.includes('PPTX')) return 'PPT';
    if (type.includes('PNG') || type.includes('JPG') || type.includes('JPEG') || type.includes('GIF')) return 'IMG';
    if (type.includes('TXT')) return 'TXT';
    return 'DOC';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return new Date().toLocaleDateString();
    }
  };

  const formatFileSize = (size) => {
    if (!size) return '';
    const bytes = parseInt(size);
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleMarkAsRead = async (stackKey, document) => {
    setProcessingStates(prev => ({ ...prev, [stackKey]: true }));

    try {
      // Call API to mark document as viewed/read
      if (userId && document.id) {
        await markViewed(userId, document.id);
      }

      // Update local state
      setDocumentStacks(prev => {
        const newStacks = { ...prev };
        const currentIndex = currentTopIndices[stackKey];
        
        if (newStacks[stackKey][currentIndex]) {
          newStacks[stackKey] = [...newStacks[stackKey]];
          newStacks[stackKey][currentIndex] = {
            ...newStacks[stackKey][currentIndex],
            status: 'read',
            marked_as_read: true
          };
        }
        return newStacks;
      });

      // Move to next document
      setCurrentTopIndices(prev => ({
        ...prev,
        [stackKey]: Math.min(prev[stackKey] + 1, documentStacks[stackKey]?.length - 1 || 0)
      }));

    } catch (error) {
      console.error('Error marking document as read:', error);
    } finally {
      setProcessingStates(prev => ({ ...prev, [stackKey]: false }));
    }
  };

  const handleOpenDocument = (document) => {
    if (document.cloudinaryUrl && document.cloudinaryUrl !== '#') {
      window.open(document.cloudinaryUrl, '_blank');
    } else {
      console.log('Opening document:', document.title);
    }
  };

  const stackConfigs = [
    {
      key: 'stack6',
      title: 'Urgent Priority',
      description: 'Critical documents requiring immediate attention',
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      key: 'stack5',
      title: 'Medium Priority',
      description: 'Documents with moderate importance',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      key: 'stack3',
      title: 'High Priority',
      description: 'Important documents requiring prompt review',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      key: 'stack2',
      title: 'Viewed - Unread',
      description: 'Documents you opened but haven\'t marked as read',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      key: 'stack4',
      title: 'Normal Priority',
      description: 'Standard documents for regular review',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      key: 'stack1',
      title: 'All Documents',
      description: 'Complete collection of your documents',
      color: 'text-neutral-600',
      bgColor: 'bg-neutral-50'
    }
  ];

  if (loading) {
    return (
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-primary mb-2">
            Document Processing Queue
          </h2>
          <p className="text-neutral-600 text-sm">Loading your documents...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-96 bg-neutral-100 animate-pulse rounded-2xl"></div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-8">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold text-primary mb-2">
            Document Processing Queue
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-primary mb-2">
          Document Processing Queue
        </h2>
        <p className="text-neutral-600 text-sm">
          Review and process documents organized by priority. Click "Mark as Read" to move to the next document in each stack.
        </p>
      </div>

      {/* Single Row of 6 Stacks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {stackConfigs.map((config) => {
          const currentStack = documentStacks[config.key] || [];
          const currentTopIndex = currentTopIndices[config.key];
          const isProcessing = processingStates[config.key];
          
          return (
            <div key={config.key} className="relative">
              {/* Stack Header */}
              <div className={`mb-4 p-3 rounded-lg ${config.bgColor} border border-opacity-20`}>
                <h3 className={`font-heading font-semibold text-sm ${config.color} mb-1`}>
                  {config.title}
                </h3>
                <p className="text-xs text-neutral-600 leading-tight">
                  {config.description}
                </p>
                <div className="text-xs text-neutral-500 mt-2">
                  {Math.max(0, currentStack.length - currentTopIndex)} documents
                </div>
              </div>

              {/* Document Stack */}
              <div className="relative h-96">
                {currentStack.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-200"
                  >
                    <div className="text-center p-6">
                      <div className="text-3xl mb-2">📋</div>
                      <div className="text-sm text-neutral-600 font-medium">No Documents</div>
                      <div className="text-xs text-neutral-500 mt-1">Stack is empty</div>
                    </div>
                  </motion.div>
                ) : currentTopIndex >= currentStack.length ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex items-center justify-center bg-green-50 rounded-2xl border border-green-200"
                  >
                    <div className="text-center p-6">
                      <div className="text-3xl mb-2">✅</div>
                      <div className="text-sm text-green-700 font-medium">All Done!</div>
                      <div className="text-xs text-green-600 mt-1">Stack completed</div>
                    </div>
                  </motion.div>
                ) : (
                  <AnimatePresence>
                    {currentStack.slice(currentTopIndex, currentTopIndex + 3).map((document, docIndex) => {
                      const isTopCard = docIndex === 0;
                      const zIndex = 3 - docIndex;
                      
                      return (
                        <motion.div
                          key={document.id}
                          className="absolute inset-0"
                          initial={{
                            x: -docIndex * 8,
                            y: -docIndex * 6,
                            rotate: -docIndex * 1,
                            scale: 1 - docIndex * 0.02,
                            zIndex: zIndex
                          }}
                          animate={{
                            x: -docIndex * 8,
                            y: -docIndex * 6,
                            rotate: -docIndex * 1,
                            scale: 1 - docIndex * 0.02,
                            zIndex: zIndex
                          }}
                          exit={{
                            x: 200,
                            opacity: 0,
                            rotate: 10,
                            transition: { duration: 0.3 }
                          }}
                        >
                          <VerticalCard
                            document={document}
                            isTopCard={isTopCard}
                            onOpenDocument={handleOpenDocument}
                            onMarkAsRead={() => handleMarkAsRead(config.key, document)}
                            isProcessing={isProcessing}
                            className="w-full h-full"
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DocumentStacksSection;