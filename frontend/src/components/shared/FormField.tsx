import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormField({ label, error, required, className, ...props }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        className={cn(error && 'border-red-300 focus-visible:ring-red-400', className)}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
