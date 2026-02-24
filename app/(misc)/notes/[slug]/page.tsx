import NotesApp from "@/components/NotesApp";

type Props = { params: Promise<{ slug: string }> };

export default async function NoteSlugPage({ params }: Props) {
  const { slug } = await params;
  return <NotesApp initialSlug={slug} />;
}