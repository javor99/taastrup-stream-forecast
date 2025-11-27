// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (c) 2025 Your Name
// Part of AquaMonitor/InnoTech-TaskForce. See LICENSE for license terms.

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
