import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Package,
  DollarSign,
  AlertCircle,
  Send
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardWidgets: React.FC = () => {
  return (
    <div className="grid gap-6">
      {/* Top row - Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Submission Status */}
        <Card className="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Data Submission</CardTitle>
              <div className="status-indicator status-warning"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>RRF Completeness</span>
                <span className="font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground">5 facilities pending submission</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card className="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Stock Status</CardTitle>
              <div className="status-indicator status-critical"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium text-green-600">324</div>
                <div className="text-muted-foreground">OK</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-amber-600">28</div>
                <div className="text-muted-foreground">Low</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-red-600">12</div>
                <div className="text-muted-foreground">Out</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forecast Accuracy */}
        <Card className="surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Forecast Accuracy</CardTitle>
              <div className="status-indicator status-ok"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold">92%</span>
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Commodities Status */}
      <Card className="surface">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Key Commodities Status</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">View All</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-muted-foreground">Commodity</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Stock Level</th>
                  <th className="text-center py-2 font-medium text-muted-foreground">Trend</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Oxytocin", status: "ok", stock: "45 days", trend: "stable" },
                  { name: "ORS", status: "warning", stock: "12 days", trend: "declining" },
                  { name: "Amoxicillin", status: "critical", stock: "3 days", trend: "critical" },
                  { name: "Vaccines", status: "ok", stock: "28 days", trend: "stable" },
                  { name: "Paracetamol", status: "warning", stock: "8 days", trend: "declining" },
                  { name: "Iron/Folic", status: "ok", stock: "60 days", trend: "increasing" }
                ].map((item) => (
                  <tr key={item.name} className="border-b border-border/40 hover:bg-muted/20">
                    <td className="py-3 font-medium">{item.name}</td>
                    <td className="py-3 text-center">
                      <div className={`status-indicator status-${item.status} mx-auto`}></div>
                    </td>
                    <td className="py-3 text-center text-muted-foreground">{item.stock}</td>
                    <td className="py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        item.trend === 'increasing' ? 'bg-green-100 text-green-700' :
                        item.trend === 'declining' ? 'bg-red-100 text-red-700' :
                        item.trend === 'critical' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* AI Assistant */}
      <Card className="surface-brand">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <CardTitle>AI Assistant</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Ask about your stock status or next order..." 
              className="flex-1"
            />
            <Button size="sm" className="hero-gradient">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              What's my stock-out risk?
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              When should I order oxytocin?
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column - Budget & Alerts */}
        <div className="space-y-6">
          {/* Budget Alignment */}
          <Card className="surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget vs Demand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Allocated</span>
                    <span>$2.4M</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Forecast Need</span>
                    <span>$3.2M</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <Badge variant="destructive" className="text-xs">
                  25% budget shortfall
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Action Alerts */}
          <Card className="surface">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">3 commodities below minimum</p>
                    <p className="text-muted-foreground text-xs">Amoxicillin, ORS, Paracetamol</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Submit RRF by 5th</p>
                    <p className="text-muted-foreground text-xs">2 days remaining</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Review procurement plan</p>
                    <p className="text-muted-foreground text-xs">Q2 planning due</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center & Right columns - Reports */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Reports */}
          <Card className="surface">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/reports">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "RRF submitted", facility: "Boru Meda HC", time: "2 hours ago", type: "success" },
                  { action: "Stock alert triggered", facility: "Jimma Hospital", time: "4 hours ago", type: "warning" },
                  { action: "Forecast updated", facility: "Regional Office", time: "1 day ago", type: "info" },
                  { action: "Order approved", facility: "Procurement Unit", time: "2 days ago", type: "success" }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <CheckCircle className={`w-4 h-4 shrink-0 ${
                      activity.type === 'success' ? 'text-green-600' :
                      activity.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-muted-foreground text-xs">{activity.facility}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardWidgets;