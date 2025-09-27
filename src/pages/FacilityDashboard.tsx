import React from "react";

const scenarios = [
  { key: "INV", title: "Facility – Inventory", desc: "Use issues/consumption from stock to forecast automatically.", time: "~2 min" },
  { key: "PROGRAM", title: "Program (Morbidity)", desc: "Malaria, RMNCH, HIV, EPI templates with conversion factors.", time: "~3–5 min" },
  { key: "CAMPAIGN", title: "Campaign/Event", desc: "Forecast for HIV testing month, Measles catch-up, etc.", time: "~5 min" },
  { key: "NATIONAL", title: "National/Regional Roll-up", desc: "Aggregate facility data or morbidity estimates at scale.", time: "~10+ min" },
  { key: "CUSTOM", title: "Custom Data Source", desc: "Upload CSV or connect DHIS2/service statistics.", time: "~3–5 min" }
] as const;

type ScenarioKey = (typeof scenarios)[number]["key"];

const BtnStyles: React.FC = () => (
  <style>{`.btn{padding:.5rem .75rem;border-radius:.75rem;background:#111827;color:#fff;font-size:.875rem} .btn:hover{background:#000}`}</style>
);

type IntentModalProps = {
  onSelect: (key: ScenarioKey) => void;
};

function IntentModal({ onSelect }: IntentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">What do you want to forecast today?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((s) => (
            <button
              key={s.key}
              onClick={() => onSelect(s.key)}
              className="p-4 rounded-xl border border-gray-200 hover:border-gray-400 text-left bg-gray-50 hover:bg-gray-100"
            >
              <div className="font-medium text-gray-900">{s.title}</div>
              <div className="text-sm text-gray-600 mt-1">{s.desc}</div>
              <div className="text-xs text-gray-400 mt-1">{s.time}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-right">
          <button className="btn" onClick={() => onSelect("INV")}>Skip (Expert Mode)</button>
        </div>
      </div>
    </div>
  );
}

type WizardProps = {
  scenario: ScenarioKey;
  onClose: () => void;
};

function Wizard({ scenario, onClose }: WizardProps) {
  const [step, setStep] = React.useState(1);
  const next = () => setStep((s) => Math.min(5, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const StepBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">{children}</div>
  );

  return (
    <div className="fixed inset-0 bg-white overflow-auto p-6 z-40">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">{scenario} Forecast Wizard</h2>
          <button className="px-3 py-1 rounded-lg bg-gray-100" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`px-3 py-1 rounded-full ${step === n ? "bg-gray-900 text-white" : "bg-gray-100"}`}
            >
              Step {n}
            </div>
          ))}
        </div>

        {step === 1 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 1 – Scope</h3>
            <p className="text-sm text-gray-600">Choose level (Facility/National), program, time horizon.</p>
          </StepBox>
        )}
        {step === 2 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 2 – Data source</h3>
            <p className="text-sm text-gray-600">Select inventory, service stats, morbidity, or upload CSV.</p>
          </StepBox>
        )}
        {step === 3 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 3 – Assumptions</h3>
            <p className="text-sm text-gray-600">
              Lead time, service level, wastage, seasonality. Program templates add specific inputs (e.g., malaria positivity).
            </p>
          </StepBox>
        )}
        {step === 4 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 4 – Review & warnings</h3>
            <p className="text-sm text-gray-600">Show formulas, data quality flags, missing data prompts.</p>
          </StepBox>
        )}
        {step === 5 && (
          <StepBox>
            <h3 className="font-medium mb-2">Step 5 – Outputs & actions</h3>
            <p className="text-sm text-gray-600">
              Forecast table & charts, export RRF/procurement, budget simulator slider.
            </p>
          </StepBox>
        )}

        <div className="flex justify-between">
          <button onClick={back} disabled={step === 1} className="px-4 py-2 bg-gray-100 rounded-xl">
            Back
          </button>
          {step < 5 && (
            <button onClick={next} className="btn">
              Next
            </button>
          )}
          {step === 5 && (
            <button onClick={onClose} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
              Save &amp; Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

type KpiItem = {
  label: string;
  value: string;
};

const Kpi: React.FC<KpiItem> = ({ label, value }) => (
  <div className="p-3 bg-white rounded-xl border border-gray-200">
    <div className="text-2xl font-semibold text-gray-900">{value}</div>
    <div className="text-sm text-gray-500">{label}</div>
  </div>
);

const KpiStrip: React.FC<{ kpis: KpiItem[] }> = ({ kpis }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {kpis.map((k, i) => (
      <Kpi key={i} label={k.label} value={k.value} />
    ))}
  </div>
);

type ForecastHistory = {
  id: string;
  name: string;
  type: string;
  status: string;
  accuracy?: number;
  updated: string;
};

type HistoryListProps = {
  items: ForecastHistory[];
  onOpen: (id: string) => void;
};

function HistoryList({ items, onOpen }: HistoryListProps) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">Recent Forecasts</h3>
        <button className="text-sm underline" onClick={() => window.alert("Open full history")}>View all</button>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-gray-500">No forecasts yet</div>
      ) : (
        <div className="divide-y">
          {items.slice(0, 5).map((it) => (
            <div key={it.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">
                  {it.name} <span className="text-xs text-gray-500">· {it.type} · {it.status}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Updated {it.updated}
                  {it.accuracy != null ? ` · Accuracy ${it.accuracy}%` : ""}
                </div>
              </div>
              <button className="btn" onClick={() => onOpen(it.id)}>
                Open
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type DataQualityIssue = {
  id: string;
  label: string;
  fix: string;
};

type DataQualityCardProps = {
  issues: DataQualityIssue[];
  score: number;
  onFix: (id: string) => void;
};

function DataQualityCard({ issues, score, onFix }: DataQualityCardProps) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200">
      <h3 className="font-medium mb-2">Data Readiness</h3>
      <div className="mb-2 text-sm text-gray-600">
        Score: <span className="font-medium text-gray-900">{score}%</span>
      </div>
      {issues.length === 0 ? (
        <div className="text-sm text-gray-500">All good 🎉</div>
      ) : (
        <div className="space-y-2">
          {issues.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <div className="text-sm text-amber-900">{i.label}</div>
              <button className="btn" onClick={() => onFix(i.id)}>
                {i.fix}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type AccuracyPoint = {
  cycle: string;
  mape: number;
};

type AccuracyCardProps = {
  series: AccuracyPoint[];
};

function AccuracyCard({ series }: AccuracyCardProps) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200">
      <h3 className="font-medium mb-2">Forecast Accuracy</h3>
      <div className="text-xs text-gray-500 mb-2">MAPE by cycle</div>
      <ul className="text-sm text-gray-700 space-y-1">
        {series.map((s) => (
          <li key={s.cycle} className="flex items-center justify-between">
            <span>{s.cycle}</span>
            <span className="font-medium">{s.mape}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type QuickActionsProps = {
  onNew: () => void;
  onRRF: () => void;
  onCDSS: () => void;
  onNonCDSS: () => void;
  onProgram: () => void;
  onImport: () => void;
};

function QuickActions({ onNew, onRRF, onCDSS, onNonCDSS, onProgram, onImport }: QuickActionsProps) {
  const Btn: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <button className="btn" onClick={onClick}>
      {label}
    </button>
  );
  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200">
      <h3 className="font-medium mb-3">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        <Btn label="New Forecast" onClick={onNew} />
        <Btn label="Generate RRF" onClick={onRRF} />
        <Btn label="Conduct CDSS Forecast" onClick={onCDSS} />
        <Btn label="Conduct Non‑CDSS Forecast" onClick={onNonCDSS} />
        <Btn label="Conduct Program Forecast" onClick={onProgram} />
        <Btn label="Import / Upload Forecast" onClick={onImport} />
      </div>
    </div>
  );
}

type ForecastingHomeProps = {
  onNew: () => void;
  onOpenForecast: (id: string) => void;
};

function ForecastingHome({ onNew, onOpenForecast }: ForecastingHomeProps) {
  const kpis: KpiItem[] = [
    { label: "Forecasts done", value: "12" },
    { label: "Avg. Accuracy", value: "84%" },
    { label: "Data Completeness", value: "92%" },
    { label: "Programs Covered", value: "3" }
  ];
  const history: ForecastHistory[] = [
    { id: "F-102", name: "RMNCH Q3", type: "Program", status: "Approved", accuracy: 82, updated: "3 days ago" },
    { id: "F-101", name: "Facility RRF Aug", type: "CDSS", status: "Submitted", accuracy: 88, updated: "2 weeks ago" },
    { id: "F-100", name: "Malaria Jun–Aug", type: "Program", status: "Draft", updated: "1 month ago" }
  ];
  const dq: DataQualityIssue[] = [
    { id: "dq1", label: "2 months missing consumption for Oxytocin", fix: "Add data" },
    { id: "dq2", label: "Negative stock for Ceftriaxone (-4)", fix: "Open stock card" }
  ];
  const mapeSeries: AccuracyPoint[] = [
    { cycle: "Q1", mape: 18 },
    { cycle: "Q2", mape: 15 },
    { cycle: "Q3", mape: 14 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <BtnStyles />
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Forecasting – Home</h1>
          <button className="btn" onClick={onNew}>
            New Forecast
          </button>
        </div>
        <KpiStrip kpis={kpis} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <HistoryList items={history} onOpen={onOpenForecast} />
            <QuickActions
              onNew={onNew}
              onRRF={() => window.alert("Generate RRF")}
              onCDSS={() => window.alert("CDSS Forecast")}
              onNonCDSS={() => window.alert("Non-CDSS Forecast")}
              onProgram={() => window.alert("Program Forecast: Malaria, RMNCH, HIV, EPI, Lab")}
              onImport={() => window.alert("Import from CSV/DHIS2")}
            />
          </div>
          <div className="space-y-4">
            <DataQualityCard issues={dq} score={91} onFix={(id) => window.alert("Fix " + id)} />
            <AccuracyCard series={mapeSeries} />
          </div>
        </div>
      </div>
    </div>
  );
}

type FacilityDashboardMode = "home" | "wizard";

export default function FacilityDashboard() {
  const [mode, setMode] = React.useState<FacilityDashboardMode>("home");
  const [scenario, setScenario] = React.useState<ScenarioKey | null>(null);

  return (
    <div>
      {mode === "home" && (
        <ForecastingHome
          onNew={() => setMode("wizard")}
          onOpenForecast={(id) => window.alert("Open forecast " + id)}
        />
      )}
      {mode === "wizard" && (
        <>
          {!scenario && <IntentModal onSelect={(key) => setScenario(key)} />}
          {scenario && (
            <Wizard
              scenario={scenario}
              onClose={() => {
                setScenario(null);
                setMode("home");
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
