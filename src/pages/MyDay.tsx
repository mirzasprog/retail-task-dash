import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Camera, 
  Upload,
  MapPin,
  AlertCircle,
  PlayCircle,
  CheckCheck,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  due_date: string;
  image_url: string | null;
  comments: string | null;
  latitude: number | null;
  longitude: number | null;
}

const MyDay = () => {
  const { user } = useAuth();
  const { isStoreManager, loading: roleLoading } = useUserRole(user?.id);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user && isStoreManager) {
      fetchTodayTasks();
    }
  }, [user, isStoreManager]);

  const fetchTodayTasks = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('due_date', today)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load today\'s tasks');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setUpdatingTask(taskId);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.completed_by = user?.id;
      }

      if (comments[taskId]) {
        updateData.comments = comments[taskId];
      }

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) throw error;

      // Log task history
      await supabase.from('task_history').insert({
        task_id: taskId,
        user_id: user?.id,
        action: 'status_change',
        old_status: tasks.find(t => t.id === taskId)?.status,
        new_status: newStatus,
        comments: comments[taskId] || null
      });

      setTasks(tasks.map(t => 
        t.id === taskId 
          ? { ...t, status: newStatus, comments: comments[taskId] || t.comments }
          : t
      ));

      toast.success(`Task ${newStatus === 'completed' ? 'completed' : 'updated'}!`);
      setComments({ ...comments, [taskId]: '' });
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setUpdatingTask(null);
    }
  };

  const handlePhotoUpload = async (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      // For now, we'll store the image as base64 in the database
      // In production, you'd upload to Supabase Storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const { error } = await supabase
          .from('tasks')
          .update({ 
            image_url: base64String,
            updated_at: new Date().toISOString()
          })
          .eq('id', taskId);

        if (error) throw error;

        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, image_url: base64String } : t
        ));

        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const captureLocation = async (taskId: string) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { error } = await supabase
            .from('tasks')
            .update({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

          if (error) throw error;

          setTasks(tasks.map(t => 
            t.id === taskId 
              ? { 
                  ...t, 
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                }
              : t
          ));

          toast.success('Location captured!');
        } catch (error) {
          console.error('Error saving location:', error);
          toast.error('Failed to save location');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Failed to get your location');
      }
    );
  };

  const bulkComplete = async () => {
    const incompleteTasks = tasks.filter(t => t.status !== 'completed');
    
    if (incompleteTasks.length === 0) {
      toast.info('All tasks are already completed!');
      return;
    }

    try {
      const updates = incompleteTasks.map(task => 
        supabase
          .from('tasks')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            completed_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)
      );

      await Promise.all(updates);

      setTasks(tasks.map(t => ({
        ...t,
        status: 'completed' as const
      })));

      toast.success(`${incompleteTasks.length} tasks completed!`);
    } catch (error) {
      console.error('Error bulk completing tasks:', error);
      toast.error('Failed to complete tasks');
    }
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStoreManager) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Access Restricted
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This view is only available for store managers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-warning" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-1">My Day</h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            
            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {completedCount} of {tasks.length} completed
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={bulkComplete}
                disabled={completedCount === tasks.length}
                className="flex-1"
                variant="outline"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Complete All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks for today!</p>
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card 
                key={task.id}
                className={`${selectedTask === task.id ? 'ring-2 ring-primary' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        {task.description && (
                          <CardDescription className="mt-1">
                            {task.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(task.priority) as any}>
                      {task.priority}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Photo Preview */}
                  {task.image_url && (
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={task.image_url} 
                        alt="Task evidence" 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Location Info */}
                  {task.latitude && task.longitude && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Location captured</span>
                    </div>
                  )}

                  {/* Comments */}
                  {task.status !== 'completed' && (
                    <Textarea
                      placeholder="Add notes or comments..."
                      value={comments[task.id] || ''}
                      onChange={(e) => setComments({ ...comments, [task.id]: e.target.value })}
                      className="min-h-[60px]"
                    />
                  )}

                  {task.comments && (
                    <div className="text-sm bg-muted p-3 rounded-lg">
                      <p className="font-medium mb-1">Notes:</p>
                      <p className="text-muted-foreground">{task.comments}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {task.status !== 'completed' && (
                      <>
                        {/* Photo Upload */}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={(e) => handlePhotoUpload(task.id, e)}
                            className="hidden"
                            id={`photo-${task.id}`}
                            disabled={uploadingPhoto}
                          />
                          <label htmlFor={`photo-${task.id}`}>
                            <Button
                              variant="outline"
                              className="w-full"
                              disabled={uploadingPhoto}
                              asChild
                            >
                              <span>
                                <Camera className="h-4 w-4 mr-2" />
                                Photo
                              </span>
                            </Button>
                          </label>
                        </div>

                        {/* Location */}
                        <Button
                          variant="outline"
                          onClick={() => captureLocation(task.id)}
                          disabled={!!task.latitude}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          {task.latitude ? 'Located' : 'Location'}
                        </Button>

                        {/* Start/Complete */}
                        {task.status === 'not_started' && (
                          <Button
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            disabled={updatingTask === task.id}
                            className="col-span-2"
                            variant="outline"
                          >
                            {updatingTask === task.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <PlayCircle className="h-4 w-4 mr-2" />
                            )}
                            Start Task
                          </Button>
                        )}

                        {task.status === 'in_progress' && (
                          <Button
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            disabled={updatingTask === task.id}
                            className="col-span-2"
                          >
                            {updatingTask === task.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Complete Task
                          </Button>
                        )}
                      </>
                    )}

                    {task.status === 'completed' && (
                      <div className="col-span-2 text-center py-2 text-success font-medium">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDay;
