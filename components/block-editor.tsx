"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Plus,
  GripVertical,
  Trash2,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
export type BlockType = "paragraph" | "heading1" | "heading2" | "heading3" | "bulletList" | "numberedList" | "todo"

export interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
  position?: number
}

interface BlockEditorProps {
  pageId: string
  userId: string
  initialBlocks?: Block[]
  onChange?: (blocks: Block[]) => void
  onSavingChange?: (isSaving: boolean) => void
}

export function BlockEditor({ pageId, userId, initialBlocks = [], onChange, onSavingChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [
          {
            id: crypto.randomUUID(),
            type: "paragraph",
            content: "",
            position: 0,
          },
        ],
  )
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    onChange?.(blocks)

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    onSavingChange?.(true)

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = blocks
          .filter((block) => block.content.trim())
          .map((block, index) => ({
            id: block.id,
            type: block.type,
            content: block.content,
            position: index,
            properties: block.checked !== undefined ? { checked: block.checked } : {},
          }))

        await fetch(`/api/pages/${pageId}/blocks`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            blocks: payload,
          }),
        })

        onSavingChange?.(false)
      } catch (error) {
        console.error("Error al guardar los bloques:", error)
        onSavingChange?.(false)
      }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [blocks, pageId, userId, onChange, onSavingChange])

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...updates } : block)))
  }

  const addBlock = (afterId: string, type: BlockType = "paragraph") => {
    const index = blocks.findIndex((b) => b.id === afterId)
    const newBlock: Block = {
      id: crypto.randomUUID(),
      type,
      content: "",
      position: index + 1,
    }
    const newBlocks = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)]
    setBlocks(newBlocks)
    setTimeout(() => setFocusedBlockId(newBlock.id), 0)
  }

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return
    setBlocks((prev) => prev.filter((block) => block.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string, index: number) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addBlock(blockId)
    } else if (e.key === "Backspace" && blocks[index].content === "" && blocks.length > 1) {
      e.preventDefault()
      deleteBlock(blockId)
      if (index > 0) {
        setFocusedBlockId(blocks[index - 1].id)
      }
    }
  }

  return (
    <div className="space-y-1">
      {blocks.map((block, index) => (
        <BlockComponent
          key={block.id}
          block={block}
          isFocused={focusedBlockId === block.id}
          showMenu={showBlockMenu === block.id}
          onFocus={() => setFocusedBlockId(block.id)}
          onBlur={() => setFocusedBlockId(null)}
          onUpdate={(updates) => updateBlock(block.id, updates)}
          onDelete={() => deleteBlock(block.id)}
          onKeyDown={(e) => handleKeyDown(e, block.id, index)}
          onShowMenu={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
        />
      ))}
    </div>
  )
}

interface BlockComponentProps {
  block: Block
  isFocused: boolean
  showMenu: boolean
  onFocus: () => void
  onBlur: () => void
  onUpdate: (updates: Partial<Block>) => void
  onDelete: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onShowMenu: () => void
}

function BlockComponent({
  block,
  isFocused,
  showMenu,
  onFocus,
  onBlur,
  onUpdate,
  onDelete,
  onKeyDown,
  onShowMenu,
}: BlockComponentProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isFocused])

  const blockTypeOptions: { type: BlockType; icon: React.ReactNode; label: string }[] = [
    { type: "paragraph", icon: <Type className="h-4 w-4" />, label: "Texto" },
    { type: "heading1", icon: <Heading1 className="h-4 w-4" />, label: "Encabezado 1" },
    { type: "heading2", icon: <Heading2 className="h-4 w-4" />, label: "Encabezado 2" },
    { type: "heading3", icon: <Heading3 className="h-4 w-4" />, label: "Encabezado 3" },
    { type: "bulletList", icon: <List className="h-4 w-4" />, label: "Lista con viñetas" },
    { type: "numberedList", icon: <ListOrdered className="h-4 w-4" />, label: "Lista numerada" },
    { type: "todo", icon: <CheckSquare className="h-4 w-4" />, label: "Tarea" },
  ]

  const renderInput = () => {
    const baseClasses = "w-full border-none bg-transparent outline-none placeholder:text-muted-foreground resize-none"

    const commonProps = {
      ref: inputRef as any,
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onUpdate({ content: e.target.value }),
      onFocus,
      onBlur,
      onKeyDown,
      placeholder: getPlaceholder(block.type),
    }

    switch (block.type) {
      case "heading1":
        return <input {...commonProps} className={cn(baseClasses, "text-3xl font-bold text-foreground")} />
      case "heading2":
        return <input {...commonProps} className={cn(baseClasses, "text-2xl font-semibold text-foreground")} />
      case "heading3":
        return <input {...commonProps} className={cn(baseClasses, "text-xl font-semibold text-foreground")} />
      case "bulletList":
        return (
          <div className="flex items-start gap-2">
            <span className="mt-2 text-foreground">•</span>
            <textarea {...commonProps} rows={1} className={cn(baseClasses, "text-base text-foreground")} />
          </div>
        )
      case "numberedList":
        return (
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-foreground">1.</span>
            <textarea {...commonProps} rows={1} className={cn(baseClasses, "text-base text-foreground")} />
          </div>
        )
      case "todo":
        return (
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={(e) => onUpdate({ checked: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-input"
            />
            <textarea
              {...commonProps}
              rows={1}
              className={cn(baseClasses, "text-base text-foreground", block.checked && "line-through opacity-60")}
            />
          </div>
        )
      default:
        return <textarea {...commonProps} rows={1} className={cn(baseClasses, "text-base text-foreground")} />
    }
  }

  return (
    <div className="group relative flex items-start gap-1 rounded px-2 py-1 hover:bg-accent/50">
      {/* Block Controls */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 cursor-grab p-0 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowMenu}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
          {showMenu && (
            <div className="absolute left-0 top-8 z-10 w-48 rounded-md border border-border bg-popover p-1 shadow-lg">
              {blockTypeOptions.map((option) => (
                <Button
                  key={option.type}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onUpdate({ type: option.type })
                    onShowMenu()
                  }}
                  className="w-full justify-start gap-2 text-popover-foreground"
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
              <div className="my-1 h-px bg-border" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onDelete()
                  onShowMenu()
                }}
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Block Content */}
      <div className="flex-1">{renderInput()}</div>
    </div>
  )
}

function getPlaceholder(type: BlockType): string {
  switch (type) {
    case "heading1":
      return "Encabezado 1"
    case "heading2":
      return "Encabezado 2"
    case "heading3":
      return "Encabezado 3"
    case "bulletList":
      return "Elemento de lista"
    case "numberedList":
      return "Elemento de lista"
    case "todo":
      return "Tarea"
    default:
      return "Escribe '/' para comandos"
  }
}
