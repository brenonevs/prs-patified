"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Check, User } from "lucide-react"

export type PlayerOption = {
  id: string
  name: string
}

type PlayerComboboxProps = {
  value: string
  onChange: (value: string, selectedUser?: PlayerOption) => void
  options: PlayerOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  isRegisteredUser?: boolean
}

export function PlayerCombobox({
  value,
  onChange,
  options,
  placeholder = "Digite o nome do jogador",
  disabled = false,
  className,
  isRegisteredUser = false,
}: PlayerComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const filteredOptions = React.useMemo(() => {
    if (!inputValue.trim()) return options
    const lower = inputValue.toLowerCase()
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(lower)
    )
  }, [options, inputValue])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    setOpen(true)

    const exactMatch = options.find(
      (opt) => opt.name.toLowerCase() === newValue.toLowerCase()
    )
    onChange(newValue, exactMatch)
  }

  const handleSelect = (option: PlayerOption) => {
    setInputValue(option.name)
    onChange(option.name, option)
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleFocus = () => {
    setOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
    }
    if (e.key === "Enter" && open && filteredOptions.length > 0) {
      e.preventDefault()
      handleSelect(filteredOptions[0])
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="h-9 pr-8 md:h-10"
        />
        {isRegisteredUser && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-400">
            <Check className="size-4" />
          </span>
        )}
      </div>

      {open && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground",
                option.name.toLowerCase() === inputValue.toLowerCase() &&
                  "bg-accent text-accent-foreground"
              )}
            >
              <User className="size-4 text-muted-foreground" />
              <span>{option.name}</span>
              {option.name.toLowerCase() === inputValue.toLowerCase() && (
                <Check className="ml-auto size-4" />
              )}
            </button>
          ))}
        </div>
      )}

      {inputValue.trim() && !isRegisteredUser && (
        <p className="mt-1 text-xs text-muted-foreground">
          Jogador convidado (não cadastrado)
        </p>
      )}
    </div>
  )
}
