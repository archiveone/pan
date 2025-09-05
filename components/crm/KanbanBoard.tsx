'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  User,
  DollarSign,
  Tag,
  MoreVertical,
} from 'lucide-react';

import { enhancedAnalytics } from '@/lib/analytics/enhanced-tracking';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const KANBAN_COLUMNS = [
  {
    id: 'NEW',
    title: 'New Leads',
    color: 'bg-blue-500',
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    color: 'bg-yellow-500',
  },
  {
    id: 'FOLLOW_UP',
    title: 'Follow Up',
    color: 'bg-purple-500',
  },
  {
    id: 'CLOSED',
    title: 'Closed',
    color: 'bg-green-500',
  },
];

interface KanbanBoardProps {
  userId?: string;
}

export function KanbanBoard({ userId }: KanbanBoardProps) {
  const { data: session } = useSession();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [session, userId]);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(\`/api/crm/cards?userId=\${userId || session?.user?.id}\`);
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
    setIsLoading(false);
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Optimistically update the UI
    const newCards = Array.from(cards);
    const [removed] = newCards.splice(source.index, 1);
    const updatedCard = { ...removed, status: destination.droppableId };
    newCards.splice(destination.index, 0, updatedCard);
    setCards(newCards);

    // Update the backend
    try {
      await fetch(\`/api/crm/cards/\${draggableId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      });

      // Track the status change in analytics
      await enhancedAnalytics.trackCRMEvent({
        userId: userId || session?.user?.id,
        listingId: draggableId,
        eventType: 'STATUS_CHANGE',
        status: destination.droppableId,
        priority: updatedCard.priority,
      });
    } catch (error) {
      console.error('Error updating card status:', error);
      // Revert the UI if the update fails
      setCards(cards);
    }
  };

  const handleCardUpdate = async (cardId: string, updates: any) => {
    try {
      const response = await fetch(\`/api/crm/cards/\${cardId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setCards(cards.map(card => card.id === cardId ? updatedCard : card));
        
        // Track the update in analytics
        await enhancedAnalytics.trackCRMEvent({
          userId: userId || session?.user?.id,
          listingId: cardId,
          eventType: 'CARD_UPDATE',
          ...updates,
        });
      }
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const handleAddNote = async (cardId: string, note: string) => {
    try {
      const response = await fetch(\`/api/crm/cards/\${cardId}/notes\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });

      if (response.ok) {
        const updatedCard = await response.json();
        setCards(cards.map(card => card.id === cardId ? updatedCard : card));
        
        // Track the note addition in analytics
        await enhancedAnalytics.trackCRMEvent({
          userId: userId || session?.user?.id,
          listingId: cardId,
          eventType: 'NOTE_ADDED',
          note,
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <div className="p-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map(column => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold">{column.title}</h3>
                </div>
                <Badge variant="secondary">
                  {cards.filter(card => card.status === column.id).length}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] rounded-lg p-2 ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-muted/10'
                    }`}
                  >
                    <AnimatePresence>
                      {cards
                        .filter(card => card.status === column.id)
                        .map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
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
                              >
                                <Card className={`${
                                  snapshot.isDragging ? 'ring-2 ring-primary' : ''
                                }`}>
                                  <CardHeader className="p-4">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="text-sm font-medium">
                                          {card.title}
                                        </CardTitle>
                                        <CardDescription>
                                          {card.listingType} - {card.location}
                                        </CardDescription>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                          <DropdownMenuItem onClick={() => {
                                            setSelectedCard(card);
                                            setIsCardDialogOpen(true);
                                          }}>
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem>Edit</DropdownMenuItem>
                                          <DropdownMenuItem>Archive</DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="p-4 pt-0">
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                      <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        {card.value}
                                      </div>
                                      <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {formatTimeAgo(card.lastUpdated)}
                                      </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={card.assignedTo?.avatar} />
                                          <AvatarFallback>
                                            {getInitials(card.assignedTo?.name)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <Badge variant={getPriorityVariant(card.priority)}>
                                          {card.priority}
                                        </Badge>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-xs">{card.notes?.length || 0}</span>
                                      </div>
                                    </div>
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

      {/* Card Detail Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedCard && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCard.title}</DialogTitle>
                <DialogDescription>
                  {selectedCard.listingType} - {selectedCard.location}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={selectedCard.status}
                      onValueChange={(value) =>
                        handleCardUpdate(selectedCard.id, { status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {KANBAN_COLUMNS.map(column => (
                          <SelectItem key={column.id} value={column.id}>
                            {column.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={selectedCard.priority}
                      onValueChange={(value) =>
                        handleCardUpdate(selectedCard.id, { priority: value })
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
                  <Label>Notes</Label>
                  <div className="mt-2 space-y-2">
                    {selectedCard.notes?.map((note: any, index: number) => (
                      <div key={index} className="flex items-start space-x-2 p-2 rounded-lg bg-muted">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={note.author.avatar} />
                          <AvatarFallback>{getInitials(note.author.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{note.author.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(note.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{note.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Textarea
                      placeholder="Add a note..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNote(selectedCard.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Information</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{selectedCard.contact.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{selectedCard.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-sm">{selectedCard.contact.email}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Activity Timeline</Label>
                    <div className="mt-2 space-y-2">
                      {selectedCard.activities?.map((activity: any, index: number) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          {getActivityIcon(activity.type)}
                          <span>{activity.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper Functions
function getInitials(name: string) {
  return name
    ?.split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase() || '??';
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'default';
    case 'LOW':
      return 'secondary';
    default:
      return 'outline';
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'NOTE':
      return <MessageSquare className="h-4 w-4" />;
    case 'STATUS_CHANGE':
      return <Tag className="h-4 w-4" />;
    case 'FOLLOW_UP':
      return <Calendar className="h-4 w-4" />;
    case 'ALERT':
      return <AlertCircle className="h-4 w-4" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
}

function formatTimeAgo(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return \`\${seconds}s ago\`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return \`\${minutes}m ago\`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return \`\${hours}h ago\`;
  const days = Math.floor(hours / 24);
  return \`\${days}d ago\`;
}