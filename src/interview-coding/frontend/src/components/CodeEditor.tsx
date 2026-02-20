'use client';

import { Editor } from '@monaco-editor/react';
import { Card } from '@/components/ui/card';
import { DEFAULT_CODE_EDITOR_OPTIONS } from '@/lib/types';
import type { CodeEditorProps } from '@/lib/types';

export function CodeEditor({
  value,
  onChange,
  language = 'python',
  theme = 'vs-dark',
  readOnly = false,
  height = '400px',
  options = {}
}: CodeEditorProps) {
  const editorOptions = {
    ...DEFAULT_CODE_EDITOR_OPTIONS,
    readOnly,
    ...options
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Code Editor</h3>
      </div>
      <div className="flex-1 px-4 pb-8">
        <div className="border rounded-md overflow-hidden" style={{ height: 'calc(100% - 32px)' }}>
          <Editor
            height="100%"
            language={language}
            theme={theme}
            value={value}
            onChange={(newValue) => onChange(newValue || '')}
            options={editorOptions}
            loading={
              <div className="flex items-center justify-center h-full">
                <div className="text-sm text-muted-foreground">Loading editor...</div>
              </div>
            }
          />
        </div>
      </div>
    </Card>
  );
}