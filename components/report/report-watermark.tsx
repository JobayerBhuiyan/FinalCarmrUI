import { Lock, Calendar, Hash } from "lucide-react"
import type { VehicleReport } from "@/lib/mock-data"

interface ReportWatermarkProps {
  report: VehicleReport
}

export function ReportWatermark({ report }: ReportWatermarkProps) {
  const generatedDate = new Date(report.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          This report is for {report.userEmail} • Sharing prohibited
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5" />
          Report ID: #{report.reportId}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Generated: {generatedDate}
        </span>
      </div>
    </div>
  )
}
