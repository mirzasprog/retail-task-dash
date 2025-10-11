import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  dow: string[];
  requires_image: boolean | null;
  requires_gps: boolean | null;
  created_at: string;
}

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_LABELS: { [key: string]: string } = {
  'MON': 'Monday',
  'TUE': 'Tuesday',
  'WED': 'Wednesday',
  'THU': 'Thursday',
  'FRI': 'Friday',
  'SAT': 'Saturday',
  'SUN': 'Sunday'
};

const TaskTemplates = () => {
  const { user } = useAuth();
  const { isHQAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as TaskTemplate['priority'],
    frequency: 'DAILY' as TaskTemplate['frequency'],
    dow: [] as string[],
    requires_image: false,
    requires_gps: false
  });

  useEffect(() => {
    if (isHQAdmin) {
      fetchTemplates();
    }
  }, [isHQAdmin]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('task_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates((data as any) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if ((formData.frequency === 'WEEKLY' || formData.frequency === 'CUSTOM') && formData.dow.length === 0) {
      toast.error('Please select at least one day of the week');
      return;
    }

    try {
      const templateData = {
        ...formData,
        dow: formData.frequency === 'DAILY' ? [] : formData.dow,
        created_by: user?.id
      };

      if (editing) {
        const { error } = await supabase
          .from('task_templates')
          .update(templateData)
          .eq('id', editing);

        if (error) throw error;
        toast.success('Template updated!');
      } else {
        const { error } = await supabase
          .from('task_templates')
          .insert(templateData);

        if (error) throw error;
        toast.success('Template created!');
      }

      resetForm();
      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditing(template.id);
    setFormData({
      title: template.title,
      description: template.description || '',
      category: template.category || '',
      priority: template.priority,
      frequency: template.frequency,
      dow: template.dow || [],
      requires_image: template.requires_image || false,
      requires_gps: template.requires_gps || false
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template deleted');
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: 'medium',
      frequency: 'DAILY',
      dow: [],
      requires_image: false,
      requires_gps: false
    });
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      dow: prev.dow.includes(day)
        ? prev.dow.filter(d => d !== day)
        : [...prev.dow, day]
    }));
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isHQAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Task templates are only available for HQ administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" />
            Task Templates & Scheduling
          </h1>
          <p className="text-muted-foreground mt-1">
            Create recurring task templates that auto-generate daily tasks
          </p>
        </div>

        {/* Create/Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Template' : 'Create New Template'}</CardTitle>
            <CardDescription>
              Define a task template with recurrence pattern
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Morning Opening Checklist"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., operations, inventory"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed task description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value as any, dow: [] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly (specific days)</SelectItem>
                    <SelectItem value="CUSTOM">Custom Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(formData.frequency === 'WEEKLY' || formData.frequency === 'CUSTOM') && (
              <div className="space-y-2">
                <Label>Days of Week *</Label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <Badge
                      key={day}
                      variant={formData.dow.includes(day) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleDay(day)}
                    >
                      {DAY_LABELS[day]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires_image"
                  checked={formData.requires_image}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_image: checked as boolean })}
                />
                <Label htmlFor="requires_image" className="cursor-pointer">
                  Requires Photo
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="requires_gps"
                  checked={formData.requires_gps}
                  onCheckedChange={(checked) => setFormData({ ...formData, requires_gps: checked as boolean })}
                />
                <Label htmlFor="requires_gps" className="cursor-pointer">
                  Requires GPS Location
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                {editing ? 'Update Template' : 'Create Template'}
              </Button>
              {editing && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Existing Templates ({templates.length})</h2>
          <div className="grid gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      {template.description && (
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{template.priority}</Badge>
                    <Badge variant="outline">{template.frequency}</Badge>
                    {template.category && <Badge variant="secondary">{template.category}</Badge>}
                    {template.frequency !== 'DAILY' && template.dow && template.dow.length > 0 && (
                      <Badge variant="outline">
                        {template.dow.map(d => DAY_LABELS[d]).join(', ')}
                      </Badge>
                    )}
                    {template.requires_image && <Badge variant="outline">📷 Photo</Badge>}
                    {template.requires_gps && <Badge variant="outline">📍 GPS</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskTemplates;
