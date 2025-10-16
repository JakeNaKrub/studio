"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trash2, Users, Clock, Calendar, User, Phone } from "lucide-react";
import type { Reservation } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PinDialog } from "./pin-dialog";
import { deleteReservation } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface ReservationsListProps {
  reservations: Reservation[];
}

export function ReservationsList({
  reservations: initialReservations,
}: ReservationsListProps) {
  const [reservations, setReservations] = React.useState(initialReservations);
  const [isPinDialogOpen, setIsPinDialogOpen] = React.useState(false);
  const [selectedReservationId, setSelectedReservationId] = React.useState<
    string | null
  >(null);
  const { toast } = useToast();

  React.useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  const handleDeleteClick = (id: string) => {
    setSelectedReservationId(id);
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedReservationId) return;

    const formData = new FormData();
    formData.append("id", selectedReservationId);
    formData.append("pin", pin);

    const result = await deleteReservation(null, formData);

    if (result.message.includes("successfully")) {
      toast({
        title: "Success",
        description: result.message,
      });
      setReservations((prev) =>
        prev.filter((r) => r.id !== selectedReservationId)
      );
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsPinDialogOpen(false);
    setSelectedReservationId(null);
  };

  return (
    <>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meeting Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.meetingName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>{reservation.personName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Phone className="h-4 w-4" />
                           <span>{reservation.mobileNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(reservation.date), "PPP")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{`${reservation.startTime} - ${reservation.endTime}`}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reservation.roomSize === "large"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize flex items-center gap-1"
                      >
                        <Users className="h-3 w-3" /> {reservation.roomSize}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(reservation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    No reservations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <PinDialog
        isOpen={isPinDialogOpen}
        onOpenChange={setIsPinDialogOpen}
        onSubmit={handlePinSubmit}
      />
    </>
  );
}
