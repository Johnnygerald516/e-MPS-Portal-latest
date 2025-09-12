"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface InteractiveCheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
}

const InteractiveCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  InteractiveCheckboxProps
>(({ className, label, description, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const isChecked = props.checked;

  return (
    <div 
      className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 transition-all duration-200 hover:border-green-300 hover:bg-green-50/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer relative flex h-5 w-5 shrink-0 rounded-md border shadow-sm transition-all duration-200",
          isChecked 
            ? "border-green-500 bg-green-500 text-white" 
            : isHovered 
              ? "border-green-400 bg-green-50" 
              : "border-gray-300 bg-white",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn(
            "flex items-center justify-center text-current transition-opacity",
            isChecked ? "opacity-100" : "opacity-0"
          )}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: isChecked ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CheckIcon className="h-3.5 w-3.5" />
          </motion.div>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      
      {(label || description) && (
        <div className="space-y-1 leading-none">
          {label && <div className="text-sm font-medium">{label}</div>}
          {description && <div className="text-xs text-gray-500">{description}</div>}
        </div>
      )}
    </div>
  )
})

InteractiveCheckbox.displayName = "InteractiveCheckbox"

export { InteractiveCheckbox }
