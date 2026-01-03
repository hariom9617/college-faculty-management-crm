import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useBranchesWithStaff, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/hooks/useBranches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Users, UserCog, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BranchFormData {
  id?: string;
  name: string;
  code: string;
  hodName: string;
  hodEmail: string;
}

export default function RegistrarBranches() {
  const { data: branches, isLoading } = useBranchesWithStaff();
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();
  const deleteBranch = useDeleteBranch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchFormData | null>(null);
  const [deletingBranchId, setDeletingBranchId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({ name: '', code: '', hodName: '', hodEmail: '' });

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setFormData({ name: '', code: '', hodName: '', hodEmail: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (e: React.MouseEvent, branch: { id: string; name: string; code: string }) => {
    e.stopPropagation();
    setEditingBranch({ ...branch, hodName: '', hodEmail: '' });
    setFormData({ name: branch.name, code: branch.code, hodName: '', hodEmail: '' });
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (e: React.MouseEvent, branchId: string) => {
    e.stopPropagation();
    setDeletingBranchId(branchId);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in department name and code',
        variant: 'destructive',
      });
      return;
    }

    // HOD is required only when creating a new department
    if (!editingBranch?.id && (!formData.hodName.trim() || !formData.hodEmail.trim())) {
      toast({
        title: 'Validation Error',
        description: 'HOD name and email are required when creating a department',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    if (!editingBranch?.id && !formData.hodEmail.includes('@')) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address for HOD',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingBranch?.id) {
        await updateBranch.mutateAsync({
          id: editingBranch.id,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
        });
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        });
      } else {
        await createBranch.mutateAsync({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          hodName: formData.hodName.trim(),
          hodEmail: formData.hodEmail.trim().toLowerCase(),
        });
        toast({
          title: 'Success',
          description: 'Department created with HOD successfully',
        });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save department',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingBranchId) return;

    try {
      await deleteBranch.mutateAsync(deletingBranchId);
      toast({
        title: 'Success',
        description: 'Department deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setDeletingBranchId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete department. Make sure no faculty are assigned.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              All Departments
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage departments with their HOD and faculty
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches?.map((branch) => (
              <Card
                key={branch.id}
                className="cursor-pointer hover:shadow-card transition-all duration-200 hover:border-primary/50 relative group"
                onClick={() => navigate(`/registrar/branches/${branch.id}`)}
              >
                <div className="absolute top-3 right-20 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleOpenEdit(e, branch)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => handleOpenDelete(e, branch.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant="outline">{branch.code}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{branch.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCog className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">HOD:</span>
                    <span className="font-medium">
                      {branch.hod?.name || 'Not Assigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Faculty:</span>
                    <span className="font-medium">{branch.facultyCount} members</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (!branches || branches.length === 0) && (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50" />
            <p className="mt-4 text-muted-foreground">No departments found</p>
            <Button className="mt-4" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Department
            </Button>
          </Card>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Edit Department' : 'Add New Department'}
            </DialogTitle>
            <DialogDescription>
              {editingBranch
                ? 'Update the department details'
                : 'Create a new department for your institution'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                placeholder="e.g., Department of Computer Science"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Department Code <span className="text-destructive">*</span></Label>
              <Input
                id="code"
                placeholder="e.g., CS"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            
            {/* HOD fields - only shown when creating new department */}
            {!editingBranch?.id && (
              <>
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Head of Department (Required)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hodName">HOD Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="hodName"
                    placeholder="e.g., Dr. John Smith"
                    value={formData.hodName}
                    onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hodEmail">HOD Email <span className="text-destructive">*</span></Label>
                  <Input
                    id="hodEmail"
                    type="email"
                    placeholder="e.g., john.smith@university.edu"
                    value={formData.hodEmail}
                    onChange={(e) => setFormData({ ...formData, hodEmail: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createBranch.isPending || updateBranch.isPending}
            >
              {editingBranch ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Make sure no faculty members are
              assigned to this department before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
