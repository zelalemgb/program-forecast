import { ReactNode, useMemo, useState } from "react";

/**
 * Issue Stock – Facility UX Spec & React Preview
 * ----------------------------------------------
 * Minimal, guided page for logistics officers to:
 *  1) Issue stock to another facility (Transfer Out)
 *  2) Issue stock to an internal clinical department (fulfill a prior request)
 *
 * Design goals: minimal decisions, FEFO guidance, scanning-first, quick actions, offline friendly.
 * Plain JS + Tailwind. Handler stubs alert; wire to APIs later.
 */

// ---------- Types ----------
export type IssueLine = {
  id: string;
  productName: string;
  productCode?: string;
  lot?: string;
  expiry?: string;
  qtyRequested?: number;
  qtyToIssue?: number;
  remarks?: string;
};

type IssueMode = "DEPT" | "XFER";

type AvailableLot = {
  lot: string;
  expiry: string;
  qty: number;
};

type ButtonVariant = "primary" | "ghost" | "success";

type ButtonProps = {
  children: ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

const Btn = ({ children, onClick, variant = "primary", disabled }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-xl text-sm ${disabled ? "opacity-50 cursor-not-allowed" : ""} ` +
      (variant === "primary"
        ? "bg-gray-900 text-white hover:bg-black"
        : variant === "ghost"
          ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
          : variant === "success"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-gray-900 text-white hover:bg-black")}
  >
    {children}
  </button>
);

type SectionProps = {
  title: string;
  right?: ReactNode;
  children: ReactNode;
};

const Section = ({ title, right, children }: SectionProps) => (
  <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

type FieldProps = {
  label: string;
  children: ReactNode;
};

const Field = ({ label, children }: FieldProps) => (
  <label className="block text-sm">
    <div className="text-gray-600 mb-1">{label}</div>
    {children}
  </label>
);

// ---------- Offline Bar ----------
type OfflineBarProps = {
  online: boolean;
  queued: number;
};

function OfflineBar({ online, queued }: OfflineBarProps) {
  return (
    <div
      className={`sticky top-0 z-40 ${online ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"} border-b px-4 py-2 flex items-center justify-between`}
    >
      <div className="text-sm">
        {online ? "Online" : "Offline"} · Queued posts: <span className="font-medium">{queued}</span>
      </div>
      {!online && <div className="text-xs text-amber-900">Issues will sync when back online</div>}
    </div>
  );
}

// ---------- Header ----------
type HeaderValue = {
  dept?: string;
  reqNo?: string;
  issuedAt?: string;
  ref?: string;
  dest?: string;
  waybill?: string;
  vehicle?: string;
};

type IssueHeaderProps = {
  mode: IssueMode;
  setMode: (mode: IssueMode) => void;
  value: HeaderValue;
  onChange: (value: HeaderValue) => void;
  onScanReq: () => void;
  onAddGeo: () => void;
};

function IssueHeader({ mode, setMode, value, onChange, onScanReq, onAddGeo }: IssueHeaderProps) {
  return (
    <Section
      title="Issue details"
      right={
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onScanReq}>
            {mode === "DEPT" ? "Scan Request" : "Scan Facility QR"}
          </Btn>
          <Btn variant="ghost" onClick={onAddGeo}>
            Add geotag
          </Btn>
        </div>
      }
    >
      <div className="mb-3 flex gap-2 text-sm">
        <button
          className={`px-3 py-1 rounded-full ${mode === "DEPT" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
          onClick={() => setMode("DEPT")}
        >
          To Department
        </button>
        <button
          className={`px-3 py-1 rounded-full ${mode === "XFER" ? "bg-gray-900 text-white" : "bg-gray-100"}`}
          onClick={() => setMode("XFER")}
        >
          Transfer Out (to facility)
        </button>
      </div>

      {mode === "DEPT" ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Department">
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={value.dept || ""}
              onChange={(event) => onChange({ ...value, dept: event.target.value })}
            >
              <option value="">Select department</option>
              <option>OPD</option>
              <option>IPD</option>
              <option>Lab</option>
              <option>MCH</option>
            </select>
          </Field>
          <Field label="Request # (optional)">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={value.reqNo || ""}
              onChange={(event) => onChange({ ...value, reqNo: event.target.value })}
              placeholder="REQ-2451"
            />
          </Field>
          <Field label="Issued at">
            <input
              type="datetime-local"
              className="w-full border rounded-xl px-3 py-2"
              value={value.issuedAt || ""}
              onChange={(event) => onChange({ ...value, issuedAt: event.target.value })}
            />
          </Field>
          <Field label="Reference (optional)">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={value.ref || ""}
              onChange={(event) => onChange({ ...value, ref: event.target.value })}
              placeholder="Ward round 10am"
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Field label="Destination facility">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={value.dest || ""}
              onChange={(event) => onChange({ ...value, dest: event.target.value })}
              placeholder="Wenchi Primary Hospital"
            />
          </Field>
          <Field label="Waybill # (optional)">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={value.waybill || ""}
              onChange={(event) => onChange({ ...value, waybill: event.target.value })}
              placeholder="WB-9921"
            />
          </Field>
          <Field label="Issued at">
            <input
              type="datetime-local"
              className="w-full border rounded-xl px-3 py-2"
              value={value.issuedAt || ""}
              onChange={(event) => onChange({ ...value, issuedAt: event.target.value })}
            />
          </Field>
          <Field label="Driver/Vehicle (optional)">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={value.vehicle || ""}
              onChange={(event) => onChange({ ...value, vehicle: event.target.value })}
              placeholder="Plate ABC-12345"
            />
          </Field>
        </div>
      )}
    </Section>
  );
}

// ---------- Capture Toolbar ----------
type CaptureBarProps = {
  onScan: () => void;
  onManual: () => void;
  onPickRequest: () => void;
};

function CaptureBar({ onScan, onManual, onPickRequest }: CaptureBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Btn onClick={onScan}>🧪 Scan item barcode</Btn>
      <Btn variant="ghost" onClick={onManual}>
        ✍️ Add line manually
      </Btn>
      <Btn variant="ghost" onClick={onPickRequest}>
        📄 Select department request
      </Btn>
    </div>
  );
}

// ---------- FEFO Suggest ----------
type LineEditorModalProps = {
  open: boolean;
  line: IssueLine;
  availableLots: AvailableLot[];
  onChange: (line: IssueLine) => void;
  onClose: () => void;
  onSave: () => void;
};

function LineEditorModal({ open, line, availableLots, onChange, onClose, onSave }: LineEditorModalProps) {
  const suggestions = useMemo(() => {
    const parseExpiry = (value?: string) => (value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER);
    return [...availableLots].sort((a, b) => parseExpiry(a.expiry) - parseExpiry(b.expiry));
  }, [availableLots]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Edit issue line · FEFO suggestions</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-100">
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Field label="Product">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={line.productName || ""}
              onChange={(event) => onChange({ ...line, productName: event.target.value })}
            />
          </Field>
          <Field label="Lot">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={line.lot || ""}
              onChange={(event) => onChange({ ...line, lot: event.target.value })}
            />
          </Field>
          <Field label="Expiry">
            <input
              type="date"
              className="w-full border rounded-xl px-3 py-2"
              value={line.expiry || ""}
              onChange={(event) => onChange({ ...line, expiry: event.target.value })}
            />
          </Field>
          <Field label="Qty to issue">
            <input
              type="number"
              min={0}
              className="w-full border rounded-xl px-3 py-2"
              value={line.qtyToIssue ?? 0}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value || "0", 10);
                onChange({ ...line, qtyToIssue: Number.isNaN(parsed) ? 0 : parsed });
              }}
            />
          </Field>
        </div>
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-900 mb-1">FEFO suggestions (earliest expiries)</div>
          <div className="max-h-40 overflow-auto border rounded-xl">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="text-left pr-3 py-1">Lot</th>
                  <th className="text-left pr-3">Expiry</th>
                  <th className="text-right pr-3">Available</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((suggestion) => (
                  <tr key={suggestion.lot} className="border-t">
                    <td className="py-1 pr-3">{suggestion.lot}</td>
                    <td className="pr-3">{suggestion.expiry}</td>
                    <td className="text-right pr-3">{suggestion.qty}</td>
                    <td className="text-right pr-3">
                      <Btn variant="ghost" onClick={() => onChange({ ...line, lot: suggestion.lot, expiry: suggestion.expiry })}>
                        Use
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          FEFO is recommended for all issues unless overridden by a supervisor.
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="success" onClick={onSave}>
            Save
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ---------- Lines Table ----------
type LinesTableProps = {
  mode: IssueMode;
  lines: IssueLine[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSplit: (id: string) => void;
  onFulfillAll: () => void;
};

function LinesTable({ mode, lines, onEdit, onDelete, onSplit, onFulfillAll }: LinesTableProps) {
  const hasRequests = lines.some((line) => line.qtyRequested != null);

  return (
    <Section
      title={mode === "DEPT" ? "Department request lines" : "Transfer-out lines"}
      right={hasRequests ? (
        <Btn variant="ghost" onClick={onFulfillAll}>
          Fulfill all
        </Btn>
      ) : null}
    >
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left pr-3 py-1">Product</th>
              {mode === "DEPT" && <th className="text-right pr-3">Requested</th>}
              <th className="text-left pr-3">Lot</th>
              <th className="text-left pr-3">Expiry</th>
              <th className="text-right pr-3">To issue</th>
              <th className="text-right pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.id} className="border-t border-gray-100">
                <td className="py-1 pr-3">{line.productName}</td>
                {mode === "DEPT" && <td className="text-right pr-3">{line.qtyRequested ?? "-"}</td>}
                <td className="pr-3">{line.lot ?? "-"}</td>
                <td className="pr-3">{line.expiry ?? "-"}</td>
                <td className="text-right pr-3">{line.qtyToIssue ?? 0}</td>
                <td className="text-right pr-3">
                  <div className="flex justify-end gap-1">
                    <Btn variant="ghost" onClick={() => onEdit(line.id)}>
                      Edit
                    </Btn>
                    <Btn variant="ghost" onClick={() => onSplit(line.id)}>
                      Split lots
                    </Btn>
                    <Btn variant="ghost" onClick={() => onDelete(line.id)}>
                      Remove
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Rules: FEFO by default; cannot issue more than available; department issues cannot exceed request unless override.
      </div>
    </Section>
  );
}

// ---------- Footer ----------
type FooterBarProps = {
  onSaveDraft: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onPost: () => void;
  canApprove: boolean;
  canPost: boolean;
};

function FooterBar({ onSaveDraft, onSubmit, onApprove, onPost, canApprove, canPost }: FooterBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex flex-wrap gap-2 justify-end">
      <Btn variant="ghost" onClick={onSaveDraft}>
        Save draft
      </Btn>
      <Btn onClick={onSubmit}>Submit for approval</Btn>
      {canApprove && (
        <Btn variant="success" onClick={onApprove}>
          Approve
        </Btn>
      )}
      {canPost && (
        <Btn variant="success" onClick={onPost}>
          Post &amp; print Issue note
        </Btn>
      )}
    </div>
  );
}

// ---------- Main Page ----------
export default function IssueStockPage() {
  const [online] = useState(true);
  const [queued] = useState(0);
  const [mode, setMode] = useState<IssueMode>("DEPT");
  const [header, setHeader] = useState<HeaderValue>({
    dept: "OPD",
    reqNo: "REQ-2451",
    issuedAt: "",
    ref: "",
    dest: "",
    waybill: "",
    vehicle: "",
  });

  const [availableLots] = useState<AvailableLot[]>([
    { lot: "L001", expiry: "2026-02-01", qty: 60 },
    { lot: "L014", expiry: "2026-05-15", qty: 140 },
    { lot: "L020", expiry: "2026-09-30", qty: 300 },
  ]);

  const [lines, setLines] = useState<IssueLine[]>([
    {
      id: "i1",
      productName: "Paracetamol 500mg",
      qtyRequested: 300,
      lot: "L001",
      expiry: "2026-02-01",
      qtyToIssue: 60,
    },
    {
      id: "i2",
      productName: "Ceftriaxone 1g",
      qtyRequested: 80,
      lot: "L014",
      expiry: "2026-05-15",
      qtyToIssue: 80,
    },
  ]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<IssueLine | null>(null);

  const openEdit = (id: string) => {
    const line = lines.find((item) => item.id === id);
    if (!line) return;
    setEditing({ ...line });
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editing) return;

    setLines((current) => {
      const exists = current.some((line) => line.id === editing.id);
      if (exists) {
        return current.map((line) => (line.id === editing.id ? editing : line));
      }

      const newId = editing.id === "new" ? `i${Date.now()}` : editing.id;
      return [...current, { ...editing, id: newId }];
    });

    setEditOpen(false);
    setEditing(null);
  };

  const closeEditor = () => {
    setEditOpen(false);
    setEditing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBar online={online} queued={queued} />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Issue stock</h1>
          <CaptureBar
            onScan={() => window.alert("Open scanner")}
            onManual={() => {
              setEditing({ id: "new", productName: "", lot: "", expiry: "", qtyToIssue: 0 });
              setEditOpen(true);
            }}
            onPickRequest={() => window.alert("Pick a department request")}
          />
        </div>

        <IssueHeader
          mode={mode}
          setMode={setMode}
          value={header}
          onChange={setHeader}
          onScanReq={() => window.alert("Scan request/facility code")}
          onAddGeo={() => window.alert("Attach geotag")}
        />

        <LinesTable
          mode={mode}
          lines={lines}
          onEdit={openEdit}
          onDelete={(id) => setLines((current) => current.filter((line) => line.id !== id))}
          onSplit={(id) => window.alert(`Split lots ${id}`)}
          onFulfillAll={() =>
            setLines((current) =>
              current.map((line) => ({
                ...line,
                qtyToIssue: line.qtyRequested ?? line.qtyToIssue ?? 0,
              })),
            )
          }
        />

        <FooterBar
          onSaveDraft={() => window.alert("Saved draft")}
          onSubmit={() => window.alert("Submitted for approval")}
          onApprove={() => window.alert("Approved")}
          onPost={() => window.alert("Posted & printed Issue note")}
          canApprove
          canPost
        />
      </div>

      <LineEditorModal
        open={editOpen}
        line={editing ?? { id: "", productName: "" }}
        availableLots={availableLots}
        onChange={(value) => setEditing(value)}
        onClose={closeEditor}
        onSave={saveEdit}
      />
    </div>
  );
}
