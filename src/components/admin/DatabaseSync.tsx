import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Database, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export function DatabaseSync() {
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const syncMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke(
        "sales-data-sync",
        {
          body: { manual: true },
        }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setLastSync(new Date());
      toast({
        title: t("admin.sync.syncSuccess"),
        description: t("admin.sync.syncDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("admin.sync.syncError"),
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.sync.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.sync.lastSync")}
                  </p>
                  <p className="font-semibold">
                    {lastSync
                      ? lastSync.toLocaleString()
                      : t("admin.sync.never")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.sync.status")}
                  </p>
                  <Badge variant="default">{t("admin.sync.online")}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.sync.mode")}
                  </p>
                  <p className="font-semibold">{t("admin.sync.manual")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">{t("admin.sync.actions")}</h3>
          <div className="flex gap-4">
            <Button
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending
                ? t("admin.sync.syncing")
                : t("admin.sync.syncNow")}
            </Button>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">{t("admin.sync.info.title")}</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{t("admin.sync.info.salesData")}</li>
            <li>{t("admin.sync.info.kpiData")}</li>
            <li>{t("admin.sync.info.categoryData")}</li>
            <li>{t("admin.sync.info.scheduled")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
