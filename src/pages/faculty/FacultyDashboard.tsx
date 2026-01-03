import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LectureCard } from '@/components/cards/LectureCard';
import { StatsCard } from '@/components/cards/StatsCard';
import { Button } from '@/components/ui/button';
import { useTodayLectures, useWeeklyLectureCount } from '@/hooks/useLectures';
import { useLectureReports } from '@/hooks/useLectureReports';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  Clock,
  FileText,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { format } from 'date-fns';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const { data: todayLectures = [], isLoading: lecturesLoading } = useTodayLectures(user?.id);
  const { data: weeklyCount = 0 } = useWeeklyLectureCount(user?.id);
  const { data: myReports = [], isLoading: reportsLoading } = useLectureReports({ facultyId: user?.id });
  
  const [isReportsDialogOpen, setIsReportsDialogOpen] = useState(false);

  const completedCount = todayLectures.filter((l) => l.status === 'completed').length;
  const scheduledCount = todayLectures.filter((l) => l.status === 'scheduled').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-serif font-bold text-foreground">
              Good Morning, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's your teaching schedule for today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell userId={user?.id} />
            <Link to="/faculty/submit-report">
              <Button variant="hero" size="lg" className="gap-2">
                <FileText className="w-5 h-5" />
                Submit Lecture Report
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Today's Lectures"
            value={todayLectures.length}
            icon={CalendarDays}
            variant="primary"
            index={0}
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle}
            variant="success"
            index={1}
          />
          <StatsCard
            title="Remaining"
            value={scheduledCount}
            icon={Clock}
            variant="secondary"
            index={2}
          />
          <StatsCard
            title="This Week"
            value={weeklyCount}
            subtitle="Total lectures"
            icon={BookOpen}
            index={3}
          />
        </div>

        {/* Today's Lectures */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Today's Schedule
            </h2>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {lecturesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : todayLectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {todayLectures.map((lecture, index) => (
                <LectureCard 
                  key={lecture.id} 
                  lecture={{
                    id: lecture.id,
                    subject: lecture.subject,
                    time: lecture.time,
                    room: `Block ${lecture.block} - Room ${lecture.room}`,
                    status: lecture.status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
                    semester: `Year ${lecture.year}`,
                  }} 
                  index={index} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 border border-border/50 text-center">
              <p className="text-muted-foreground">No lectures scheduled for today</p>
            </div>
          )}
        </div>

        {/* Attendance and Quick Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceCard />
          
          {/* Quick Actions */}
          <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg font-semibold text-card-foreground mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link to="/faculty/submit-report">
                <Button variant="outline" className="gap-2">
                  <FileText className="w-4 h-4" />
                  New Report
                </Button>
              </Link>
              <Button variant="outline" className="gap-2" disabled>
                <CalendarDays className="w-4 h-4" />
                View Schedule
              </Button>
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={() => setIsReportsDialogOpen(true)}
              >
                <BookOpen className="w-4 h-4" />
                My Reports ({myReports.length})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* My Reports Dialog */}
      <Dialog open={isReportsDialogOpen} onOpenChange={setIsReportsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Submitted Reports</DialogTitle>
          </DialogHeader>
          {reportsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : myReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports submitted yet</p>
              <Link to="/faculty/submit-report">
                <Button className="mt-4">Submit Your First Report</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic Covered</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(new Date(report.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{report.subject}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.topic_covered}
                    </TableCell>
                    <TableCell>{report.duration} mins</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === 'completed'
                            ? 'default'
                            : report.status === 'cancelled'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}