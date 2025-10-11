import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, CheckCircle2, Clock, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

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
      title: "Real-time KPIs",
      description: "Track sales, shrinkage, availability, and more in real-time"
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: "Task Management",
      description: "Never miss a daily task with our smart tracking system"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Trend Analysis",
      description: "Visualize performance trends and make data-driven decisions"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Time Tracking",
      description: "Monitor queue times and operational efficiency metrics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Retail Operations
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamline your store management with real-time insights, automated task tracking, 
              and powerful analytics in one unified dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="text-lg px-8"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="text-lg px-8"
            >
              View Demo
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
              <div className="text-sm text-muted-foreground mt-1">System Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success">24/7</div>
              <div className="text-sm text-muted-foreground mt-1">Real-time Monitoring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Stores Managed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
