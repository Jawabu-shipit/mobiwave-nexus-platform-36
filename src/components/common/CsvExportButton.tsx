
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export interface CsvExportButtonProps {
  data: object[];
  filename: string;
  label?: string;
}

export function CsvExportButton({ data, filename, label }: CsvExportButtonProps) {
  function handleExport() {
    if (!data?.length) return;
    const headers = Object.keys(data[0]);
    const rows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((key) => JSON.stringify(row[key] ?? "")).join(",")
      ),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  return (
    <Button onClick={handleExport} variant="outline" size="sm" className="ml-2 flex items-center gap-2" disabled={!data?.length}>
      <Download className="w-4 h-4" />
      {label ?? "Export CSV"}
    </Button>
  );
}
