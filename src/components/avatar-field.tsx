'use client';

import { ImageUpIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AVATAR_ACCEPT } from '@/core/person';

type AvatarFieldProps = { currentUrl: string | null; initials: string; isInvalid: boolean };

// AvatarField previews a picked image before upload. It submits the file as "avatar", or
// remove_avatar=1 when the current picture is removed.
export function AvatarField({ currentUrl, initials, isInvalid }: AvatarFieldProps) {
  const t = useTranslations('avatar');
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const shownUrl = previewUrl ?? (isRemoved ? null : currentUrl);

  function handlePick(file: File | undefined) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function handleRemove() {
    handlePick(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsRemoved(true);
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-16">
        {shownUrl && <AvatarImage src={shownUrl} alt="" className="object-cover" />}
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <ImageUpIcon />
            {t('pick')}
          </Button>
          {shownUrl && (
            <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
              <Trash2Icon />
              {t('remove')}
            </Button>
          )}
        </div>
        <p className="text-muted-foreground text-xs">{t('hint')}</p>
      </div>
      <input
        ref={inputRef}
        id="avatar"
        type="file"
        name="avatar"
        accept={AVATAR_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-invalid={isInvalid}
        onChange={(event) => handlePick(event.target.files?.[0])}
      />
      {isRemoved && !previewUrl && <input type="hidden" name="remove_avatar" value="1" />}
    </div>
  );
}
