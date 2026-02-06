"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
}

export function LazyImage({ src, alt, className, wrapperClassName }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!imgRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: "200px" }
    )
    observer.observe(imgRef.current)
    return () => observer.disconnect()
  }, [])

  if (hasError) {
    return (
      <div ref={imgRef} className={cn("bg-muted", wrapperClassName)}>
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-xs text-muted-foreground">Error</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={imgRef} className={cn("overflow-hidden bg-muted", wrapperClassName)}>
      {isInView ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-muted" />
      )}
    </div>
  )
}
