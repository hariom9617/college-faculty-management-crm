import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAttendanceByBranch } from '@/hooks/useAttendance';
import { format } from 'date-fns';
import { Loader2, Building2, UserCheck, UserX, Users } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function RegistrarAttendanceView() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data: branchAttendance, isLoading } = useAttendanceByBranch(selectedDate);

  const branches = branchAttendance ? Object.values(branchAttendance) : [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Department-wise Attendance
          </CardTitle>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : branches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No departments found</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {branches.map((branchData) => (
              <AccordionItem key={branchData.branch.id} value={branchData.branch.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{branchData.branch.code}</Badge>
                      <span className="font-medium">{branchData.branch.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-success">
                        <UserCheck className="w-4 h-4" />
                        {branchData.present.length}
                      </span>
                      <span className="flex items-center gap-1 text-destructive">
                        <UserX className="w-4 h-4" />
                        {branchData.leave.length}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {branchData.notMarked.length}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {branchData.present.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-success mb-2">Present ({branchData.present.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {branchData.present.map(({ profile }) => (
                            <Badge key={profile.id} variant="outline" className="bg-success/5">
                              {profile.name}
                              {profile.role === 'hod' && <span className="ml-1 text-xs">(HOD)</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {branchData.leave.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-destructive mb-2">On Leave ({branchData.leave.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {branchData.leave.map(({ profile }) => (
                            <Badge key={profile.id} variant="outline" className="bg-destructive/5">
                              {profile.name}
                              {profile.role === 'hod' && <span className="ml-1 text-xs">(HOD)</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {branchData.notMarked.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Not Marked ({branchData.notMarked.length})</h4>
                        <div className="flex flex-wrap gap-2">
                          {branchData.notMarked.map((profile) => (
                            <Badge key={profile.id} variant="outline" className="bg-muted">
                              {profile.name}
                              {profile.role === 'hod' && <span className="ml-1 text-xs">(HOD)</span>}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {branchData.present.length === 0 && branchData.leave.length === 0 && branchData.notMarked.length === 0 && (
                      <p className="text-sm text-muted-foreground">No faculty in this department</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
