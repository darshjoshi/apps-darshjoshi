export function PanelHeader({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        {badge && (
          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-mono font-bold tracking-widest">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs font-mono text-gray-400">{subtitle}</p>
    </div>
  );
}
