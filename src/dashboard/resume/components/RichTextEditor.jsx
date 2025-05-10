import { Button } from '@/components/ui/button';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { Brain, LoaderCircle } from 'lucide-react';
import React, { useContext, useState } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  Editor,
  EditorProvider,
  HtmlButton,
  Separator,
  Toolbar,
} from 'react-simple-wysiwyg';
import { AIChatSession } from './../../../../service/AIModal';
import { toast } from 'sonner';

// If your defaultValue might be an array (e.g., structured rich text data),
// create a helper function to convert it to plain text.
const extractPlainText = (data) => {
  if (Array.isArray(data)) {
    return data
      .map((node) => {
        if (node.children && Array.isArray(node.children)) {
          return node.children.map(child => child.text).join(" ");
        }
        return "";
      })
      .join(" ");
  }
  return typeof data === 'string' ? data : "";
};

// Revised prompt that returns a plain array of strings (if needed)
const PROMPT =
  'Position title: {positionTitle}. Provide 5-7 lines of job experience as plain text. Only output an array of strings without any keys or labels.';

function RichTextEditor({ onRichTextEditorChange, index, defaultValue }) {
  // Ensure defaultValue is always a string:
  const initialValue =
    typeof defaultValue === 'string'
      ? defaultValue
      : defaultValue
      ? extractPlainText(defaultValue)
      : "";

  const [value, setValue] = useState(initialValue);
  const { resumeInfo } = useContext(ResumeInfoContext);
  const [loading, setLoading] = useState(false);

  const GenerateSummeryFromAI = async () => {
    if (!resumeInfo?.experience[index]?.title) {
      toast('Please Add Position Title');
      return;
    }
    setLoading(true);
    const prompt = PROMPT.replace('{positionTitle}', resumeInfo.experience[index].title);
    const result = await AIChatSession.sendMessage(prompt);
    const resp = await result.response.text(); // Ensure async handling
    const stringResp = Array.isArray(resp) ? resp[0] : String(resp);
    setValue(stringResp);
    onRichTextEditorChange(stringResp, index);
    setLoading(false);
  };

  return (
    <div>
      <div className="flex justify-between my-2">
        <label className="text-xs">Summary</label>
        <Button
          variant="outline"
          size="sm"
          onClick={GenerateSummeryFromAI}
          disabled={loading}
          className="flex gap-2 border-primary text-primary"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <>
              <Brain className="h-4 w-4" /> Generate from AI
            </>
          )}
        </Button>
      </div>
      <EditorProvider>
        <Editor
          value={value}
          onChange={(e) => {
            // Explicitly convert the new value to a string
            const newValue = String(e.target.value);
            setValue(newValue);
            onRichTextEditorChange(newValue, index);
          }}
        >
          <Toolbar>
            <BtnBold />
            <BtnItalic />
            <BtnUnderline />
            <BtnStrikeThrough />
            <Separator />
            <BtnNumberedList />
            <BtnBulletList />
            <Separator />
            <BtnLink />
          </Toolbar>
        </Editor>
      </EditorProvider>
    </div>
  );
}

export default RichTextEditor;
