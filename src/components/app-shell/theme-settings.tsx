'use client';

import { CircleCheckIcon, SettingsIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { RadioGroup } from 'radix-ui';
import { type ReactNode, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { resetLayoutPreferences, setLayoutPreference } from './actions';
import {
  SIDEBAR_COLLAPSIBLE_COOKIE,
  SIDEBAR_VARIANT_COOKIE,
  type SidebarCollapsible,
  type SidebarVariant,
} from './layout-preferences';

type ThemeSettingsProps = { variant: SidebarVariant; collapsible: SidebarCollapsible };
type Option = { value: string; label: string; preview: ReactNode };

const BAR = 'rounded-sm bg-muted-foreground/30';

// ThemeSettings is the gear drawer: colour theme, sidebar style and how the sidebar collapses.
export function ThemeSettings({ variant, collapsible }: ThemeSettingsProps) {
  const t = useTranslations('common.settings');
  const { theme = 'system', setTheme } = useTheme();
  const { open, setOpen } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const layout = open ? 'default' : collapsible;

  function handleLayoutChange(value: string) {
    if (value === 'default') {
      setOpen(true);
      return;
    }
    setOpen(false);
    startTransition(() => setLayoutPreference(SIDEBAR_COLLAPSIBLE_COOKIE, value));
  }

  function handleReset() {
    setTheme('system');
    setOpen(true);
    startTransition(() => resetLayoutPreferences());
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t('open')}>
          <SettingsIcon />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="pb-0">
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-6 overflow-y-auto px-4">
          <OptionGroup
            title={t('theme')}
            value={theme}
            onChange={setTheme}
            options={[
              {
                value: 'system',
                label: t('themes.system'),
                preview: <ThemePreview mode="system" />,
              },
              { value: 'light', label: t('themes.light'), preview: <ThemePreview mode="light" /> },
              { value: 'dark', label: t('themes.dark'), preview: <ThemePreview mode="dark" /> },
            ]}
          />
          <OptionGroup
            title={t('sidebar')}
            className="max-md:hidden"
            value={variant}
            disabled={isPending}
            onChange={(value) =>
              startTransition(() => setLayoutPreference(SIDEBAR_VARIANT_COOKIE, value))
            }
            options={[
              {
                value: 'inset',
                label: t('sidebars.inset'),
                preview: <SidebarPreview variant="inset" />,
              },
              {
                value: 'floating',
                label: t('sidebars.floating'),
                preview: <SidebarPreview variant="floating" />,
              },
              {
                value: 'sidebar',
                label: t('sidebars.sidebar'),
                preview: <SidebarPreview variant="sidebar" />,
              },
            ]}
          />
          <OptionGroup
            title={t('layout')}
            className="max-md:hidden"
            value={layout}
            disabled={isPending}
            onChange={handleLayoutChange}
            options={[
              {
                value: 'default',
                label: t('layouts.default'),
                preview: <LayoutPreview width="w-1/3" />,
              },
              { value: 'icon', label: t('layouts.icon'), preview: <LayoutPreview width="w-2" /> },
              {
                value: 'offcanvas',
                label: t('layouts.offcanvas'),
                preview: <LayoutPreview width={null} />,
              },
            ]}
          />
        </div>
        <SheetFooter>
          <Button variant="destructive" disabled={isPending} onClick={handleReset}>
            {t('reset')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

type OptionGroupProps = {
  title: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

function OptionGroup({ title, value, options, onChange, disabled, className }: OptionGroupProps) {
  return (
    <section className={className}>
      <h3 className="text-muted-foreground mb-2 text-sm font-semibold">{title}</h3>
      <RadioGroup.Root
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        aria-label={title}
        className="grid grid-cols-3 gap-4"
      >
        {options.map((option) => (
          <RadioGroup.Item
            key={option.value}
            value={option.value}
            className="group text-left outline-none disabled:opacity-60"
          >
            <div className="ring-border group-data-[state=checked]:ring-primary relative rounded-md ring-1 transition group-focus-visible:ring-2 group-data-[state=checked]:ring-2">
              <CircleCheckIcon className="fill-primary stroke-primary-foreground absolute top-0 right-0 size-5 translate-x-1/2 -translate-y-1/2 group-data-[state=unchecked]:hidden" />
              {option.preview}
            </div>
            <span className="mt-1 block text-xs">{option.label}</span>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </section>
  );
}

function ThemePreview({ mode }: { mode: 'light' | 'dark' | 'system' }) {
  // Fixed colours on purpose: each preview shows that theme whatever the current one is.
  const light = (
    <div className="flex h-full flex-1 flex-col gap-1 bg-white p-1.5">
      <div className="h-1.5 w-2/3 rounded-sm bg-slate-300" />
      <div className="h-1.5 w-1/2 rounded-sm bg-slate-200" />
    </div>
  );
  const dark = (
    <div className="flex h-full flex-1 flex-col gap-1 bg-slate-950 p-1.5">
      <div className="h-1.5 w-2/3 rounded-sm bg-slate-600" />
      <div className="h-1.5 w-1/2 rounded-sm bg-slate-700" />
    </div>
  );
  return (
    <div className="flex h-14 overflow-hidden rounded-md">
      {mode !== 'dark' && light}
      {mode !== 'light' && dark}
    </div>
  );
}

function SidebarPreview({ variant }: { variant: SidebarVariant }) {
  const isInset = variant === 'inset';
  return (
    <div className={cn('flex h-14 gap-1 overflow-hidden rounded-md p-1', isInset && 'bg-muted')}>
      <div
        className={cn(
          'flex w-1/3 flex-col gap-1 p-1',
          variant === 'floating' && 'rounded-sm border shadow-sm',
          variant === 'sidebar' && 'border-r',
        )}
      >
        <div className={cn(BAR, 'h-1.5')} />
        <div className={cn(BAR, 'h-1.5 w-2/3')} />
      </div>
      <div
        className={cn('flex-1 rounded-sm', isInset ? 'bg-background shadow-sm' : 'bg-muted/60')}
      />
    </div>
  );
}

function LayoutPreview({ width }: { width: string | null }) {
  return (
    <div className="flex h-14 gap-1 overflow-hidden rounded-md p-1">
      {width && <div className={cn(BAR, width)} />}
      <div className="bg-muted/60 flex flex-1 flex-col gap-1 rounded-sm p-1">
        <div className={cn(BAR, 'h-1.5 w-1/2')} />
        <div className={cn(BAR, 'h-1.5 w-1/3')} />
      </div>
    </div>
  );
}
