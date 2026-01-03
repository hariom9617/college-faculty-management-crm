import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/cards/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  useLectureReports,
  useDepartmentStats,
} from "@/hooks/useLectureReports";
import { useAllDepartments } from "@/hooks/useProfiles";
import { RegistrarAttendanceView } from "@/components/attendance/RegistrarAttendanceView";
import {
  Building2,
  FileText,
  CheckCircle,
  TrendingUp,
  Search,
  Filter,
  Loader2,
} from "lucide-react";

export default function RegistrarDashboard() {
  const { user } = useAuth();
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allReports = [], isLoading } = useLectureReports();
  const { data: departmentStats = [] } = useDepartmentStats();
  const { data: departments = [] } = useAllDepartments();

  const filteredReports = allReports.filter((report) => {
    const matchesDepartment =
      departmentFilter === "all" ||
      report.faculty?.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesSearch =
      report.faculty?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.faculty?.department
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesStatus && matchesSearch;
  });

  const totalLectures = departmentStats.reduce(
    (sum, d) => sum + d.totalLectures,
    0
  );
  const totalCompleted = departmentStats.reduce(
    (sum, d) => sum + d.completed,
    0
  );
  const completionRate =
    totalLectures > 0 ? Math.round((totalCompleted / totalLectures) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Registrar Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            College-wide academic overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Departments"
            value={departments.length}
            icon={Building2}
            variant="primary"
            index={0}
          />
          <StatsCard
            title="Total Reports"
            value={allReports.length}
            icon={FileText}
            variant="secondary"
            index={1}
          />
          <StatsCard
            title="Completed"
            value={totalCompleted}
            icon={CheckCircle}
            variant="success"
            index={2}
          />
          <StatsCard
            title="Completion Rate"
            value={`${completionRate}%`}
            icon={TrendingUp}
            index={3}
          />
        </div>

        {/* Department Summary Cards */}
        <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
            Department Summary
          </h2>
          {departmentStats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {departmentStats.map((dept, index) => (
                <div
                  key={dept.department}
                  className="bg-card rounded-xl p-5 border border-border/50 shadow-card card-hover animate-slide-up"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <h3 className="font-semibold text-card-foreground mb-3">
                    {dept.department}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-medium">{dept.totalLectures}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Completed</span>
                      <span className="font-medium">{dept.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-destructive">Cancelled</span>
                      <span className="font-medium">{dept.cancelled}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rate</span>
                        <span className="font-semibold text-secondary">
                          {dept.totalLectures > 0
                            ? Math.round(
                                (dept.completed / dept.totalLectures) * 100
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 border border-border/50 text-center">
              <p className="text-muted-foreground">
                No department data available
              </p>
            </div>
          )}
        </div>

        {/* Department-wise Attendance */}
        <div className="animate-slide-up" style={{ animationDelay: "300ms" }}>
          <RegistrarAttendanceView />
        </div>

        {/* All Reports Table */}
        <div
          className="bg-card rounded-xl border border-border/50 shadow-card animate-slide-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-serif font-semibold text-card-foreground mb-4">
              All Lecture Reports
            </h2>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by faculty, subject, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <TableHead>Department</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Date</TableHead>
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
                        <TableCell>
                          <Badge variant="outline">
                            {report.faculty?.department || "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {report.faculty?.name || "Unknown"}
                        </TableCell>
                        <TableCell>{report.subject}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {report.topic_covered}
                        </TableCell>
                        <TableCell>
                          {new Date(report.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              report.status as
                                | "completed"
                                | "cancelled"
                                | "rescheduled"
                            }
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
                        <p className="text-muted-foreground">
                          No reports found
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
