'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreVertical,
  Filter,
  SortAsc,
  Search,
  Tag,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BoardItem {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  type: 'TASK' | 'LEAD' | 'DEAL';
  value?: number;
  lastUpdated: string;
}

interface BoardGroup {
  id: string;
  name: string;
  items: BoardItem[];
}

interface ModularBoardProps {
  type: 'TASKS' | 'LEADS' | 'DEALS';
  workspaceId: string;
  onItemUpdate?: (item: BoardItem) => void;
}

export function ModularBoard({ type, workspaceId, onItemUpdate }: ModularBoardProps) {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<BoardGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BoardItem | null>(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: '',
    assignee: '',
    tags: [] as string[],
  });

  useEffect(() => {
    fetchBoardData();
  }, [type, workspaceId]);

  const fetchBoardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        \`/api/crm/boards?type=\${type}&workspaceId=\${workspaceId}\`
      );
      const data = await response.json();
      setGroups(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching board data:', error);
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const sourceGroup = groups.find(g => g.id === source.droppableId);
    const destGroup = groups.find(g => g.id === destination.droppableId);

    if (!sourceGroup || !destGroup) return;

    // Create new groups array
    const newGroups = Array.from(groups);
    const sourceGroupIndex = newGroups.findIndex(g => g.id === source.droppableId);
    const destGroupIndex = newGroups.findIndex(g => g.id === destination.droppableId);

    // Remove item from source group
    const [movedItem] = newGroups[sourceGroupIndex].items.splice(source.index, 1);

    // Add item to destination group
    newGroups[destGroupIndex].items.splice(destination.index, 0, {
      ...movedItem,
      status: destGroup.id,
    });

    // Update state
    setGroups(newGroups);

    // Update backend
    try {
      await fetch(\`/api/crm/items/\${draggableId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destGroup.id }),
      });

      onItemUpdate?.(movedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert changes on error
      setGroups(groups);
    }
  };

  const handleCreateItem = async (newItem: Partial<BoardItem>) => {
    try {
      const response = await fetch('/api/crm/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          type,
          workspaceId,
        }),
      });

      if (response.ok) {
        const item = await response.json();
        const newGroups = Array.from(groups);
        const groupIndex = newGroups.findIndex(g => g.id === item.status);
        newGroups[groupIndex].items.push(item);
        setGroups(newGroups);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<BoardItem>) => {
    try {
      const response = await fetch(\`/api/crm/items/\${itemId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        const newGroups = groups.map(group => ({
          ...group,
          items: group.items.map(item =>
            item.id === itemId ? updatedItem : item
          ),
        }));
        setGroups(newGroups);
        onItemUpdate?.(updatedItem);
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const filteredGroups = groups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      const matchesSearch = item.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPriority = !filters.priority || item.priority === filters.priority;
      const matchesAssignee =
        !filters.assignee || item.assignedTo?.id === filters.assignee;
      const matchesTags =
        filters.tags.length === 0 ||
        filters.tags.every(tag => item.tags.includes(tag));
      return matchesSearch && matchesPriority && matchesAssignee && matchesTags;
    }),
  }));

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Label>Priority</Label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) =>
                    setFilters({ ...filters, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <SortAsc className="h-4 w-4 mr-2" />
            Sort
          </Button>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create {type === 'TASKS' ? 'Task' : type === 'LEADS' ? 'Lead' : 'Deal'}
        </Button>
      </div>

      {/* Board Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGroups.map((group) => (
            <div key={group.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{group.name}</h3>
                  <Badge variant="secondary">{group.items.length}</Badge>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>

              <Droppable droppableId={group.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={\`min-h-[500px] rounded-lg p-2 \${
                      snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-muted/10'
                    }\`}
                  >
                    <AnimatePresence>
                      {group.items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className="mb-2"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsItemDialogOpen(true);
                              }}
                            >
                              <Card className={\`\${
                                snapshot.isDragging ? 'ring-2 ring-primary' : ''
                              }\`}>
                                <CardHeader className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <CardTitle className="text-sm font-medium">
                                        {item.title}
                                      </CardTitle>
                                      {item.description && (
                                        <CardDescription>
                                          {item.description}
                                        </CardDescription>
                                      )}
                                    </div>
                                    <Badge
                                      variant={
                                        item.priority === 'HIGH'
                                          ? 'destructive'
                                          : item.priority === 'MEDIUM'
                                          ? 'default'
                                          : 'secondary'
                                      }
                                    >
                                      {item.priority}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center space-x-2">
                                      {item.assignedTo && (
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage
                                            src={item.assignedTo.avatar}
                                            alt={item.assignedTo.name}
                                          />
                                          <AvatarFallback>
                                            {item.assignedTo.name
                                              .split(' ')
                                              .map((n) => n[0])
                                              .join('')}
                                          </AvatarFallback>
                                        </Avatar>
                                      )}
                                      {item.dueDate && (
                                        <div className="flex items-center text-muted-foreground">
                                          <Calendar className="h-4 w-4 mr-1" />
                                          {new Date(item.dueDate).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                    {item.value && (
                                      <div className="font-medium">
                                        ${item.value.toLocaleString()}
                                      </div>
                                    )}
                                  </div>
                                  {item.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {item.tags.map((tag) => (
                                        <Badge
                                          key={tag}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Item Detail Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.title}</DialogTitle>
                <DialogDescription>
                  {type} Details
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedItem.status}
                      onValueChange={(value) =>
                        handleUpdateItem(selectedItem.id, { status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={selectedItem.priority}
                      onValueChange={(value: any) =>
                        handleUpdateItem(selectedItem.id, { priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={selectedItem.description}
                    onChange={(e) =>
                      handleUpdateItem(selectedItem.id, {
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter description"
                  />
                </div>
                {/* Add more fields based on type */}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create New {type === 'TASKS' ? 'Task' : type === 'LEADS' ? 'Lead' : 'Deal'}
            </DialogTitle>
          </DialogHeader>
          {/* Add create form */}
        </DialogContent>
      </Dialog>
    </div>
  );
}