import UpdateReservationForm from "@/app/_components/UpdateReservationForm";
import { getBooking, getCabin } from "@/app/_lib/data-service";

export default async function Page({ params }) {
  const booking = await getBooking(params.bookingId);
  const cabin = await getCabin(booking.cabin_id);

  return <UpdateReservationForm booking={booking} cabin={cabin} />;
}
