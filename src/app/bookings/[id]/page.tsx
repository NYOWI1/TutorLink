import TutorLinkApp from '@/components/TutorLinkApp';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TutorLinkApp path={'/bookings/' + id + ''} />;
}
