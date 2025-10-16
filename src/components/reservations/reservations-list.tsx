"use client";

import * as React from "react";
import { format } from "date-fns";
import { Trash2, Users, Clock, Calendar, User, Phone, Edit } from "lucide-react";
import type { Reservation } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PinDialog } from "./pin-dialog";
import { deleteReservation, getReservation } from "@/lib/firebase/reservations";
import { useToast } from "@/hooks/use-toast";
import { ReservationDialog } from "./reservation-dialog";
import { useFirestore } from "@/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReservationsListProps {
  reservations: Reservation[];
}

export function ReservationsList({
  reservations: initialReservations,
}: ReservationsListProps) {
  const firestore = useFirestore();
  const [reservations, setReservations] = React.useState(initialReservations);
  const [isPinDialogOpen, setIsPinDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);
  const [pinDialogAction, setPinDialogAction] = React.useState<'edit' | 'delete'>('delete');
  const { toast } = useToast();

  React.useEffect(() => {
    setReservations(initialReservations);
  }, [initialReservations]);

  const handleDeleteClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setPinDialogAction('delete');
    setIsPinDialogOpen(true);
  };

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setPinDialogAction('edit');
    setIsPinDialogOpen(true);
  };

  const handlePinSubmit = async (pin: string) => {
    if (!selectedReservation || !firestore) return;

    const latestReservation = await getReservation(firestore, selectedReservation.id);
    if (!latestReservation) {
        toast({ title: "Error", description: "Reservation not found.", variant: "destructive" });
        setIsPinDialogOpen(false);
        return;
    }

    const isValidPin = pin.toUpperCase() === 'ITISESC' || pin === latestReservation.pin;
    if (!isValidPin) {
      toast({
        title: "Error",
        description: "Invalid PIN.",
        variant: "destructive",
      });
      return;
    }
    
    setIsPinDialogOpen(false);

    if (pinDialogAction === 'delete') {
      try {
        await deleteReservation(firestore, selectedReservation.id);
        toast({
          title: "Success",
          description: "Reservation deleted successfully.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Could not delete reservation.",
          variant: "destructive",
        });
      }
    } else if (pinDialogAction === 'edit') {
       setSelectedReservation(latestReservation); 
       setIsEditDialogOpen(true);
    }
  };
  
  const onUpdateSuccess = () => {
    handleDialogClose();
  };
  
  const handleDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedReservation(null);
  }
  
  if (reservations.length === 0) {
    return (
        <div className="text-center h-24 flex items-center justify-center">
            <p>No reservations found.</p>
        </div>
    );
  }


  return (
    <>
      <div className="md:hidden space-y-4 p-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span className="text-lg">{reservation.meetingName}</span>
                <Badge
                  variant={reservation.roomSize === 'large' ? 'default' : 'secondary'}
                  className="capitalize flex items-center gap-1"
                >
                  <Users className="h-3 w-3" /> {reservation.roomSize}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{reservation.personName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{reservation.mobileNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(reservation.date), "PPP")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{`${reservation.startTime} - ${reservation.endTime}`}</span>
              </div>
                <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditClick(reservation)}
                  className="mr-2"
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(reservation)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="hidden md:block">
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
            {reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                <TableCell className="font-medium">
                    {reservation.meetingName}
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-3">
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
                        onClick={() => handleEditClick(reservation)}
                    >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(reservation)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                </TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
      </div>

      <PinDialog
        isOpen={isPinDialogOpen}
        onOpenChange={setIsPinDialogOpen}
        onSubmit={handlePinSubmit}
        actionType={pinDialogAction}
      />
       {selectedReservation && (
        <ReservationDialog
            isOpen={isEditDialogOpen}
            onOpenChange={handleDialogClose}
            reservation={selectedReservation}
            onSuccess={onUpdateSuccess}
        >
            <></>
        </ReservationDialog>
      )}
    </>
  );
}
