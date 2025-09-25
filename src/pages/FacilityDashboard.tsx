import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Truck, 
  Calendar,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface IdName {
  id: string;
  name: string;
}

interface RiskItem {
  productId: string;
  productName: string;
  soh: number;
  amc: number;
  daysOfStock: number;
  priority: 'A' | 'B' | 'C';
}

interface RiskMetric {
  count: number;
  items: RiskItem[];
}

interface IncomingShipment {
  asn: string;
  lines: { productId: string; productName: string; qty: number }[];
}

interface AlertChip {
  label: string;
  count: number;
  type: 'near-expiry' | 'over-stock' | 'cycle-count';
}

interface TodayStripData {
  stockoutsNow: RiskMetric;
  lowStockRisk: RiskMetric;
  incomingFromEPSS: IncomingShipment[];
  alerts: AlertChip[];
}

interface RrfParams {
  reviewCycle: 'M' | 'B' | 'Q';
  leadTimeDays: number;
  safetyDays: number;
  horizonMonths: number;
}

interface RrfPreview {
  requestId?: string;
  items: { productId: string; productName: string; soh: number; amc: number; suggestedQty: number }[];
}

interface CommittedDemandConfig {
  contractId?: string;
  budget: number;
  currency: string;
  capped: boolean;
}

interface InventoryForecastCard {
  productId: string;
  productName: string;
  next3Months: number[];
  reason: string;
}

interface InventoryForecastData {
  program: 'ALL' | 'LAB' | 'RMNCH' | 'EPI' | 'ART';
  items: InventoryForecastCard[];
}

interface MorbidityForecastData {
  condition: 'MALARIA' | 'TB' | 'HIV' | 'OTHER';
  params: Record<string, number>;
  outputs: { productId: string; productName: string; forecastQty: number }[];
}

interface QuickStartTemplate {
  label: string;
  templateKey: 'LAB_STARTER' | 'RMNCH_STARTER' | 'EPI_STARTER';
  defaults: Record<string, number>;
}

interface SupplyScorecard {
  facilityScore: number;
  fillRate: number;
  leadTimeDays: number;
  stockAccuracy: number;
  expiryRisk: number;
  serviceLevel: number;
}

// UI Components
const Section: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ 
  title, 
  children, 
  right 
}) => (
  <Card className="surface border-border/50">
    <CardContent className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {right}
      </div>
      {children}
    </CardContent>
  </Card>
);

const KPI: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="flex flex-col space-y-1">
    <div className="text-2xl font-semibold text-foreground">{value}</div>
    <div className="text-muted-foreground text-sm">
      {label}
      {hint && <span className="text-muted-foreground/70"> · {hint}</span>}
    </div>
  </div>
);

const ActionChip: React.FC<{ text: string; onClick?: () => void }> = ({ text, onClick }) => (
  <Badge 
    variant="secondary" 
    className="cursor-pointer hover:bg-accent/80 transition-colors mr-2 mb-2"
    onClick={onClick}
  >
    {text}
  </Badge>
);

// Dashboard Sections
const TodayStrip: React.FC<{
  data: TodayStripData;
  onOpenStockouts: () => void;
  onOpenRiskList: () => void;
  onOpenIncoming: () => void;
  onOpenAlert: (chip: AlertChip) => void;
}> = ({ data, onOpenStockouts, onOpenRiskList, onOpenIncoming, onOpenAlert }) => {
  const incomingCount = data.incomingFromEPSS.reduce((acc, s) => acc + s.lines.length, 0);
  
  return (
    <Section title="Today's Overview">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Button
          variant="outline"
          onClick={onOpenStockouts}
          className="h-auto p-4 text-left justify-start border-status-critical/20 bg-status-critical/5 hover:bg-status-critical/10"
        >
          <div className="flex items-center space-x-3 w-full">
            <AlertTriangle className="h-5 w-5 text-status-critical" />
            <KPI label="Stockouts now" value={`${data.stockoutsNow.count}`} hint="tap to view" />
          </div>
        </Button>
        
        <Button
          variant="outline"
          onClick={onOpenRiskList}
          className="h-auto p-4 text-left justify-start border-status-warning/20 bg-status-warning/5 hover:bg-status-warning/10"
        >
          <div className="flex items-center space-x-3 w-full">
            <Clock className="h-5 w-5 text-status-warning" />
            <KPI label="Low stock risk (<15d)" value={`${data.lowStockRisk.count}`} hint="tap to view" />
          </div>
        </Button>
        
        <Button
          variant="outline"
          onClick={onOpenIncoming}
          className="h-auto p-4 text-left justify-start border-status-ok/20 bg-status-ok/5 hover:bg-status-ok/10"
        >
          <div className="flex items-center space-x-3 w-full">
            <Truck className="h-5 w-5 text-status-ok" />
            <KPI label="Incoming this week" value={`${incomingCount}`} hint="tap to pre-fill GRN" />
          </div>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {data.alerts.map((alert) => (
          <ActionChip
            key={alert.label}
            text={`${alert.label} (${alert.count})`}
            onClick={() => onOpenAlert(alert)}
          />
        ))}
      </div>
    </Section>
  );
};

const RefillStrip: React.FC<{
  onGenerateRRF: (params: RrfParams) => void;
  onCommittedDemand: (cfg: CommittedDemandConfig) => void;
  onTransferWizard: () => void;
  lastPreview?: RrfPreview;
}> = ({ onGenerateRRF, onCommittedDemand, onTransferWizard, lastPreview }) => {
  const defaultParams: RrfParams = { reviewCycle: 'M', leadTimeDays: 30, safetyDays: 15, horizonMonths: 3 };
  const defaultCommit: CommittedDemandConfig = { budget: 250000, currency: 'ETB', capped: true };
  
  return (
    <Section title="Refill & RRF">
      <div className="flex flex-wrap gap-3 mb-4">
        <Button onClick={() => onGenerateRRF(defaultParams)} className="bg-brand hover:bg-brand/90">
          <Package className="h-4 w-4 mr-2" />
          Generate RRF
        </Button>
        <Button variant="outline" onClick={() => onCommittedDemand(defaultCommit)}>
          Committed-Demand Refill
        </Button>
        <Button variant="outline" onClick={onTransferWizard}>
          <ArrowRight className="h-4 w-4 mr-2" />
          Transfer Wizard
        </Button>
      </div>
      
      {lastPreview && (
        <div className="border border-border rounded-lg p-4 bg-muted/30">
          <div className="text-sm text-muted-foreground mb-3">Last RRF Preview</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">SOH</th>
                  <th className="text-right py-2">AMC</th>
                  <th className="text-right py-2">Suggested</th>
                </tr>
              </thead>
              <tbody>
                {lastPreview.items.slice(0, 6).map((item) => (
                  <tr key={item.productId} className="border-b border-border/50">
                    <td className="py-2">{item.productName}</td>
                    <td className="text-right py-2">{item.soh}</td>
                    <td className="text-right py-2">{item.amc}</td>
                    <td className="text-right py-2 font-medium">{item.suggestedQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Section>
  );
};

const ForecastStrip: React.FC<{
  inventory: InventoryForecastData;
  morbidity: MorbidityForecastData;
  quickStarts: QuickStartTemplate[];
  onUseForRRF: (productIds: string[]) => void;
  onEditAssumptions: () => void;
}> = ({ inventory, morbidity, quickStarts, onUseForRRF, onEditAssumptions }) => {
  const [activeTab, setActiveTab] = useState<'INV' | 'MORB' | 'QS'>('INV');
  
  const TabButton: React.FC<{ id: 'INV' | 'MORB' | 'QS'; label: string }> = ({ id, label }) => (
    <Button
      variant={activeTab === id ? "default" : "outline"}
      size="sm"
      onClick={() => setActiveTab(id)}
      className={cn(
        "transition-all",
        activeTab === id && "bg-brand hover:bg-brand/90"
      )}
    >
      {label}
    </Button>
  );
  
  return (
    <Section
      title="Forecasting"
      right={
        <div className="flex items-center gap-2">
          <TabButton id="INV" label="Inventory" />
          <TabButton id="MORB" label="Program" />
          <TabButton id="QS" label="Templates" />
        </div>
      }
    >
      {activeTab === 'INV' && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">Program: {inventory.program}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventory.items.slice(0, 6).map((card) => (
              <Card key={card.productId} className="border-border/50">
                <CardContent className="p-4">
                  <div className="font-medium text-foreground mb-2">{card.productName}</div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Next 3 months: {card.next3Months.join(' → ')}
                  </div>
                  <div className="text-xs text-muted-foreground">{card.reason}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onUseForRRF(inventory.items.map(i => i.productId))}>
              Use for RRF
            </Button>
            <Button variant="outline" onClick={onEditAssumptions}>
              Edit Assumptions
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'MORB' && (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Condition: {morbidity.condition}
          </div>
          <div className="text-xs text-muted-foreground">
            Inputs: {Object.entries(morbidity.params).map(([k, v]) => `${k}=${v}`).join(', ')}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2">Product</th>
                  <th className="text-right py-2">Forecast Qty</th>
                </tr>
              </thead>
              <tbody>
                {morbidity.outputs.slice(0, 8).map((output) => (
                  <tr key={output.productId} className="border-b border-border/50">
                    <td className="py-2">{output.productName}</td>
                    <td className="text-right py-2 font-medium">{output.forecastQty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button onClick={() => onUseForRRF(morbidity.outputs.map(o => o.productId))}>
            Apply to Forecast
          </Button>
        </div>
      )}

      {activeTab === 'QS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickStarts.map((template) => (
            <Card key={template.templateKey} className="border-border/50 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="font-medium text-foreground mb-2">{template.label}</div>
                <div className="text-xs text-muted-foreground">
                  Defaults: {Object.keys(template.defaults).slice(0, 4).join(', ')}...
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
};

const SupplyHealth: React.FC<{ score: SupplyScorecard }> = ({ score }) => {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const getScoreColor = () => {
    if (score.facilityScore >= 85) return 'bg-status-ok';
    if (score.facilityScore >= 60) return 'bg-status-warning';
    return 'bg-status-critical';
  };
  
  return (
    <Section title="Supply Chain Health">
      <div className="space-y-4">
        <div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", getScoreColor())} 
              style={{ width: `${score.facilityScore}%` }} 
            />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Facility Supply Score: <span className="font-medium text-foreground">{score.facilityScore}</span>/100
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <KPI label="Fill rate" value={pct(score.fillRate)} />
          <KPI label="Lead time" value={`${score.leadTimeDays}d`} />
          <KPI label="Stock accuracy" value={pct(score.stockAccuracy)} />
          <KPI label="Expiry risk" value={pct(score.expiryRisk)} />
          <KPI label="Service level (A)" value={pct(score.serviceLevel)} />
        </div>
      </div>
    </Section>
  );
};

const AssistantStrip: React.FC<{
  onAsk: (prompt: string) => void;
  suggestions: string[];
}> = ({ onAsk, suggestions }) => {
  const [query, setQuery] = useState("");
  
  return (
    <Section title="Ask Forlab.ai Assistant">
      <div className="space-y-4">
        <div className="flex gap-3">
          <Input
            className="flex-1"
            placeholder="Ask about RRF, forecast, near-expiry, budget…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onAsk(query);
                setQuery("");
              }
            }}
          />
          <Button 
            onClick={() => { onAsk(query); setQuery(""); }}
            className="bg-brand hover:bg-brand/90"
          >
            Ask
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, i) => (
            <ActionChip
              key={i}
              text={suggestion}
              onClick={() => onAsk(suggestion)}
            />
          ))}
        </div>
      </div>
    </Section>
  );
};

// Mock Data
const exampleToday: TodayStripData = {
  stockoutsNow: { 
    count: 3, 
    items: [
      { productId: 'p1', productName: 'RDT Malaria', soh: 0, amc: 120, daysOfStock: 0, priority: 'A' },
      { productId: 'p2', productName: 'ACT (Artemether-Lumefantrine)', soh: 0, amc: 80, daysOfStock: 0, priority: 'A' },
      { productId: 'p3', productName: 'Paracetamol 500mg', soh: 0, amc: 300, daysOfStock: 0, priority: 'B' }
    ]
  },
  lowStockRisk: { 
    count: 6, 
    items: [
      { productId: 'p4', productName: 'Oxytocin inj', soh: 150, amc: 400, daysOfStock: 11, priority: 'A' },
      { productId: 'p5', productName: 'HIV Test Kit', soh: 60, amc: 120, daysOfStock: 15, priority: 'A' }
    ]
  },
  incomingFromEPSS: [
    { 
      asn: 'ASN-24873', 
      lines: [
        { productId: 'p4', productName: 'Oxytocin inj', qty: 200 }, 
        { productId: 'p6', productName: 'Ceftriaxone 1g', qty: 100 }
      ] 
    },
    { 
      asn: 'ASN-24874', 
      lines: [{ productId: 'p7', productName: 'Syringe 5ml', qty: 500 }] 
    }
  ],
  alerts: [
    { label: 'Near-expiry in 60 days', count: 7, type: 'near-expiry' },
    { label: 'Over-stocked', count: 5, type: 'over-stock' },
    { label: 'Cycle-count due (Lab)', count: 1, type: 'cycle-count' }
  ]
};

const exampleRrfPreview: RrfPreview = {
  requestId: 'REQ-001',
  items: [
    { productId: 'p1', productName: 'RDT Malaria', soh: 0, amc: 120, suggestedQty: 450 },
    { productId: 'p2', productName: 'ACT (AL)', soh: 20, amc: 80, suggestedQty: 250 },
    { productId: 'p3', productName: 'Paracetamol 500mg', soh: 30, amc: 300, suggestedQty: 900 }
  ]
};

const exampleInventoryForecast: InventoryForecastData = {
  program: 'RMNCH',
  items: [
    { productId: 'p4', productName: 'Oxytocin inj', next3Months: [420, 440, 460], reason: '↑ +5% seasonal trend' },
    { productId: 'p8', productName: 'Magnesium sulphate', next3Months: [140, 145, 150], reason: 'Stable demand' },
    { productId: 'p9', productName: 'Misoprostol 200mcg', next3Months: [220, 230, 240], reason: '↑ gradual uptake' }
  ]
};

const exampleMorbidity: MorbidityForecastData = {
  condition: 'MALARIA',
  params: { suspectedCases: 1200, testRate: 0.92, positivity: 0.18, treatmentRate: 0.98 },
  outputs: [
    { productId: 'p1', productName: 'RDT Malaria', forecastQty: 1104 },
    { productId: 'p2', productName: 'ACT (AL)', forecastQty: 212 }
  ]
};

const exampleQuickStarts: QuickStartTemplate[] = [
  { label: 'Lab – CBC & Reagents starter', templateKey: 'LAB_STARTER', defaults: { months: 3, leadTimeDays: 30, serviceLevel: 0.9 } },
  { label: 'RMNCH – Delivery bundle', templateKey: 'RMNCH_STARTER', defaults: { months: 3, leadTimeDays: 25, serviceLevel: 0.95 } },
  { label: 'EPI – Cold chain essentials', templateKey: 'EPI_STARTER', defaults: { months: 6, leadTimeDays: 45, serviceLevel: 0.95 } },
];

const exampleScore: SupplyScorecard = {
  facilityScore: 78,
  fillRate: 0.86,
  leadTimeDays: 18,
  stockAccuracy: 0.93,
  expiryRisk: 0.07,
  serviceLevel: 0.88
};

const exampleSuggestions = [
  'Why did paracetamol forecast increase this month?',
  'Prepare RRF for RMNCH using last 6 months and 30-day lead time.',
  'Show items I can transfer from OPD to IPD to avoid expiry.',
  'Simulate 20% budget cut impact on A-class items.'
];

// Main Component
export default function FacilityDashboard() {
  const handleAction = (action: string, data?: any) => {
    console.log(`Action: ${action}`, data);
    // Toast notification would go here
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-wide space-y-6 py-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-responsive-xl font-semibold text-foreground">Facility Dashboard</h1>
          <div className="text-responsive-sm text-muted-foreground">
            Unified health facility commodity management
          </div>
        </div>

        <TodayStrip
          data={exampleToday}
          onOpenStockouts={() => handleAction('Open stockouts list')}
          onOpenRiskList={() => handleAction('Open low-stock risk list')}
          onOpenIncoming={() => handleAction('Open incoming shipments')}
          onOpenAlert={(chip) => handleAction('Open alert', chip)}
        />

        <RefillStrip
          onGenerateRRF={(params) => handleAction('Generate RRF', params)}
          onCommittedDemand={(cfg) => handleAction('Committed-demand refill', cfg)}
          onTransferWizard={() => handleAction('Open transfer wizard')}
          lastPreview={exampleRrfPreview}
        />

        <ForecastStrip
          inventory={exampleInventoryForecast}
          morbidity={exampleMorbidity}
          quickStarts={exampleQuickStarts}
          onUseForRRF={(ids) => handleAction('Use products for RRF', ids)}
          onEditAssumptions={() => handleAction('Edit assumptions')}
        />

        <SupplyHealth score={exampleScore} />

        <AssistantStrip
          onAsk={(query) => handleAction('Ask Forlab.ai', query)}
          suggestions={exampleSuggestions}
        />
      </div>
    </div>
  );
}