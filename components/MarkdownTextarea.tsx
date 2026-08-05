'use client';

import { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, List } from 'lucide-react';

interface MarkdownTextareaProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

// Textarea с мини-панелью форматирования. Ничего "магического" — просто вставляет
// markdown-синтаксис (**полужирный**, "- пункт списка") вокруг выделения или курсора.
// Рендерится на фронтенде через marked, как и раньше рендерился legacy-контент статьи.
export function MarkdownTextarea({ value, onChange, rows = 4, placeholder }: MarkdownTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyBold = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || 'текст';
    const next = value.slice(0, start) + '**' + selected + '**' + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 2, start + 2 + selected.length);
    });
  };

  const applyList = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end);

    if (selected) {
      // Каждую строку выделения превращаем в пункт списка
      const listified = selected
        .split('\n')
        .map((line) => (line.trim() ? `- ${line.replace(/^[-*]\s*/, '')}` : line))
        .join('\n');
      const next = value.slice(0, start) + listified + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, start + listified.length);
      });
    } else {
      // Без выделения — маркер в начало текущей строки
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const next = value.slice(0, lineStart) + '- ' + value.slice(lineStart);
      onChange(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + 2, start + 2);
      });
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={applyBold}
          title="Полужирный"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={applyList}
          title="Маркированный список"
        >
          <List className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Textarea
        ref={ref}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
