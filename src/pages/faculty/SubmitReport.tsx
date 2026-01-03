import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFacultyLectures, useUpdateLectureStatus } from '@/hooks/useLectures';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateLectureReport } from '@/hooks/useLectureReports';
import { useCreateNotification } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CheckCircle, Send, Loader2, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function SubmitReport() {
  const { user } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: scheduledLectures = [], isLoading: lecturesLoading } = useFacultyLectures(user?.id);
  const createReport = useCreateLectureReport();
  const updateLectureStatus = useUpdateLectureStatus();
  const createNotification = useCreateNotification();

  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [formData, setFormData] = useState({
    topic: '',
    duration: '60',
    status: 'completed',
    remarks: '',
  });

  const selectedLecture = scheduledLectures.find(l => l.id === selectedLectureId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a report.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedLectureId || !selectedLecture) {
      toast({
        title: 'Error',
        description: 'Please select a lecture to report.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createReport.mutateAsync({
        faculty_id: user.id,
        subject: selectedLecture.subject,
        date: selectedLecture.date,
        topic_covered: formData.topic,
        duration: parseInt(formData.duration),
        status: formData.status,
        remarks: formData.remarks || undefined,
      });

      // Update lecture status
      await updateLectureStatus.mutateAsync({
        id: selectedLectureId,
        status: formData.status,
      });

      // Find and notify the HOD of the department
      if (user.branch_id) {
        const { data: hodData } = await supabase
          .from('user_roles')
          .select(`
            profile_id,
            profiles!user_roles_profile_id_fkey(id, branch_id)
          `)
          .eq('role', 'hod');

        if (hodData) {
          const hod = hodData.find((h: any) => h.profiles?.branch_id === user.branch_id);
          if (hod) {
            await createNotification.mutateAsync({
              user_id: hod.profile_id,
              title: 'New Lecture Report Submitted',
              message: `${user.name} has submitted a report for ${selectedLecture.subject} - ${formData.topic} (${formData.status})`,
              type: 'report',
            });
          }
        }
      }

      setIsSuccess(true);
      toast({
        title: 'Report Submitted!',
        description: 'Your lecture report has been submitted successfully.',
      });

      setTimeout(() => {
        navigate('/faculty');
      }, 2000);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isSuccess) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Report Submitted Successfully!
            </h2>
            <p className="text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            to="/faculty"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Submit Lecture Report
          </h1>
          <p className="text-muted-foreground mt-1">
            Select a scheduled lecture and fill in the details
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl p-6 md:p-8 border border-border/50 shadow-card animate-slide-up"
        >
          <div className="space-y-6">
            {/* Select Lecture */}
            <div className="space-y-2">
              <Label htmlFor="lecture">Select Lecture</Label>
              {lecturesLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading lectures...
                </div>
              ) : scheduledLectures.length === 0 ? (
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <CalendarDays className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No scheduled lectures found. Please contact your HOD to assign lectures.
                  </p>
                </div>
              ) : (
                <Select
                  value={selectedLectureId}
                  onValueChange={setSelectedLectureId}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select a lecture to report" />
                  </SelectTrigger>
                  <SelectContent>
                    {scheduledLectures.map((lecture) => (
                      <SelectItem key={lecture.id} value={lecture.id}>
                        {lecture.subject} - {format(new Date(lecture.date), 'MMM d, yyyy')} at {lecture.time} (Block {lecture.block}, Room {lecture.room})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Selected Lecture Details */}
            {selectedLecture && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <h3 className="font-medium text-foreground mb-2">Selected Lecture</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="text-muted-foreground">Subject:</span> {selectedLecture.subject}</p>
                  <p><span className="text-muted-foreground">Date:</span> {format(new Date(selectedLecture.date), 'MMM d, yyyy')}</p>
                  <p><span className="text-muted-foreground">Time:</span> {selectedLecture.time}</p>
                  <p><span className="text-muted-foreground">Location:</span> Block {selectedLecture.block}, Room {selectedLecture.room}</p>
                  <p><span className="text-muted-foreground">Year:</span> {selectedLecture.year}</p>
                </div>
              </div>
            )}

            {/* Topic Covered */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic Covered</Label>
              <Input
                id="topic"
                placeholder="Enter the topic covered in this lecture"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                className="h-12"
                required
              />
            </div>

            {/* Duration and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) =>
                    setFormData({ ...formData, duration: value })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="75">75 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Lecture Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                placeholder="Add any additional notes or observations..."
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={createReport.isPending || !selectedLectureId}
              >
                {createReport.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
