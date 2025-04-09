
import React, { useState, useRef } from 'react';
import { File, FileText, Image, FilePlus, Search, Tag, Trash2, ExternalLink, ClipboardList } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import NeumorphCard from '@/components/NeumorphCard';
import { cn } from '@/lib/utils';

type Document = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  tags: string[];
  dateAdded: Date;
  size: number;
  summary?: string;
};

type FileTypeIconProps = {
  type: Document['type'];
  className?: string;
};

const FileTypeIcon: React.FC<FileTypeIconProps> = ({ type, className }) => {
  switch (type) {
    case 'pdf':
      return <FileText className={cn("text-red-500", className)} />;
    case 'image':
      return <Image className={cn("text-blue-500", className)} />;
    case 'doc':
      return <File className={cn("text-blue-400", className)} />;
    default:
      return <File className={cn("text-gray-500", className)} />;
  }
};

const DocumentsVault: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Q1 Strategy Document.pdf',
      type: 'pdf',
      tags: ['strategy', 'quarterly'],
      dateAdded: new Date('2025-01-15'),
      size: 1250000,
      summary: 'Q1 strategy document including OKRs and team assignments.'
    },
    {
      id: '2',
      name: 'Product Roadmap 2025.doc',
      type: 'doc',
      tags: ['roadmap', 'product'],
      dateAdded: new Date('2025-02-01'),
      size: 754000,
    },
    {
      id: '3',
      name: 'Team Photo.jpg',
      type: 'image',
      tags: ['team', 'photos'],
      dateAdded: new Date('2025-03-10'),
      size: 2500000,
    },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [enableSummary, setEnableSummary] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags))
  );
  
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => doc.tags.includes(tag));
    return matchesSearch && matchesTags;
  });
  
  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Process each uploaded file
    Array.from(files).forEach(file => {
      const fileType: Document['type'] = 
        file.type.includes('pdf') ? 'pdf' :
        file.type.includes('image') ? 'image' :
        file.type.includes('word') || file.type.includes('doc') ? 'doc' : 'other';
        
      const newDoc: Document = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: fileType,
        tags: [],
        dateAdded: new Date(),
        size: file.size,
      };
      
      setDocuments(prev => [...prev, newDoc]);
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Process each dropped file
    Array.from(files).forEach(file => {
      const fileType: Document['type'] = 
        file.type.includes('pdf') ? 'pdf' :
        file.type.includes('image') ? 'image' :
        file.type.includes('word') || file.type.includes('doc') ? 'doc' : 'other';
        
      const newDoc: Document = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        type: fileType,
        tags: [],
        dateAdded: new Date(),
        size: file.size,
      };
      
      setDocuments(prev => [...prev, newDoc]);
    });
  };
  
  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Documents Vault</h1>
      
      {/* Upload Area */}
      <div 
        className="neumorph p-6 mb-8 border-2 border-dashed border-bell-muted rounded-xl text-center cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />
        <FilePlus className="w-12 h-12 mx-auto mb-3 text-bell-primary" />
        <p className="mb-2">Drag and drop files here or click to browse</p>
        <p className="text-sm text-bell-muted">Supports all document and image formats</p>
      </div>
      
      {/* Search and Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bell-muted" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-10 w-full shadow-neumorph-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Tag className="text-bell-muted" />
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm",
                  selectedTags.includes(tag)
                    ? "bg-bell-primary text-white"
                    : "bg-bell-subtle text-bell-foreground"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        
        {/* Auto-summarization Toggle */}
        <div className="flex items-center gap-2">
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={enableSummary}
                onChange={() => setEnableSummary(!enableSummary)}
              />
              <div className={`w-10 h-5 rounded-full shadow-inner ${enableSummary ? 'bg-bell-primary' : 'bg-bell-muted'}`}></div>
              <div className={`absolute w-4 h-4 rounded-full transition-transform ${enableSummary ? 'transform translate-x-5 bg-white' : 'bg-white'} top-0.5 left-0.5`}></div>
            </div>
            <span className="ml-2 text-sm">Enable Auto-Summary</span>
          </label>
        </div>
      </div>
      
      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map(doc => (
          <NeumorphCard key={doc.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-lg bg-bell-subtle">
                <FileTypeIcon type={doc.type} className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{doc.name}</h3>
                <div className="flex items-center text-sm text-bell-muted mt-1">
                  <span>{doc.dateAdded.toLocaleDateString()}</span>
                  <span className="mx-2">•</span>
                  <span>{formatFileSize(doc.size)}</span>
                </div>
                
                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-bell-subtle text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Summary (if enabled and available) */}
                {enableSummary && doc.summary && (
                  <p className="text-sm mt-2 text-bell-muted line-clamp-2">{doc.summary}</p>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end mt-3 gap-2">
              <button 
                className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
                title="View document"
              >
                <ExternalLink className="w-4 h-4 text-bell-muted" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
                title="Assign to task"
              >
                <ClipboardList className="w-4 h-4 text-bell-muted" />
              </button>
              <button 
                className="p-2 rounded-full hover:bg-bell-subtle transition-colors"
                title="Delete document"
                onClick={() => handleDeleteDocument(doc.id)}
              >
                <Trash2 className="w-4 h-4 text-bell-muted" />
              </button>
            </div>
          </NeumorphCard>
        ))}
      </div>
      
      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className="text-center py-10">
          <File className="w-12 h-12 mx-auto mb-4 text-bell-muted" />
          <h3 className="text-lg font-medium mb-1">No documents found</h3>
          <p className="text-bell-muted">
            {searchTerm || selectedTags.length > 0 
              ? "Try adjusting your search or filters" 
              : "Upload your first document to get started"}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentsVault;
