import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  name: string;
  email: string;
  department: string;
  user_id: string | null;
  created_at: string;
  role?: string;
  branch_id?: string | null;
}

export function useProfileByRole(role: 'faculty' | 'hod' | 'registrar') {
  return useQuery({
    queryKey: ['profile', role],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          profile:profiles!user_roles_profile_id_fkey(*)
        `)
        .eq('role', role)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (!data?.profile) return null;
      
      return {
        ...data.profile,
        role: data.role,
      } as Profile;
    },
  });
}

export function useBranchFaculty(branchId?: string | null) {
  return useQuery({
    queryKey: ['faculty', 'branch', branchId],
    queryFn: async () => {
      if (!branchId) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles!inner(role)
        `)
        .eq('branch_id', branchId)
        .eq('user_roles.role', 'faculty');

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!branchId,
  });
}

export function useAllDepartments() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data.map(branch => ({
        id: branch.id,
        name: branch.name,
      }));
    },
  });
}
