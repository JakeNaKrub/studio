"use client";

import Link from "next/link";
import { Moon } from "lucide-react";
import { Button } from "../ui/button";

export function Header() {
  // A full theme toggle implementation is out of scope.
  // This is a placeholder.
  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-bold text-lg font-headline">Common-Room Booking</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          <Moon className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}
