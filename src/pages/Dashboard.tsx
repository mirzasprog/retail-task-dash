import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    if (!roleLoading && role === 'admin') {
      navigate('/admin', { replace: true });
      return;
    }

    if (!roleLoading && role === 'regional_supervisor') {
      navigate('/regional', { replace: true });
      return;
    }

    if (!roleLoading && role === 'hq_administrator') {
      navigate('/hq', { replace: true });
      return;
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    const fetchStore = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (profile?.store_id) {
        const { data: store } = await supabase
          .from('stores')
          .select('name')
          .eq('id', profile.store_id)
          .single();

        if (store) {
          setStoreName(store.name);
        }
      }
    };

    fetchStore();
  }, [user]);

  if (roleLoading || role === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Store Dashboard</h1>
          <p className="text-muted-foreground">{storeName || 'Loading...'}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Daily Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€128,450</div>
              <p className="text-xs text-green-600">+12.4% from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8/12</div>
              <p className="text-xs text-muted-foreground">4 remaining today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.4%</div>
              <p className="text-xs text-red-600">-0.8% from yesterday</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
