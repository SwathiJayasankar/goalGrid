import React, { useState } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  File as FileIcon, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  HardDrive,
  Edit,
  Save,
  Eye,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatDate } from '../utils/plannerHelpers';

export default function FileManagementTab({ files = [], setFiles }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '' });
  const [fileDescription, setFileDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Filter & Search Files
  const filteredFiles = files.filter(file => {
    const matchesCategory = activeCategory === 'all' || file.type === activeCategory;
    const matchesQuery = file.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (file.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (file.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const selectedFile = files.find(f => f.id === selectedFileId);

  // File Upload Handler (Base64 Encode)
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
          content: event.target.result, // base64 / text content
          description: '',
          createdAt: formatDate(new Date())
        };

        setFiles(prev => [newFile, ...prev]);
        if (!selectedFileId) {
          setSelectedFileId(newFile.id);
        }
      };

      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  // Drag and Drop Events
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

  // Delete Action
  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) {
      setSelectedFileId(null);
      setIsEditingNote(false);
    }
  };

  // Create Note Action
  const handleCreateNote = () => {
    const newNote = {
      id: `file-${Date.now()}`,
      name: 'New Note.txt',
      type: 'note',
      size: 0,
      content: 'Write something productive here...',
      description: 'Custom text note created in workspace',
      createdAt: formatDate(new Date())
    };

    setFiles(prev => [newNote, ...prev]);
    setSelectedFileId(newNote.id);
    setNoteForm({ title: 'New Note.txt', content: 'Write something productive here...' });
    setIsEditingNote(true);
  };

  // Save Note Action
  const handleSaveNote = () => {
    setFiles(prev => prev.map(f => {
      if (f.id === selectedFileId) {
        return {
          ...f,
          name: noteForm.title.endsWith('.txt') ? noteForm.title : `${noteForm.title}.txt`,
          content: noteForm.content,
          size: new Blob([noteForm.content]).size
        };
      }
      return f;
    }));
    setIsEditingNote(false);
  };

  // Save Description Action
  const handleSaveDescription = () => {
    setFiles(prev => prev.map(f => {
      if (f.id === selectedFileId) {
        return {
          ...f,
          description: fileDescription
        };
      }
      return f;
    }));
  };

  const selectFile = (file) => {
    setSelectedFileId(file.id);
    if (file.type === 'note') {
      setNoteForm({ title: file.name, content: file.content });
      setIsEditingNote(false);
    } else {
      setFileDescription(file.description || '');
      setIsEditingNote(false);
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'note': return <FileText size={20} style={{ color: '#818cf8' }} />;
      case 'pdf': return <FileText size={20} style={{ color: '#f87171' }} />;
      case 'image': return <ImageIcon size={20} style={{ color: '#34d399' }} />;
      default: return <FileIcon size={20} style={{ color: '#94a3b8' }} />;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="file-management-container" style={{ animation: 'slideInRight 0.4s ease-out' }}>
      <style>{`
        .file-manager-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 24px;
          margin-top: 24px;
          min-height: 580px;
        }

        .file-sidebar-left {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          backdrop-filter: blur(24px);
        }

        .file-content-right {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(24px);
        }

        .fms-drag-uploader {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.005);
          transition: all 0.2s ease;
        }

        .fms-drag-uploader.dragging {
          border-color: #7c3aed;
          background: rgba(124, 58, 237, 0.05);
        }

        .fms-drag-uploader:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.015);
        }

        .fms-search-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 12px 8px 36px;
          color: white;
          font-size: 0.85rem;
        }

        .fms-search-input:focus {
          border-color: rgba(124, 58, 237, 0.5);
          outline: none;
        }

        .category-tab-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #cbd5e1;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .category-tab-btn:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .category-tab-btn.active {
          background: rgba(124, 58, 237, 0.15);
          color: #c4b5fd;
          font-weight: 600;
        }

        .file-list-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow-y: auto;
          max-height: 280px;
          padding-right: 2px;
        }

        .file-list-items::-webkit-scrollbar {
          width: 4px;
        }

        .file-list-items::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }

        .file-item-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.005);
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.2s ease;
        }

        .file-item-card:hover {
          background: rgba(255, 255, 255, 0.02);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .file-item-card.selected {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(124, 58, 237, 0.3);
        }

        .note-editor-title {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 10px 14px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          width: 100%;
          margin-bottom: 16px;
        }

        .note-editor-title:focus {
          border-color: rgba(124, 58, 237, 0.5);
          outline: none;
        }

        .note-editor-textarea {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 16px;
          color: #cbd5e1;
          font-size: 0.9rem;
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          resize: none;
          min-height: 250px;
          margin-bottom: 16px;
        }

        .note-editor-textarea:focus {
          border-color: rgba(124, 58, 237, 0.5);
          outline: none;
        }

        .fms-view-image {
          max-height: 220px;
          object-fit: contain;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 8px;
        }

        @media (max-width: 900px) {
          .file-manager-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ color: 'white', fontSize: '1.6rem', marginBottom: '4px' }}>File Locker</h2>
          <p style={{ color: '#a0aec0', fontSize: '0.95rem', margin: 0 }}>Upload PDF references, images, & save notes for the AI Copilot to reference</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleCreateNote}
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              padding: '10px 18px',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> New Note
          </button>
        </div>
      </div>

      {/* Grid Workspace */}
      <div className="file-manager-grid">
        {/* Left Side Menu & Upload Panel */}
        <div className="file-sidebar-left">
          {/* Uploader Zone */}
          <div 
            className={`fms-drag-uploader ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input 
              type="file" 
              id="file-upload-input" 
              multiple 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
              accept=".pdf, image/*, .txt, .md"
            />
            <div style={{ fontSize: '1.8rem', color: '#a78bfa', marginBottom: '8px' }}>📂</div>
            <div style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>Upload Reference Files</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>PDF, Images, TXT (Drag & Drop)</div>
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
            <input 
              type="text" 
              className="fms-search-input" 
              placeholder="Search reference folder..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', paddingLeft: '4px' }}>Folders</div>
            {[
              { id: 'all', label: 'All Files', count: files.length },
              { id: 'note', label: 'Text Notes', count: files.filter(f => f.type === 'note').length },
              { id: 'pdf', label: 'PDF Documents', count: files.filter(f => f.type === 'pdf').length },
              { id: 'image', label: 'Images / Scans', count: files.filter(f => f.type === 'image').length }
            ].map(cat => (
              <button 
                key={cat.id} 
                className={`category-tab-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.label}</span>
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px' }}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Files List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px', paddingLeft: '4px' }}>RECENT FILES</div>
            <div className="file-list-items">
              {filteredFiles.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: '#475569', fontSize: '0.8rem' }}>No files found</div>
              ) : (
                filteredFiles.map(file => (
                  <div 
                    key={file.id} 
                    className={`file-item-card ${selectedFileId === file.id ? 'selected' : ''}`}
                    onClick={() => selectFile(file)}
                  >
                    {getFileIcon(file.type)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'white', fontSize: '0.8rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '2px' }}>{file.type === 'note' ? 'Note' : formatSize(file.size)} • {file.createdAt}</div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(file.id, e)}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}
                      title="Delete Lock"
                    >
                      <Trash2 size={13} hover-color="#ef4444" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side Workspace Details */}
        <div className="file-content-right">
          {!selectedFile ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '16px' }}>
              <HardDrive size={52} strokeWidth={1} style={{ opacity: 0.5 }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#cbd5e1', fontSize: '0.95rem', fontWeight: '600' }}>No Reference Selected</div>
                <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '4px', maxWidth: '280px' }}>Select an items from the sidebar or upload files to view details and index notes.</p>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {getFileIcon(selectedFile.type)}
                  <div>
                    <h3 style={{ color: 'white', fontSize: '1.05rem', fontWeight: '600', margin: 0 }}>{selectedFile.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Created on: {selectedFile.createdAt} {selectedFile.type !== 'note' && `• Size: ${formatSize(selectedFile.size)}`}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedFile.type === 'note' && (
                    <button
                      onClick={() => {
                        if (isEditingNote) {
                          handleSaveNote();
                        } else {
                          setNoteForm({ title: selectedFile.name, content: selectedFile.content });
                          setIsEditingNote(true);
                        }
                      }}
                      style={{
                        background: isEditingNote ? '#10b981' : 'rgba(255,255,255,0.05)',
                        border: '1px solid ' + (isEditingNote ? '#10b981' : 'rgba(255,255,255,0.1)'),
                        borderRadius: '6px',
                        color: 'white',
                        padding: '6px 14px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {isEditingNote ? (
                        <>
                          <Save size={13} /> Save Note
                        </>
                      ) : (
                        <>
                          <Edit size={13} /> Edit Note
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedFile.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '6px',
                      color: '#f87171',
                      padding: '6px 14px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={13} /> Delete Reference
                  </button>
                </div>
              </div>

              {/* View / Edit area */}
              {selectedFile.type === 'note' ? (
                // TXT NOTE EDITOR
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {isEditingNote ? (
                    <>
                      <input 
                        type="text" 
                        className="note-editor-title"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                        placeholder="Title of Note"
                      />
                      <textarea
                        className="note-editor-textarea"
                        value={noteForm.content}
                        onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                        placeholder="Write your note body here..."
                      />
                    </>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ padding: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', flex: 1, minHeight: '250px' }}>
                        {selectedFile.content || <span style={{ color: '#475569' }}>No content written in this note.</span>}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // UPLOADED FILE VIEW (PDF & Images)
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {selectedFile.type === 'image' && (
                      <img 
                        src={selectedFile.content} 
                        alt={selectedFile.name} 
                        className="fms-view-image"
                      />
                    )}
                    {selectedFile.type === 'pdf' && (
                      <div style={{ width: '130px', height: '130px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '2.5rem' }}>📄</div>
                        <span style={{ fontSize: '0.75rem', color: '#f87171', fontWeight: 'bold' }}>PDF document</span>
                      </div>
                    )}
                    {selectedFile.type !== 'image' && selectedFile.type !== 'pdf' && (
                      <div style={{ width: '130px', height: '130px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '2.5rem' }}>📂</div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>Reference File</span>
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: '240px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(252,252,252,0.03)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        <Sparkles size={13} /> AI Copilot Context
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Provide a summary description, tag names, or paste extracted text of this file below. The AI matches and reasons about this text context during conversations.</p>
                    </div>
                  </div>

                  {/* AI context summary editing */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600 }}>File Description / Extracted Text</label>
                      <button 
                        onClick={handleSaveDescription}
                        style={{
                          background: 'rgba(124, 58, 237, 0.1)',
                          border: '1px solid rgba(124, 58, 237, 0.3)',
                          borderRadius: '4px',
                          color: '#c4b5fd',
                          padding: '2px 8px',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Update Index
                      </button>
                    </div>
                    <textarea 
                      placeholder="e.g. 'This is my syllabus for Math 101. Final exam is on Dec 12, assignments: Homework 1 due Friday.' or summarize the contents of the image/PDF..."
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                      style={{ 
                        width: '100%', 
                        flex: 1, 
                        minHeight: '160px', 
                        background: 'rgba(0,0,0,0.2)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        borderRadius: '8px', 
                        padding: '12px', 
                        color: '#cbd5e1', 
                        fontSize: '0.85rem',
                        lineHeight: '1.5'
                      }}
                    />
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

    </div>
  );
}
