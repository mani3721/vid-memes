import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2, Undo2, Redo2, Minus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

function ToolbarBtn({ onClick, active, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`grid size-7 place-items-center rounded text-xs transition-colors ${
        active ? 'bg-brand/20 text-brand' : 'text-mid hover:bg-panel-hover hover:text-hi'
      }`}
    >
      {children}
    </button>
  )
}

const Sep = () => <div className="mx-1 h-5 w-px bg-edge" />

export default function RichTextEditor({ value, onChange }) {
  const [linkUrl, setLinkUrl] = useState('')
  const [showLink, setShowLink] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-brand underline' },
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: { class: 'rich-editor min-h-48 px-3 py-2.5 outline-none' },
    },
  })

  const applyLink = useCallback(() => {
    if (!editor) return
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setShowLink(false)
  }, [editor, linkUrl])

  // Sync when value changes externally (e.g. from the "Write Blog" generator).
  // Compare against the editor's own current HTML to avoid resetting on every
  // keystroke (the parent updates `value` on each edit, but editor.getHTML()
  // equals the incoming value in that case, so this fires only on true external
  // changes like generated content).
  useEffect(() => {
    if (!editor) return
    if (value === editor.getHTML()) return
    editor.commands.setContent(value || '')
  }, [editor, value])

  if (!editor) return null

  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-canvas focus-within:border-brand">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-edge bg-canvas/60 px-2 py-1.5">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic className="size-3.5" />
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="size-3.5" />
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="size-3.5" />
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run()
            } else {
              setShowLink((v) => !v)
            }
          }}
          active={editor.isActive('link')}
          title="Link"
        >
          <Link2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal rule">
          <Minus className="size-3.5" />
        </ToolbarBtn>

        <Sep />

        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          <Undo2 className="size-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          <Redo2 className="size-3.5" />
        </ToolbarBtn>
      </div>

      {showLink && (
        <div className="flex items-center gap-2 border-b border-edge bg-canvas/40 px-3 py-2">
          <input
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyLink()}
            className="flex-1 bg-transparent text-sm text-hi outline-none placeholder:text-lo"
            autoFocus
          />
          <button type="button" onClick={applyLink} className="rounded px-2 py-1 text-xs text-brand hover:bg-brand/10">
            Apply
          </button>
          <button type="button" onClick={() => setShowLink(false)} className="rounded px-2 py-1 text-xs text-mid hover:text-hi">
            Cancel
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  )
}
