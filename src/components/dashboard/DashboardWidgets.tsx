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

    </div>
  );
};

export default DashboardWidgets;