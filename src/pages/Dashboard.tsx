import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  AlertTriangle,
  Clock,
  Users,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Clock3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
}

const KPICard = ({ title, value, change, icon, trend, status }: KPICardProps) => {
  const statusColors = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive'
  };

  return (
    <Card className="bg-gradient-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={statusColors[status]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center mt-1">
          {trend === 'up' ? (
            <TrendingUp className={`h-4 w-4 mr-1 ${change > 0 ? 'text-success' : 'text-destructive'}`} />
          ) : (
            <TrendingDown className={`h-4 w-4 mr-1 ${change < 0 ? 'text-success' : 'text-destructive'}`} />
          )}
          {Math.abs(change)}% from yesterday
        </p>
      </CardContent>
    </Card>
  );
};

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'done';
  priority: 'high' | 'medium' | 'low';
  time: string;
}

const TaskItem = ({ task }: { task: Task }) => {
  const statusIcons = {
    pending: <Circle className="h-4 w-4 text-muted-foreground" />,
    'in-progress': <Clock3 className="h-4 w-4 text-warning" />,
    done: <CheckCircle2 className="h-4 w-4 text-success" />
  };

  const priorityColors = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary'
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div className="flex items-center gap-3">
        {statusIcons[task.status]}
        <div>
          <p className="text-sm font-medium">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.time}</p>
        </div>
      </div>
      <Badge variant={priorityColors[task.priority] as any}>
        {task.priority}
      </Badge>
    </div>
  );
};

const Dashboard = () => {
  const [selectedStore, setSelectedStore] = useState("store-1");

  const stores = [
    { id: "store-1", name: "Store #001 - City Center" },
    { id: "store-2", name: "Store #002 - Mall West" },
    { id: "store-3", name: "Store #003 - North Plaza" },
  ];

  const kpiData = [
    {
      title: "Daily Sales",
      value: "€12,345",
      change: 8.5,
      icon: <DollarSign className="h-4 w-4" />,
      trend: 'up' as const,
      status: 'good' as const
    },
    {
      title: "Shrinkage",
      value: "0.8%",
      change: -0.3,
      icon: <AlertTriangle className="h-4 w-4" />,
      trend: 'down' as const,
      status: 'good' as const
    },
    {
      title: "Availability",
      value: "96.2%",
      change: 2.1,
      icon: <Package className="h-4 w-4" />,
      trend: 'up' as const,
      status: 'good' as const
    },
    {
      title: "SCO Uptime",
      value: "98.5%",
      change: 1.2,
      icon: <ShoppingCart className="h-4 w-4" />,
      trend: 'up' as const,
      status: 'good' as const
    },
    {
      title: "Queue Time",
      value: "2.3 min",
      change: -15.2,
      icon: <Clock className="h-4 w-4" />,
      trend: 'down' as const,
      status: 'good' as const
    },
    {
      title: "Cash Variance",
      value: "€12",
      change: -40,
      icon: <Users className="h-4 w-4" />,
      trend: 'down' as const,
      status: 'good' as const
    },
  ];

  const tasks: Task[] = [
    { id: '1', title: 'Opening checklist completion', status: 'done', priority: 'high', time: '08:00 AM' },
    { id: '2', title: 'Price verification - Fresh produce', status: 'in-progress', priority: 'high', time: '09:30 AM' },
    { id: '3', title: 'Shelf audit - Aisle 3-5', status: 'pending', priority: 'medium', time: '11:00 AM' },
    { id: '4', title: 'Bake-off quality check', status: 'done', priority: 'high', time: '07:00 AM' },
    { id: '5', title: 'Inventory count - Dairy section', status: 'pending', priority: 'medium', time: '02:00 PM' },
    { id: '6', title: 'Closing cash reconciliation', status: 'pending', priority: 'high', time: '08:00 PM' },
  ];

  const salesData = [
    { name: 'Mon', sales: 11200 },
    { name: 'Tue', sales: 10800 },
    { name: 'Wed', sales: 12100 },
    { name: 'Thu', sales: 11900 },
    { name: 'Fri', sales: 13400 },
    { name: 'Sat', sales: 15200 },
    { name: 'Sun', sales: 12345 },
  ];

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskProgress = (completedTasks / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Store Dashboard</h1>
            <p className="text-muted-foreground">Real-time insights and daily operations</p>
          </div>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stores.map(store => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Charts and Tasks Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Weekly Sales Trend</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Daily Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Tasks</CardTitle>
              <CardDescription>
                {completedTasks} of {tasks.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={taskProgress} className="h-2" />
              <div className="space-y-1 max-h-[240px] overflow-y-auto">
                {tasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
