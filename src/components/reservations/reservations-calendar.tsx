"use client";

import * as React from "react";
import { format, isSameDay, parseISO } from "date-fns";
import type { Reservation } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Edit, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { ReservationsList } from "./reservations-list";

interface ReservationsCalendarProps {
  reservations: Reservation[];
}

export function ReservationsCalendar({ reservations }: ReservationsCalendarProps) {
  const [month, setMonth] = React.useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);

  const reservationsByDay = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      const day = format(parseISO(reservation.date), "yyyy-MM-dd");
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(reservation);
      return acc;
    }, {} as Record<string, Reservation[]>);
  }, [reservations]);
  
  const DayWithReservations = (day: Date) => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayReservations = reservationsByDay[dayStr] || [];

    if (dayReservations.length === 0) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
            {format(day, 'd')}
        </div>
      );
    }
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="w-full h-full flex flex-col items-center justify-center p-0 rounded-md hover:bg-accent focus:bg-accent-foreground/10 relative">
              <span className="font-bold">{format(day, 'd')}</span>
              <div className="text-xs text-muted-foreground -mt-1">{dayReservations.length} bkngs</div>
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0">
          <ReservationsList reservations={dayReservations} />
        </PopoverContent>
      </Popover>
    )
  }


  return (
    <Card>
        <CardContent className="p-0 md:p-6 flex justify-center">
            <Calendar
                month={month}
                onMonthChange={setMonth}
                components={{
                    Day: ({ date }) => DayWithReservations(date),
                }}
                className="rounded-md border p-0 [&_td]:p-0 [&_tr]:border-0"
                classNames={{
                    day: 'h-20 w-20 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
                    head_cell: 'text-muted-foreground rounded-md w-20 font-normal text-sm',
                    table: 'w-full border-collapse space-y-1',
                    row: 'flex w-full mt-2',
                    cell: 'h-20 w-20 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20'
                }}
            />
        </CardContent>
    </Card>
  );
}