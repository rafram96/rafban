"use client";

import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/components/board").then((m) => m.Board), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen p-6" style={{ background: "var(--bg)" }}>
      <div className="mx-auto" style={{ maxWidth: 1400 }}>
        <Board />
      </div>
    </main>
  );
}
