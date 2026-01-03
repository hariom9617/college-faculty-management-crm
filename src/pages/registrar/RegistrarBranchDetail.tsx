import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useBranchDetails } from '@/hooks/useBranches';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Building2, Mail, UserCog, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegistrarBranchDetail() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useBranchDetails(branchId || null);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Branch not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/registrar/branches')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Departments
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const { branch, hod, faculty } = data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/registrar/branches')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-serif font-bold text-foreground">
                {branch.name}
              </h1>
              <Badge variant="outline">{branch.code}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">Department Details</p>
          </div>
        </div>

        {/* HOD Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCog className="w-5 h-5 text-primary" />
              Head of Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hod ? (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {hod.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-lg">{hod.name}</p>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{hod.email}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No HOD assigned to this department</p>
            )}
          </CardContent>
        </Card>

        {/* Faculty List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-primary" />
              Faculty Members ({faculty?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {faculty && faculty.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculty.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {member.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  No faculty members in this department
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
