import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBranchAttendance } from '@/hooks/useAttendance';
import { useBranchFaculty } from '@/hooks/useProfiles';
import { format } from 'date-fns';
import { Loader2, Users, UserCheck, UserX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HodAttendanceViewProps {
  branchId?: string | null;
}

export function HodAttendanceView({ branchId }: HodAttendanceViewProps) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { data: attendance = [], isLoading } = useBranchAttendance(branchId, selectedDate);
  const { data: allFaculty = [] } = useBranchFaculty(branchId);

  const presentList = attendance.filter((a) => a.status === 'present');
  const leaveList = attendance.filter((a) => a.status === 'leave');
  
  // Find faculty who haven't marked attendance
  const markedUserIds = attendance.map((a) => a.user_id);
  const notMarkedList = allFaculty.filter((f) => !markedUserIds.includes(f.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Faculty Attendance
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
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-success/10 rounded-lg p-3 text-center">
                <UserCheck className="w-5 h-5 mx-auto text-success mb-1" />
                <p className="text-2xl font-bold text-success">{presentList.length}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="bg-destructive/10 rounded-lg p-3 text-center">
                <UserX className="w-5 h-5 mx-auto text-destructive mb-1" />
                <p className="text-2xl font-bold text-destructive">{leaveList.length}</p>
                <p className="text-xs text-muted-foreground">On Leave</p>
              </div>
              <div className="bg-muted rounded-lg p-3 text-center">
                <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-2xl font-bold">{notMarkedList.length}</p>
                <p className="text-xs text-muted-foreground">Not Marked</p>
              </div>
            </div>

            <Tabs defaultValue="present">
              <TabsList className="w-full">
                <TabsTrigger value="present" className="flex-1">Present</TabsTrigger>
                <TabsTrigger value="leave" className="flex-1">On Leave</TabsTrigger>
                <TabsTrigger value="not-marked" className="flex-1">Not Marked</TabsTrigger>
              </TabsList>

              <TabsContent value="present">
                {presentList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No faculty present</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presentList.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.profile?.name || 'Unknown'}</TableCell>
                          <TableCell>{record.profile?.email || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="leave">
                {leaveList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No faculty on leave</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveList.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.profile?.name || 'Unknown'}</TableCell>
                          <TableCell>{record.profile?.email || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              <TabsContent value="not-marked">
                {notMarkedList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">All faculty have marked attendance</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notMarkedList.map((faculty) => (
                        <TableRow key={faculty.id}>
                          <TableCell className="font-medium">{faculty.name}</TableCell>
                          <TableCell>{faculty.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
