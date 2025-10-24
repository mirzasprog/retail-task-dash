import { MainLayout } from '@/components/layouts/MainLayout';

const HQ = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">HQ Dashboard</h1>
          <p className="text-muted-foreground">Headquarters overview</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default HQ;
