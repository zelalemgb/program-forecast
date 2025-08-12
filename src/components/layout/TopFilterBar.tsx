import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Building2, Layers } from "lucide-react";

const programs = [
  { value: "EPI", label: "EPI" },
  { value: "HIV", label: "HIV" },
  { value: "TB", label: "TB" },
];

const years = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
];

const facilities = [
  { value: "all", label: "All Facilities" },
  { value: "facility-1", label: "Facility 1" },
  { value: "facility-2", label: "Facility 2" },
];

const TopFilterBar: React.FC = () => {
  const [program, setProgram] = React.useState<string>("");
  const [year, setYear] = React.useState<string>("");
  const [facility, setFacility] = React.useState<string>("");

  return (
    <div className="border-b bg-muted/30">
      <div className="container flex flex-wrap items-center gap-3 py-2">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <Select value={program} onValueChange={setProgram}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {programs.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {years.map((y) => (
                <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={facility} onValueChange={setFacility}>
            <SelectTrigger className="w-[220px] h-8">
              <SelectValue placeholder="Facility" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {facilities.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TopFilterBar;
