
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, XCircle } from 'lucide-react';

export type ActivityType = 'check-in' | 'payment' | 'membership' | 'booking';

interface ActivityProps {
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  details: string;
  status?: 'success' | 'failed' | 'pending';
}

export function RecentActivityItem({ type, user, timestamp, details, status = 'success' }: ActivityProps) {
  const getTypeIcon = () => {
    switch (type) {
      case 'check-in':
        return <div className="h-2 w-2 rounded-full bg-green-500"></div>;
      case 'payment':
        return <div className="h-2 w-2 rounded-full bg-blue-500"></div>;
      case 'membership':
        return <div className="h-2 w-2 rounded-full bg-purple-500"></div>;
      case 'booking':
        return <div className="h-2 w-2 rounded-full bg-orange-500"></div>;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <div className="h-4 w-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="relative mt-1">
        {getTypeIcon()}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{user.name}</span>
          <time className="text-xs text-muted-foreground ml-auto">{timestamp}</time>
        </div>
        <p className="text-sm text-muted-foreground">{details}</p>
      </div>
      <div className="mt-1">
        {getStatusIcon()}
      </div>
    </div>
  );
}
