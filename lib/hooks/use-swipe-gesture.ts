import { useRef, useCallback } from 'react'

interface SwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  threshold?: number // Minimum distance for swipe (px)
}

interface TouchPosition {
  x: number
  y: number
  time: number
}

/**
 * Custom hook for detecting swipe gestures on touch devices
 * 
 * @param options - Configuration for swipe detection
 * @returns Touch event handlers to attach to target element
 * 
 * @example
 * ```tsx
 * const handlers = useSwipeGesture({
 *   onSwipeRight: () => console.log('Swiped right!'),
 *   threshold: 50
 * })
 * 
 * return <div {...handlers}>Swipeable content</div>
 * ```
 */
export function useSwipeGesture(options: SwipeGestureOptions) {
  const { onSwipeLeft, onSwipeRight, threshold = 50 } = options
  
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null // Reset end position
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchEnd.current.x - touchStart.current.x
    const distanceY = touchEnd.current.y - touchStart.current.y
    const timeDiff = touchEnd.current.time - touchStart.current.time

    // Check if swipe is horizontal (X distance > Y distance)
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    
    // Velocity check: prevent slow drags from triggering swipe
    const velocity = Math.abs(distanceX) / timeDiff
    const isFastEnough = velocity > 0.3 // px/ms

    if (isHorizontalSwipe && isFastEnough) {
      if (distanceX > threshold && onSwipeRight) {
        onSwipeRight()
      } else if (distanceX < -threshold && onSwipeLeft) {
        onSwipeLeft()
      }
    }

    // Reset positions
    touchStart.current = null
    touchEnd.current = null
  }, [onSwipeLeft, onSwipeRight, threshold])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}
