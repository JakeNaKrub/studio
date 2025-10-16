'use client';

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { createReservation, updateReservation } from "@/lib/firebase/reservations";
import { useToast } from "@/hooks/use-toast";
import type { Reservation } from "@/lib/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFirestore } from "@/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";

const ReservationBaseSchema = z.object({
  meetingName: z.string().min(3, "Meeting name must be at least 3 characters"),
  personName: z.string().min(2, "Person name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  date: z.string().min(1, "Please select a date."),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  roomSize: z.enum(["small", "large"], {
    required_error: "You need to select a room size.",
  }),
});

const ReservationSchema = ReservationBaseSchema.extend({
  pin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
}).refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

const UpdateReservationSchema = ReservationBaseSchema.refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

type ReservationFormValues = z.infer<typeof ReservationSchema>;
type UpdateReservationFormValues = z.infer<typeof UpdateReservationSchema>;


const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

const end_timeSlots = [...timeSlots, "24:00"];


interface ReservationDialogProps {
  children?: React.ReactNode;
  reservation?: Reservation | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: (reservation: Reservation) => void;
}

export function ReservationDialog({ 
  children,
  reservation,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: ReservationDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isEditMode = !!reservation;

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDialogOpen = controlledIsOpen ?? internalIsOpen;
  const setIsDialogOpen = controlledOnOpenChange ?? setInternalIsOpen;

  const form = useForm<ReservationFormValues | UpdateReservationFormValues>({
    resolver: zodResolver(isEditMode ? UpdateReservationSchema : ReservationSchema),
    defaultValues: isEditMode && reservation ? {
      ...reservation,
      date: format(parseISO(reservation.date), "yyyy-MM-dd"),
    } : {
      meetingName: "",
      personName: "",
      mobileNumber: "",
      date: "",
      startTime: "",
      endTime: "",
      roomSize: undefined,
      pin: "",
    },
  });
  
  useEffect(() => {
    if (isDialogOpen) {
      form.reset(isEditMode && reservation ? {
          ...reservation,
          date: format(parseISO(reservation.date), "yyyy-MM-dd"),
      } : {
          meetingName: "",
          personName: "",
          mobileNumber: "",
          date: "",
          startTime: "",
          endTime: "",
          roomSize: undefined,
          pin: "",
      });
    }
  }, [reservation, isEditMode, form, isDialogOpen]);

  const onFormSubmit = async (data: ReservationFormValues | UpdateReservationFormValues) => {
    if (!firestore) {
        toast({
            title: "Error",
            description: "Database not available. Please try again later.",
            variant: "destructive",
        });
        return;
    }
    try {
      let resultReservation: Reservation;
      if (isEditMode && reservation) {
        const updateData = data as UpdateReservationFormValues;
        const updatedDoc = await updateReservation(firestore, reservation.id, {
          ...updateData,
          date: new Date(updateData.date).toISOString(),
        });
        resultReservation = updatedDoc;
        toast({ title: "Success!", description: "Reservation updated successfully." });
      } else {
        const createData = data as ReservationFormValues;
        const newDoc = await createReservation(firestore, {
          ...createData,
          date: new Date(createData.date).toISOString(),
        });
        resultReservation = newDoc;
        toast({ title: "Success!", description: "Reservation created successfully." });
      }
      
      if(onSuccess) {
        onSuccess(resultReservation);
      }
      form.reset();
      setIsDialogOpen(false);

    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  const availableEndTimes = useMemo(() => {
    const startTime = form.watch("startTime");
    if (!startTime) return end_timeSlots;
    return end_timeSlots.filter(time => time > startTime);
  }, [form.watch("startTime")]);

  const handleOpenChange = (open: boolean) => {
      setIsDialogOpen(open);
      if (!open) {
          form.reset();
      }
  }


  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Reservation' : 'Create a New Reservation'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for your reservation.' : 'Fill in the details below to book a common room.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto -mx-6 px-6">
          <Form {...form}>
            <form
              id="reservation-form"
              onSubmit={form.handleSubmit(onFormSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="meetingName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Quarterly Review" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="personName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} min={format(new Date(), "yyyy-MM-dd")}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="pt-2">
                      <FormLabel>Start Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select start time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="pt-2">
                      <FormLabel>End Time</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select end time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableEndTimes.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomSize"
                  render={({ field }) => (
                    <FormItem className="space-y-3 pt-2">
                      <FormLabel>Room Size</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="small" />
                            </FormControl>
                            <FormLabel className="font-normal">Small</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="large" />
                            </FormControl>
                            <FormLabel className="font-normal">Large</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isEditMode && (
                  <FormField
                      control={form.control}
                      name="pin"
                      render={({ field }) => (
                      <FormItem className="pt-2 md:col-span-2">
                          <FormLabel>4-Digit PIN</FormLabel>
                          <FormControl>
                          <Input type="password" placeholder="****" {...field} maxLength={4} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                )}
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter className="pt-4 flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" form="reservation-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : (isEditMode ? "Update Reservation" : "Save Reservation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
