"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";

import { cn } from "@/lib/utils";
import { createReservation, updateReservation } from "@/lib/actions";
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

const ReservationSchema = z.object({
  meetingName: z.string().min(3, "Meeting name must be at least 3 characters"),
  personName: z.string().min(2, "Person name must be at least 2 characters"),
  mobileNumber: z
    .string()
    .regex(/^\d{3}-\d{3}-\d{4}$/, "Use format XXX-XXX-XXXX"),
  date: z.string().min(1, "Please select a date."),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  roomSize: z.enum(["small", "large"], {
    required_error: "You need to select a room size.",
  }),
  pin: z.string().min(4, "PIN must be at least 4 digits."),
})
.refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
});

type ReservationFormValues = z.infer<typeof ReservationSchema>;

const timeSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = i + 8; // 8 AM to 5 PM (17:00)
    return `${hour.toString().padStart(2, '0')}:00`;
});

interface ReservationDialogProps {
  children?: React.ReactNode;
  reservation?: Reservation | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUpdate?: (reservation: Reservation) => void;
}

export function ReservationDialog({ 
  children,
  reservation,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
  onUpdate,
}: ReservationDialogProps) {
  const { toast } = useToast();
  
  const isEditMode = !!reservation;
  const action = isEditMode ? updateReservation : createReservation;

  const [state, formAction] = useActionState(action, { message: "", errors: null, data: null });

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isDialogOpen = controlledIsOpen ?? internalIsOpen;
  const setIsDialogOpen = controlledOnOpenChange ?? setInternalIsOpen;

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(ReservationSchema),
    defaultValues: isEditMode ? {
      ...reservation,
      date: format(parseISO(reservation.date), "yyyy-MM-dd"),
      pin: "", // Clear pin for security
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
    form.reset(isEditMode ? {
        ...reservation,
        date: format(parseISO(reservation.date), "yyyy-MM-dd"),
        pin: ""
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
  }, [reservation, isEditMode, form]);

  useEffect(() => {
    if (state.message.includes("successfully")) {
      toast({
        title: "Success!",
        description: state.message,
      });
      if(isEditMode && onUpdate && state.data) {
        onUpdate(state.data as Reservation);
      }
      form.reset();
      setIsDialogOpen(false);
    } else if (state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, form, setIsDialogOpen, isEditMode, onUpdate]);

  const onFormSubmit = (data: ReservationFormValues) => {
    const formData = new FormData();
    if(isEditMode && reservation) {
      formData.append("id", reservation.id);
    }
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formAction(formData);
  };
  
  const availableEndTimes = useMemo(() => {
    const startTime = form.watch("startTime");
    if (!startTime) return timeSlots;
    return timeSlots.filter(time => time > startTime);
  }, [form.watch("startTime")]);


  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => {
      setIsDialogOpen(open);
      if (!open) form.reset();
    }}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Reservation' : 'Create a New Reservation'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details for your reservation.' : 'Fill in the details below to book a common room.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
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
                      <Input placeholder="123-456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem className="pt-2">
                    <FormLabel>{isEditMode ? "Enter PIN to Confirm" : "4-Digit PIN"}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="****" {...field} maxLength={isEditMode ? 7 : 4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : (isEditMode ? "Update Reservation" : "Save Reservation")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
