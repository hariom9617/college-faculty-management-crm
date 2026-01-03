import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Lecture {
  id: string;
  subject: string;
  time: string;
  room: number;
  block: string;
  year: number;
  status: string;
  date: string;
  faculty_id: string;
  faculty?: {
    id: string;
    name: string;
    department: string;
  };
}

export function useTodayLectures(facultyId?: string) {
  return useQuery({
    queryKey: ['lectures', 'today', facultyId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('lectures')
        .select(`
          *,
          faculty:profiles!lectures_faculty_id_fkey(id, name, department)
        `)
        .eq('date', today);

      if (facultyId) {
        query = query.eq('faculty_id', facultyId);
      }

      const { data, error } = await query.order('time');
      
      if (error) throw error;
      return data as Lecture[];
    },
  });
}

export function useFacultyLectures(facultyId?: string) {
  return useQuery({
    queryKey: ['lectures', 'faculty', facultyId],
    queryFn: async () => {
      if (!facultyId) return [];
      
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .eq('faculty_id', facultyId)
        .eq('status', 'scheduled')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      
      if (error) throw error;
      return data as Lecture[];
    },
    enabled: !!facultyId,
  });
}

export function useLecturesByDateRange(branchId?: string | null, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['lectures', 'range', branchId, startDate, endDate],
    queryFn: async () => {
      if (!branchId || !startDate || !endDate) return [];

      // First get faculty in this branch
      const { data: branchFaculty, error: facultyError } = await supabase
        .from('profiles')
        .select('id')
        .eq('branch_id', branchId);

      if (facultyError) throw facultyError;
      
      const facultyIds = branchFaculty.map(f => f.id);
      
      if (facultyIds.length === 0) return [];

      const { data, error } = await supabase
        .from('lectures')
        .select(`
          *,
          faculty:profiles!lectures_faculty_id_fkey(id, name, department)
        `)
        .in('faculty_id', facultyIds)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date')
        .order('time');
      
      if (error) throw error;
      return data as Lecture[];
    },
    enabled: !!branchId && !!startDate && !!endDate,
  });
}

export function useWeeklyLectureCount(facultyId?: string) {
  return useQuery({
    queryKey: ['lectures', 'weekly', facultyId],
    queryFn: async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      let query = supabase
        .from('lectures')
        .select('id', { count: 'exact' })
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0]);

      if (facultyId) {
        query = query.eq('faculty_id', facultyId);
      }

      const { count, error } = await query;
      
      if (error) throw error;
      return count || 0;
    },
  });
}

export function useRoomConflict(date: string, time: string, block: string, room: number, excludeLectureId?: string) {
  return useQuery({
    queryKey: ['lectures', 'conflict', date, time, block, room],
    queryFn: async () => {
      if (!date || !time || !block || !room) return null;

      let query = supabase
        .from('lectures')
        .select(`
          id,
          faculty:profiles!lectures_faculty_id_fkey(name, department)
        `)
        .eq('date', date)
        .eq('time', time)
        .eq('block', block)
        .eq('room', room);

      if (excludeLectureId) {
        query = query.neq('id', excludeLectureId);
      }

      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!date && !!time && !!block && !!room,
  });
}

export function useBookedRooms(date: string, time: string) {
  return useQuery({
    queryKey: ['lectures', 'booked-rooms', date, time],
    queryFn: async () => {
      if (!date || !time) return [];

      const { data, error } = await supabase
        .from('lectures')
        .select('block, room')
        .eq('date', date)
        .eq('time', time);
      
      if (error) throw error;
      return data as { block: string; room: number }[];
    },
    enabled: !!date && !!time,
  });
}

export function useCreateLecture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lecture: {
      faculty_id: string;
      subject: string;
      date: string;
      time: string;
      room: number;
      block: string;
      year: number;
    }) => {
      const { data, error } = await supabase
        .from('lectures')
        .insert({
          faculty_id: lecture.faculty_id,
          subject: lecture.subject,
          date: lecture.date,
          time: lecture.time,
          room: lecture.room,
          block: lecture.block,
          year: lecture.year,
          status: 'scheduled',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
}

export function useUpdateLecture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (lecture: {
      id: string;
      faculty_id: string;
      subject: string;
      date: string;
      time: string;
      room: number;
      block: string;
      year: number;
    }) => {
      const { data, error } = await supabase
        .from('lectures')
        .update({
          faculty_id: lecture.faculty_id,
          subject: lecture.subject,
          date: lecture.date,
          time: lecture.time,
          room: lecture.room,
          block: lecture.block,
          year: lecture.year,
        })
        .eq('id', lecture.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
}

export function useDeleteLecture() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lectures')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
}

export function useUpdateLectureStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('lectures')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lectures'] });
    },
  });
}
