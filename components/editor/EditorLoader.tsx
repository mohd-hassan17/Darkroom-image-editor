"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor").then((m) => m.Editor), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh items-center justify-center bg-base text-sm text-text-tertiary">
      Loading editor…
    </div>
  ),
});

export function EditorLoader() {
  return <Editor />;
}
