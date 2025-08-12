import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Database } from "@/integrations/supabase/types";

export type Transition = Database["public"]["Tables"]["request_transitions"]["Row"];

type Props = { transitions: Transition[] };

const stageLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  manager_review: "Manager Review",
  approved: "Approved",
  in_procurement: "In Procurement",
  completed: "Completed",
};

export const StageTimeline: React.FC<Props> = ({ transitions }) => {
  const items = [...transitions].sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime());
  return (
    <Card>
      <CardContent className="py-4">
        <ol className="relative border-s ps-4 space-y-4">
          {items.map(t => (
            <li key={t.id} className="ms-4">
              <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
              <time className="mb-1 block text-xs text-muted-foreground">{new Date(t.created_at!).toLocaleString()}</time>
              <h3 className="text-sm font-medium">{stageLabels[t.to_stage || ""] || t.to_stage}</h3>
              <p className="text-sm text-muted-foreground">{t.decision} {t.comment ? `- ${t.comment}` : ""}</p>
            </li>
          ))}
          {items.length === 0 && (
            <li className="ms-4 text-sm text-muted-foreground">No transitions yet.</li>
          )}
        </ol>
      </CardContent>
    </Card>
  );
};

export default StageTimeline;
