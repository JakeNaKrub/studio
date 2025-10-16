"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "./db";
import type { Reservation } from "./types";

const ReservationBaseSchema = z.object({
  meetingName: z.string().min(3, "Meeting name must be at least 3 characters"),
  personName: z.string().min(2, "Person name must be at least 2 characters"),
  mobileNumber: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Mobile number must be in XXX-XXX-XXXX format"),
  date: z.string().min(1, "Please select a date."),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  roomSize: z.enum(["small", "large"]),
});

const ReservationSchema = ReservationBaseSchema.extend({
  pin: z.string().min(4, "PIN must be 4 digits.").max(4, "PIN must be 4 digits."),
});

const UpdateReservationSchema = ReservationBaseSchema.extend({
    id: z.string(),
});


const PinSchema = z.object({
  id: z.string(),
  pin: z.string(), // Allow variable length for admin PIN
});

const ADMIN_PIN = "ITISESC";

export async function getReservations(): Promise<Reservation[]> {
  // In a real app, you would fetch from Firestore
  return Promise.resolve(db.reservations);
}

export async function createReservation(prevState: any, formData: FormData) {
  const rawData = {
    meetingName: formData.get("meetingName"),
    personName: formData.get("personName"),
    mobileNumber: formData.get("mobileNumber"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    roomSize: formData.get("roomSize"),
    pin: formData.get("pin"),
  };
  
  const validatedFields = ReservationSchema.safeParse(rawData);

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
    date: new Date(date).toISOString(),
    ...rest,
  };

  // In a real app, you would save to Firestore
  db.reservations.push(newReservation);

  revalidatePath("/reservations/list");
  revalidatePath("/reservations/calendar");
  revalidatePath("/");

  return { message: "Reservation created successfully.", data: newReservation };
}

export async function updateReservation(prevState: any, formData: FormData) {
    const rawData = {
        id: formData.get("id"),
        meetingName: formData.get("meetingName"),
        personName: formData.get("personName"),
        mobileNumber: formData.get("mobileNumber"),
        date: formData.get("date"),
        startTime: formData.get("startTime"),
        endTime: formData.get("endTime"),
        roomSize: formData.get("roomSize"),
    };

    const validatedFields = UpdateReservationSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { message: "Validation failed.", errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { id, date, ...rest } = validatedFields.data;

    if (rest.startTime >= rest.endTime) {
      return {
          errors: { endTime: ["End time must be after start time."] },
          message: "Validation failed."
      }
    }

    const reservationIndex = db.reservations.findIndex((r) => r.id === id);

    if (reservationIndex === -1) {
        return { message: "Reservation not found." };
    }

    const originalReservation = db.reservations[reservationIndex];

    const updatedReservation: Reservation = {
        ...originalReservation,
        ...rest,
        date: new Date(date).toISOString(),
    };
    
    db.reservations[reservationIndex] = updatedReservation;

    revalidatePath("/reservations/list");
    revalidatePath("/reservations/calendar");
    revalidatePath("/");

    return { message: "Reservation updated successfully.", data: updatedReservation };
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

  if (reservationIndex === -1) {
    return { message: "Reservation not found." };
  }

  const reservation = db.reservations[reservationIndex];
  
  // Check if the provided PIN is the admin PIN or the correct reservation PIN
  if (pin.toUpperCase() !== ADMIN_PIN && pin !== reservation.pin) {
    return { message: "Invalid PIN." };
  }

  db.reservations.splice(reservationIndex, 1);

  revalidatePath("/reservations/list");
  revalidatePath("/reservations/calendar");
  revalidatePath("/");

  return { message: "Reservation deleted successfully." };
}
