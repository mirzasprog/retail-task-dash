import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Store, BarChart3, CheckSquare } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Retail Task Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your retail operations with powerful task management and analytics
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <Store className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Store Management</h3>
            <p className="text-muted-foreground">
              Manage multiple stores with real-time KPI tracking and performance metrics
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <CheckSquare className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Task Tracking</h3>
            <p className="text-muted-foreground">
              Create, assign, and monitor tasks across your retail network efficiently
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow">
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analytics & Reports</h3>
            <p className="text-muted-foreground">
              Get insights with comprehensive sales analytics and performance reports
            </p>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/login')} className="px-8">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
