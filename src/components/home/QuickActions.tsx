import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PlusCircle, Upload, ShieldCheck, LineChart } from "lucide-react";

interface Props {
  onAnnounce?: () => void;
}

const QuickActions: React.FC<Props> = ({ onAnnounce }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onAnnounce} variant="secondary">
        <PlusCircle className="h-4 w-4 mr-2" /> Announce Excess Stock
      </Button>
      <Button asChild>
        <Link to="/requests/new"><PlusCircle className="h-4 w-4 mr-2" /> New Request</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/forecast"><LineChart className="h-4 w-4 mr-2" /> Forecast Workbench</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/dashboard"><Upload className="h-4 w-4 mr-2" /> Import / Analyze</Link>
      </Button>
      <Button asChild variant="outline">
        <Link to="/validation"><ShieldCheck className="h-4 w-4 mr-2" /> Guardrails</Link>
      </Button>
    </div>
  );
};

export default QuickActions;
