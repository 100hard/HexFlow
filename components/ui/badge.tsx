import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        active: "border-emerald-200 bg-emerald-50 text-emerald-700",
        draft: "border-amber-200 bg-amber-50 text-amber-700",
        paused: "border-slate-200 bg-slate-100 text-slate-600",
      },
    },
    defaultVariants: {
      variant: "active",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
