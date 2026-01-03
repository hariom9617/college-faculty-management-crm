import { Lecture } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LectureCardProps {
  lecture: Lecture;
  index: number;
}

export function LectureCard({ lecture, index }: LectureCardProps) {
  const statusVariant = lecture.status as 'completed' | 'cancelled' | 'rescheduled' | 'scheduled';

  return (
    <div
      className={cn(
        'group bg-card rounded-xl p-5 shadow-card card-hover border border-border/50',
        'animate-slide-up'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors">
            {lecture.subject}
          </h3>
          <p className="text-sm text-muted-foreground">{lecture.semester}</p>
        </div>
        <Badge variant={statusVariant} className="capitalize">
          {lecture.status}
        </Badge>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-secondary" />
          <span>{lecture.time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 text-secondary" />
          <span>{lecture.room}</span>
        </div>
      </div>

      {lecture.status === 'scheduled' && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span>Ready to conduct</span>
          </div>
        </div>
      )}
    </div>
  );
}
