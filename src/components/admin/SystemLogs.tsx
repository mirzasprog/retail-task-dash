import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export function SystemLogs() {
  const { t } = useTranslation();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["system-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sync_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge variant="default">Success</Badge>;
    } else if (status >= 400) {
      return <Badge variant="destructive">Error</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("admin.logs.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">{t("common.loading")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.logs.columns.timestamp")}</TableHead>
                <TableHead>{t("admin.logs.columns.method")}</TableHead>
                <TableHead>{t("admin.logs.columns.endpoint")}</TableHead>
                <TableHead>{t("admin.logs.columns.status")}</TableHead>
                <TableHead>{t("admin.logs.columns.latency")}</TableHead>
                <TableHead>{t("admin.logs.columns.error")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.method}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {log.endpoint}
                  </TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>{log.latency_ms}ms</TableCell>
                  <TableCell className="max-w-md truncate">
                    {log.error_message || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
