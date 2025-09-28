import React from "react";

/**
 * Inventory Management – Launch Board (Facility) – React Preview
 * --------------------------------------------------------------
 * A concise control tower for facility storekeepers: KPIs → Alerts → Actions → Snapshot → Navigation.
 * Plain JS + Tailwind. Wire the onClick handlers to your real routes/APIs.
 */

// --- UI Primitives ---
type BtnProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

const Btn: React.FC<BtnProps> = ({ children, onClick, variant = "primary" }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-xl text-sm ${
      variant === "primary"
        ? "bg-gray-900 text-white hover:bg-black"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }`}
    type="button"
  >
    {children}
  </button>
);

type SectionProps = {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

type KPIProps = {
  label: string;
  value: string;
  hint?: string;
};

const KPI: React.FC<KPIProps> = ({ label, value, hint }) => (
  <div className="p-3 bg-white rounded-xl border border-gray-200">
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">
      {label}
      {hint ? <span className="text-gray-400"> · {hint}</span> : null}
    </div>
  </div>
);

type ChipProps = {
  text: string;
  onClick?: () => void;
};

const Chip: React.FC<ChipProps> = ({ text, onClick }) => (
  <button
    onClick={onClick}
    className="px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs mr-2 mb-2"
    type="button"
  >
    {text}
  </button>
);

// --- Top KPIs ---
type TopKpisProps = {
  onOpen: (key: string) => void;
};

function TopKpis({ onOpen }: TopKpisProps) {
  const kpis = [
    { label: "Stock on Hand (value)", value: "ETB 2.4M", key: "soh" },
    { label: "Stock Accuracy", value: "93%", key: "acc" },
    { label: "Near-Expiry Items", value: "12", key: "near" },
    { label: "Avg DoS (A items)", value: "41 days", key: "dos" },
    { label: "Active Requests", value: "5", key: "reqs" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {kpis.map((k) => (
        <div key={k.key} onClick={() => onOpen(k.key)} className="cursor-pointer">
          <KPI label={k.label} value={k.value} />
        </div>
      ))}
    </div>
  );
}

// --- Alerts & Exceptions ---
type Alert = {
  id: string;
  text: string;
  severity: "critical" | "warn";
  actions?: string[];
};

type AlertsPanelProps = {
  alerts: Alert[];
  onFix: (id: string, action: string) => void;
};

function AlertsPanel({ alerts, onFix }: AlertsPanelProps) {
  return (
    <Section
      title="Alerts & Exceptions"
      right={<span className="text-xs text-gray-500">Fix these first</span>}
    >
      {alerts.length === 0 ? (
        <div className="text-sm text-gray-500">All clear 🎉</div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{
                borderColor: a.severity === "critical" ? "#fecaca" : "#e5e7eb",
                background: a.severity === "critical" ? "#fff1f2" : "#f9fafb",
              }}
            >
              <div className="text-sm text-gray-800">{a.text}</div>
              <div className="flex gap-2">
                {a.actions?.map((act, i) => (
                  <Btn
                    key={`${a.id}-${act}-${i}`}
                    variant="secondary"
                    onClick={() => onFix(a.id, act)}
                  >
                    {act}
                  </Btn>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

// --- Quick Actions Grid ---
type QuickActionsProps = {
  go: (key: string) => void;
};

function QuickActions({ go }: QuickActionsProps) {
  const actions = [
    { key: "receive", label: "Receive stock (GRN)", icon: "📦" },
    { key: "issue", label: "Issue stock", icon: "📤" },
    { key: "transfer", label: "Transfer stock", icon: "🔄" },
    { key: "adjust", label: "Adjust stock", icon: "🧾" },
    { key: "count", label: "Cycle count", icon: "🧮" },
    { key: "rrf", label: "Generate RRF / Refill", icon: "📊" },
    { key: "search", label: "Search product / stock card", icon: "🔍" },
  ];
  return (
    <Section title="Quick Actions">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((act) => (
          <button
            key={act.key}
            onClick={() => go(act.key)}
            className="p-4 rounded-xl border border-gray-200 hover:border-gray-400 bg-gray-50 text-left"
            type="button"
          >
            <div className="text-2xl mb-1">{act.icon}</div>
            <div className="font-medium text-gray-900">{act.label}</div>
          </button>
        ))}
      </div>
    </Section>
  );
}

// --- Inventory Snapshot ---
type SnapshotRow = {
  id: string;
  name: string;
  soh: number;
  mos: string;
  expiry: string;
  status: "OUT" | "LOW" | "EXP" | "OK";
};

type InventorySnapshotProps = {
  rows: SnapshotRow[];
  onAction: (action: string, id: string) => void;
};

function InventorySnapshot({ rows, onAction }: InventorySnapshotProps) {
  return (
    <Section title="Inventory snapshot (critical items)">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left pr-3 py-1">Product</th>
              <th className="text-right pr-3">SOH</th>
              <th className="text-right pr-3">MOS</th>
              <th className="text-left pr-3">Nearest Expiry</th>
              <th className="text-left pr-3">Status</th>
              <th className="text-right pr-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="py-1 pr-3">{r.name}</td>
                <td className="text-right pr-3">{r.soh}</td>
                <td className="text-right pr-3">{r.mos}</td>
                <td className="pr-3">{r.expiry}</td>
                <td className="pr-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      r.status === "OUT"
                        ? "bg-rose-100 text-rose-800"
                        : r.status === "LOW"
                        ? "bg-amber-100 text-amber-800"
                        : r.status === "EXP"
                        ? "bg-fuchsia-100 text-fuchsia-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="text-right pr-3">
                  <div className="flex justify-end gap-1">
                    <Btn variant="secondary" onClick={() => onAction("receive", r.id)}>
                      Receive
                    </Btn>
                    <Btn variant="secondary" onClick={() => onAction("issue", r.id)}>
                      Issue
                    </Btn>
                    <Btn variant="secondary" onClick={() => onAction("adjust", r.id)}>
                      Adjust
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

// --- Navigation Links ---
type NavLinksProps = {
  go: (key: string) => void;
};

function NavLinks({ go }: NavLinksProps) {
  const links = [
    { key: "forecast", label: "Go to Forecasting" },
    { key: "supply", label: "View Supply Chain Health" },
    { key: "rrfTracker", label: "Open Requests & RRF Tracker" },
    { key: "reports", label: "See Reports" },
  ];
  return (
    <Section title="Navigate">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {links.map((l) => (
          <button
            key={l.key}
            onClick={() => go(l.key)}
            className="underline text-gray-800"
            type="button"
          >
            {l.label}
          </button>
        ))}
      </div>
    </Section>
  );
}

// --- Page ---
export default function InventoryLaunchBoard() {
  const alerts: Alert[] = [
    { id: "a1", text: "Stockout: Oxytocin inj 10IU", severity: "critical", actions: ["Receive", "Transfer in"] },
    { id: "a2", text: "Low stock: Ceftriaxone 1g (11 days)", severity: "warn", actions: ["Generate RRF", "Issue stopgap"] },
    { id: "a3", text: "Near-expiry: RDT Malaria (45 days)", severity: "warn", actions: ["Transfer out", "Adjust to quarantine"] },
  ];
  const rows: SnapshotRow[] = [
    { id: "p1", name: "Oxytocin inj 10IU", soh: 198, mos: "0", expiry: "—", status: "OUT" },
    { id: "p2", name: "Ceftriaxone 1g", soh: 120, mos: "11", expiry: "2026-05-15", status: "LOW" },
    { id: "p3", name: "RDT Malaria", soh: 600, mos: "75", expiry: "2025-11-10", status: "EXP" },
    { id: "p4", name: "Paracetamol 500mg", soh: 2200, mos: "60", expiry: "2026-02-01", status: "OK" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Facility</span>
            <select
              className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => window.alert(`Switch to ${e.target.value}`)}
            >
              <option>Addis Health Center</option>
              <option>Wenchi Primary Hospital</option>
              <option>Harar General Hospital</option>
            </select>
          </div>
        </div>

        <TopKpis onOpen={(k) => window.alert(`Open KPI ${k}`)} />
        <AlertsPanel alerts={alerts} onFix={(id, act) => window.alert(`Fix ${id} via ${act}`)} />
        <QuickActions go={(key) => window.alert(`Go ${key}`)} />
        <InventorySnapshot rows={rows} onAction={(act, id) => window.alert(`${act} for ${id}`)} />
        <NavLinks go={(key) => window.alert(`Navigate ${key}`)} />
      </div>
    </div>
  );
}
