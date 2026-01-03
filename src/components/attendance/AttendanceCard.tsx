import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTodayAttendance, useMyAttendanceHistory, useMarkAttendance } from '@/hooks/useAttendance';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Loader2, Calendar } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { LeaveApplicationDialog } from './LeaveApplicationDialog';

export function AttendanceCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);

  const { data: todayAttendance, isLoading: todayLoading } = useTodayAttendance(user?.id);
  const { data: history = [], isLoading: historyLoading } = useMyAttendanceHistory(user?.id);
  const markAttendance = useMarkAttendance();

  const handleMarkAttendance = async (status: 'present' | 'leave') => {
    if (!user) return;

    try {
      await markAttendance.mutateAsync({
        user_id: user.id,
        role: user.role || 'faculty',
        branch_id: user.branch_id || null,
        status,
      });

      toast({
        title: 'Attendance Marked',
        description: `You have marked yourself as ${status === 'present' ? 'Present' : 'On Leave'} for today.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark attendance',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : todayAttendance ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={todayAttendance.status === 'present' ? 'default' : 'destructive'}>
                  {todayAttendance.status === 'present' ? 'Present' : 'On Leave'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Marked at {format(new Date(todayAttendance.created_at), 'hh:mm a')}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
                  View History
                </Button>
                <LeaveApplicationDialog />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You haven't marked your attendance yet.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleMarkAttendance('present')}
                  disabled={markAttendance.isPending}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Present
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleMarkAttendance('leave')}
                  disabled={markAttendance.isPending}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  On Leave
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="w-full">
                View History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Attendance History</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No attendance records yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {format(new Date(record.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                        {record.status === 'present' ? 'Present' : 'On Leave'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
