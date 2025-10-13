import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const features = [
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('index.features.realTimeKPIs'),
      description: t('index.features.realTimeKPIsDesc')
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: t('index.features.taskManagement'),
      description: t('index.features.taskManagementDesc')
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: t('index.features.trendAnalysis'),
      description: t('index.features.trendAnalysisDesc')
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: t('index.features.timeTracking'),
      description: t('index.features.timeTrackingDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              {t('index.hero.title')}
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                {t('index.hero.subtitle')}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('index.hero.description')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8"
            >
              {t('index.hero.getStarted')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="text-lg px-8"
            >
              {t('index.hero.viewDemo')}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-border"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">99.5%</div>
              <div className="text-sm text-muted-foreground mt-1">{t('index.stats.uptime')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">{t('index.stats.monitoring')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground mt-1">{t('index.stats.stores')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
