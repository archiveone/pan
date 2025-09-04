'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FileUpload } from '@/components/file-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFileSize, getFileIcon } from '@/app/api/files/presigned/route';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  FileIcon,
  FolderIcon,
  MoreVerticalIcon,
  SearchIcon,
  TrashIcon,
  PencilIcon,
} from 'lucide-react';

interface File {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  folder: string;
  description?: string;
  createdAt: Date;
  property?: {
    id: string;
    title: string;
  };
  lead?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    name: string;
  };
}

export default function FilesPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder, selectedType, searchQuery]);

  const fetchFiles = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFolder !== 'all') params.append('folder', selectedFolder);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/files?${params}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (fileUrl: string) => {
    // File upload handled by FileUpload component
    // Refresh file list after successful upload
    fetchFiles();
  };

  const handleDelete = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete file');

      toast.success('File deleted successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleEdit = async (fileId: string, updates: Partial<File>) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update file');

      toast.success('File updated successfully');
      fetchFiles();
    } catch (error) {
      console.error('Error updating file:', error);
      toast.error('Failed to update file');
    }
  };

  const getFolderIcon = (folder: string) => {
    switch (folder) {
      case 'properties':
        return '🏠';
      case 'leads':
        return '👥';
      case 'contracts':
        return '📄';
      default:
        return '📁';
    }
  };

  const getRelatedItemLink = (file: File) => {
    if (file.property) {
      return (
        <a
          href={`/properties/${file.property.id}`}
          className="text-blue-500 hover:underline"
        >
          {file.property.title}
        </a>
      );
    }
    if (file.lead) {
      return (
        <a
          href={`/crm/leads/${file.lead.id}`}
          className="text-blue-500 hover:underline"
        >
          {file.lead.name}
        </a>
      );
    }
    if (file.contact) {
      return (
        <a
          href={`/crm/contacts/${file.contact.id}`}
          className="text-blue-500 hover:underline"
        >
          {file.contact.name}
        </a>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Files</h1>
        <Button onClick={() => setShowUploadModal(true)}>Upload Files</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(
                files.reduce((acc, file) => acc + (file.size || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {files.filter(f => f.type.startsWith('image/')).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {files.filter(f => !f.type.startsWith('image/')).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            prefix={<SearchIcon className="w-4 h-4 text-gray-400" />}
          />
        </div>
        <Select
          value={selectedFolder}
          onValueChange={setSelectedFolder}
          className="w-48"
        >
          <option value="all">All Folders</option>
          <option value="properties">Properties</option>
          <option value="leads">Leads</option>
          <option value="contracts">Contracts</option>
          <option value="general">General</option>
        </Select>
        <Select
          value={selectedType}
          onValueChange={setSelectedType}
          className="w-48"
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="document">Documents</option>
          <option value="pdf">PDFs</option>
          <option value="spreadsheet">Spreadsheets</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Folder</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading files...
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No files found
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileIcon className="w-4 h-4 text-gray-400" />
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {file.name}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getFolderIcon(file.folder)}
                        {file.folder}
                      </div>
                    </TableCell>
                    <TableCell>{file.type}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{getRelatedItemLink(file)}</TableCell>
                    <TableCell>
                      {format(new Date(file.createdAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVerticalIcon className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              // Open edit modal
                            }}
                          >
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                onUploadComplete={(fileUrl) => {
                  handleFileUpload(fileUrl);
                  setShowUploadModal(false);
                }}
                folder={selectedFolder === 'all' ? 'general' : selectedFolder}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}