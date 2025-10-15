import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "hq_administrator" | "regional_supervisor" | "store_manager";

export const useUserRole = (userId: string | undefined) => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } else if (data) {
        setRole(data.role as UserRole);
      }
      setLoading(false);
    };

    fetchRole();

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
          fetchRole();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const hasRole = (checkRole: UserRole) => role === checkRole;
  const isAdmin = role === "admin";
  const isStoreManager = role === "store_manager";
  const isRegionalSupervisor = role === "regional_supervisor";
  const isHQAdmin = role === "hq_administrator";

  return {
    role,
    loading,
    hasRole,
    isAdmin,
    isStoreManager,
    isRegionalSupervisor,
    isHQAdmin
  };
};