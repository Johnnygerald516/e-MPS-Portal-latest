"use client"

import { Button } from "@/components/ui/button"
import { qaService } from "@/lib/qa-service"
import { useState, useEffect } from "react"

interface HelpSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function HelpSuggestions({ onSuggestionClick }: HelpSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  useEffect(() => {
    // Get a selection of question patterns to show as suggestions
    const allPatterns = qaService.getAllQuestionPatterns()
    
    // Select a subset of patterns to show as suggestions
    const selectedPatterns = [
      "how do I apply",
      "what documents do I need",
      "check status",
      "how much does it cost",
      "processing time",
      "help"
    ]
    
    // Filter to only include patterns that exist in our data
    const availableSuggestions = selectedPatterns.filter(pattern => 
      allPatterns.some(p => p.toLowerCase().includes(pattern.toLowerCase()))
    )
    
    setSuggestions(availableSuggestions)
  }, [])
  
  if (suggestions.length === 0) return null
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <p className="w-full text-xs text-muted-foreground mb-1">
        Try asking:
      </p>
      {suggestions.map((suggestion, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size="sm"
          className="text-xs py-1 h-auto"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion}
        </Button>
      ))}
    </div>
  )
}
