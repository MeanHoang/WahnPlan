"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Paperclip,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

interface RichTextEditorProps {
  content?: any;
  onSave?: (content: any, plainText: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onSave,
  placeholder = "Start writing...",
  editable = true,
}: RichTextEditorProps): JSX.Element {
  const [isEditing, setIsEditing] = useState(true); // Always start in editing mode
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Image.extend({
        addPasteRules() {
          return []; // Disable default paste rules
        },
        addNodeView() {
          return ({ node, getPos, editor }) => {
            const container = document.createElement("div");
            container.className = "resizable-image-container";

            const img = document.createElement("img");
            img.src = node.attrs.src;
            img.alt = node.attrs.alt || "";
            img.title = node.attrs.title || "";
            img.className = "max-w-full h-auto cursor-pointer";

            if (node.attrs.width) {
              img.style.width = `${node.attrs.width}px`;
            }
            if (node.attrs.height) {
              img.style.height = `${node.attrs.height}px`;
            }

            // Create resize handles
            const createHandle = (position: string) => {
              const handle = document.createElement("div");
              handle.className = `resize-handle ${position}`;
              return handle;
            };

            const handleSE = createHandle("se");
            const handleSW = createHandle("sw");
            const handleNE = createHandle("ne");
            const handleNW = createHandle("nw");

            container.appendChild(img);
            container.appendChild(handleSE);
            container.appendChild(handleSW);
            container.appendChild(handleNE);
            container.appendChild(handleNW);

            // Add resize functionality
            const startResize = (
              handle: HTMLElement,
              startX: number,
              startY: number,
              startWidth: number,
              startHeight: number
            ) => {
              const onMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                let newWidth = startWidth;
                let newHeight = startHeight;

                if (handle === handleSE) {
                  newWidth = Math.max(50, startWidth + deltaX);
                  newHeight = Math.max(50, startHeight + deltaY);
                } else if (handle === handleSW) {
                  newWidth = Math.max(50, startWidth - deltaX);
                  newHeight = Math.max(50, startHeight + deltaY);
                } else if (handle === handleNE) {
                  newWidth = Math.max(50, startWidth + deltaX);
                  newHeight = Math.max(50, startHeight - deltaY);
                } else if (handle === handleNW) {
                  newWidth = Math.max(50, startWidth - deltaX);
                  newHeight = Math.max(50, startHeight - deltaY);
                }

                img.style.width = `${newWidth}px`;
                img.style.height = `${newHeight}px`;
              };

              const onMouseUp = () => {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup", onMouseUp);

                // Update the node attributes
                const pos = getPos();
                if (pos !== undefined) {
                  editor.commands.updateAttributes("image", {
                    width: img.style.width,
                    height: img.style.height,
                  });
                }
              };

              document.addEventListener("mousemove", onMouseMove);
              document.addEventListener("mouseup", onMouseUp);
            };

            [handleSE, handleSW, handleNE, handleNW].forEach((handle) => {
              handle.addEventListener("mousedown", (e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = img.offsetWidth;
                const startHeight = img.offsetHeight;
                startResize(handle, startX, startY, startWidth, startHeight);
              });
            });

            return {
              dom: container,
              contentDOM: null,
            };
          };
        },
      }).configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          style: "max-width: 100%; height: auto;",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
      }),
    ],
    content: content || "",
    editable: isEditing,
    immediatelyRender: false,
    autofocus: true,
    onUpdate: ({ editor }: { editor: any }) => {
      setHasChanges(true);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-xl max-w-none min-h-[500px] focus:outline-none border-none",
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content && !hasChanges) {
      editor.commands.setContent(content);
    }
  }, [content, editor, hasChanges]);

  // Handle paste and drop events for images, videos and files
  useEffect(() => {
    if (!editor) return;

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      // Check if there's any image in clipboard
      let hasImage = false;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf("image") !== -1) {
          hasImage = true;
          break;
        }
      }

      if (hasImage) {
        // Prevent default behavior completely
        event.preventDefault();
        event.stopPropagation();

        // Process only the first image to avoid duplicates
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item && item.type.indexOf("image") !== -1) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                const result = e.target?.result as string;
                if (result) {
                  editor.chain().focus().setImage({ src: result }).run();
                }
              };
              reader.readAsDataURL(file);
              break; // Only process first image
            }
          }
        }
        return;
      }

      // Handle video paste
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type.indexOf("video") !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              const result = e.target?.result as string;
              if (result) {
                editor
                  .chain()
                  .focus()
                  .insertContent(
                    `<video controls style="max-width: 100%; height: auto;"><source src="${result}" type="${file.type}"></video>`
                  )
                  .run();
              }
            };
            reader.readAsDataURL(file);
          }
          break;
        }
      }

      // Handle file paste (for other file types)
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (
          item &&
          item.kind === "file" &&
          item.type.indexOf("image") === -1 &&
          item.type.indexOf("video") === -1
        ) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            editor
              .chain()
              .focus()
              .insertContent(
                `<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">📎 ${file.name}</span>`
              )
              .run();
          }
          break;
        }
      }
    };

    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      const files = event.dataTransfer?.files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const result = e.target?.result as string;
            if (result) {
              editor.chain().focus().setImage({ src: result }).run();
            }
          };
          reader.readAsDataURL(file);
        } else if (file.type.startsWith("video/")) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const result = e.target?.result as string;
            if (result) {
              editor
                .chain()
                .focus()
                .insertContent(
                  `<video controls style="max-width: 100%; height: auto;"><source src="${result}" type="${file.type}"></video>`
                )
                .run();
            }
          };
          reader.readAsDataURL(file);
        } else {
          editor
            .chain()
            .focus()
            .insertContent(
              `<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">📎 ${file.name}</span>`
            )
            .run();
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener("paste", handlePaste, true); // Use capture phase
    editorElement.addEventListener("drop", handleDrop);
    editorElement.addEventListener("dragover", (e: any) => e.preventDefault());

    return () => {
      editorElement.removeEventListener("paste", handlePaste, true);
      editorElement.removeEventListener("drop", handleDrop);
      editorElement.removeEventListener("dragover", (e: any) =>
        e.preventDefault()
      );
    };
  }, [editor]);

  const handleSave = () => {
    if (!editor || !onSave) return;

    const jsonContent = editor.getJSON();
    const plainText = editor.getText();

    onSave(jsonContent, plainText);
    setHasChanges(false);
    // Keep editing mode open after save
  };

  const handleCancel = () => {
    if (editor && content) {
      editor.commands.setContent(content ?? "");
    }
    setHasChanges(false);
    // Keep editing mode open after cancel
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Toolbar - Always visible since always editing */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-10 w-10 p-0 ${
            editor.isActive("bold") ? "bg-gray-200" : ""
          }`}
        >
          <Bold className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-10 w-10 p-0 ${
            editor.isActive("italic") ? "bg-gray-200" : ""
          }`}
        >
          <Italic className="h-5 w-5" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-10 w-10 p-0 ${
            editor.isActive("bulletList") ? "bg-gray-200" : ""
          }`}
        >
          <List className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-10 w-10 p-0 ${
            editor.isActive("orderedList") ? "bg-gray-200" : ""
          }`}
        >
          <ListOrdered className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-10 w-10 p-0 ${
            editor.isActive("blockquote") ? "bg-gray-200" : ""
          }`}
        >
          <Quote className="h-5 w-5" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="h-10 w-10 p-0"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter video URL:");
            if (url) {
              editor
                .chain()
                .focus()
                .insertContent(
                  `<video controls style="max-width: 100%; height: auto;"><source src="${url}"></video>`
                )
                .run();
            }
          }}
          className="h-10 w-10 p-0"
        >
          <Video className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const url = window.prompt("Enter URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`h-10 w-10 p-0 ${
            editor.isActive("link") ? "bg-gray-200" : ""
          }`}
        >
          <LinkIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*,video/*,.pdf,.doc,.docx,.txt";
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                if (file.type.startsWith("image/")) {
                  const reader = new FileReader();
                  reader.onload = (e: any) => {
                    const result = e.target?.result as string;
                    if (result) {
                      editor.chain().focus().setImage({ src: result }).run();
                    }
                  };
                  reader.readAsDataURL(file);
                } else if (file.type.startsWith("video/")) {
                  const reader = new FileReader();
                  reader.onload = (e: any) => {
                    const result = e.target?.result as string;
                    if (result) {
                      editor
                        .chain()
                        .focus()
                        .insertContent(
                          `<video controls style="max-width: 100%; height: auto;"><source src="${result}" type="${file.type}"></video>`
                        )
                        .run();
                    }
                  };
                  reader.readAsDataURL(file);
                } else {
                  editor
                    .chain()
                    .focus()
                    .insertContent(
                      `<span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">📎 ${file.name}</span>`
                    )
                    .run();
                }
              }
            };
            input.click();
          }}
          className="h-10 w-10 p-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-10 w-10 p-0"
        >
          <Undo className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-10 w-10 p-0"
        >
          <Redo className="h-5 w-5" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          className="h-10 px-4 text-sm"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!hasChanges}
          className="h-10 px-4 text-sm"
        >
          Save
        </Button>
      </div>

      {/* Editor Content */}
      <div className="p-8 relative">
        <EditorContent
          editor={editor}
          className="prose prose-xl max-w-none min-h-[500px] focus:outline-none border-none"
        />
      </div>
    </div>
  );
}
