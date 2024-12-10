"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBookings } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData) {
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const nationalID = formData.get("nationalID");
  const [nationality, countryFlag] = formData.get("nationality").split("%");

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID))
    throw new Error("Please provide a valid national ID");

  const updateData = {
    nationality,
    country_flag: countryFlag,
    national_id: nationalID,
  };

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", session.user.guestId);

  if (error) throw new Error("Guest could not be updated");

  revalidatePath("/account/profile");
}

export async function createBooking(bookingData, formData) {
  console.log("booking data:", bookingData);
  console.log("Form data:", formData);

  // check authenticated
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  const newBooking = {
    start_date: bookingData.startDate,
    end_date: bookingData.endDate,
    num_nights: bookingData.numNights,
    cabin_price: bookingData.cabinPrice,
    cabin_id: bookingData.cabinId,
    guest_id: session.user.guestId,
    num_guests: Number(formData.get("numGuests")),
    observations: formData.get("observations").slice(0, 1000),
    extras_price: 0,
    total_price: bookingData.cabinPrice,
    is_paid: false,
    has_breakfast: false,
    status: "unfonfirmed",
  };

  const { error } = await supabase.from("bookings").insert([newBooking]);

  if (error) throw new Error("Booking could not be created");

  revalidatePath(`/cabins/${bookingData.cabinId}`);
  redirect("/cabins/thankyou");
}

export async function deleteBooking(bookingId) {
  // check authenticated
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // check if booking belongs to user
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  if (!guestBookingIds.includes(bookingId))
    throw new Error("You are not allowed to delete this booking");

  // delete reservation
  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) throw new Error("Booking could not be deleted");

  revalidatePath("/account/reservations");
}

export async function updateReservation(formData) {
  // check authenticated
  const session = await auth();
  if (!session) throw new Error("You must be logged in");

  // check if booking belongs to user
  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingIds = guestBookings.map((booking) => booking.id);
  const reservationId = Number(formData.get("reservationId"));

  if (!guestBookingIds.includes(reservationId))
    throw new Error("You are not allowed to delete this booking");

  const updateData = {
    num_guests: formData.get("numGuests"),
    observations: formData.get("observations").slice(0, 1000),
  };

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", reservationId);

  if (error) {
    console.error(error);
    throw new Error("Reservation could not be updated");
  }

  revalidatePath("/account/reservations/");
  revalidatePath(`/account/reservations/edit/${reservationId}`);

  redirect("/account/reservations");
}

// server action because we cannot run signIn from client side button
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
