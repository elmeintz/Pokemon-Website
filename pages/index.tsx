import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import type { Pokedex } from "../data/models/pokedex";
import type { Pokemon } from "../data/models/pokemon";
import { formatPokemonName } from "../utils/flavor-text-formatter";
import Image from "next/image";

export default function Home() {
  const PAGE_SIZE = 50; // requirement: at most 50 per page
  const [offset, setOffset] = useState(0);

  // fetch paginated pokedex client side
  const fetchPokedex = async (lim: number, off: number): Promise<Pokedex> => {
    const resp = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${lim}&offset=${off}`
    );
    if (!resp.ok) throw new Error("Failed to fetch Pokédex");
    return (await resp.json()) as Pokedex;
  };

  const {
    data: pokedex,
    error: listError,
    isLoading: listLoading,
  } = useQuery<Pokedex>({
    queryKey: ["pokedex", PAGE_SIZE, offset],
    queryFn: () => fetchPokedex(PAGE_SIZE, offset),
  });

  // client side sprites from /pokemon/{name}
  const fetchSprites = async (names: string[]): Promise<Record<string, string>> => {
    const out: Record<string, string> = {};
    await Promise.allSettled(
      names.map(async (name) => {
        const res = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as Pokemon;
        out[name] = data.sprites.front_default ?? "";
      })
    );
    return out;
  };

  const {
    data: spriteMap,
    isLoading: spritesLoading,
  } = useQuery<Record<string, string>>({
    queryKey: ["sprites", pokedex?.results?.map((r) => r.name) ?? []],
    enabled: !!pokedex?.results?.length,
    queryFn: () => fetchSprites(pokedex!.results.map((r) => r.name)),
  });

  const total = pokedex?.count ?? 0;
  const canPrev = offset > 0;
  const canNext = total ? offset + PAGE_SIZE < total : false;
  const page = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = total ? Math.ceil(total / PAGE_SIZE) : undefined;

  return (
    <div className="flex h-svh max-h-svh w-full flex-col items-center overflow-hidden">
      <header className="w-full bg-yellow-400 shadow-md flex items-center justify-center py-3">
        <div className="flex items-center gap-3">
          <Image
            src="/pokemon-logo.png"
            alt="Pokémon Logo"
            width={200}     // specify width
            height={80}     // and height
            className="h-10 w-auto"
          />
          <h1 className="text-2xl font-bold text-gray-800 tracking-wide">Pokédex Browser</h1>
        </div>
      </header>

      <div className="flex w-full flex-1 flex-col gap-6 px-12 py-8 md:flex-row md:justify-center">
        {listLoading && <p className="text-sm text-gray-600">Loading…</p>}
        {!!listError && (
          <p className="text-sm text-red-600">
            {(listError as Error).message || "Something went wrong"}
          </p>
        )}

        {!!pokedex && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setOffset((n) => Math.max(0, n - PAGE_SIZE))}
                disabled={!canPrev}
                aria-label="Previous page"
              >
                Prev
              </button>
              <span className="text-sm text-gray-800">
                Page {page}
                {totalPages ? ` / ${totalPages}` : ""} · Showing {PAGE_SIZE} (indices {offset}–{offset + PAGE_SIZE - 1})
              </span>
              <button
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                onClick={() => setOffset((n) => n + PAGE_SIZE)}
                disabled={!canNext}
                aria-label="Next page"
              >
                Next
              </button>
            </div>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {pokedex.results.map((p) => {
                  const sprite = spriteMap?.[p.name] || "";
                  return (
                    <li key={p.name}>
                      <Link
                        href={`/pokemon?name=${encodeURIComponent(p.name)}`}
                        className="flex flex-col items-center justify-center gap-2 rounded border bg-white hover:bg-gray-100 transition w-32 h-20 mx-auto"
                      >
                        <div className="h-8 w-8 shrink-0">
                          {sprite && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={sprite}
                              alt={`${formatPokemonName(p.name)} sprite`}
                              className="h-8 w-8 object-contain"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <span className="text-sm text-center truncate">{formatPokemonName(p.name)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            {spritesLoading && (
              <p className="text-xs text-gray-500">Loading sprites…</p>
            )}
          </div>
        )}
      </div>

      <p className="h-14 px-4 text-center text-xs text-gray-600">
        Made with 🩵 by{" "}
        <a className="underline underline-offset-2 hover:cursor-pointer">Lauren Meintzer</a>{" "}
        for COMP 426 @ UNC-Chapel Hill
      </p>
    </div>
  );
}
