import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface TaskWithLocation {
  id: string;
  title: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  store_id: string;
  stores: {
    name: string;
    latitude: number | null;
    longitude: number | null;
  };
}

const TaskMap = () => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [tasks, setTasks] = useState<TaskWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<TaskWithLocation | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    fetchMapboxToken();
    fetchTasksWithLocation();
  }, [user]);

  const fetchMapboxToken = async () => {
    // In production, fetch from edge function that has the secret
    // For now, using environment variable
    const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || '';
    setMapboxToken(token);
  };

  const fetchTasksWithLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          stores:store_id (
            name,
            latitude,
            longitude
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .limit(100);

      if (error) throw error;
      setTasks(data as any || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || tasks.length === 0) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: tasks[0] ? [tasks[0].longitude, tasks[0].latitude] : [0, 0],
      zoom: 12
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for each task
    tasks.forEach(task => {
      const el = document.createElement('div');
      el.className = 'task-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '18px';
      
      // Color based on status
      if (task.status === 'completed') {
        el.style.backgroundColor = '#22c55e';
        el.innerHTML = '✓';
      } else if (task.status === 'in_progress') {
        el.style.backgroundColor = '#f59e0b';
        el.innerHTML = '⋯';
      } else {
        el.style.backgroundColor = '#ef4444';
        el.innerHTML = '!';
      }
      
      el.style.color = 'white';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([task.longitude, task.latitude])
        .addTo(map.current!);

      el.addEventListener('click', () => {
        setSelectedTask(task);
        map.current?.flyTo({
          center: [task.longitude, task.latitude],
          zoom: 16
        });
      });

      // Add popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${task.title}</h3>
            <p style="font-size: 12px; color: #666;">${task.stores.name}</p>
            <p style="font-size: 12px; margin-top: 4px;">
              Status: <strong>${task.status}</strong>
            </p>
          </div>
        `);

      marker.setPopup(popup);
    });

    // Fit bounds to show all markers
    if (tasks.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      tasks.forEach(task => {
        bounds.extend([task.longitude, task.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

    return () => {
      map.current?.remove();
    };
  }, [tasks, mapboxToken]);

  // Check geofencing
  const checkGeofence = (taskLat: number, taskLng: number, userLat: number, userLng: number): boolean => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = taskLat * Math.PI / 180;
    const φ2 = userLat * Math.PI / 180;
    const Δφ = (userLat - taskLat) * Math.PI / 180;
    const Δλ = (userLng - taskLng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in meters
    return distance <= 150; // Within 150m
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Mapbox Token Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please add your Mapbox public token to the Supabase secrets to enable the map.
            </p>
            <p className="text-sm text-muted-foreground">
              Get your token from: <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {/* Legend */}
          <div className="absolute top-4 left-4 bg-background border rounded-lg p-4 shadow-lg">
            <h3 className="font-semibold mb-2">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">✓</div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">⋯</div>
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">!</div>
                <span>Not Started</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l bg-background overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Task Locations
          </h2>

          {selectedTask && (
            <Card className="mb-4">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{selectedTask.title}</CardTitle>
                  <Badge variant={
                    selectedTask.status === 'completed' ? 'default' :
                    selectedTask.status === 'in_progress' ? 'secondary' :
                    'destructive'
                  }>
                    {selectedTask.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedTask.stores.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTask.latitude.toFixed(6)}, {selectedTask.longitude.toFixed(6)}
                  </p>
                </div>

                {selectedTask.image_url && (
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={selectedTask.image_url}
                      alt="Task evidence"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {!selectedTask.image_url && (
                  <div className="bg-muted rounded-lg p-8 text-center">
                    <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No photo evidence</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold">All Tasks ({tasks.length})</h3>
            {tasks.map(task => (
              <Card 
                key={task.id}
                className={`cursor-pointer transition-colors ${
                  selectedTask?.id === task.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedTask(task);
                  map.current?.flyTo({
                    center: [task.longitude, task.latitude],
                    zoom: 16
                  });
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.stores.name}
                      </p>
                    </div>
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'in_progress' ? 'secondary' :
                      'outline'
                    } className="text-xs">
                      {task.status}
                    </Badge>
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

export default TaskMap;
