"use client";

import * as React from "react";
import { format } from "date-fns";
import type { Reservation } from "@/lib/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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

  const reservationsByDay = React.useMemo(() => {
    return reservations.reduce((acc, reservation) => {
      const day = reservation.date.split('T')[0];
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
        <PopoverContent className="w-full max-w-sm p-0">
          <ReservationsList reservations={dayReservations} />
        </PopoverContent>
      </Popover>
    )
  }


  return (
    <Card>
        <CardContent className="p-4 md:p-6 flex justify-center">
            <Calendar
                month={month}
                onMonthChange={setMonth}
                components={{
                    Day: ({ date }) => DayWithReservations(date),
                }}
                className="p-0 [&_td]:p-0 [&_tr]:border-0"
                classNames={{
                    head_cell: 'text-muted-foreground rounded-md w-full font-normal text-sm',
                    table: 'w-full border-collapse space-y-1',
                    row: 'flex w-full mt-2',
                    cell: 'h-24 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20'
                }}
            />
        </CardContent>
    </Card>
  );
}