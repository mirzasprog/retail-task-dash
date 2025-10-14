import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "store_manager" | "regional_supervisor" | "hq_administrator";

export const useUserRole = (userId: string | undefined) => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
      } else if (data) {
        setRoles(data.map(r => r.role as UserRole));
      }
      setLoading(false);
    };

    fetchRoles();

    // Subscribe to realtime updates for role changes
    const channel = supabase
      .channel(`user_roles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchRoles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isStoreManager = hasRole("store_manager");
  const isRegionalSupervisor = hasRole("regional_supervisor");
  const isHQAdmin = hasRole("hq_administrator");

  return {
    roles,
    loading,
    hasRole,
    isStoreManager,
    isRegionalSupervisor,
    isHQAdmin
  };
};