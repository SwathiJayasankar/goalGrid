import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  File as FileIcon, 
  Plus, 
  Search, 
  Trash2, 
  HardDrive,
  Edit,
  Save,
  Sparkles,
  Upload,
  Check,
  Folder,
  Loader2,
  ArrowLeft,
  X,
  Download,
  ExternalLink
} from 'lucide-react';
import { formatDate } from '../utils/plannerHelpers';

export default function FileManagementTab({ files = [], setFiles }) {
  const [currentFolder, setCurrentFolder] = useState(''); // '' = root directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [fileDescription, setFileDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'typing' | 'indexing'

  const selectedFile = files.find(f => f.id === selectedFileId);

  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type === 'note' || selectedFile.type === 'text') {
        setNoteForm({ title: selectedFile.name, content: selectedFile.content });
      } else {
        setFileDescription(selectedFile.description || '');
      }
      setSyncStatus('synced');
    }
  }, [selectedFileId, selectedFile]);

  // Handler for directory tree
  const currentPathItems = files.filter(file => {
    const parentFolder = file.folder || '';
    
    // In search mode, show glob matches from anywhere at any depth
    if (searchQuery.trim().length > 0) {
      return file.type !== 'folder' && (
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return parentFolder === currentFolder;
  });

  const getBreadcrumbs = () => {
    const crumbs = [{ id: '', name: 'Locker Root' }];
    if (!currentFolder) return crumbs;

    // Split paths if nested, or display active folder name
    const activeFold = files.find(f => f.type === 'folder' && f.name === currentFolder);
    if (activeFold) {
      crumbs.push({ id: activeFold.name, name: activeFold.name });
    } else {
      crumbs.push({ id: currentFolder, name: currentFolder });
    }
    return crumbs;
  };

  // Directory actions
  const handleCreateFolder = () => {
    const name = window.prompt("Enter new folder name:");
    if (!name || !name.trim()) return;
    const folderName = name.trim();
    
    // Prevent duplicates
    if (files.some(f => f.type === 'folder' && f.name.toLowerCase() === folderName.toLowerCase() && (f.folder || '') === currentFolder)) {
      alert("A folder with this name already exists in the current directory.");
      return;
    }

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: folderName,
      type: 'folder',
      folder: currentFolder,
      createdAt: formatDate(new Date())
    };

    setFiles(prev => [newFolder, ...prev]);
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    processFiles(uploadedFiles);
  };

  const processFiles = (uploadedFiles) => {
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        let type = 'other';
        if (file.type.includes('image')) {
          type = 'image';
        } else if (file.type === 'application/pdf') {
          type = 'pdf';
        } else if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          type = 'text';
        }

        const newFile = {
          id: `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          type: type,
          content: event.target.result,
          description: '',
          folder: currentFolder,
          createdAt: formatDate(new Date())
        };

        setFiles(prev => [newFile, ...prev]);
      };

      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Delete this item permanently?')) {
      setFiles(prev => prev.filter(f => f.id !== id && f.folder !== id));
      if (selectedFileId === id) {
        setSelectedFileId(null);
        setIsEditingNote(false);
      }
    }
  };

  const handleCreateNote = () => {
    const newNote = {
      id: `file-${Date.now()}`,
      name: 'Untitled Note.txt',
      type: 'note',
      size: 0,
      content: 'Write notes here...',
      description: 'Locker txt note',
      folder: currentFolder,
      createdAt: formatDate(new Date())
    };

    setFiles(prev => [newNote, ...prev]);
    setSelectedFileId(newNote.id);
    setNoteForm({ title: newNote.name, content: newNote.content });
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
    const formattedTitle = noteForm.title.trim() || 'Untitled Note.txt';
    const finalTitle = formattedTitle.endsWith('.txt') ? formattedTitle : `${formattedTitle}.txt`;
    setFiles(prev => prev.map(f => {
      if (f.id === selectedFileId) {
        return {
          ...f,
          name: finalTitle,
          content: noteForm.content,
          size: new Blob([noteForm.content]).size
        };
      }
      return f;
    }));
    setIsEditingNote(false);
  };

  const handleDescriptionChange = (newVal) => {
    setFileDescription(newVal);
    setSyncStatus('typing');
    setFiles(prev => prev.map(f => {
      if (f.id === selectedFileId) {
        return { ...f, description: newVal };
      }
      return f;
    }));
  };

  const handleDescriptionBlur = () => {
    setSyncStatus('indexing');
    setTimeout(() => setSyncStatus('synced'), 600);
  };

  const navigateUp = () => {
    if (!currentFolder) return;
    // Go up one level (currently flat, back to root)
    setCurrentFolder('');
  };

  const handleDownloadFile = (file) => {
    try {
      const link = document.createElement('a');
      link.href = file.content;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("Could not download file.");
    }
  };

  const handleOpenInNewTab = (file) => {
    try {
      if (file.content.startsWith('data:')) {
        const parts = file.content.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      }
    } catch (err) {
      console.error("Failed to open file:", err);
      window.open(file.content, '_blank');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="desktop-explorer-wrapper animate-fade" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <style>{`
        .desktop-explorer-wrapper {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-height: 550px;
          position: relative;
        }

        /* Drag Overlay */
        .workspace-drag-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(124, 58, 237, 0.12);
          border: 3px dashed rgba(124, 58, 237, 0.6);
          border-radius: 20px;
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1.25rem;
          z-index: 100;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        /* Top control bar */
        .explorer-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 14px 20px;
          backdrop-filter: blur(10px);
          gap: 16px;
          flex-wrap: wrap;
        }

        .crumbs-and-buttons {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .back-nav-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255,255,255,0.06);
          color: white;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .back-nav-btn:hover:not(:disabled) {
          background: rgba(124, 58, 237, 0.2);
          border-color: rgba(124, 58, 237, 0.3);
        }

        .back-nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .explorer-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #94a3b8;
          font-weight: 500;
          margin-right: 12px;
        }

        .breadcrumb-item {
          cursor: pointer;
          color: #e2e8f0;
          transition: color 0.15s ease;
        }

        .breadcrumb-item:hover {
          color: #c4b5fd;
        }

        /* Toolbar Actions */
        .toolbar-action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tbar-btn {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 0.82rem;
          font-weight: 550;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.03);
          color: white;
        }

        .tbar-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }

        .tbar-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          border: none;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
        }

        .tbar-primary:hover {
          box-shadow: 0 6px 15px rgba(124, 58, 237, 0.35);
        }

        .tbar-search-wrap {
          position: relative;
          width: 250px;
        }

        .tbar-search-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 8px 12px 8px 36px;
          color: white;
          font-size: 0.82rem;
          transition: all 0.2s ease;
        }

        .tbar-search-input:focus {
          border-color: rgba(124, 58, 237, 0.5);
          outline: none;
        }

        /* Desktop grid structure */
        .desktop-grid-pane {
          background: rgba(10, 12, 16, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 32px;
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          grid-gap: 28px;
          align-content: start;
          backdrop-filter: blur(20px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          min-height: 480px;
        }

        /* Icon elements */
        .desktop-icon-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          position: relative;
          padding: 12px 8px;
          border-radius: 12px;
          transition: all 0.2s ease;
          user-select: none;
          max-width: 130px;
          outline: none;
        }

        .desktop-icon-cell:hover {
          background: rgba(255, 255, 255, 0.035);
        }

        .desktop-icon-cell.selected-cell {
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.25);
        }

        /* Visual File Types inside icon box */
        .icon-visual-box {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-bottom: 10px;
          border-radius: 14px;
        }

        /* Folder representation styling */
        .visual-folder-gradient {
          width: 74px;
          height: 60px;
          border-radius: 8px;
          background: linear-gradient(135deg, #eab308 0%, #b45309 100%);
          position: relative;
          box-shadow: 0 6px 14px rgba(180, 83, 9, 0.25);
        }

        .visual-folder-gradient::before {
          content: '';
          position: absolute;
          top: -6px;
          left: 4px;
          width: 25px;
          height: 8px;
          background: #eab308;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
        }

        .visual-folder-gradient::after {
          content: '';
          position: absolute;
          bottom: 0px;
          left: 2px;
          right: 2px;
          top: 14px;
          background: linear-gradient(135deg, #fef08a 0%, #facc15 100%);
          border-radius: 6px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
        }

        /* Shortcut Blue Overlay Arrow */
        .shortcut-overlay-badge {
          position: absolute;
          top: 0px;
          right: -2px;
          background: #3b82f6;
          border: 1px solid rgba(255,255,255,0.4);
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.65rem;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          z-index: 5;
        }

        /* Document style icons */
        .visual-pdf-icon {
          width: 58px;
          height: 70px;
          background: #ffffff;
          border-radius: 6px;
          border: 2px solid #ef4444;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .visual-pdf-label {
          background: #ef4444;
          color: white;
          font-size: 0.58rem;
          font-weight: 800;
          padding: 2px 5px;
          border-radius: 3px;
          margin-top: 4px;
        }

        .visual-txt-icon {
          width: 58px;
          height: 70px;
          background: #4f46e5;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #c7d2fe;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .visual-img-thumb {
          width: 78px;
          height: 78px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.15);
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }

        .visual-file-misc {
          width: 58px;
          height: 70px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
        }

        /* Text title */
        .icon-label-text {
          font-weight: 550;
          color: #f8fafc;
          font-size: 0.78rem;
          margin-top: 4px;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Popup Detail Overlay */
        .modal-fullscreen-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-detail-panel {
          width: 680px;
          max-width: calc(100vw - 32px);
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (max-width: 640px) {
          .crumbs-and-buttons {
            flex-wrap: wrap;
          }
          .toolbar-action-buttons {
            flex-wrap: wrap;
            width: 100%;
          }
          .tbar-search-wrap {
            width: 100% !important;
          }
          .desktop-grid-pane {
            padding: 16px !important;
            grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)) !important;
            grid-gap: 12px !important;
          }
          .modal-detail-panel {
            padding: 16px !important;
          }
        }

        @keyframes scaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {isDragging && (
        <div className="workspace-drag-overlay">
          Drop Files to Reference in Copilot
        </div>
      )}

      {/* Breadcrumb & Control Panel */}
      <div className="explorer-toolbar animate-fade">
        <div className="crumbs-and-buttons">
          <button 
            type="button" 
            className="back-nav-btn" 
            onClick={navigateUp}
            disabled={!currentFolder}
            title="Up to Parent Directory"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="explorer-breadcrumbs">
            {getBreadcrumbs().map((crumb, idx) => (
              <span key={crumb.id}>
                {idx > 0 && <span style={{ margin: '0 4px', opacity: 0.3 }}>/</span>}
                <span className="breadcrumb-item" onClick={() => setCurrentFolder(crumb.id)}>
                  {crumb.name}
                </span>
              </span>
            ))}
          </div>

          <div className="toolbar-action-buttons">
            <button type="button" className="tbar-btn" onClick={handleCreateFolder}>
              <Folder size={14} style={{ color: '#fbbf24' }} /> New Folder
            </button>
            <button type="button" className="tbar-btn" onClick={handleCreateNote}>
              <Plus size={14} /> Write Note
            </button>
            <button 
              type="button" 
              className="tbar-btn tbar-primary" 
              onClick={() => document.getElementById('explorer-upload').click()}
            >
              <Upload size={14} /> Upload References
            </button>
            <input 
              type="file" 
              id="explorer-upload" 
              multiple 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
              accept=".pdf, image/*, .txt, .md"
            />
          </div>
        </div>

        {/* Global/Filter search */}
        <div className="tbar-search-wrap">
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
          <input 
            type="text" 
            className="tbar-search-input" 
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid View */}
      <div className="desktop-grid-pane animate-fade">
        {currentPathItems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '16px', padding: '60px 0' }}>
            <HardDrive size={40} style={{ opacity: 0.3 }} />
            <div style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
              {searchQuery ? 'No matching references' : 'This folder is empty'}
            </div>
          </div>
        ) : (
          currentPathItems.map(file => {
            const isFolder = file.type === 'folder';

            return (
              <div 
                key={file.id} 
                className="desktop-icon-cell"
                onDoubleClick={() => {
                  if (isFolder) {
                    setCurrentFolder(file.name);
                  } else {
                    setSelectedFileId(file.id);
                  }
                }}
                onClick={() => {
                  // Fallback for click (single action on mobile)
                  if (!isFolder) {
                    setSelectedFileId(file.id);
                  } else {
                    // Small delay to allow double click, or just click to enter is also fine for folder
                  }
                }}
              >
                {/* Diagonal shortcut arrow overlay */}
                <div className="shortcut-overlay-badge">↙</div>

                <div className="icon-visual-box">
                  {isFolder && <div className="visual-folder-gradient" />}
                  {!isFolder && file.type === 'image' && (
                    <img src={file.content} alt={file.name} className="visual-img-thumb" />
                  )}
                  {!isFolder && file.type === 'pdf' && (
                    <div className="visual-pdf-icon">
                      <FileText size={24} style={{ color: '#ef4444' }} />
                      <span className="visual-pdf-label">PDF</span>
                    </div>
                  )}
                  {!isFolder && file.type === 'note' && (
                    <div className="visual-txt-icon">
                      <FileText size={28} />
                    </div>
                  )}
                  {!isFolder && file.type !== 'image' && file.type !== 'pdf' && file.type !== 'note' && (
                    <div className="visual-file-misc">
                      <FileIcon size={28} />
                    </div>
                  )}
                </div>

                <div className="icon-label-text" title={file.name}>
                  {file.name}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating File Detail Inspector Modal */}
      {selectedFile && (
        <div className="modal-fullscreen-backdrop">
          <div className="modal-detail-panel animate-fade" style={selectedFile.type === 'pdf' ? { width: '850px' } : {}}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="category-pill-count" style={{ display: 'inline-flex', background: 'rgba(124, 58, 237, 0.15)', color: '#c4b5fd', fontWeight: 600 }}>
                  {selectedFile.type.toUpperCase()}
                </span>
                {selectedFile.size > 0 && (
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                    {formatSize(selectedFile.size)}
                  </span>
                )}
                <span style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600 }}>{selectedFile.name}</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedFileId(null);
                  setIsEditingNote(false);
                }} 
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* View/Edit Form Workspace */}
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '480px', paddingRight: '4px' }}>
              {(selectedFile.type === 'note' || selectedFile.type === 'text') ? (
                // Note editing or file text view
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {isEditingNote && selectedFile.type === 'note' ? (
                    <>
                      <input 
                        type="text" 
                        className="note-editor-title"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        placeholder="Title"
                      />
                      <textarea
                        className="note-editor-textarea"
                        value={noteForm.content}
                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                        placeholder="Write content..."
                      />
                    </>
                  ) : (
                    <div className="note-content-preview-box" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {selectedFile.content || <span style={{ color: '#475569' }}>This file is empty.</span>}
                    </div>
                  )}
                </div>
              ) : (
                // Render upload file
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {selectedFile.type === 'image' && (
                      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <img src={selectedFile.content} alt={selectedFile.name} style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '8px' }} />
                      </div>
                    )}
                    {selectedFile.type === 'pdf' && (
                      <div style={{ width: '100%', height: '420px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', background: 'white' }}>
                        <iframe 
                          src={selectedFile.content} 
                          title={selectedFile.name} 
                          width="100%" 
                          height="100%" 
                          style={{ border: 'none' }} 
                        />
                      </div>
                    )}
                    {selectedFile.type !== 'image' && selectedFile.type !== 'pdf' && (
                      <div className="visual-file-misc" style={{ width: '90px', height: '110px' }}>
                        <FileIcon size={32} />
                      </div>
                    )}

                    {/* AI explanation block */}
                    <div className="ai-context-info-card" style={{ flex: 1, minWidth: '250px' }}>
                      <div className="ai-glow-tag">
                        <Sparkles size={12} className="animate-pulse" />
                        <span>AI Search Context</span>
                      </div>
                      <p className="ai-card-tip">
                        Provide a textual summary or extracted keywords. Copilot queries this description field dynamically to reason about this file context during chats.
                      </p>
                    </div>
                  </div>

                  {/* AI context summary editing */}
                  <div className="index-field-wrapper">
                    <div className="index-field-header">
                      <label style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>File Index Summary / Text Excerpts</label>
                      <span className={`sync-hud-status ${
                        syncStatus === 'synced' ? 'sync-hud-synced' : 
                        syncStatus === 'typing' ? 'sync-hud-typing' : 'sync-hud-indexing'
                      }`}>
                        {syncStatus === 'synced' && <><Check size={10} /> Synced</>}
                        {syncStatus === 'typing' && <><Loader2 size={10} className="spinner" /> Typing...</>}
                        {syncStatus === 'indexing' && <><Loader2 size={10} className="spinner animate-spin" /> Indexing...</>}
                      </span>
                    </div>
                    <textarea 
                      placeholder="e.g. 'Class syllabus. Final exam Dec 14.'"
                      value={fileDescription}
                      onBlur={handleDescriptionBlur}
                      onChange={(e) => handleDescriptionChange(e.target.value)}
                      className="index-text-area"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedFile.type === 'note' && (
                  <button 
                    type="button" 
                    className={`premium-tab-button ${isEditingNote ? 'solid-save-btn' : 'tbar-btn'}`}
                    onClick={() => {
                      if (isEditingNote) {
                        handleSaveNote();
                      } else {
                        setIsEditingNote(true);
                      }
                    }}
                  >
                    {isEditingNote ? <><Save size={13} /> Save Note</> : <><Edit size={13} /> Edit Note</>}
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="premium-tab-button tbar-btn"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => handleDownloadFile(selectedFile)}
                  title="Download raw file"
                >
                  <Download size={13} /> Download
                </button>
                <button 
                  type="button" 
                  className="premium-tab-button tbar-btn"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onClick={() => handleOpenInNewTab(selectedFile)}
                  title="Open file in new browser window"
                >
                  <ExternalLink size={13} /> Open
                </button>

                <button 
                  type="button" 
                  className="premium-tab-button outline-danger-btn" 
                  onClick={() => handleDelete(selectedFile.id)}
                >
                  <Trash2 size={13} /> Delete Ref
                </button>
              </div>

              <button 
                type="button" 
                className="tbar-btn" 
                style={{ background: 'rgba(255,255,255,0.06)' }}
                onClick={() => {
                  setSelectedFileId(null);
                  setIsEditingNote(false);
                }}
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
