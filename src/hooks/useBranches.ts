import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Branch {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface BranchWithStaff extends Branch {
  hod: {
    id: string;
    name: string;
    email: string;
  } | null;
  facultyCount: number;
}

export function useAllBranches() {
  return useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Branch[];
    },
  });
}

export function useBranchesWithStaff() {
  return useQuery({
    queryKey: ['branches', 'with-staff'],
    queryFn: async () => {
      // Get all branches
      const { data: branches, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (branchError) throw branchError;

      // Get all HODs with their profiles
      const { data: hods, error: hodError } = await supabase
        .from('user_roles')
        .select(`
          profile:profiles!user_roles_profile_id_fkey(id, name, email, branch_id)
        `)
        .eq('role', 'hod');

      if (hodError) throw hodError;

      // Get faculty counts per branch
      const { data: facultyCounts, error: facultyError } = await supabase
        .from('user_roles')
        .select(`
          profile:profiles!user_roles_profile_id_fkey(branch_id)
        `)
        .eq('role', 'faculty');

      if (facultyError) throw facultyError;

      // Map branches with HOD and faculty count
      const branchesWithStaff: BranchWithStaff[] = branches.map((branch) => {
        const hodData = hods.find((h) => h.profile?.branch_id === branch.id);
        const facultyInBranch = facultyCounts.filter(
          (f) => f.profile?.branch_id === branch.id
        );

        return {
          ...branch,
          hod: hodData?.profile
            ? {
                id: hodData.profile.id,
                name: hodData.profile.name,
                email: hodData.profile.email,
              }
            : null,
          facultyCount: facultyInBranch.length,
        };
      });

      return branchesWithStaff;
    },
  });
}

export function useBranchDetails(branchId: string | null) {
  return useQuery({
    queryKey: ['branch', branchId, 'details'],
    queryFn: async () => {
      if (!branchId) return null;

      // Get branch info
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single();

      if (branchError) throw branchError;

      // Get HOD for this branch
      const { data: hodData, error: hodError } = await supabase
        .from('user_roles')
        .select(`
          profile:profiles!user_roles_profile_id_fkey(*)
        `)
        .eq('role', 'hod');

      if (hodError) throw hodError;

      const hod = hodData.find((h) => h.profile?.branch_id === branchId)?.profile;

      // Get faculty for this branch
      const { data: facultyData, error: facultyError } = await supabase
        .from('user_roles')
        .select(`
          profile:profiles!user_roles_profile_id_fkey(*)
        `)
        .eq('role', 'faculty');

      if (facultyError) throw facultyError;

      const faculty = facultyData
        .filter((f) => f.profile?.branch_id === branchId)
        .map((f) => f.profile);

      return {
        branch,
        hod,
        faculty,
      };
    },
    enabled: !!branchId,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      code: string;
      hodName: string;
      hodEmail: string;
    }) => {
      // Create the branch first
      const { data: branch, error: branchError } = await supabase
        .from('branches')
        .insert({ name: data.name, code: data.code })
        .select()
        .single();

      if (branchError) throw branchError;

      // Create the HOD profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: data.hodName,
          email: data.hodEmail,
          department: data.name,
          branch_id: branch.id,
        })
        .select()
        .single();

      if (profileError) {
        // Rollback: delete the branch if profile creation fails
        await supabase.from('branches').delete().eq('id', branch.id);
        throw profileError;
      }

      // Assign HOD role to the profile
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          profile_id: profile.id,
          role: 'hod',
        });

      if (roleError) {
        // Rollback: delete profile and branch if role assignment fails
        await supabase.from('profiles').delete().eq('id', profile.id);
        await supabase.from('branches').delete().eq('id', branch.id);
        throw roleError;
      }

      return branch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, code }: { id: string; name: string; code: string }) => {
      const { data, error } = await supabase
        .from('branches')
        .update({ name, code })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });
}
