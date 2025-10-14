import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, TrendingUp, TrendingDown, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";

interface DailySalesData {
  id: string;
  store_id: string;
  store_name: string;
  date: string;
  hour: number;
  current_year_sales: number;
  previous_year_sales: number;
  current_year_customers: number;
  previous_year_customers: number;
  sales_growth_percent: number;
  customer_growth_percent: number;
}

interface RegionSummary {
  region_name: string;
  total_current_sales: number;
  total_previous_sales: number;
  growth_percent: number;
}

const DailySales = () => {
  const { t } = useTranslation();
  const { session } = useAuth();
  const { hasRole } = useUserRole(session?.user?.id);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [stores, setStores] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<DailySalesData[]>([]);
  const [regionSummary, setRegionSummary] = useState<RegionSummary[]>([]);

  const canViewAllStores = hasRole('hq_administrator') || hasRole('regional_supervisor');

  useEffect(() => {
    if (session) {
      loadStores();
      loadSalesData();
    }
  }, [session, selectedDate, selectedStore]);

  const loadStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, code')
        .order('name');

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const loadSalesData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('daily_sales')
        .select(`
          id,
          store_id,
          date,
          hour,
          current_year_sales,
          previous_year_sales,
          current_year_customers,
          previous_year_customers,
          sales_growth_percent,
          customer_growth_percent,
          stores!inner(name, code, region_id, regions(name))
        `)
        .eq('date', selectedDate)
        .order('hour', { ascending: false });

      if (selectedStore !== 'all') {
        query = query.eq('store_id', selectedStore);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData: DailySalesData[] = (data || []).map((item: any) => ({
        id: item.id,
        store_id: item.store_id,
        store_name: item.stores.name,
        date: item.date,
        hour: item.hour,
        current_year_sales: item.current_year_sales,
        previous_year_sales: item.previous_year_sales,
        current_year_customers: item.current_year_customers,
        previous_year_customers: item.previous_year_customers,
        sales_growth_percent: item.sales_growth_percent,
        customer_growth_percent: item.customer_growth_percent,
      }));

      setSalesData(formattedData);

      // Calculate region summary
      if (selectedStore === 'all') {
        const regionMap = new Map<string, RegionSummary>();

        data?.forEach((item: any) => {
          const regionName = item.stores.regions?.name || 'Unknown';
          const existing = regionMap.get(regionName);

          if (existing) {
            existing.total_current_sales += item.current_year_sales;
            existing.total_previous_sales += item.previous_year_sales;
          } else {
            regionMap.set(regionName, {
              region_name: regionName,
              total_current_sales: item.current_year_sales,
              total_previous_sales: item.previous_year_sales,
              growth_percent: 0,
            });
          }
        });

        const summaries = Array.from(regionMap.values()).map(summary => ({
          ...summary,
          growth_percent: summary.total_previous_sales > 0
            ? ((summary.total_current_sales / summary.total_previous_sales) - 1) * 100
            : 0,
        }));

        setRegionSummary(summaries);
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error(t('errors.failedToLoadData'));
    } finally {
      setLoading(false);
    }
  };

  const syncSalesData = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sales-data-sync');

      if (error) throw error;

      toast.success(t('success.dataSynced'));
      loadSalesData();
    } catch (error) {
      console.error('Error syncing sales data:', error);
      toast.error(t('errors.failedToSyncData'));
    } finally {
      setSyncing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('bs-BA', {
      style: 'currency',
      currency: 'BAM',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('bs-BA', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const totalCurrentSales = salesData.reduce((sum, item) => sum + item.current_year_sales, 0);
  const totalPreviousSales = salesData.reduce((sum, item) => sum + item.previous_year_sales, 0);
  const totalGrowth = totalPreviousSales > 0
    ? ((totalCurrentSales / totalPreviousSales) - 1) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t('dailySales.title')}</h1>
            <p className="text-muted-foreground">{t('dailySales.subtitle')}</p>
          </div>
          <Button onClick={syncSalesData} disabled={syncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? t('dailySales.syncing') : t('dailySales.syncNow')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-2 block">{t('dailySales.selectDate')}</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {canViewAllStores && (
            <div>
              <label className="text-sm font-medium mb-2 block">{t('dailySales.selectStore')}</label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name} ({store.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dailySales.currentYearSales')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalCurrentSales)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dailySales.previousYearSales')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPreviousSales)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dailySales.growth')}</CardTitle>
              {totalGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(totalGrowth)}
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedStore === 'all' && regionSummary.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('dailySales.regionSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.region')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.currentYearSales')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.previousYearSales')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.growth')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {regionSummary.map((region) => (
                    <TableRow key={region.region_name}>
                      <TableCell className="font-medium">{region.region_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(region.total_current_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(region.total_previous_sales)}</TableCell>
                      <TableCell className={`text-right ${region.growth_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(region.growth_percent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('dailySales.detailedData')}</CardTitle>
            <CardDescription>{t('dailySales.hourlyBreakdown')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">{t('common.loading')}</div>
            ) : salesData.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">{t('dailySales.noData')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.store')}</TableHead>
                    <TableHead>{t('dailySales.hour')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.currentSales')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.previousSales')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.salesGrowth')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.currentCustomers')}</TableHead>
                    <TableHead className="text-right">{t('dailySales.customerGrowth')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.store_name}</TableCell>
                      <TableCell>{item.hour}:00</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.current_year_sales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.previous_year_sales)}</TableCell>
                      <TableCell className={`text-right ${item.sales_growth_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(item.sales_growth_percent)}
                      </TableCell>
                      <TableCell className="text-right">{item.current_year_customers}</TableCell>
                      <TableCell className={`text-right ${item.customer_growth_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatPercent(item.customer_growth_percent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DailySales;
