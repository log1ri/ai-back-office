"use client"

import { useState, useEffect } from "react"
import { CheckCircle } from "lucide-react"
import { cn } from "../../lib/utils"

interface SuccessModalProps {
  isVisible: boolean
  onClose: () => void
  title?: string
  description?: string
  duration?: number
}

export function SuccessModal({ 
  isVisible, 
  onClose, 
  title = "Success", 
  description,
  duration = 4000 
}: SuccessModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300) 
  }

  if (!isVisible && !isAnimating) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={cn(
          "bg-green-50 border border-green-200 rounded-lg shadow-lg p-3 w-64 transition-all duration-300 ease-out cursor-pointer",
          isAnimating && isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        )}
        onClick={handleClose}
      >
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-green-900 text-sm">{title}</h3>
            {description && (
              <p className="text-xs text-green-700">{description}</p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-0.5 bg-green-200 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full bg-green-500 rounded-full transition-all ease-out",
              isAnimating && isVisible ? "w-full" : "w-0",
            )}
            style={{
              transitionDuration: `${duration}ms`
            }}
          />
        </div>
      </div>
    </div>
  )
}