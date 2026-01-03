import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Attendance {
  id: string;
  user_id: string;
  role: string;
  branch_id: string | null;
  date: string;
  status: 'present' | 'leave';
  created_at: string;
  profile?: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
}

export function useTodayAttendance(userId?: string) {
  const today = format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['attendance', 'today', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data as Attendance | null;
    },
    enabled: !!userId,
  });
}

export function useMyAttendanceHistory(userId?: string) {
  return useQuery({
    queryKey: ['attendance', 'history', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!userId,
  });
}

export function useBranchAttendance(branchId?: string | null, date?: string) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['attendance', 'branch', branchId, targetDate],
    queryFn: async () => {
      if (!branchId) return [];

      // Get attendance records
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('branch_id', branchId)
        .eq('date', targetDate);

      if (attendanceError) throw attendanceError;

      // Get profile info for each attendance
      const userIds = attendanceData.map((a) => a.user_id);
      if (userIds.length === 0) return [];

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, department')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge attendance with profiles
      return attendanceData.map((attendance) => ({
        ...attendance,
        status: attendance.status as 'present' | 'leave',
        profile: profilesData.find((p) => p.id === attendance.user_id),
      })) as Attendance[];
    },
    enabled: !!branchId,
  });
}

export function useAllAttendance(date?: string) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['attendance', 'all', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', targetDate);

      if (error) throw error;
      return data as Attendance[];
    },
  });
}

export function useAttendanceByBranch(date?: string) {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');

  return useQuery({
    queryKey: ['attendance', 'by-branch', targetDate],
    queryFn: async () => {
      // Get all attendance for the date
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', targetDate);

      if (attendanceError) throw attendanceError;

      // Get all profiles with their branch info
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, department, branch_id');

      if (profilesError) throw profilesError;

      // Get branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');

      if (branchesError) throw branchesError;

      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('profile_id, role');

      if (rolesError) throw rolesError;

      // Map profiles with roles
      const profilesWithRoles = profilesData.map((profile) => {
        const roleEntry = rolesData.find((r) => r.profile_id === profile.id);
        return {
          ...profile,
          role: roleEntry?.role || 'faculty',
        };
      });

      // Group attendance by branch
      const grouped: Record<string, {
        branch: { id: string; name: string; code: string };
        present: { profile: typeof profilesWithRoles[0]; attendance: Attendance }[];
        leave: { profile: typeof profilesWithRoles[0]; attendance: Attendance }[];
        notMarked: typeof profilesWithRoles[0][];
      }> = {};

      branchesData.forEach((branch) => {
        const branchProfiles = profilesWithRoles.filter((p) => p.branch_id === branch.id);
        const branchAttendance = attendanceData.filter((a) => a.branch_id === branch.id);

        const present: typeof grouped[string]['present'] = [];
        const leave: typeof grouped[string]['leave'] = [];
        const notMarked: typeof grouped[string]['notMarked'] = [];

        branchProfiles.forEach((profile) => {
          const attendance = branchAttendance.find((a) => a.user_id === profile.id);
          if (attendance) {
            if (attendance.status === 'present') {
              present.push({ profile, attendance: attendance as Attendance });
            } else {
              leave.push({ profile, attendance: attendance as Attendance });
            }
          } else {
            notMarked.push(profile);
          }
        });

        grouped[branch.id] = {
          branch,
          present,
          leave,
          notMarked,
        };
      });

      return grouped;
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      user_id,
      role,
      branch_id,
      status,
      date,
    }: {
      user_id: string;
      role: string;
      branch_id: string | null;
      status: 'present' | 'leave';
      date?: string;
    }) => {
      const targetDate = date || format(new Date(), 'yyyy-MM-dd');

      // Check if attendance already exists for the date
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', user_id)
        .eq('date', targetDate)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from('attendance')
          .update({ status })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('attendance')
          .insert({
            user_id,
            role,
            branch_id,
            status,
            date: targetDate,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}
