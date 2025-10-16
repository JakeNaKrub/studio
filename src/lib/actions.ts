"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import type { Reservation } from "./types";

const ReservationSchema = z.object({
  id: z.string().optional(),
  meetingName: z.string().min(3, "Meeting name must be at least 3 characters"),
  personName: z.string().min(2, "Person name must be at least 2 characters"),
  mobileNumber: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Mobile number must be in XXX-XXX-XXXX format"),
  date: z.date({ required_error: "Please select a date." }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  roomSize: z.enum(["small", "large"]),
  pin: z.string().length(4, "PIN must be 4 digits"),
});

const PinSchema = z.object({
  id: z.string(),
  pin: z.string().length(4, "PIN must be 4 digits"),
})

export async function getReservations(): Promise<Reservation[]> {
  // In a real app, you would fetch from Firestore
  return Promise.resolve(db.reservations);
}

export async function createReservation(prevState: any, formData: FormData) {
  const validatedFields = ReservationSchema.safeParse({
    meetingName: formData.get("meetingName"),
    personName: formData.get("personName"),
    mobileNumber: formData.get("mobileNumber"),
    date: new Date(formData.get("date") as string),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    roomSize: formData.get("roomSize"),
    pin: formData.get("pin"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Validation failed.",
    };
  }
  
  const { date, ...rest } = validatedFields.data;

  // Basic time validation
  if (rest.startTime >= rest.endTime) {
      return {
          errors: { endTime: ["End time must be after start time."] },
          message: "Validation failed."
      }
  }

  const newReservation: Reservation = {
    id: crypto.randomUUID(),
    date: date.toISOString(),
    ...rest,
  };

  // In a real app, you would save to Firestore
  db.reservations.push(newReservation);

  revalidatePath("/reservations/list");
  revalidatePath("/reservations/calendar");

  return { message: "Reservation created successfully.", data: newReservation };
}

export async function deleteReservation(prevState: any, formData: FormData) {
  const validatedFields = PinSchema.safeParse({
    id: formData.get("id"),
    pin: formData.get("pin"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid data.",
    };
  }

  const { id, pin } = validatedFields.data;

  const reservationIndex = db.reservations.findIndex((r) => r.id === id);

  if (reservationIndex === -1 || db.reservations[reservationIndex].pin !== pin) {
    return { message: "Invalid PIN or reservation not found." };
  }

  db.reservations.splice(reservationIndex, 1);

  revalidatePath("/reservations/list");
  revalidatePath("/reservations/calendar");

  return { message: "Reservation deleted successfully." };
}
