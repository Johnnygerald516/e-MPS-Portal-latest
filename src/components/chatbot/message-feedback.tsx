"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageFeedbackProps {
  messageId: string
  onFeedback: (messageId: string, isHelpful: boolean, comment?: string) => Promise<void>
}

export function MessageFeedback({ messageId, onFeedback }: MessageFeedbackProps) {
  const [feedbackState, setFeedbackState] = useState<'none' | 'helpful' | 'unhelpful' | 'submitted'>('none')
  const [comment, setComment] = useState<string>('')
  const [isCommentVisible, setIsCommentVisible] = useState<boolean>(false)
  
  const handleFeedback = async (isHelpful: boolean) => {
    setFeedbackState(isHelpful ? 'helpful' : 'unhelpful')
    
    if (!isHelpful) {
      // Show comment field for unhelpful feedback
      setIsCommentVisible(true)
    } else {
      try {
        // Submit immediately for helpful feedback
        await onFeedback(messageId, true)
        setFeedbackState('submitted')
      } catch (error) {
        console.error('Error submitting feedback:', error)
        // Reset state if submission fails
        setFeedbackState('none')
      }
    }
  }
  
  const submitFeedback = async () => {
    try {
      await onFeedback(messageId, feedbackState === 'helpful', comment)
      setFeedbackState('submitted')
      setIsCommentVisible(false)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      // Keep the form open if submission fails
    }
  }
  
  if (feedbackState === 'submitted') {
    return (
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Check className="h-3 w-3 mr-1" />
        <span>Thank you for your feedback</span>
      </div>
    )
  }
  
  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <div className="text-xs text-muted-foreground">Was this helpful?</div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            feedbackState === 'helpful' && "bg-green-100 text-green-700"
          )}
          onClick={() => handleFeedback(true)}
        >
          <ThumbsUp className="h-3 w-3" />
          <span className="sr-only">Yes</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 w-6 p-0",
            feedbackState === 'unhelpful' && "bg-red-100 text-red-700"
          )}
          onClick={() => handleFeedback(false)}
        >
          <ThumbsDown className="h-3 w-3" />
          <span className="sr-only">No</span>
        </Button>
      </div>
      
      {isCommentVisible && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="w-full text-xs p-2 border rounded-md resize-none h-16"
            placeholder="How can we improve this response?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={submitFeedback}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
