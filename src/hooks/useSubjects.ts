import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subject {
  id: string;
  name: string;
  code: string;
  branch_id: string;
  year: number;
  created_at: string;
}

export const useSubjects = (branchId?: string | null, year?: number | null) => {
  return useQuery({
    queryKey: ['subjects', branchId, year],
    queryFn: async () => {
      let query = supabase
        .from('subjects')
        .select('*')
        .order('name');
      
      if (branchId) {
        query = query.eq('branch_id', branchId);
      }
      
      if (year) {
        query = query.eq('year', year);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!branchId,
  });
};

export const useSubjectsByYear = (branchId?: string | null) => {
  return useQuery({
    queryKey: ['subjects', 'by-year', branchId],
    queryFn: async () => {
      if (!branchId) return { 1: [], 2: [], 3: [], 4: [] };
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('branch_id', branchId)
        .order('name');
      
      if (error) throw error;
      
      const grouped: Record<number, Subject[]> = { 1: [], 2: [], 3: [], 4: [] };
      (data as Subject[]).forEach(subject => {
        if (grouped[subject.year]) {
          grouped[subject.year].push(subject);
        }
      });
      
      return grouped;
    },
    enabled: !!branchId,
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (subject: { name: string; code: string; branch_id: string; year: number }) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, name, code, year }: { id: string; name: string; code: string; year: number }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update({ name, code, year })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
};
