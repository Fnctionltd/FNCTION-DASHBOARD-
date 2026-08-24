export function Splash({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-xl uppercase tracking-[0.34em]">FNCTION</p>
        <p className="mt-6 text-sm text-ink-dim">{children}</p>
      </div>
    </main>
  );
}
