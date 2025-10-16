// pages/pokemon.tsx
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import type { Pokemon } from "../data/models/pokemon";
import type { PokemonSpecies } from "../data/models/pokemon-species";
import { formatFlavorText } from "../utils/flavor-text-formatter";
import Image from "next/image";


//props to pass to PokeMonDetailPage, also describe the type we want returned from API calls
type Props = {
  pokemon: Pokemon;
  species: PokemonSpecies;
};


const PokemonDetailPage: NextPage<Props> = ({ pokemon, species }) => {
  const router = useRouter();
  //use the router to go back to home page

  const imageUrl = pokemon.sprites.front_default ?? "";
  const types = pokemon.types.map((t) => t.type.name);
  const stats = pokemon.stats.map((s) => ({ name: s.stat.name, value: s.base_stat }));
  const moves = pokemon.moves.map((m) => m.move.name);

  const rawFlavor =
    species.flavor_text_entries.find((f) => f.language.name === "en")?.flavor_text ??
    species.flavor_text_entries[0]?.flavor_text ??
    "";
  const description = formatFlavorText
    ? formatFlavorText(rawFlavor)
    : rawFlavor.replace(/\s+/g, " ").trim();

  const evolvesFrom = species.evolves_from_species?.name ?? null;

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
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={`${pokemon.name} sprite`}
              width={128}          // 32 * 4 (since Tailwind’s w-32 = 8rem = 128px)
              height={128}         // same for h-32
              className="object-contain"
            />
          )}
        <div>
          <h1 className="text-3xl font-semibold capitalize">{pokemon.name}</h1>
          <p className="mt-1">
            <strong>Type{types.length > 1 ? "s" : ""}:</strong> {types.join(", ")}
          </p>
          {evolvesFrom && (
            <p className="mt-1">
              <strong>Evolves from:</strong>{" "}
              <Link
                className="underline hover:no-underline capitalize"
                href={`/pokemon?name=${encodeURIComponent(evolvesFrom)}`}
              >
                {evolvesFrom}
              </Link>
            </p>
          )}
        </div>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="leading-relaxed">{description || "No description available."}</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Base Stats</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {stats.map((s) => (
            <li key={s.name} className="flex justify-between rounded-lg border p-2">
              <span className="capitalize">{s.name}</span>
              <span className="font-medium">{s.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Moves</h2>
        <p className="text-sm text-gray-600 mb-2">Click any move to see its details.</p>
        <div className="flex flex-wrap gap-2">
          {moves.map((mv) => (
            <Link
            href={`/move_det?move=${encodeURIComponent(mv)}`}
            className="block w-full rounded border px-3 py-1 text-left hover:bg-gray-100"
            key={mv}
            >
              {mv}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const name =
    typeof context.query.name === "string" ? context.query.name.trim() : "";

  if (!name) return { notFound: true };

  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(name)}`),
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) return { notFound: true };

    const [pokemon, species] = (await Promise.all([
      pokemonRes.json(),
      speciesRes.json(),
    ])) as [Pokemon, PokemonSpecies];

    return { props: { pokemon, species } };
  } catch {
    return { notFound: true };
  }
};

export default PokemonDetailPage;
