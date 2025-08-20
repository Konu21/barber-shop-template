import ModifyBookingClient from "./ModifyBookingClient";

interface ModifyBookingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ModifyBookingPage({
  params,
}: ModifyBookingPageProps) {
  const { id } = await params;

  return <ModifyBookingClient bookingId={id} />;
}
