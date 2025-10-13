import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskTemplate {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  dow: string[];
  requires_image: boolean;
  requires_gps: boolean;
  created_at: string;
}

const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const TaskTemplates = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { isHQAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    frequency: 'DAILY' as 'DAILY' | 'WEEKLY' | 'CUSTOM',
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
      toast.error(t('errors.failedToLoadTemplates'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const templateData = {
        ...formData,
        dow: formData.frequency === 'DAILY' ? [] : formData.dow,
        created_by: user?.id
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from('task_templates')
          .update(templateData)
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success(t('success.templateUpdated'));
      } else {
        const { error } = await supabase
          .from('task_templates')
          .insert([templateData]);

        if (error) throw error;
        toast.success(t('success.templateCreated'));
      }

      setShowDialog(false);
      setEditingTemplate(null);
      resetForm();
      await fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error(t('errors.failedToSaveTemplate'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('taskTemplates.deleteConfirm'))) return;

    try {
      const { error } = await supabase
        .from('task_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(t('success.templateDeleted'));
      await fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error(t('errors.failedToDeleteTemplate'));
    }
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description || '',
      category: template.category || '',
      priority: template.priority,
      frequency: template.frequency,
      dow: template.dow || [],
      requires_image: template.requires_image,
      requires_gps: template.requires_gps
    });
    setShowDialog(true);
  };

  const resetForm = () => {
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
            <CardTitle>{t('taskTemplates.accessRestricted')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('taskTemplates.hqOnly')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              {t('taskTemplates.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('taskTemplates.subtitle')}
            </p>
          </div>

          <Button onClick={() => { resetForm(); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            {t('taskTemplates.newTemplate')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.title}</CardTitle>
                    {template.description && (
                      <CardDescription className="mt-1 line-clamp-2">
                        {template.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={
                    template.priority === 'critical' ? 'destructive' :
                    template.priority === 'high' ? 'destructive' :
                    template.priority === 'medium' ? 'secondary' :
                    'outline'
                  }>
                    {t(`tasks.${template.priority}`)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{template.frequency}</span>
                  {template.dow && template.dow.length > 0 && (
                    <span className="text-muted-foreground">
                      ({template.dow.join(', ')})
                    </span>
                  )}
                </div>

                {template.category && (
                  <Badge variant="outline">{template.category}</Badge>
                )}

                <div className="flex gap-2 text-xs">
                  {template.requires_image && (
                    <Badge variant="secondary">{t('taskTemplates.photoRequired')}</Badge>
                  )}
                  {template.requires_gps && (
                    <Badge variant="secondary">{t('taskTemplates.gpsRequired')}</Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t('common.delete')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {t('taskTemplates.noTemplates')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? t('taskTemplates.editTemplate') : t('taskTemplates.createTemplate')}
            </DialogTitle>
            <DialogDescription>
              {t('taskTemplates.configureRecurring')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t('taskTemplates.titleLabel')}</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('taskTemplates.titlePlaceholder')}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., operations"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Priority *</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
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
            </div>

            <div>
              <label className="text-sm font-medium">Frequency *</label>
              <Select
                value={formData.frequency}
                onValueChange={(value: any) => setFormData({ ...formData, frequency: value, dow: [] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="CUSTOM">Custom Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.frequency === 'WEEKLY' || formData.frequency === 'CUSTOM') && (
              <div>
                <label className="text-sm font-medium mb-2 block">Days *</label>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.dow.includes(day)}
                        onCheckedChange={() => toggleDay(day)}
                        id={day}
                      />
                      <label htmlFor={day} className="text-sm cursor-pointer">
                        {t(`taskTemplates.${day.toLowerCase()}`)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.requires_image}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, requires_image: checked as boolean })
                  }
                  id="requires_image"
                />
                <label htmlFor="requires_image" className="text-sm cursor-pointer">
                  Requires photo evidence
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.requires_gps}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, requires_gps: checked as boolean })
                  }
                  id="requires_gps"
                />
                <label htmlFor="requires_gps" className="text-sm cursor-pointer">
                  Requires GPS location
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskTemplates;
