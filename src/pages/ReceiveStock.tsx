import React from "react";

// ---------- Types ----------
interface GrnLine {
  id: string;
  productName: string;
  productCode?: string;
  gtin?: string;
  lot?: string;
  expiry?: string;
  qtyDispatched?: number;
  qtyReceived?: number;
  qtyDamaged?: number;
  remarks?: string;
  confidence?: number;
  resolved?: boolean;
  matchStatus?: "auto" | "partial" | "unmatched";
}

interface ConflictItem {
  id: string;
  entity: string;
  server: string;
  local: string;
}

interface AvailableLotSuggestion {
  lot: string;
  expiry: string;
  qty: number;
}

interface OfflineBarProps {
  online: boolean;
  queued: number;
  onResolve: () => void;
}

interface ConflictModalProps {
  conflicts: ConflictItem[] | null;
  onClose: () => void;
  onApplyServer: (id: string) => void;
  onKeepLocal: (id: string) => void;
}

interface ShipmentHeaderValue {
  supplier?: string;
  asn?: string;
  receivedAt?: string;
  quarantine?: boolean;
}

interface ShipmentHeaderProps {
  value: ShipmentHeaderValue;
  onChange: (value: ShipmentHeaderValue) => void;
  onScanASN: () => void;
  onGeo: () => void;
  onToggleQuarantine: (checked: boolean) => void;
}

interface CaptureBarProps {
  onPhoto: () => void;
  onScan: () => void;
  onManual: () => void;
}

interface AiTranscribePanelProps {
  images: string[];
  lines: GrnLine[];
  onAddPhoto: () => void;
  onRunAI: () => void;
  onAcceptAll: () => void;
  onRejectLine: (id: string) => void;
  onResolveLine: (id: string) => void;
}

interface ScanPanelProps {
  onScan: () => void;
  onAddLine: () => void;
}

interface LineEditorModalProps {
  open: boolean;
  line: EditableLine;
  availableLots: AvailableLotSuggestion[];
  onChange: (line: EditableLine) => void;
  onClose: () => void;
  onSave: () => void;
}

interface DamageShortModalProps {
  open: boolean;
  type: "damage" | "short";
  onClose: () => void;
  onSave: (payload: { reason: string; photo: File | null }) => void;
}

interface LinesTableProps {
  lines: GrnLine[];
  onEdit: (id: string) => void;
  onSplit: (id: string) => void;
  onDamage: (id: string) => void;
  onShort: (id: string) => void;
  onDelete: (id: string) => void;
}

interface FooterBarProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onPost: () => void;
  canApprove?: boolean;
  canPost?: boolean;
}

// ---------- Utility ----------
const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `line-${Date.now()}-${Math.random().toString(16).slice(2)}`;

type EditableLine = Partial<GrnLine> & { id?: string; isNew?: boolean };

// ---------- Primitives ----------
const Btn: React.FC<
  React.PropsWithChildren<{
    onClick?: () => void;
    variant?: "primary" | "ghost" | "success";
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>
> = ({ children, onClick, variant = "primary", disabled, type = "button" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    type={type}
    className={`px-3 py-2 rounded-xl text-sm ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${
      variant === "primary"
        ? "bg-gray-900 text-white hover:bg-black"
        : variant === "ghost"
        ? "bg-gray-100 hover:bg-gray-200 text-gray-800"
        : variant === "success"
        ? "bg-emerald-600 text-white hover:bg-emerald-700"
        : "bg-gray-900 text-white hover:bg-black"
    }`}
  >
    {children}
  </button>
);

const Section: React.FC<
  React.PropsWithChildren<{ title: string; right?: React.ReactNode }>
> = ({ title, right, children }) => (
  <section className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {right}
    </div>
    {children}
  </section>
);

const Field: React.FC<React.PropsWithChildren<{ label: string }>> = ({
  label,
  children,
}) => (
  <label className="block text-sm">
    <div className="text-gray-600 mb-1">{label}</div>
    {children}
  </label>
);

// ---------- Offline Bar ----------
function OfflineBar({ online, queued, onResolve }: OfflineBarProps) {
  return (
    <div
      className={`sticky top-0 z-40 ${
        online ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
      } border-b px-4 py-2 flex items-center justify-between`}
    >
      <div className="text-sm">
        {online ? "Online" : "Offline"} · Queued posts:{" "}
        <span className="font-medium">{queued}</span>
      </div>
      {!online && <Btn variant="ghost" onClick={onResolve}>Resolve conflicts</Btn>}
    </div>
  );
}

function ConflictModal({
  conflicts,
  onClose,
  onApplyServer,
  onKeepLocal,
}: ConflictModalProps) {
  if (!conflicts) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Sync conflicts</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-100">
            Close
          </button>
        </div>
        <div className="text-sm text-gray-600 mb-3">
          Choose how to resolve each difference between server and local data.
        </div>
        <div className="space-y-2 max-h-80 overflow-auto">
          {conflicts.map((c) => (
            <div
              key={c.id}
              className="p-3 border border-amber-200 bg-amber-50 rounded-xl"
            >
              <div className="text-sm font-medium text-amber-900">
                {c.entity} · {c.id}
              </div>
              <div className="text-xs text-gray-700 mt-1">Server: {c.server}</div>
              <div className="text-xs text-gray-700">Local: {c.local}</div>
              <div className="mt-2 flex gap-2">
                <Btn variant="ghost" onClick={() => onApplyServer(c.id)}>
                  Use server
                </Btn>
                <Btn variant="ghost" onClick={() => onKeepLocal(c.id)}>
                  Keep local
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Header ----------
function ShipmentHeader({
  value,
  onChange,
  onScanASN,
  onGeo,
  onToggleQuarantine,
}: ShipmentHeaderProps) {
  return (
    <Section
      title="Delivery details"
      right={
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onScanASN}>
            Scan ASN/QR
          </Btn>
          <Btn variant="ghost" onClick={onGeo}>
            Add geotag
          </Btn>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Field label="Supplier">
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={value.supplier ?? ""}
            onChange={(e) => onChange({ ...value, supplier: e.target.value })}
            placeholder="EPSS – Addis Hub"
          />
        </Field>
        <Field label="ASN / Delivery Note #">
          <input
            className="w-full border rounded-xl px-3 py-2"
            value={value.asn ?? ""}
            onChange={(e) => onChange({ ...value, asn: e.target.value })}
            placeholder="ASN-24873"
          />
        </Field>
        <Field label="Received at">
          <input
            type="datetime-local"
            className="w-full border rounded-xl px-3 py-2"
            value={value.receivedAt ?? ""}
            onChange={(e) =>
              onChange({ ...value, receivedAt: e.target.value })
            }
          />
        </Field>
        <Field label="Quarantine all (cold-chain breach, recall, etc.)">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={!!value.quarantine}
              onChange={(e) => onToggleQuarantine(e.target.checked)}
            />
            <span className="text-xs text-gray-600">
              Items not available for issue until cleared
            </span>
          </div>
        </Field>
      </div>
    </Section>
  );
}

// ---------- Capture Toolbar ----------
function CaptureBar({ onPhoto, onScan, onManual }: CaptureBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Btn onClick={onPhoto}>📸 Capture delivery note (AI)</Btn>
      <Btn variant="ghost" onClick={onScan}>
        🧪 Scan carton barcode
      </Btn>
      <Btn variant="ghost" onClick={onManual}>
        ✍️ Add line manually
      </Btn>
    </div>
  );
}

// ---------- AI Transcription ----------
function AiTranscribePanel({
  images,
  lines,
  onAddPhoto,
  onRunAI,
  onAcceptAll,
  onRejectLine,
  onResolveLine,
}: AiTranscribePanelProps) {
  return (
    <Section
      title="Photo → AI transcription"
      right={
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={onAddPhoto}>
            Add photo
          </Btn>
          <Btn onClick={onRunAI}>Transcribe</Btn>
        </div>
      }
    >
      <div className="text-sm text-gray-600 mb-2">
        Upload a clear photo of the delivery note. The app will detect products,
        lots, expiries and quantities. You can correct any line before adding to
        GRN.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {images.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt="delivery"
            className="w-full h-36 object-cover rounded-xl border"
          />
        ))}
      </div>
      {lines.length > 0 && (
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left pr-3 py-1">Product</th>
                <th className="text-left pr-3">Lot</th>
                <th className="text-left pr-3">Expiry</th>
                <th className="text-right pr-3">Qty</th>
                <th className="text-right pr-3">Conf.</th>
                <th className="text-right pr-3"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr
                  key={l.id}
                  className={`border-t ${
                    l.matchStatus === "unmatched" ? "bg-amber-50" : ""
                  }`}
                >
                  <td className="py-1 pr-3">{l.productName}</td>
                  <td className="pr-3">{l.lot ?? "-"}</td>
                  <td className="pr-3">{l.expiry ?? "-"}</td>
                  <td className="text-right pr-3">
                    {l.qtyReceived ?? l.qtyDispatched ?? 0}
                  </td>
                  <td className="text-right pr-3">
                    {l.confidence != null
                      ? `${Math.round(l.confidence * 100)}%`
                      : "-"}
                  </td>
                  <td className="text-right pr-3">
                    <div className="flex justify-end gap-1">
                      <Btn variant="ghost" onClick={() => onResolveLine(l.id)}>
                        Resolve
                      </Btn>
                      <Btn variant="ghost" onClick={() => onRejectLine(l.id)}>
                        Remove
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {lines.length > 0 && (
        <div className="mt-3 flex justify-end">
          <Btn onClick={onAcceptAll}>Add to GRN</Btn>
        </div>
      )}
    </Section>
  );
}

// ---------- Scan Panel ----------
function ScanPanel({ onScan, onAddLine }: ScanPanelProps) {
  return (
    <Section title="Scan cartons">
      <div className="text-sm text-gray-600 mb-2">
        Scan GTIN/GS1 barcodes. The app will parse lot & expiry where available
        (AI/GS1 parsing). FEFO helps auto-pick lots.
      </div>
      <div className="flex items-center gap-2">
        <Btn onClick={onScan}>Start scanning</Btn>
        <Btn variant="ghost" onClick={onAddLine}>
          Add line manually
        </Btn>
      </div>
    </Section>
  );
}

// ---------- Line Editor with FEFO suggestions ----------
function LineEditorModal({
  open,
  line,
  availableLots,
  onChange,
  onClose,
  onSave,
}: LineEditorModalProps) {
  const suggestions = React.useMemo(
    () =>
      [...availableLots].sort(
        (a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime(),
      ),
    [availableLots],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Edit line · FEFO suggestions</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-100">
            Close
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <Field label="Product">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={line.productName ?? ""}
              onChange={(e) => onChange({ ...line, productName: e.target.value })}
            />
          </Field>
          <Field label="Lot">
            <input
              className="w-full border rounded-xl px-3 py-2"
              value={line.lot ?? ""}
              onChange={(e) => onChange({ ...line, lot: e.target.value })}
            />
          </Field>
          <Field label="Expiry">
            <input
              type="date"
              className="w-full border rounded-xl px-3 py-2"
              value={line.expiry ?? ""}
              onChange={(e) => onChange({ ...line, expiry: e.target.value })}
            />
          </Field>
          <Field label="Received qty">
            <input
              type="number"
              className="w-full border rounded-xl px-3 py-2"
              value={line.qtyReceived ?? 0}
              onChange={(e) =>
                onChange({
                  ...line,
                  qtyReceived: Number.parseInt(e.target.value || "0", 10),
                })
              }
            />
          </Field>
        </div>
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-900 mb-1">
            FEFO suggestions (earliest expiries)
          </div>
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
                {suggestions.map((s, i) => (
                  <tr key={`${s.lot}-${i}`} className="border-t">
                    <td className="py-1 pr-3">{s.lot}</td>
                    <td className="pr-3">{s.expiry}</td>
                    <td className="text-right pr-3">{s.qty}</td>
                    <td className="text-right pr-3">
                      <Btn
                        variant="ghost"
                        onClick={() =>
                          onChange({ ...line, lot: s.lot, expiry: s.expiry })
                        }
                      >
                        Use
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

// ---------- Damage/Short Modal with reason + evidence ----------
function DamageShortModal({ open, type, onClose, onSave }: DamageShortModalProps) {
  const [reason, setReason] = React.useState("");
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) {
      setReason("");
      setPhoto(null);
      setPreview("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-full max-w-md">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">
            {type === "damage" ? "Mark damaged" : "Mark short"}
          </h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-gray-100">
            Close
          </button>
        </div>
        <div className="space-y-2 text-sm">
          <Field label="Reason">
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select reason</option>
              <option value="broken">Broken/Crushed</option>
              <option value="leak">Leak/Spillage</option>
              <option value="temp">Cold-chain breach</option>
              <option value="expired">Expired on arrival</option>
              <option value="lost">Lost in transit</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Photo evidence">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                if (!file) {
                  setPhoto(null);
                  setPreview("");
                  return;
                }
                setPhoto(file);
                const url = URL.createObjectURL(file);
                setPreview(url);
              }}
            />
          </Field>
          {preview && (
            <img
              src={preview}
              alt="evidence"
              className="w-full h-40 object-cover rounded-xl border"
            />
          )}
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="success" onClick={() => onSave({ reason, photo })}>
            Save
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ---------- Lines Table ----------
function LinesTable({
  lines,
  onEdit,
  onSplit,
  onDamage,
  onShort,
  onDelete,
}: LinesTableProps) {
  return (
    <Section title="Receipt lines">
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left pr-3 py-1">Product</th>
              <th className="text-left pr-3">Lot</th>
              <th className="text-left pr-3">Expiry</th>
              <th className="text-right pr-3">Dispatched</th>
              <th className="text-right pr-3">Received</th>
              <th className="text-right pr-3">Damaged</th>
              <th className="text-right pr-3">Short</th>
              <th className="text-right pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => {
              const dispatched = l.qtyDispatched ?? 0;
              const received = l.qtyReceived ?? 0;
              const damaged = l.qtyDamaged ?? 0;
              const shortQty = Math.max(0, dispatched - received - damaged);

              return (
                <tr key={l.id} className="border-t border-gray-100">
                  <td className="py-1 pr-3">{l.productName}</td>
                  <td className="pr-3">{l.lot ?? "-"}</td>
                  <td className="pr-3">{l.expiry ?? "-"}</td>
                  <td className="text-right pr-3">{l.qtyDispatched ?? "-"}</td>
                  <td className="text-right pr-3">{received}</td>
                  <td className="text-right pr-3">{damaged}</td>
                  <td className="text-right pr-3">{shortQty}</td>
                  <td className="text-right pr-3">
                    <div className="flex justify-end gap-1">
                      <Btn variant="ghost" onClick={() => onEdit(l.id)}>
                        Edit
                      </Btn>
                      <Btn variant="ghost" onClick={() => onSplit(l.id)}>
                        Split lot
                      </Btn>
                      <Btn variant="ghost" onClick={() => onDamage(l.id)}>
                        Mark damaged
                      </Btn>
                      <Btn variant="ghost" onClick={() => onShort(l.id)}>
                        Mark short
                      </Btn>
                      <Btn variant="ghost" onClick={() => onDelete(l.id)}>
                        Remove
                      </Btn>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-gray-500">
        Rules: Lot & expiry required; received+damaged ≤ dispatched; expired items
        go to quarantine. FEFO: suggest earliest expiries during edit/add.
      </div>
    </Section>
  );
}

function FooterBar({
  onSaveDraft,
  onSubmit,
  onApprove,
  onPost,
  canApprove,
  canPost,
}: FooterBarProps) {
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
          Post &amp; print GRN
        </Btn>
      )}
    </div>
  );
}

// ---------- Main Page ----------
const ReceiveStockPage: React.FC = () => {
  const [online] = React.useState(false);
  const [queued] = React.useState(3);
  const [conflicts, setConflicts] = React.useState<ConflictItem[] | null>(null);

  const [hdr, setHdr] = React.useState<ShipmentHeaderValue>({
    supplier: "EPSS – Addis Hub",
    asn: "",
    receivedAt: "",
    quarantine: false,
  });
  const [images, setImages] = React.useState<string[]>([]);
  const [aiLines, setAiLines] = React.useState<GrnLine[]>([]);
  const [lines, setLines] = React.useState<GrnLine[]>([
    {
      id: "1",
      productName: "Oxytocin inj 10IU",
      productCode: "OXY10",
      lot: "AB12X",
      expiry: "2026-03-31",
      qtyDispatched: 200,
      qtyReceived: 198,
      qtyDamaged: 2,
      matchStatus: "auto",
    },
  ]);

  const [availableLots] = React.useState<AvailableLotSuggestion[]>([
    { lot: "AA01", expiry: "2026-01-15", qty: 120 },
    { lot: "AB12X", expiry: "2026-03-31", qty: 80 },
    { lot: "AC77", expiry: "2026-07-10", qty: 200 },
  ]);

  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EditableLine>({});

  const [dsOpen, setDsOpen] = React.useState(false);
  const [dsType, setDsType] = React.useState<"damage" | "short">("damage");
  const [dsTarget, setDsTarget] = React.useState<string | null>(null);

  const addPhoto = React.useCallback(() => {
    setImages((imgs) =>
      imgs.concat([
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=600",
      ]),
    );
  }, []);

  const runAI = React.useCallback(() => {
    setAiLines([
      {
        id: "t1",
        productName: "Ceftriaxone 1g",
        lot: "B9K2",
        expiry: "2027-01-31",
        qtyDispatched: 100,
        qtyReceived: 100,
        confidence: 0.92,
        matchStatus: "partial",
      },
      {
        id: "t2",
        productName: "Syringe 5ml",
        lot: "S5-778",
        expiry: "2028-06-30",
        qtyDispatched: 500,
        qtyReceived: 500,
        confidence: 0.88,
        matchStatus: "auto",
      },
    ]);
  }, []);

  const acceptAll = React.useCallback(() => {
    setLines((current) => current.concat(aiLines));
    setAiLines([]);
  }, [aiLines]);

  const resolveConflicts = React.useCallback(() => {
    setConflicts([
      {
        id: "GRN-102",
        entity: "grn",
        server: "qtyReceived Oxytocin=196",
        local: "qtyReceived Oxytocin=198",
      },
    ]);
  }, []);

  const openEdit = React.useCallback(
    (id: string) => {
      const target = lines.find((line) => line.id === id);
      if (!target) return;
      setEditing({ ...target });
      setEditOpen(true);
    },
    [lines],
  );

  const openNewLine = React.useCallback(() => {
    setEditing({
      id: createId(),
      productName: "",
      lot: "",
      expiry: "",
      qtyReceived: 0,
      isNew: true,
    });
    setEditOpen(true);
  }, []);

  const saveEdit = React.useCallback(() => {
    setLines((current) => {
      if (!editing.id) return current;
      const sanitized: GrnLine = {
        id: editing.id,
        productName: editing.productName ?? "",
        productCode: editing.productCode,
        gtin: editing.gtin,
        lot: editing.lot,
        expiry: editing.expiry,
        qtyDispatched: editing.qtyDispatched,
        qtyReceived: editing.qtyReceived ?? 0,
        qtyDamaged: editing.qtyDamaged ?? 0,
        remarks: editing.remarks,
        confidence: editing.confidence,
        resolved: editing.resolved,
        matchStatus: editing.matchStatus,
      };

      const exists = current.some((line) => line.id === editing.id);
      if (exists) {
        return current.map((line) =>
          line.id === editing.id ? sanitized : line,
        );
      }
      return current.concat(sanitized);
    });

    setEditOpen(false);
  }, [editing]);

  const openDamage = React.useCallback((id: string) => {
    setDsTarget(id);
    setDsType("damage");
    setDsOpen(true);
  }, []);

  const openShort = React.useCallback((id: string) => {
    setDsTarget(id);
    setDsType("short");
    setDsOpen(true);
  }, []);

  const saveDamageShort = React.useCallback(
    ({ reason, photo }: { reason: string; photo: File | null }) => {
      if (!dsTarget) return;
      setLines((current) =>
        current.map((line) => {
          if (line.id !== dsTarget) return line;
          const next: GrnLine = { ...line };
          if (dsType === "damage") {
            next.qtyDamaged = (line.qtyDamaged ?? 0) + 1;
          } else {
            const reduced = Math.max(0, (line.qtyReceived ?? 0) - 1);
            next.qtyReceived = reduced;
          }
          if (reason) {
            next.remarks = reason;
          }
          console.log("Evidence saved", {
            line: line.id,
            type: dsType,
            reason,
            photo,
          });
          return next;
        }),
      );
      setDsOpen(false);
    },
    [dsTarget, dsType],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineBar online={online} queued={queued} onResolve={resolveConflicts} />
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
        <div className="flex items-baseline justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Receive stock (GRN)
          </h1>
          <CaptureBar
            onPhoto={addPhoto}
            onScan={() => window.alert("Open scanner")}
            onManual={openNewLine}
          />
        </div>

        <ShipmentHeader
          value={hdr}
          onChange={setHdr}
          onScanASN={() => window.alert("Scan ASN")}
          onGeo={() => window.alert("Attach geotag")}
          onToggleQuarantine={(q) => setHdr((prev) => ({ ...prev, quarantine: q }))}
        />
        <AiTranscribePanel
          images={images}
          lines={aiLines}
          onAddPhoto={addPhoto}
          onRunAI={runAI}
          onAcceptAll={acceptAll}
          onRejectLine={(id) =>
            setAiLines((prev) => prev.filter((line) => line.id !== id))
          }
          onResolveLine={(id) => {
            const line = aiLines.find((l) => l.id === id);
            if (!line) return;
            setEditing({ ...line });
            setEditOpen(true);
          }}
        />
        <ScanPanel
          onScan={() => window.alert("Start scanning")}
          onAddLine={openNewLine}
        />

        <LinesTable
          lines={lines}
          onEdit={openEdit}
          onSplit={(id) => window.alert(`Split lot ${id}`)}
          onDamage={openDamage}
          onShort={openShort}
          onDelete={(id) =>
            setLines((prev) => prev.filter((line) => line.id !== id))
          }
        />

        <FooterBar
          onSaveDraft={() => window.alert("Saved draft")}
          onSubmit={() => window.alert("Submitted for approval")}
          onApprove={() => window.alert("Approved")}
          onPost={() => window.alert("Posted & printed GRN")}
          canApprove
          canPost
        />
      </div>

      <LineEditorModal
        open={editOpen}
        line={editing}
        availableLots={availableLots}
        onChange={setEditing}
        onClose={() => setEditOpen(false)}
        onSave={saveEdit}
      />

      <DamageShortModal
        open={dsOpen}
        type={dsType}
        onClose={() => setDsOpen(false)}
        onSave={saveDamageShort}
      />

      <ConflictModal
        conflicts={conflicts}
        onClose={() => setConflicts(null)}
        onApplyServer={(id) => {
          window.alert(`Using server for ${id}`);
          setConflicts(null);
        }}
        onKeepLocal={(id) => {
          window.alert(`Keeping local for ${id}`);
          setConflicts(null);
        }}
      />
    </div>
  );
};

export default ReceiveStockPage;
