import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Strikethrough, List, ListOrdered } from "lucide-react";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  editorClassName?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-100 p-2 bg-gray-50 rounded-t-xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("bold")
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("italic")
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("strike")
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("bulletList")
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md hover:bg-gray-200 transition-colors ${
          editor.isActive("orderedList")
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600"
        }`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
    </div>
  );
};

export function TiptapEditor({
  value,
  onChange,
  readOnly = false,
  className,
  editorClassName,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your reply here...",
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Using getHTML() so formatting is preserved
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[120px] p-4 text-sm text-gray-700 leading-relaxed custom_scroll pr-2 ${editorClassName || ""}`,
      },
    },
  });

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div
        className={
          className ||
          `flex flex-col bg-white border rounded-xl overflow-hidden transition-all border-gray-200`
        }
      >
        {!readOnly && (
          <div className="border-b border-gray-100 p-2 bg-gray-50 rounded-t-xl h-10" />
        )}
        <div
          className={`overflow-y-auto max-h-75 custom_scroll ${readOnly ? "bg-gray-50/50" : "bg-transparent"} p-4 min-h-30 ${editorClassName || ""}`}
        />
      </div>
    );
  }
  if (editor && value !== editor.getHTML() && !editor.isFocused) {
    // Check if it's plain text coming from AI (no html tags) and format it
    // Or just let Tiptap handle it
    setTimeout(() => {
      editor.commands.setContent(value, { emitUpdate: false });
    });
  }

  // Update editable state
  if (editor && editor.isEditable === readOnly) {
    editor.setEditable(!readOnly);
  }

  return (
    <div
      className={
        className ||
        `flex flex-col bg-white border rounded-xl overflow-hidden transition-all ${!readOnly ? "border-[#add633] focus-within:ring-1 focus-within:ring-green-400" : "border-gray-200"}`
      }
    >
      {!readOnly && <MenuBar editor={editor} />}
      <div
        className={`overflow-y-auto max-h-75 custom_scroll ${readOnly ? "bg-gray-50/50" : "bg-transparent"}`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
