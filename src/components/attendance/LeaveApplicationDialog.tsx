import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useMarkAttendance } from '@/hooks/useAttendance';
import { useToast } from '@/hooks/use-toast';
import { format, isBefore, startOfToday } from 'date-fns';
import { CalendarIcon, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LeaveApplicationDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [reason, setReason] = useState('');
  const markAttendance = useMarkAttendance();

  const handleApplyLeave = async () => {
    if (!user || !selectedDate) return;

    try {
      await markAttendance.mutateAsync({
        user_id: user.id,
        role: user.role || 'faculty',
        branch_id: user.branch_id || null,
        status: 'leave',
        date: format(selectedDate, 'yyyy-MM-dd'),
      });

      toast({
        title: 'Leave Applied',
        description: `Leave has been applied for ${format(selectedDate, 'MMMM dd, yyyy')}.`,
      });

      setOpen(false);
      setSelectedDate(undefined);
      setReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to apply for leave',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Apply for Leave
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, startOfToday())}
                  initialFocus
                  className={cn('p-3 pointer-events-auto')}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea
              placeholder="Enter reason for leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyLeave}
              disabled={!selectedDate || markAttendance.isPending}
            >
              {markAttendance.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Apply Leave
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
