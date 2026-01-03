import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjectsByYear, useCreateSubject, useUpdateSubject, useDeleteSubject, Subject } from "@/hooks/useSubjects";
import { useBranchFaculty } from "@/hooks/useProfiles";

const YEARS = [1, 2, 3, 4];

const HodSubjects = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const branchId = user?.branch_id;
  
  const { data: subjectsByYear = { 1: [], 2: [], 3: [], 4: [] }, isLoading } = useSubjectsByYear(branchId);
  const { data: faculty = [] } = useBranchFaculty(branchId);
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", year: "1" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingSubject) {
        await updateSubject.mutateAsync({
          id: editingSubject.id,
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          year: parseInt(formData.year),
        });
        toast({
          title: "Success",
          description: "Subject updated successfully",
        });
      } else {
        if (!branchId) {
          toast({
            title: "Error",
            description: "No department assigned",
            variant: "destructive",
          });
          return;
        }
        
        await createSubject.mutateAsync({ 
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          branch_id: branchId,
          year: parseInt(formData.year),
        });
        toast({
          title: "Success",
          description: "Subject added successfully",
        });
      }
      
      setIsDialogOpen(false);
      setEditingSubject(null);
      setFormData({ name: "", code: "", year: "1" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save subject",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({ name: subject.name, code: subject.code, year: subject.year.toString() });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteSubject.mutateAsync(deleteId);
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subject",
        variant: "destructive",
      });
    }
    setDeleteId(null);
  };

  const openNewDialog = (year?: number) => {
    setEditingSubject(null);
    setFormData({ name: "", code: "", year: year?.toString() || "1" });
    setIsDialogOpen(true);
  };

  const getYearLabel = (year: number) => {
    return year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year';
  };

  const totalSubjects = Object.values(subjectsByYear).flat().length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
            <p className="text-muted-foreground">
              Manage subjects for your department by year
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openNewDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => setFormData({ ...formData, year: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {getYearLabel(year)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Data Structures"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CS201"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createSubject.isPending || updateSubject.isPending}>
                    {editingSubject ? "Update" : "Add"} Subject
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Department Subjects ({totalSubjects})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading subjects...
              </div>
            ) : (
              <Tabs defaultValue="1" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  {YEARS.map((year) => (
                    <TabsTrigger key={year} value={year.toString()}>
                      {getYearLabel(year)} ({subjectsByYear[year]?.length || 0})
                    </TabsTrigger>
                  ))}
                </TabsList>
                {YEARS.map((year) => (
                  <TabsContent key={year} value={year.toString()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{getYearLabel(year)} Subjects</h3>
                      <Button size="sm" variant="outline" onClick={() => openNewDialog(year)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to {getYearLabel(year)}
                      </Button>
                    </div>
                    {subjectsByYear[year]?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground border rounded-lg">
                        No subjects added for {getYearLabel(year)}. Click "Add to {getYearLabel(year)}" to get started.
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject Code</TableHead>
                            <TableHead>Subject Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subjectsByYear[year]?.map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{subject.code}</TableCell>
                              <TableCell>{subject.name}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(subject)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(subject.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default HodSubjects;