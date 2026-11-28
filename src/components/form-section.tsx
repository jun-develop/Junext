import { Loader2Icon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type FormSectionProps = { title: string; description?: string; children: ReactNode };

// FormSection is one block of a form card: its title and hint on the left, a two-column field grid on
// the right. Separate sections with <Separator />.
export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="grid gap-x-8 gap-y-6 md:grid-cols-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      <div className="grid content-start gap-6 sm:grid-cols-2 md:col-span-2">{children}</div>
    </section>
  );
}

// RequiredMark flags a required field label.
export function RequiredMark() {
  return (
    <span aria-hidden className="text-destructive">
      {'*'}
    </span>
  );
}

type SubmitButtonProps = {
  isPending: boolean;
  icon: ReactNode;
  label: string;
  pendingLabel: string;
};

// SubmitButton shows a spinner instead of its icon while the form is saving.
export function SubmitButton({ isPending, icon, label, pendingLabel }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? <Loader2Icon className="animate-spin" /> : icon}
      {isPending ? pendingLabel : label}
    </Button>
  );
}
