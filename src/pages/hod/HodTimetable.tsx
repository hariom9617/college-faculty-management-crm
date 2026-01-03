import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useBranchFaculty } from '@/hooks/useProfiles';
import { useCreateLecture, useUpdateLecture, useDeleteLecture, useLecturesByDateRange, useBookedRooms, Lecture } from '@/hooks/useLectures';
import { useSubjects } from '@/hooks/useSubjects';
import { useCreateNotification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Clock, User, BookOpen, Building, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
];

const YEARS = [1, 2, 3, 4];
const BLOCKS = ['A', 'B', 'C', 'D'];
const ROOMS_PER_BLOCK = 15;

interface FormData {
  id?: string;
  faculty_id: string;
  subject: string;
  date: string;
  time: string;
  block: string;
  room: string;
  year: string;
}

const initialFormData: FormData = {
  faculty_id: '',
  subject: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  time: '',
  block: '',
  room: '',
  year: '',
};

export default function HodTimetable() {
  const { user } = useAuth();
  const { data: faculty } = useBranchFaculty(user?.branch_id);
  const createLecture = useCreateLecture();
  const updateLecture = useUpdateLecture();
  const deleteLecture = useDeleteLecture();
  const createNotification = useCreateNotification();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Fetch subjects based on selected year
  const { data: subjects = [] } = useSubjects(user?.branch_id, formData.year ? parseInt(formData.year) : null);

  // Get booked rooms for the selected date and time
  const { data: bookedRooms } = useBookedRooms(formData.date, formData.time);

  // Calculate week range for lectures display
  const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekStartStr = format(weekStart, 'yyyy-MM-dd');
  const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

  const { data: lectures } = useLecturesByDateRange(user?.branch_id, weekStartStr, weekEndStr);

  // Check if a room is booked (excluding current lecture if editing)
  const isRoomBooked = (block: string, room: number) => {
    if (!bookedRooms) return false;
    return bookedRooms.some((r) => {
      if (isEditing && formData.id) {
        // When editing, check if the booked room belongs to the current lecture
        const currentLecture = lectures?.find(l => l.id === formData.id);
        if (currentLecture && currentLecture.block === r.block && currentLecture.room === r.room) {
          return false; // Allow the current lecture's room
        }
      }
      return r.block === block && r.room === room;
    });
  };

  // Get available rooms for the selected block
  const availableRooms = useMemo(() => {
    if (!formData.block) return [];
    const rooms: number[] = [];
    for (let i = 1; i <= ROOMS_PER_BLOCK; i++) {
      if (!isRoomBooked(formData.block, i)) {
        rooms.push(i);
      }
    }
    return rooms;
  }, [formData.block, bookedRooms, isEditing, formData.id]);

  const handleSubmit = async () => {
    if (!formData.faculty_id || !formData.subject || !formData.date || !formData.time || !formData.block || !formData.room || !formData.year) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    // Double-check room availability
    if (isRoomBooked(formData.block, parseInt(formData.room))) {
      toast({
        title: 'Room Not Available',
        description: 'This room is already booked for the selected time slot',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isEditing && formData.id) {
        await updateLecture.mutateAsync({
          id: formData.id,
          faculty_id: formData.faculty_id,
          subject: formData.subject,
          date: formData.date,
          time: formData.time,
          block: formData.block,
          room: parseInt(formData.room),
          year: parseInt(formData.year),
        });
        toast({
          title: 'Success',
          description: 'Lecture updated successfully',
        });
      } else {
        await createLecture.mutateAsync({
          faculty_id: formData.faculty_id,
          subject: formData.subject,
          date: formData.date,
          time: formData.time,
          block: formData.block,
          room: parseInt(formData.room),
          year: parseInt(formData.year),
        });

        // Send notification to faculty
        const selectedFaculty = faculty?.find(f => f.id === formData.faculty_id);
        await createNotification.mutateAsync({
          user_id: formData.faculty_id,
          title: 'New Lecture Scheduled',
          message: `You have been assigned to teach ${formData.subject} on ${format(new Date(formData.date), 'MMM dd, yyyy')} at ${formData.time} in Block ${formData.block}, Room ${formData.room}.`,
          type: 'lecture',
        });

        toast({
          title: 'Success',
          description: 'Lecture scheduled and faculty notified',
        });
      }

      setIsDialogOpen(false);
      setIsEditing(false);
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save lecture',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (lecture: Lecture) => {
    setFormData({
      id: lecture.id,
      faculty_id: lecture.faculty_id,
      subject: lecture.subject,
      date: lecture.date,
      time: lecture.time,
      block: lecture.block,
      room: lecture.room.toString(),
      year: lecture.year.toString(),
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteLecture.mutateAsync(deleteId);
      toast({
        title: 'Success',
        description: 'Lecture deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete lecture',
        variant: 'destructive',
      });
    }
    setDeleteId(null);
  };

  const openNewDialog = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // Group lectures by day
  const lecturesByDay = useMemo(() => {
    const grouped: Record<string, Lecture[]> = {};
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
      grouped[date] = lectures?.filter((l) => l.date === date) || [];
    }
    return grouped;
  }, [lectures, weekStart]);

  const getYearLabel = (year: number) => {
    return year === 1 ? '1st Year' : year === 2 ? '2nd Year' : year === 3 ? '3rd Year' : '4th Year';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Lecture Timetable
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage lectures for your faculty
            </p>
          </div>
          <Button onClick={openNewDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Lecture
          </Button>
        </div>

        {/* Schedule Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setIsEditing(false);
            setFormData(initialFormData);
          }
        }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Lecture' : 'Schedule New Lecture'}</DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update the lecture details' : 'Assign a lecture to a faculty member'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) =>
                    setFormData({ ...formData, year: value, subject: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year first" />
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
                <Label>Subject</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) =>
                    setFormData({ ...formData, subject: value })
                  }
                  disabled={!formData.year}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.year ? "Select subject" : "Select year first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No subjects for this year
                      </SelectItem>
                    ) : (
                      subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.year && subjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No subjects found. Add subjects in the Subjects page first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Faculty</Label>
                <Select
                  value={formData.faculty_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, faculty_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculty?.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value, room: '' })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Time Slot</Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) =>
                    setFormData({ ...formData, time: value, room: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Block</Label>
                <Select
                  value={formData.block}
                  onValueChange={(value) =>
                    setFormData({ ...formData, block: value, room: '' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCKS.map((block) => (
                      <SelectItem key={block} value={block}>
                        Block {block}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Room</Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) =>
                    setFormData({ ...formData, room: value })
                  }
                  disabled={!formData.block || !formData.date || !formData.time}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !formData.block || !formData.date || !formData.time 
                        ? 'Select block, date & time first' 
                        : 'Select room'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No rooms available
                      </SelectItem>
                    ) : (
                      availableRooms.map((room) => (
                        <SelectItem key={room} value={room.toString()}>
                          Room {formData.block}-{room}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {formData.block && formData.date && formData.time && availableRooms.length === 0 && (
                  <p className="text-sm text-destructive">
                    All rooms in Block {formData.block} are booked for this time slot
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditing(false);
                  setFormData(initialFormData);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createLecture.isPending || updateLecture.isPending}
              >
                {isEditing ? 'Update' : 'Schedule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Week Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Week of {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
              </CardTitle>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Week View */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(lecturesByDay).map(([date, dayLectures]) => (
            <Card key={date}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {format(new Date(date), 'EEEE, MMM dd')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayLectures && dayLectures.length > 0 ? (
                  dayLectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="p-3 rounded-lg bg-muted/50 space-y-1 group relative"
                    >
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEdit(lecture)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => setDeleteId(lecture.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {lecture.subject}
                        </span>
                        <Badge
                          variant={
                            lecture.status === 'completed'
                              ? 'default'
                              : lecture.status === 'cancelled'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="text-xs"
                        >
                          {lecture.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {lecture.time}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building className="w-3 h-3" />
                        Block {lecture.block} - Room {lecture.room}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <BookOpen className="w-3 h-3" />
                        {getYearLabel(lecture.year)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {lecture.faculty?.name}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No lectures
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Scheduled Lectures Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Scheduled Lectures This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lectures && lectures.length > 0 ? (
                  lectures.map((lecture) => (
                    <TableRow key={lecture.id}>
                      <TableCell>
                        {format(new Date(lecture.date), 'MMM dd')}
                      </TableCell>
                      <TableCell>{lecture.time}</TableCell>
                      <TableCell>{lecture.subject}</TableCell>
                      <TableCell>{getYearLabel(lecture.year)}</TableCell>
                      <TableCell>
                        Block {lecture.block}, Room {lecture.room}
                      </TableCell>
                      <TableCell>{lecture.faculty?.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lecture.status === 'completed'
                              ? 'default'
                              : lecture.status === 'cancelled'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {lecture.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lecture)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(lecture.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No lectures scheduled for this week
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lecture</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lecture? This action cannot be undone.
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
}