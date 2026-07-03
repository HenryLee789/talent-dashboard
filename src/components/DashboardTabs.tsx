import type { DashboardTab } from "../types/talent";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "dashboard", label: "数据看板" },
  { id: "report", label: "分析报告" },
  { id: "entry", label: "数据录入" },
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <nav className="print-hidden mb-5 border-b border-dashboard-line">
      <div className="flex items-center gap-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative h-11 px-1 text-sm font-semibold transition ${
                isActive
                  ? "text-dashboard-blue"
                  : "text-dashboard-muted hover:text-slate-700"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-[-1px] left-0 h-0.5 w-full rounded-full bg-dashboard-blue" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
