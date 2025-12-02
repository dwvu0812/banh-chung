import DeckDetailClient from "./DeckDetailClient";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeckDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <DeckDetailClient deckId={resolvedParams.id} />;
}

