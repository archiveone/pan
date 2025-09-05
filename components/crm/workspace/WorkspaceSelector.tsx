'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Settings, Users, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

interface WorkspaceSelectorProps {
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSelector({ onWorkspaceChange }: WorkspaceSelectorProps) {
  const { data: session } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state for creating new workspace
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchWorkspaces();
  }, [session]);

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/crm/workspaces');
      const data = await response.json();
      setWorkspaces(data);
      if (data.length > 0) {
        setSelectedWorkspace(data[0]);
        onWorkspaceChange?.(data[0].id);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch('/api/crm/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWorkspace),
      });

      if (response.ok) {
        const workspace = await response.json();
        setWorkspaces([...workspaces, workspace]);
        setSelectedWorkspace(workspace);
        onWorkspaceChange?.(workspace.id);
        setIsCreateDialogOpen(false);
        setNewWorkspace({ name: '', description: '' });
      }
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    onWorkspaceChange?.(workspace.id);
  };

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center">
              {selectedWorkspace ? (
                <>
                  <span className="font-medium">{selectedWorkspace.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {selectedWorkspace.role}
                  </Badge>
                </>
              ) : (
                'Select Workspace'
              )}
            </div>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleWorkspaceSelect(workspace)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span>{workspace.name}</span>
                <Badge variant="secondary" className="ml-2">
                  {workspace.role}
                </Badge>
              </div>
              <Badge variant="outline">{workspace.memberCount}</Badge>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsCreateDialogOpen(true)}
            className="text-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your CRM data and collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={newWorkspace.name}
                onChange={(e) =>
                  setNewWorkspace({ ...newWorkspace, name: e.target.value })
                }
                placeholder="Enter workspace name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newWorkspace.description}
                onChange={(e) =>
                  setNewWorkspace({ ...newWorkspace, description: e.target.value })
                }
                placeholder="Enter workspace description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWorkspace}>Create Workspace</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Workspace Settings Button */}
      {selectedWorkspace && (
        <div className="mt-2 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {/* Navigate to workspace settings */}}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => {/* Open members dialog */}}
          >
            <Users className="h-4 w-4 mr-2" />
            Members ({selectedWorkspace.memberCount})
          </Button>
        </div>
      )}
    </div>
  );
}