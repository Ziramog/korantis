export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-6" style={{ background: '#0B0B0D' }}>
      <div
        className="text-sm font-mono tracking-[0.3em] uppercase"
        style={{
          color: '#88888E',
          animation: 'loader-pulse 2s ease-in-out infinite',
        }}
      >
        Korantis
      </div>
      <div className="w-32 h-px overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="absolute top-0 h-full"
          style={{
            width: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'loader-bar 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
