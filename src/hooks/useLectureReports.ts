import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LectureReport {
  id: string;
  faculty_id: string;
  subject: string;
  date: string;
  topic_covered: string;
  duration: number;
  status: string;
  remarks: string | null;
  created_at: string;
  faculty?: {
    id: string;
    name: string;
    email: string;
    department: string;
    branch_id: string | null;
  };
}

export function useLectureReports(options?: { 
  department?: string;
  facultyId?: string;
  branchId?: string;
}) {
  return useQuery({
    queryKey: ['lecture_reports', options?.department, options?.facultyId, options?.branchId],
    queryFn: async () => {
      let query = supabase
        .from('lecture_reports')
        .select(`
          *,
          faculty:profiles!lecture_reports_faculty_id_fkey(id, name, email, department, branch_id)
        `)
        .order('date', { ascending: false });

      if (options?.facultyId) {
        query = query.eq('faculty_id', options.facultyId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      let reports = data as LectureReport[];
      
      // Filter by branch if specified
      if (options?.branchId) {
        reports = reports.filter(
          report => report.faculty?.branch_id === options.branchId
        );
      }
      
      // Filter by department if specified (fallback)
      if (options?.department && !options?.branchId) {
        reports = reports.filter(
          report => report.faculty?.department === options.department
        );
      }
      
      return reports;
    },
  });
}

export function useCreateLectureReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: {
      faculty_id: string;
      subject: string;
      date: string;
      topic_covered: string;
      duration: number;
      status: string;
      remarks?: string;
    }) => {
      const { data, error } = await supabase
        .from('lecture_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lecture_reports'] });
    },
  });
}

export function useDepartmentStats() {
  return useQuery({
    queryKey: ['department_stats'],
    queryFn: async () => {
      const { data: reports, error } = await supabase
        .from('lecture_reports')
        .select(`
          *,
          faculty:profiles!lecture_reports_faculty_id_fkey(department)
        `);

      if (error) throw error;

      // Group by department and calculate stats
      const statsMap = new Map<string, {
        department: string;
        totalLectures: number;
        completed: number;
        cancelled: number;
        rescheduled: number;
      }>();

      (reports as LectureReport[]).forEach(report => {
        const dept = report.faculty?.department || 'Unknown';
        
        if (!statsMap.has(dept)) {
          statsMap.set(dept, {
            department: dept,
            totalLectures: 0,
            completed: 0,
            cancelled: 0,
            rescheduled: 0,
          });
        }

        const stats = statsMap.get(dept)!;
        stats.totalLectures++;
        
        if (report.status === 'completed') stats.completed++;
        else if (report.status === 'cancelled') stats.cancelled++;
        else if (report.status === 'rescheduled') stats.rescheduled++;
      });

      return Array.from(statsMap.values());
    },
  });
}

export function useFacultyCount(options?: { department?: string; branchId?: string }) {
  return useQuery({
    queryKey: ['faculty_count', options?.department, options?.branchId],
    queryFn: async () => {
      // Get faculty profiles with their roles
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          profile:profiles!user_roles_profile_id_fkey(id, department, branch_id)
        `)
        .eq('role', 'faculty');
      
      if (error) throw error;
      
      let count = data?.length || 0;
      
      if (options?.branchId) {
        count = data?.filter(item => item.profile?.branch_id === options.branchId).length || 0;
      } else if (options?.department) {
        count = data?.filter(item => item.profile?.department === options.department).length || 0;
      }
      
      return count;
    },
  });
}

export function useSubjects() {
  return useQuery({
    queryKey: ['subjects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lectures')
        .select('subject');

      if (error) throw error;
      
      // Get unique subjects
      const subjects = [...new Set(data.map(l => l.subject))];
      return subjects;
    },
  });
}
