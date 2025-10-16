import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import type { Move } from "../data/models/move";

type Props = { move: Move };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const raw = Array.isArray(context.query.move)
    ? context.query.move[0]
    : context.query.move;
  const moveName = raw?.toString().trim().toLowerCase() ?? "";

  if (!moveName) return { notFound: true };

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${encodeURIComponent(moveName)}`);
    if (!res.ok) return { notFound: true };
    const move = (await res.json()) as Move;
    return { props: { move } };
  } catch {
    return { notFound: true };
  }
};

const MoveDetailPage: NextPage<Props> = ({ move }) => {
  const router = useRouter();

  // Prefer English flavor text
  const flavorEN = move.flavor_text_entries.find((e) => e.language?.name === "en");

  const stat = (v: unknown) =>
    v === 0 || typeof v === "number" ? String(v) : v ? String(v) : "—";

  return (
    <div className="mx-auto max-w-3xl p-4 space-y-6">
      <button
        onClick={() => router.back()}
        className="rounded-xl px-4 py-2 border hover:bg-gray-50"
        aria-label="Go back"
      >
        ← Back
      </button>

      <header className="flex items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold capitalize">{move.name}</h1>
          <p className="mt-1 text-gray-700">
            <strong>Type:</strong> <span className="capitalize">{move.type?.name ?? "—"}</span>
          </p>
          <p className="text-gray-700">
            <strong>Category:</strong> <span className="capitalize">{move.damage_class?.name ?? "—"}</span>
          </p>
        </div>
      </header>

      {flavorEN?.flavor_text && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Flavor</h2>
          <p className="leading-relaxed whitespace-pre-line">
            {flavorEN.flavor_text}
          </p>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-2">Base Stats</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <li className="rounded-xl border p-3"><strong>Power:</strong> {stat((move as Move).power)}</li>
          <li className="rounded-xl border p-3"><strong>Accuracy:</strong> {stat((move as Move).accuracy)}</li>
          <li className="rounded-xl border p-3"><strong>PP:</strong> {stat((move as Move).pp)}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">More</h2>
        <p className="text-sm text-gray-600">
          Add machines, contest type, targets, or Pokémon that learn this move here.
        </p>
      </section>
    </div>
  );
};

export default MoveDetailPage;
