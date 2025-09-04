'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadStatus, ContactType } from '@prisma/client';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source: string;
  propertyId?: string;
  createdAt: Date;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: ContactType;
  lastContact?: Date;
  notes?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  relatedTo?: {
    type: 'LEAD' | 'CONTACT' | 'PROPERTY';
    id: string;
    name: string;
  };
}

export default function CRMDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCRMData = async () => {
    try {
      const [leadsRes, contactsRes, tasksRes] = await Promise.all([
        fetch('/api/crm/leads'),
        fetch('/api/crm/contacts'),
        fetch('/api/crm/tasks'),
      ]);

      if (!leadsRes.ok || !contactsRes.ok || !tasksRes.ok) {
        throw new Error('Failed to fetch CRM data');
      }

      const [leadsData, contactsData, tasksData] = await Promise.all([
        leadsRes.json(),
        contactsRes.json(),
        tasksRes.json(),
      ]);

      setLeads(leadsData);
      setContacts(contactsData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching CRM data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Stats cards for quick overview
  const StatsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leads.length}</div>
          <p className="text-xs text-muted-foreground">
            {leads.filter(l => l.status === 'NEW').length} new leads
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Active Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{contacts.length}</div>
          <p className="text-xs text-muted-foreground">
            {contacts.filter(c => c.type === 'CLIENT').length} clients
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tasks.filter(t => !t.completed).length}
          </div>
          <p className="text-xs text-muted-foreground">
            {tasks.filter(t => !t.completed && t.priority === 'HIGH').length} high priority
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CRM Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push('/dashboard/crm/leads/new')}>
            Add Lead
          </Button>
          <Button onClick={() => router.push('/dashboard/crm/contacts/new')}>
            Add Contact
          </Button>
          <Button onClick={() => router.push('/dashboard/crm/tasks/new')}>
            Add Task
          </Button>
        </div>
      </div>

      <StatsSection />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No leads found. Start by adding your first lead.
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map(lead => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{lead.name}</h3>
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' :
                          lead.status === 'LOST' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lead.status}
                        </span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading contacts...</div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No contacts found. Start by adding your first contact.
                </div>
              ) : (
                <div className="space-y-4">
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <p className="text-sm text-gray-500">{contact.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded text-sm bg-gray-100">
                          {contact.type}
                        </span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No tasks found. Start by adding your first task.
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                          task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}