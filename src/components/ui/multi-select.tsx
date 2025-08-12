import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

type MultiSelectProps = {
  label: string;
  options: string[];
  values: string[];
  onChange: (vals: string[]) => void;
};

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, values, onChange }) => {
  const toggle = (val: string) => {
    if (values.includes(val)) onChange(values.filter(v => v !== val));
    else onChange([...values, val]);
  };
  const allSelected = values.length === options.length && options.length > 0;
  const clearAll = () => onChange([]);
  const selectAll = () => onChange([...options]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[220px]">
          <span>{label}</span>
          <span className="text-xs text-muted-foreground">{values.length ? `${values.length} selected` : "All"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0 z-50 bg-popover" align="start">
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <button className="text-xs text-primary" onClick={selectAll} type="button">Select all</button>
          <button className="text-xs text-muted-foreground" onClick={clearAll} type="button">Clear</button>
        </div>
        <ScrollArea className="h-56">
          <ul className="p-2 space-y-1">
            {options.map((opt) => (
              <li key={opt} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-accent">
                <Checkbox id={`ms-${label}-${opt}`} checked={values.includes(opt)} onCheckedChange={() => toggle(opt)} />
                <label htmlFor={`ms-${label}-${opt}`} className="text-sm cursor-pointer">{opt}</label>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="px-3 py-2 border-t text-xs text-muted-foreground">
          {allSelected ? "All selected" : values.length ? `${values.length} selected` : "None selected (showing all)"}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelect;
