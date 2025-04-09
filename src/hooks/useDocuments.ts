
import { useState, useRef } from 'react';
import { useDocumentUtils } from '@/utils/dataUtils';
import { useToast } from '@/hooks/use-toast';

export const useDocuments = () => {
  const { documents, addDocument, updateDocument, deleteDocument, searchDocuments } = useDocumentUtils();
  const [searchTerm, setSearchTerm] = useState('');
  const [enableSummary, setEnableSummary] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags))
  );
  
  const filteredDocuments = searchTerm || selectedTags.length > 0
    ? searchDocuments(searchTerm).filter(doc => 
        selectedTags.length === 0 || 
        selectedTags.some(tag => doc.tags.includes(tag))
      )
    : documents;

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
      const fileType: 'pdf' | 'image' | 'doc' | 'other' = 
        file.type.includes('pdf') ? 'pdf' :
        file.type.includes('image') ? 'image' :
        file.type.includes('word') || file.type.includes('doc') ? 'doc' : 'other';
      
      // For now, create a blob URL (in a real app this would be uploaded to Supabase Storage)
      const url = URL.createObjectURL(file);
      
      addDocument({
        name: file.name,
        type: fileType,
        url,
        tags: [],
        uploadDate: new Date(),
      });
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: 'Files uploaded',
      description: `${files.length} file(s) successfully uploaded.`,
    });
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    // Process each dropped file
    Array.from(files).forEach(file => {
      const fileType: 'pdf' | 'image' | 'doc' | 'other' = 
        file.type.includes('pdf') ? 'pdf' :
        file.type.includes('image') ? 'image' :
        file.type.includes('word') || file.type.includes('doc') ? 'doc' : 'other';
      
      // For now, create a blob URL (in a real app this would be uploaded to Supabase Storage)
      const url = URL.createObjectURL(file);
      
      addDocument({
        name: file.name,
        type: fileType,
        url,
        tags: [],
        uploadDate: new Date(),
      });
    });
    
    toast({
      title: 'Files uploaded',
      description: `${files.length} file(s) successfully uploaded.`,
    });
  };
  
  const handleDeleteDocument = (id: string) => {
    deleteDocument(id);
    
    toast({
      title: 'Document deleted',
      description: 'Document was successfully removed.',
    });
  };
  
  const addTagToDocument = (documentId: string, tag: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc && !doc.tags.includes(tag)) {
      updateDocument({
        ...doc,
        tags: [...doc.tags, tag]
      });
      
      toast({
        title: 'Tag added',
        description: `Tag "${tag}" added to document.`,
      });
    }
  };
  
  const removeTagFromDocument = (documentId: string, tag: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      updateDocument({
        ...doc,
        tags: doc.tags.filter(t => t !== tag)
      });
    }
  };
  
  const viewDocument = (url: string) => {
    window.open(url, '_blank');
  };
  
  const assignToTask = (documentId: string) => {
    toast({
      title: 'Assign to task',
      description: 'This feature is coming soon.',
    });
  };

  return {
    documents: filteredDocuments,
    allTags,
    searchTerm,
    setSearchTerm,
    enableSummary,
    setEnableSummary,
    selectedTags,
    fileInputRef,
    handleTagClick,
    handleFileUpload,
    handleDrop,
    handleDeleteDocument,
    addTagToDocument,
    removeTagFromDocument,
    viewDocument,
    assignToTask
  };
};
