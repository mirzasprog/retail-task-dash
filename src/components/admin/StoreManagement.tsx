import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StoreDialog } from "./StoreDialog";
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

export function StoreManagement() {
  const [search, setSearch] = useState("");
  const [selectedStore, setSelectedStore] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["admin-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select(`
          *,
          region:regions(name),
          manager:profiles!stores_manager_id_fkey(full_name, email)
        `)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("stores").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      toast({ title: t("admin.stores.deleteSuccess") });
    },
    onError: () => {
      toast({
        title: t("admin.stores.deleteError"),
        variant: "destructive",
      });
    },
  });

  const filteredStores = stores?.filter((store) =>
    store.name.toLowerCase().includes(search.toLowerCase()) ||
    store.code.toLowerCase().includes(search.toLowerCase())
  );

  const formatBadgeColor = (format: string) => {
    switch (format) {
      case "maxi":
        return "default";
      case "super":
        return "secondary";
      case "small":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("admin.stores.title")}</CardTitle>
          <Button
            onClick={() => {
              setSelectedStore(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("admin.stores.addStore")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("admin.stores.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">{t("common.loading")}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("admin.stores.columns.code")}</TableHead>
                <TableHead>{t("admin.stores.columns.name")}</TableHead>
                <TableHead>{t("admin.stores.columns.region")}</TableHead>
                <TableHead>{t("admin.stores.columns.format")}</TableHead>
                <TableHead>{t("admin.stores.columns.manager")}</TableHead>
                <TableHead>{t("admin.stores.columns.size")}</TableHead>
                <TableHead>{t("admin.stores.columns.employees")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores?.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">{store.code}</TableCell>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.region?.name}</TableCell>
                  <TableCell>
                    <Badge variant={formatBadgeColor(store.format)}>
                      {store.format?.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{store.manager?.full_name || "-"}</TableCell>
                  <TableCell>{store.size_sqm ? `${store.size_sqm} m²` : "-"}</TableCell>
                  <TableCell>{store.num_employees || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedStore(store);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(store.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <StoreDialog
        store={selectedStore}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
