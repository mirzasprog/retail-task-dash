import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Shield, Database, FileText } from "lucide-react";
import { StoreManagement } from "@/components/admin/StoreManagement";
import { UserManagement } from "@/components/admin/UserManagement";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { SystemLogs } from "@/components/admin/SystemLogs";
import { DatabaseSync } from "@/components/admin/DatabaseSync";
import { Header } from "@/components/Header";
import { useTranslation } from "react-i18next";

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, role, loading } = useUserRole(user?.id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Only redirect if we're sure the user is NOT admin (user exists, loading done, not admin)
  useEffect(() => {
    if (user && !loading && !isAdmin) {
      console.log('[Admin] Not admin, redirecting to /dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [isAdmin, loading, user, navigate]);

  // Show loading while checking
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse">{t("common.loading")}</div>
      </div>
    );
  }

  // If not admin after loading, show nothing (will redirect)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
          <p className="text-muted-foreground">{t("admin.subtitle")}</p>
        </div>

        <Tabs defaultValue="stores" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stores" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {t("admin.tabs.stores")}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("admin.tabs.users")}
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("admin.tabs.roles")}
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t("admin.tabs.sync")}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("admin.tabs.logs")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stores">
            <StoreManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>

          <TabsContent value="sync">
            <DatabaseSync />
          </TabsContent>

          <TabsContent value="logs">
            <SystemLogs />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
