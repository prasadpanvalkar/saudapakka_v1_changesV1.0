import { redirect } from 'next/navigation';

export default function MandateRedirectPage({ params }: { params: { id: string } }) {
    redirect(`/dashboard/mandates/${params.id}`);
}
