"use client";
import ReservationCard from "./ReservationCard";
import { useOptimistic } from "react";
import { deleteBooking } from "@/app/_lib/actions";

function ReservationList({ bookings }) {
  // optimisticDelete - setter function
  const [optimisticBookings, optimisticDelete] = useOptimistic(
    bookings, // actual state
    // function for optimistic state, gets arguments: current state and all arguments for functions
    // calculate what should be optimistic results
    (curBookings, bookingId) => {
      return curBookings.filter((booking) => booking.id !== bookingId);
    }
  );

  // function jus to delete reservation
  async function handleDelete(bookingId) {
    // call optimistic
    optimisticDelete(bookingId);
    await deleteBooking(bookingId);
  }

  return (
    <ul className="space-y-6">
      {optimisticBookings.map((booking) => (
        // bookings replaced with optimistic bookings
        <ReservationCard
          booking={booking}
          onDelete={handleDelete}
          key={booking.id}
        />
      ))}
    </ul>
  );
}

export default ReservationList;
