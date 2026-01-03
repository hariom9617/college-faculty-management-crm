import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Users, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HodFacultyList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    email: '',
  });

  // Fetch faculty members in the same branch as HOD
  const { data: facultyList, isLoading } = useQuery({
    queryKey: ['faculty-list', user?.branch_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          role,
          profile:profiles!user_roles_profile_id_fkey(*)
        `)
        .eq('role', 'faculty');

      if (error) throw error;

      // Filter by HOD's branch
      const branchFaculty = data?.filter(
        (item) => item.profile?.branch_id === user?.branch_id
      );

      return branchFaculty?.map((item) => item.profile) || [];
    },
    enabled: !!user?.branch_id,
  });

  // Add new faculty mutation
  const addFacultyMutation = useMutation({
    mutationFn: async (faculty: { name: string; email: string }) => {
      // First create the profile with branch_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          name: faculty.name,
          email: faculty.email,
          department: user?.department || '',
          branch_id: user?.branch_id,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Then assign the faculty role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          profile_id: profile.id,
          role: 'faculty',
        });

      if (roleError) throw roleError;

      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty-list'] });
      toast.success('Faculty member added successfully');
      setIsDialogOpen(false);
      setNewFaculty({ name: '', email: '' });
    },
    onError: (error) => {
      toast.error('Failed to add faculty: ' + error.message);
    },
  });

  const handleAddFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name || !newFaculty.email) {
      toast.error('Please fill in all fields');
      return;
    }
    addFacultyMutation.mutate(newFaculty);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">
              Faculty List
            </h1>
            <p className="text-muted-foreground">
              Manage faculty members in {user?.department}
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Faculty Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddFaculty} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newFaculty.name}
                    onChange={(e) =>
                      setNewFaculty({ ...newFaculty, name: e.target.value })
                    }
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) =>
                      setNewFaculty({ ...newFaculty, email: e.target.value })
                    }
                    placeholder="john.doe@renaissance.in"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addFacultyMutation.isPending}
                  >
                    {addFacultyMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Faculty'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Card */}
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Faculty</p>
              <p className="text-2xl font-bold text-foreground">
                {facultyList?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Faculty Table */}
        <Card>
          <CardHeader>
            <CardTitle>Faculty Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : facultyList && facultyList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyList.map((faculty) => (
                    <TableRow key={faculty?.id}>
                      <TableCell className="font-medium">
                        {faculty?.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          {faculty?.email}
                        </div>
                      </TableCell>
                      <TableCell>{faculty?.department}</TableCell>
                      <TableCell>
                        {faculty?.created_at
                          ? new Date(faculty.created_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No faculty members found in your department</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
