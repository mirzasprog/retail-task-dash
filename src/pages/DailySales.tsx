import { MainLayout } from '@/components/layouts/MainLayout';

const DailySales = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Daily Sales</h1>
          <p className="text-muted-foreground">View sales data and analytics</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default DailySales;
