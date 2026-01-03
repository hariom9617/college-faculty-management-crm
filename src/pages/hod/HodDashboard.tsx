import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/cards/StatsCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { useLectureReports, useFacultyCount } from '@/hooks/useLectureReports';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { HodAttendanceView } from '@/components/attendance/HodAttendanceView';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';

export default function HodDashboard() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: departmentReports = [], isLoading } = useLectureReports({ 
    branchId: user?.branch_id || undefined
  });
  const { data: facultyCount = 0 } = useFacultyCount({ branchId: user?.branch_id || undefined });

  const filteredReports = departmentReports.filter((report) => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesSearch =
      report.faculty?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.topic_covered.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const completedCount = departmentReports.filter((r) => r.status === 'completed').length;
  const cancelledCount = departmentReports.filter((r) => r.status === 'cancelled').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">
              HOD Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              {user?.department} Department Overview
            </p>
          </div>
          <NotificationBell userId={user?.id} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Faculty Members"
            value={facultyCount}
            icon={Users}
            variant="primary"
            index={0}
          />
          <StatsCard
            title="Total Reports"
            value={departmentReports.length}
            icon={FileText}
            variant="secondary"
            index={1}
          />
          <StatsCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle}
            variant="success"
            index={2}
          />
          <StatsCard
            title="Cancelled"
            value={cancelledCount}
            icon={XCircle}
            index={3}
          />
        </div>

        {/* HOD Self Attendance */}
        <div className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <AttendanceCard />
        </div>

        {/* Tabs for Reports and Attendance */}
        <Tabs defaultValue="reports" className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <TabsList>
            <TabsTrigger value="reports">Lecture Reports</TabsTrigger>
            <TabsTrigger value="attendance">Faculty Attendance</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <div className="bg-card rounded-xl border border-border/50 shadow-card">
              <div className="p-6 border-b border-border/50">
                <h2 className="text-xl font-serif font-semibold text-card-foreground mb-4">
                  Faculty Lecture Reports
                </h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search by faculty, subject, or topic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-11"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faculty</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.length > 0 ? (
                        filteredReports.map((report, index) => (
                          <TableRow
                            key={report.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell className="font-medium">
                              {report.faculty?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>{report.subject}</TableCell>
                            <TableCell className="max-w-[200px] truncate">
                              {report.topic_covered}
                            </TableCell>
                            <TableCell>
                              {new Date(report.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>{report.duration} min</TableCell>
                            <TableCell>
                              <Badge
                                variant={report.status as 'completed' | 'cancelled' | 'rescheduled'}
                                className="capitalize"
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8">
                            <p className="text-muted-foreground">No reports found</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <HodAttendanceView branchId={user?.branch_id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
