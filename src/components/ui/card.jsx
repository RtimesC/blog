import { cn } from '@/lib/utils';

function Card({ className, ...props }) {
  return <div className={cn('rounded-xl border bg-card text-card-foreground', className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn('', className)} {...props} />;
}

export { Card, CardContent };
