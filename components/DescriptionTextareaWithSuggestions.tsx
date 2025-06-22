import React, { useEffect, useRef, useState } from 'react'

import { getDescriptionSuggestions } from '@/application/useCases/transactions/getDescriptionSuggestions'
import { Textarea } from '@/components/ui/textarea'


export const DescriptionTextareaWithSuggestions = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ value, onChange, name, placeholder, ...props }, ref) => {
    const [descriptions, setDescriptions] = useState<string[]>([])
    const [suggestion, setSuggestion] = useState('')
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const ghostRef = useRef<HTMLTextAreaElement>(null)

    // Fetch unique descriptions for the user using the use case
    useEffect(() => {
      const fetchDescriptions = async () => {
        const suggestions = await getDescriptionSuggestions()
        setDescriptions(suggestions)
      }
      fetchDescriptions()
    }, [])

    // Update suggestion as user types
    useEffect(() => {
      if (typeof value === 'string' && value.length > 0) {
        const match = descriptions.find(
          (desc) =>
            desc.startsWith(value) &&
            desc !== value
        )
        setSuggestion(match || '')
      } else {
        setSuggestion('')
      }
    }, [value, descriptions])

    // Sync scroll between real and ghost textarea
    const handleScroll = () => {
      if (inputRef.current && ghostRef.current) {
        ghostRef.current.scrollTop = inputRef.current.scrollTop
        ghostRef.current.scrollLeft = inputRef.current.scrollLeft
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (suggestion && (e.key === 'Tab' || e.key === 'ArrowRight')) {
        e.preventDefault()
        if (onChange) {
          const syntheticEvent = {
            ...e,
            target: { value: suggestion, name: name || '' },
          } as unknown as React.ChangeEvent<HTMLTextAreaElement>
          onChange(syntheticEvent)
        }
      }
    }

    // Build the ghost value: user input + suggestion remainder (with suggestion part styled)
    const getGhostValue = () => {
      if (typeof value !== 'string' || !suggestion) return ''
      if (!suggestion.startsWith(value)) return value
      return suggestion
    }

    // For accessibility, only show the ghost if there's a suggestion
    const showGhost = suggestion && typeof value === 'string' && suggestion !== value

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Ghost textarea for suggestion overlay */}
        <Textarea
          ref={ghostRef}
          value={showGhost ? getGhostValue() : ''}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            color: '#aaa',
            background: 'transparent',
            zIndex: 1,
            pointerEvents: 'none',
            resize: 'none',
            overflow: 'hidden',
            // Make the suggestion part muted, but user's input normal color
            WebkitTextFillColor: 'initial',
          }}
          className={props.className}
        />
        {/* Real textarea on top */}
        <Textarea
          ref={ref || inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          name={name}
          placeholder={placeholder}
          autoComplete="off"
          style={{
            position: 'relative',
            background: 'transparent',
            zIndex: 2,
          }}
          {...props}
        />
      </div>
    )
  }
)
DescriptionTextareaWithSuggestions.displayName = 'DescriptionTextareaWithSuggestions'