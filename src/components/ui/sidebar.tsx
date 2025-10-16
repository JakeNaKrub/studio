"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Menu } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Nextacular</SheetTitle>
          <SheetDescription>
            The easiest way to build modern apps with Next.js and Firebase.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col space-y-4 mt-4">
          <Link
            href="/reservations/calendar"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "justify-start",
              pathname === "/reservations/calendar" && "bg-muted"
            )}
          >
            Calendar
          </Link>
          <Link
            href="/reservations/list"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "justify-start",
              pathname === "/reservations/list" && "bg-muted"
            )}
          >
            List
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
