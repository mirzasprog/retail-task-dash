import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";
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
  const { t } = useTranslation();
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
          {Math.abs(change)}% {t('dashboard.fromYesterday')}
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

  const { t } = useTranslation();
  
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
        {t(`tasks.${task.priority}`)}
      </Badge>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isStoreManager, isHQAdmin, loading: roleLoading } = useUserRole(user?.id);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [availableStores, setAvailableStores] = useState<Array<{ id: string; name: string }>>([]);
  const [userStoreId, setUserStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && !roleLoading) {
      fetchUserStores();
    }
  }, [user, roleLoading, isStoreManager, isHQAdmin]);

  const fetchUserStores = async () => {
    try {
      // Get user's profile to check their assigned store
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user?.id)
        .single();

      setUserStoreId(profile?.store_id || null);

      // Fetch stores based on role
      let storesQuery = supabase.from('stores').select('id, name, code');

      // If store manager, only show their assigned store
      if (isStoreManager && !isHQAdmin && profile?.store_id) {
        storesQuery = storesQuery.eq('id', profile.store_id);
      }

      const { data: stores } = await storesQuery.order('code');

      const formattedStores = (stores || []).map(s => ({
        id: s.id,
        name: s.name
      }));

      setAvailableStores(formattedStores);
      
      // Set initial selected store
      if (formattedStores.length > 0) {
        setSelectedStore(formattedStores[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic data based on selected store
  const storeDataMap: { [key: string]: any } = {
    "store-1": {
      kpis: [
        { title: t('dashboard.dailySales'), value: "€12,345", change: 8.5, icon: <DollarSign className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.shrinkage'), value: "0.8%", change: -0.3, icon: <AlertTriangle className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.availability'), value: "96.2%", change: 2.1, icon: <Package className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.scoUptime'), value: "98.5%", change: 1.2, icon: <ShoppingCart className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.queueTime'), value: "2.3 min", change: -15.2, icon: <Clock className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.cashVariance'), value: "€12", change: -40, icon: <Users className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
      ],
      sales: [
        { name: 'Mon', sales: 11200 },
        { name: 'Tue', sales: 10800 },
        { name: 'Wed', sales: 12100 },
        { name: 'Thu', sales: 11900 },
        { name: 'Fri', sales: 13400 },
        { name: 'Sat', sales: 15200 },
        { name: 'Sun', sales: 12345 },
      ]
    },
    "store-2": {
      kpis: [
        { title: t('dashboard.dailySales'), value: "€9,876", change: 5.2, icon: <DollarSign className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.shrinkage'), value: "1.2%", change: 0.1, icon: <AlertTriangle className="h-4 w-4" />, trend: 'up' as const, status: 'warning' as const },
        { title: t('dashboard.availability'), value: "94.8%", change: -1.3, icon: <Package className="h-4 w-4" />, trend: 'down' as const, status: 'warning' as const },
        { title: t('dashboard.scoUptime'), value: "96.2%", change: -2.1, icon: <ShoppingCart className="h-4 w-4" />, trend: 'down' as const, status: 'warning' as const },
        { title: t('dashboard.queueTime'), value: "3.1 min", change: 8.5, icon: <Clock className="h-4 w-4" />, trend: 'up' as const, status: 'warning' as const },
        { title: t('dashboard.cashVariance'), value: "€25", change: 15, icon: <Users className="h-4 w-4" />, trend: 'up' as const, status: 'warning' as const },
      ],
      sales: [
        { name: 'Mon', sales: 9200 },
        { name: 'Tue', sales: 9500 },
        { name: 'Wed', sales: 10100 },
        { name: 'Thu', sales: 9800 },
        { name: 'Fri', sales: 11200 },
        { name: 'Sat', sales: 12400 },
        { name: 'Sun', sales: 9876 },
      ]
    },
    "store-3": {
      kpis: [
        { title: t('dashboard.dailySales'), value: "€15,234", change: 12.8, icon: <DollarSign className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.shrinkage'), value: "0.5%", change: -0.5, icon: <AlertTriangle className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.availability'), value: "97.8%", change: 3.2, icon: <Package className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.scoUptime'), value: "99.1%", change: 0.8, icon: <ShoppingCart className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.queueTime'), value: "1.8 min", change: -22.3, icon: <Clock className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.cashVariance'), value: "€8", change: -50, icon: <Users className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
      ],
      sales: [
        { name: 'Mon', sales: 14200 },
        { name: 'Tue', sales: 13800 },
        { name: 'Wed', sales: 15100 },
        { name: 'Thu', sales: 14900 },
        { name: 'Fri', sales: 16400 },
        { name: 'Sat', sales: 17800 },
        { name: 'Sun', sales: 15234 },
      ]
    }
  };

  const kpiData = storeDataMap[selectedStore]?.kpis || storeDataMap["store-1"].kpis;
  const salesData = storeDataMap[selectedStore]?.sales || storeDataMap["store-1"].sales;

  const tasks: Task[] = [
    { id: '1', title: 'Opening checklist completion', status: 'done', priority: 'high', time: '08:00 AM' },
    { id: '2', title: 'Price verification - Fresh produce', status: 'in-progress', priority: 'high', time: '09:30 AM' },
    { id: '3', title: 'Shelf audit - Aisle 3-5', status: 'pending', priority: 'medium', time: '11:00 AM' },
    { id: '4', title: 'Bake-off quality check', status: 'done', priority: 'high', time: '07:00 AM' },
    { id: '5', title: 'Inventory count - Dairy section', status: 'pending', priority: 'medium', time: '02:00 PM' },
    { id: '6', title: 'Closing cash reconciliation', status: 'pending', priority: 'high', time: '08:00 PM' },
  ];

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskProgress = (completedTasks / tasks.length) * 100;

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{t('dashboard.storeDashboard')}</h1>
            <p className="text-muted-foreground">{t('dashboard.realTimeInsights')}</p>
          </div>
          {availableStores.length > 1 && (
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map(store => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {availableStores.length === 1 && (
            <div className="text-lg font-semibold">{availableStores[0].name}</div>
          )}
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
              <CardTitle>{t('dashboard.weeklySalesTrend')}</CardTitle>
              <CardDescription>{t('dashboard.last7Days')}</CardDescription>
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
              <CardTitle>{t('dashboard.dailyTasks')}</CardTitle>
              <CardDescription>
                {completedTasks} {t('common.of')} {tasks.length} {t('dashboard.completedTasks')}
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
