import CancelBookingClient from "./CancelBookingClient";

interface CancelBookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CancelBookingPage({
  params,
}: CancelBookingPageProps) {
  const { id } = await params;

  return <CancelBookingClient bookingId={id} />;
}
