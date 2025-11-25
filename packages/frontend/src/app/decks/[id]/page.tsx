import DeckDetailClient from "./DeckDetailClient";

interface PageProps {
  params: {
    id: string;
  };
}

export default function DeckDetailPage({ params }: PageProps) {
  return <DeckDetailClient deckId={params.id} />;
}

