import React, { useState, useRef } from 'react';
import { Upload, FileText, Search, Bell, User, Menu, X, Filter, Eye, Download, Clock, AlertTriangle, Link, Plus } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([
    {
      id: 1,
      name: 'Safety Directive - Track Maintenance.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadDate: '2025-01-15',
      status: 'processed',
      priority: 'urgent',
      department: 'Safety',
      summary: 'Critical safety protocols for track maintenance during operational hours...'
    },
    {
      id: 2,
      name: 'Procurement Guidelines 2025.docx',
      type: 'doc',
      size: '1.2 MB',
      uploadDate: '2025-01-14',
      status: 'processing',
      priority: 'medium',
      department: 'Procurement',
      summary: 'Updated procurement guidelines and vendor evaluation criteria...'
    }
  ]);
  const [urlInput, setUrlInput] = useState('');
  const [isUrlUploading, setIsUrlUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // backend URL from env
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

  // endpoints
  const API_ENDPOINTS = {
    UPLOAD_FILE: `${BACKEND_URL}/file`,
    GET_URL: `${BACKEND_URL}/url`
  };

  // Fixed simulateUpload function - removed random failure
  const simulateUpload = (fileId) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Faster progress
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          resolve();
        } else {
          setUploadProgress(prev => ({ ...prev, [fileId]: Math.round(progress) }));
        }
      }, 150);
    });
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    if (files.length === 0) return;
    
    for (const file of files) {
      const fileId = Date.now() + Math.random();
      
      // Validate file type and size - now includes images
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/svg+xml',
        'image/webp'
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|gif|svg|webp)$/i)) {
        alert(`File type not supported: ${file.name}`);
        continue;
      }
      
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }
      
      // Determine file type
      let fileType = 'other';
      if (file.type.includes('pdf')) fileType = 'pdf';
      else if (file.type.includes('word') || file.name.includes('doc')) fileType = 'doc';
      else if (file.type.includes('sheet') || file.name.includes('xls')) fileType = 'excel';
      else if (file.type.startsWith('image/')) fileType = 'image';
      
      // Add file to state with uploading status
      const newFile = {
        id: fileId,
        name: file.name,
        type: fileType,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'uploading',
        priority: 'medium',
        department: 'General',
        summary: 'Uploading document...'
      };
      setUploadedFiles(prev => [newFile, ...prev]);
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      try {
        // For development, use simulation. For production, use real API
        if (BACKEND_URL.includes('localhost')) {
          // Use simulation for local development
          await simulateUpload(fileId);
        } else {
          // Use real API for production
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await axios.post(API_ENDPOINTS.UPLOAD_FILE, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
            },
            timeout: 30000, // 30 second timeout
          });
        }
        
        // Update file status to processing
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'processing',
            summary: 'Document uploaded successfully. Processing...'
          } : f)
        );
        
        // Clear upload progress
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
        
        // Poll for processing status
        pollProcessingStatus(fileId);
        
      } catch (error) {
        console.error('File upload error:', error);
        
        let errorMessage = 'Upload failed. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'Upload timeout. Please try again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Update file status to error
        setUploadedFiles(prev =>
          prev.map(f => f.id === fileId ? { 
            ...f, 
            status: 'error',
            summary: errorMessage
          } : f)
        );
        
        // Clear upload progress
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }
    
    // Clear file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a valid URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(urlInput);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    const fileId = Date.now() + Math.random();
    setIsUrlUploading(true);

    // Extract filename from URL or create a default one
    const urlParts = urlInput.split('/');
    const fileName = urlParts[urlParts.length - 1] || 'url-document';
    
    // Determine file type from URL extension
    let fileType = 'other';
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) fileType = 'pdf';
    else if (['doc', 'docx'].includes(extension)) fileType = 'doc';
    else if (['xls', 'xlsx'].includes(extension)) fileType = 'excel';
    else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) fileType = 'image';

    const newFile = {
      id: fileId,
      name: fileName,
      type: fileType,
      size: 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      status: 'uploading',
      priority: 'medium',
      department: 'General',
      summary: 'Downloading from URL...',
      url: urlInput
    };

    setUploadedFiles(prev => [newFile, ...prev]);
    setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

    try {
      // For development, use simulation
      if (BACKEND_URL.includes('localhost')) {
        await simulateUpload(fileId);
      } else {
        // Use real API for production
        const response = await axios.post(API_ENDPOINTS.GET_URL, {
          url: urlInput
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        });
      }

      // Update file status to processing
      setUploadedFiles(prev =>
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'processing',
          summary: 'URL content downloaded successfully. Processing...'
        } : f)
      );

      // Clear upload progress
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });

      // Poll for processing status
      pollProcessingStatus(fileId);

      // Clear URL input
      setUrlInput('');

    } catch (error) {
      console.error('URL upload error:', error);
      
      setUploadedFiles(prev =>
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'error',
          summary: 'Failed to download from URL. Please check the URL and try again.'
        } : f)
      );

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    } finally {
      setIsUrlUploading(false);
    }
  };

  // Simulate processing status polling
  const pollProcessingStatus = (fileId) => {
    // In a real implementation, you would poll your backend for status updates
    setTimeout(() => {
      setUploadedFiles(prev =>
        prev.map(f => f.id === fileId ? { 
          ...f, 
          status: 'processed',
          summary: 'Document processed and indexed successfully.'
        } : f)
      );
    }, 2000); // Reduced from 3000ms to 2000ms for faster feedback
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-urgent';
      case 'high': return 'bg-high';
      case 'medium': return 'bg-medium';
      case 'low': return 'bg-low';
      default: return 'bg-neutral-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'processed': return 'text-success bg-success/10';
      case 'processing': return 'text-warning bg-warning/10';
      case 'uploading': return 'text-info bg-info/10';
      case 'error': return 'text-danger bg-danger/10';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getDepartmentColor = (department) => {
    switch (department.toLowerCase()) {
      case 'safety': return 'text-safety bg-safety/10';
      case 'engineering': return 'text-engineering bg-engineering/10';
      case 'operations': return 'text-operations bg-operations/10';
      case 'maintenance': return 'text-maintenance bg-maintenance/10';
      case 'finance': return 'text-finance bg-finance/10';
      case 'procurement': return 'text-procurement bg-procurement/10';
      default: return 'text-neutral-600 bg-neutral-100';
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf': return 'text-pdf';
      case 'doc': return 'text-doc';
      case 'excel': return 'text-excel';
      case 'image': return 'text-image';
      default: return 'text-neutral-600';
    }
  };

  const filteredFiles = uploadedFiles.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const text = {
    en: {
      dashboard: 'Dashboard',
      documents: 'Documents',
      search: 'Search',
      analytics: 'Analytics',
      settings: 'Settings',
      uploadDocument: 'Upload Document',
      recentDocuments: 'Recent Documents',
      quickStats: 'Quick Stats',
      urgentDirectives: 'Urgent Directives',
      searchPlaceholder: 'Search documents...',
      totalDocuments: 'Total Documents',
      pendingReview: 'Pending Review',
      thisWeek: 'This Week',
      view: 'View',
      download: 'Download',
      processing: 'Processing',
      processed: 'Processed',
      uploading: 'Uploading',
      error: 'Error',
      uploadInfo: 'Supports PDF, DOC, DOCX, XLS, XLSX, and all image formats (PNG, JPG, JPEG, GIF, SVG, WEBP) up to 10MB',
      dragDrop: 'Click to upload or drag and drop',
      urlUpload: 'Or upload from URL',
      urlPlaceholder: 'Enter document or image URL',
      urlUploadButton: 'Upload from URL',
      noDocuments: 'No documents found matching your search.'
    },
    ml: {
      dashboard: 'ഡാഷ്ബോർഡ്',
      documents: 'പ്രമാണങ്ങൾ',
      search: 'തിരയൽ',
      analytics: 'വിശകലനം',
      settings: 'ക്രമീകരണങ്ങൾ',
      uploadDocument: 'പ്രമാണം അപ്‌ലോഡ് ചെയ്യുക',
      recentDocuments: 'പുതിയ പ്രമാണങ്ങൾ',
      quickStats: 'വേഗത്തിലുള്ള സ്ഥിതിവിവരക്കണക്കുകൾ',
      urgentDirectives: 'അടിയന്തര നിർദ്ദേശങ്ങൾ',
      searchPlaceholder: 'പ്രമാണങ്ങൾ തിരയുക...',
      totalDocuments: 'മൊത്തം പ്രമാണങ്ങൾ',
      pendingReview: 'അവലോകനം കാത്തിരിക്കുന്നു',
      thisWeek: 'ഈ ആഴ്ച',
      view: 'കാണുക',
      download: 'ഡൌൺലോഡ്',
      processing: 'പ്രോസസ്സിംഗ്',
      processed: 'പ്രോസസ് ചെയ്തു',
      uploading: 'അപ്‌ലോഡ് ചെയ്യുന്നു',
      error: 'പിശക്',
      uploadInfo: 'PDF, DOC, DOCX, XLS, XLSX, കൂടാതെ എല്ലാ ഇമേജ് ഫോർമാറ്റുകളും (PNG, JPG, JPEG, GIF, SVG, WEBP) പരമാവധി 10MB',
      dragDrop: 'അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ ഇഴുത്ത് വിടുക',
      urlUpload: 'അല്ലെങ്കിൽ URL-ൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യുക',
      urlPlaceholder: 'പ്രമാണം അല്ലെങ്കിൽ ഇമേജ് URL നൽകുക',
      urlUploadButton: 'URL-ൽ നിന്ന് അപ്‌ലോഡ് ചെയ്യുക',
      noDocuments: 'നിങ്ങളുടെ തിരയലുമായി പൊരുത്തപ്പെടുന്ന പ്രമാണങ്ങൾ കണ്ടെത്തിയില്ല.'
    }
  };

  const t = text[selectedLanguage];

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="bg-secondary border-b border-border px-4 lg:px-6 h-16 flex items-center justify-between sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-hover rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="text-secondary" size={16} />
            </div>
            <h1 className="text-xl font-heading font-semibold text-primary">KMRL Doc Intelligence</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                selectedLanguage === 'en' ? 'bg-secondary text-primary shadow-sm' : 'text-neutral-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setSelectedLanguage('ml')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                selectedLanguage === 'ml' ? 'bg-secondary text-primary shadow-sm' : 'text-neutral-600'
              }`}
            >
              ML
            </button>
          </div>
          
          <button className="relative p-2 hover:bg-hover rounded-lg transition-colors" aria-label="Notifications">
            <Bell size={20} className="text-neutral-600" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-secondary text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          <button className="flex items-center gap-2 p-2 hover:bg-hover rounded-lg transition-colors" aria-label="User menu">
            <User size={20} className="text-neutral-600" />
            <span className="hidden sm:block text-sm font-medium text-neutral-700">Alan-W-Arch</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-fixed w-64 bg-secondary border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <nav className="p-4 space-y-2 mt-4">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-accent/10 text-accent rounded-lg font-medium">
              <FileText size={20} />
              {t.dashboard}
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-hover rounded-lg transition-colors">
              <FileText size={20} />
              {t.documents}
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-hover rounded-lg transition-colors">
              <Search size={20} />
              {t.search}
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-neutral-600 hover:bg-hover rounded-lg transition-colors">
              <FileText size={20} />
              {t.analytics}
            </a>
          </nav>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-primary/20 z-modal-backdrop lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 max-w-full">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{t.totalDocuments}</p>
                  <p className="text-2xl font-bold text-primary">1,247</p>
                </div>
                <FileText className="text-neutral-400" size={24} />
              </div>
            </div>
            
            <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{t.pendingReview}</p>
                  <p className="text-2xl font-bold text-warning">23</p>
                </div>
                <Clock className="text-neutral-400" size={24} />
              </div>
            </div>
            
            <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{t.urgentDirectives}</p>
                  <p className="text-2xl font-bold text-danger">8</p>
                </div>
                <AlertTriangle className="text-neutral-400" size={24} />
              </div>
            </div>
            
            <div className="bg-secondary p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{t.thisWeek}</p>
                  <p className="text-2xl font-bold text-success">156</p>
                </div>
                <FileText className="text-neutral-400" size={24} />
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-secondary rounded-xl border border-border p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-heading font-semibold text-primary mb-4">{t.uploadDocument}</h2>
            
            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer mb-6"
            >
              <Upload className="mx-auto mb-4 text-neutral-400" size={48} />
              <p className="text-lg font-medium text-neutral-700 mb-2">
                {t.dragDrop}
              </p>
              <p className="text-sm text-neutral-500">
                {t.uploadInfo}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.svg,.webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* URL Upload Section */}
            <div className="border-t border-divider pt-6">
              <div className="flex items-center mb-3">
                <Link className="mr-2 text-neutral-500" size={20} />
                <h3 className="text-md font-medium text-neutral-700">{t.urlUpload}</h3>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder={t.urlPlaceholder}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent bg-secondary"
                    onKeyPress={(e) => e.key === 'Enter' && handleUrlUpload()}
                  />
                </div>
                <button
                  onClick={handleUrlUpload}
                  disabled={isUrlUploading || !urlInput.trim()}
                  className="px-6 py-3 bg-accent text-secondary rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isUrlUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-secondary"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>{t.urlUploadButton}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Documents */}
          <div className="bg-secondary rounded-xl border border-border p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-heading font-semibold text-primary">{t.recentDocuments}</h2>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent w-full sm:w-auto bg-secondary"
                  />
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-hover transition-colors">
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
                  <div key={file.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-secondary">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(file.priority)} mt-2`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium truncate ${getFileTypeColor(file.type)}`}>{file.name}</h3>
                            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{file.summary}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                              <span>{file.size}</span>
                              <span>{file.uploadDate}</span>
                              <span className={`capitalize px-2 py-1 rounded-full text-xs ${getDepartmentColor(file.department)}`}>
                                {file.department}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
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
                            <span className="text-xs text-neutral-500 whitespace-nowrap">{uploadProgress[file.id]}%</span>
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <button 
                            className="p-2 hover:bg-hover rounded-lg transition-colors disabled:cursor-not-allowed"
                            disabled={file.status === 'uploading' || file.status === 'error'}
                            aria-label={t.view}
                          >
                            <Eye size={16} className={`${file.status === 'uploading' || file.status === 'error' ? 'text-disabled' : 'text-neutral-600'}`} />
                          </button>
                          <button 
                            className="p-2 hover:bg-hover rounded-lg transition-colors disabled:cursor-not-allowed"
                            disabled={file.status === 'uploading' || file.status === 'error'}
                            aria-label={t.download}
                          >
                            <Download size={16} className={`${file.status === 'uploading' || file.status === 'error' ? 'text-disabled' : 'text-neutral-600'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
