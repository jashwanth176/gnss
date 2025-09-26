"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

const SIZE_MAP = {
  sm: { width: 198, height: 32 },
  md: { width: 242, height: 40 },
  lg: { width: 286, height: 46 },
}

type SiteLogoProps = {
  size?: keyof typeof SIZE_MAP
  className?: string
  priority?: boolean
}

export function SiteLogo({ size = "md", className, priority }: SiteLogoProps) {
  const dimensions = SIZE_MAP[size]

  return (
    <Image
      src="/hlogo.png"
      alt="GNSS-R Portal"
      width={dimensions.width}
      height={dimensions.height}
  className={cn("h-auto max-h-16 w-auto", className)}
      priority={priority}
    />
  )
}
