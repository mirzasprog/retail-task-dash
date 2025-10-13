import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/Header";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
  onClick?: () => void;
}

const KPICard = ({ title, value, change, icon, trend, status, onClick }: KPICardProps) => {
  const { t } = useTranslation();
  const statusColors = {
    good: 'text-success',
    warning: 'text-warning',
    critical: 'text-destructive'
  };

  return (
    <Card 
      className={`bg-gradient-card hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
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
  const { isStoreManager, isRegionalSupervisor, isHQAdmin, loading: roleLoading } = useUserRole(user?.id);
  const navigate = useNavigate();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [availableStores, setAvailableStores] = useState<Array<{ id: string; name: string }>>([]);
  const [userStoreId, setUserStoreId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayTasks, setTodayTasks] = useState<Array<{ id: string; title: string; status: string; priority: string; due_date: string }>>([]);
  const [allTasks, setAllTasks] = useState<Array<{ id: string; title: string; status: string; priority: string; due_date: string }>>([]);
  const [showMonthlySales, setShowMonthlySales] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(false);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; sales: number; percentage: number }>>([]);

  useEffect(() => {
    if (user && !roleLoading) {
      fetchUserStores();
    }
  }, [user, roleLoading, isStoreManager, isHQAdmin]);

  useEffect(() => {
    if (selectedStore && isStoreManager) {
      fetchTodayTasks();
    }
    if (selectedStore && (isRegionalSupervisor || isHQAdmin)) {
      fetchAllTasks();
    }
  }, [selectedStore, isStoreManager, isRegionalSupervisor, isHQAdmin]);

  const fetchUserStores = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

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

  const fetchTodayTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, due_date')
        .eq('due_date', today)
        .eq('store_id', selectedStore)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      setTodayTasks(data || []);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, priority, due_date')
        .eq('store_id', selectedStore)
        .order('due_date', { ascending: true })
        .order('priority', { ascending: false });

      if (error) {
        console.error('Error fetching all tasks:', error);
        return;
      }

      setAllTasks(data || []);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
    }
  };

  const fetchCategoryBreakdown = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: categorySales, error } = await supabase
        .from('daily_category_sales')
        .select(`
          sales_amount,
          category_id,
          product_categories (
            name
          )
        `)
        .eq('store_id', selectedStore)
        .eq('date', today);

      if (error) {
        console.error('Error fetching category sales:', error);
        // Generate mock data for demonstration
        const mockCategories = [
          { name: 'Fruits and Vegetables', sales: 2500, percentage: 20.2 },
          { name: 'Meat and Fish', sales: 2000, percentage: 16.2 },
          { name: 'Dairy Products', sales: 1800, percentage: 14.6 },
          { name: 'Bakery', sales: 1500, percentage: 12.1 },
          { name: 'Beverages', sales: 1300, percentage: 10.5 },
          { name: 'Snacks and Sweets', sales: 1100, percentage: 8.9 },
          { name: 'Frozen Foods', sales: 900, percentage: 7.3 },
          { name: 'Other', sales: 1245, percentage: 10.1 }
        ];
        setCategoryData(mockCategories);
        return;
      }

      if (!categorySales || categorySales.length === 0) {
        // Generate mock data for demonstration
        const mockCategories = [
          { name: 'Fruits and Vegetables', sales: 2500, percentage: 20.2 },
          { name: 'Meat and Fish', sales: 2000, percentage: 16.2 },
          { name: 'Dairy Products', sales: 1800, percentage: 14.6 },
          { name: 'Bakery', sales: 1500, percentage: 12.1 },
          { name: 'Beverages', sales: 1300, percentage: 10.5 },
          { name: 'Snacks and Sweets', sales: 1100, percentage: 8.9 },
          { name: 'Frozen Foods', sales: 900, percentage: 7.3 },
          { name: 'Other', sales: 1245, percentage: 10.1 }
        ];
        setCategoryData(mockCategories);
        return;
      }

      const totalSales = categorySales.reduce((sum, cat) => sum + (cat.sales_amount || 0), 0);
      const formatted = categorySales.map(cat => ({
        name: (cat.product_categories as any)?.name || 'Unknown',
        sales: cat.sales_amount || 0,
        percentage: totalSales > 0 ? ((cat.sales_amount || 0) / totalSales) * 100 : 0
      }));

      setCategoryData(formatted);
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
    }
  };

  // Generate monthly sales data for current month
  const generateMonthlySales = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const currentDay = now.getDate();
    
    const baseAmount = selectedStore === "store-1" ? 12000 : selectedStore === "store-2" ? 9500 : 15000;
    
    return Array.from({ length: currentDay }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const variation = Math.random() * 0.3 - 0.15; // -15% to +15%
      const weekendBoost = dayName === 'Sat' || dayName === 'Sun' ? 1.2 : 1;
      const amount = Math.round(baseAmount * (1 + variation) * weekendBoost);
      
      return {
        day,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayName,
        sales: amount,
        formattedSales: `€${amount.toLocaleString()}`
      };
    });
  };

  const monthlySalesData = generateMonthlySales();
  const totalMonthlySales = monthlySalesData.reduce((sum, day) => sum + day.sales, 0);

  // Generate current month vs same month last year data
  const generateMonthlySalesComparison = (storeMultiplier: number) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDay = today.getDate();
    
    const monthData = [];
    
    for (let day = 1; day <= currentDay; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      
      // Same date last year
      const lastYearDate = new Date(year - 1, month, day);
      
      // Base amount varies by store
      const baseAmount = 12000 * storeMultiplier;
      
      // Add variation based on day
      const variation = Math.sin(day / 5) * 0.15; // -15% to +15%
      const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.25 : 1;
      
      // Current year sales (lower than last year)
      const currentYearSales = Math.round(baseAmount * 0.85 * (1 + variation) * weekendBoost);
      
      // Last year sales (higher - performing better)
      const lastYearVariation = Math.sin((day + 3) / 5) * 0.12;
      const lastYearSales = Math.round(baseAmount * 1.05 * (1 + lastYearVariation) * weekendBoost);
      
      monthData.push({
        name: day.toString(),
        day: day,
        fullDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        currentYear: currentYearSales,
        lastYear: lastYearSales,
      });
    }
    
    return monthData;
  };

  // Dynamic data based on selected store
  const storeDataMap: { [key: string]: any } = {
    "store-1": {
      kpis: [
        { title: t('dashboard.dailySales'), value: "€12,345", change: 8.5, icon: <DollarSign className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const, onClick: () => setShowMonthlySales(true) },
        { title: t('dashboard.shrinkage'), value: "0.8%", change: -0.3, icon: <AlertTriangle className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.availability'), value: "96.2%", change: 2.1, icon: <Package className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.scoUptime'), value: "98.5%", change: 1.2, icon: <ShoppingCart className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.queueTime'), value: "2.3 min", change: -15.2, icon: <Clock className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.fruitsVegShare'), value: "20.2%", change: 1.5, icon: <Package className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const, onClick: () => { fetchCategoryBreakdown(); setShowCategoryBreakdown(true); } },
      ],
      sales: generateMonthlySalesComparison(1.0)
    },
    "store-2": {
      kpis: [
        { title: t('dashboard.dailySales'), value: "€9,876", change: 5.2, icon: <DollarSign className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const, onClick: () => setShowMonthlySales(true) },
        { title: t('dashboard.shrinkage'), value: "1.2%", change: 0.1, icon: <AlertTriangle className="h-4 w-4" />, trend: 'up' as const, status: 'warning' as const },
        { title: t('dashboard.availability'), value: "94.8%", change: -1.3, icon: <Package className="h-4 w-4" />, trend: 'down' as const, status: 'warning' as const },
        { title: t('dashboard.scoUptime'), value: "96.2%", change: -2.1, icon: <ShoppingCart className="h-4 w-4" />, trend: 'down' as const, status: 'warning' as const },
        { title: t('dashboard.queueTime'), value: "3.1 min", change: 8.5, icon: <Clock className="h-4 w-4" />, trend: 'up' as const, status: 'warning' as const },
        { title: t('dashboard.fruitsVegShare'), value: "18.5%", change: -0.8, icon: <Package className="h-4 w-4" />, trend: 'down' as const, status: 'warning' as const, onClick: () => { fetchCategoryBreakdown(); setShowCategoryBreakdown(true); } },
      ],
      sales: generateMonthlySalesComparison(0.82)
    },
    "store-3": {
      kpis: [
        { title: t('dashboard.dailySales'), value: "€15,234", change: 12.8, icon: <DollarSign className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const, onClick: () => setShowMonthlySales(true) },
        { title: t('dashboard.shrinkage'), value: "0.5%", change: -0.5, icon: <AlertTriangle className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.availability'), value: "97.8%", change: 3.2, icon: <Package className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.scoUptime'), value: "99.1%", change: 0.8, icon: <ShoppingCart className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const },
        { title: t('dashboard.queueTime'), value: "1.8 min", change: -22.3, icon: <Clock className="h-4 w-4" />, trend: 'down' as const, status: 'good' as const },
        { title: t('dashboard.fruitsVegShare'), value: "22.1%", change: 2.3, icon: <Package className="h-4 w-4" />, trend: 'up' as const, status: 'good' as const, onClick: () => { fetchCategoryBreakdown(); setShowCategoryBreakdown(true); } },
      ],
      sales: generateMonthlySalesComparison(1.27)
    }
  };

  const kpiData = storeDataMap[selectedStore]?.kpis || storeDataMap["store-1"].kpis;
  const salesData = storeDataMap[selectedStore]?.sales || storeDataMap["store-1"].sales;

  // Map database tasks to UI format
  const tasks: Task[] = todayTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status === 'completed' ? 'done' : task.status === 'in_progress' ? 'in-progress' : 'pending',
    priority: task.priority as 'high' | 'medium' | 'low',
    time: new Date(task.due_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }));

  const allTasksFormatted: Task[] = allTasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status === 'completed' ? 'done' : task.status === 'in_progress' ? 'in-progress' : 'pending',
    priority: task.priority as 'high' | 'medium' | 'low',
    time: new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  const completedTasks = tasks.length > 0 ? tasks.filter(t => t.status === 'done').length : 0;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const completedAllTasks = allTasksFormatted.length > 0 ? allTasksFormatted.filter(t => t.status === 'done').length : 0;
  const allTasksProgress = allTasksFormatted.length > 0 ? (completedAllTasks / allTasksFormatted.length) * 100 : 0;

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
              <CardTitle>{t('dashboard.monthlySalesTrend')}</CardTitle>
              <CardDescription>{t('dashboard.currentMonthComparison')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--foreground))"
                    label={{ value: t('dashboard.dayOfMonth'), position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: any) => value ? `€${value.toLocaleString()}` : 'N/A'}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="currentYear" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name={new Date().getFullYear().toString()}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lastYear" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name={(new Date().getFullYear() - 1).toString()}
                    dot={{ fill: 'hsl(var(--muted-foreground))', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-primary"></div>
                  <span>{new Date().getFullYear()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-muted-foreground" style={{ backgroundImage: 'repeating-linear-gradient(to right, hsl(var(--muted-foreground)) 0, hsl(var(--muted-foreground)) 5px, transparent 5px, transparent 10px)' }}></div>
                  <span className="text-muted-foreground">{new Date().getFullYear() - 1}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Tasks - Only for Store Managers */}
          {isStoreManager && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t('dashboard.dailyTasks')}</CardTitle>
                    <CardDescription>
                      {completedTasks} {t('common.of')} {tasks.length} {t('dashboard.completedTasks')}
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/my-day')} size="sm">
                    {t('dashboard.viewAllTasks')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={taskProgress} className="h-2" />
                <div className="space-y-1 max-h-[240px] overflow-y-auto">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('myDay.noTasksToday')}
                    </p>
                  ) : (
                    tasks.map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Tasks - For Regional Supervisors and HQ Admins */}
          {(isRegionalSupervisor || isHQAdmin) && !isStoreManager && (
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.allTasks')}</CardTitle>
                <CardDescription>
                  {completedAllTasks} {t('common.of')} {allTasksFormatted.length} {t('dashboard.completedTasks')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={allTasksProgress} className="h-2" />
                <div className="space-y-1 max-h-[240px] overflow-y-auto">
                  {allTasksFormatted.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('dashboard.noTasks')}
                    </p>
                  ) : (
                    allTasksFormatted.map(task => (
                      <TaskItem key={task.id} task={task} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>

      {/* Monthly Sales Dialog */}
      <Dialog open={showMonthlySales} onOpenChange={setShowMonthlySales}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('dashboard.monthlySalesBreakdown')}</DialogTitle>
            <DialogDescription>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - Total: €{totalMonthlySales.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.day')}</TableHead>
                <TableHead>{t('dashboard.date')}</TableHead>
                <TableHead className="text-right">{t('dashboard.sales')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlySalesData.map((day) => (
                <TableRow key={day.day}>
                  <TableCell className="font-medium">{day.dayName}</TableCell>
                  <TableCell>{day.date}</TableCell>
                  <TableCell className="text-right font-semibold">{day.formattedSales}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {/* Category Breakdown Dialog */}
      <Dialog open={showCategoryBreakdown} onOpenChange={setShowCategoryBreakdown}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('dashboard.categoryBreakdown')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.todaySalesByCategory')}
            </DialogDescription>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.category')}</TableHead>
                <TableHead className="text-right">{t('dashboard.sales')}</TableHead>
                <TableHead className="text-right">{t('dashboard.share')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryData.map((category, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">€{category.sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">{category.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
