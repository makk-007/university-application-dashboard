import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Upload,
  FileJson,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCycle } from "../context/CycleContext";
import {
  getUniversities,
  importUniversities,
} from "../../services/universities";
import {
  getScholarships,
  importScholarships,
} from "../../services/scholarships";
import {
  exportToJson,
  exportUniversitiesToCsv,
  exportScholarshipsToCsv,
} from "../utils/dataExport";
import {
  parseUniversityCsv,
  parseScholarshipCsv,
  ParsedUniversityRow,
  ParsedScholarshipRow,
} from "../utils/dataImport";

type ImportKind = "universities" | "scholarships";

export function DataManagementCard() {
  const { cycles } = useCycle();
  const [exporting, setExporting] = useState<string | null>(null);
  const [importKind, setImportKind] = useState<ImportKind | null>(null);
  const [pendingText, setPendingText] = useState("");
  const uniFileInput = useRef<HTMLInputElement>(null);
  const scholFileInput = useRef<HTMLInputElement>(null);

  const handleExportJson = async () => {
    setExporting("json");
    try {
      const [universities, scholarships] = await Promise.all([
        getUniversities(),
        getScholarships(),
      ]);
      exportToJson({
        exportedAt: new Date().toISOString(),
        cycles,
        universities,
        scholarships,
      });
      toast.success("Backup exported");
    } catch (e: any) {
      toast.error("Failed to export backup", { description: e.message });
    } finally {
      setExporting(null);
    }
  };

  const handleExportUniversitiesCsv = async () => {
    setExporting("uni-csv");
    try {
      const universities = await getUniversities();
      exportUniversitiesToCsv(universities, cycles);
      toast.success("Universities exported");
    } catch (e: any) {
      toast.error("Failed to export universities", { description: e.message });
    } finally {
      setExporting(null);
    }
  };

  const handleExportScholarshipsCsv = async () => {
    setExporting("schol-csv");
    try {
      const scholarships = await getScholarships();
      exportScholarshipsToCsv(scholarships, cycles);
      toast.success("Scholarships exported");
    } catch (e: any) {
      toast.error("Failed to export scholarships", { description: e.message });
    } finally {
      setExporting(null);
    }
  };

  const handleFileSelected = async (
    kind: ImportKind,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    setPendingText(text);
    setImportKind(kind);
  };

  return (
    <div className="bg-card rounded-xl border card-resting overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <Database className="size-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-base font-semibold text-foreground">
          Data Management
        </h2>
      </div>

      <div className="px-6 py-5 space-y-5">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Export</p>
          <p className="text-xs text-muted-foreground mb-3">
            Download your data for backup or to open in a spreadsheet. The full
            backup includes every field; CSV exports are flattened for
            spreadsheet use.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportJson}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-3 h-9 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {exporting === "json" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileJson className="size-4" aria-hidden="true" />
              )}
              Full Backup (JSON)
            </button>
            <button
              onClick={handleExportUniversitiesCsv}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-3 h-9 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {exporting === "uni-csv" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileSpreadsheet className="size-4" aria-hidden="true" />
              )}
              Universities (CSV)
            </button>
            <button
              onClick={handleExportScholarshipsCsv}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-3 h-9 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
            >
              {exporting === "schol-csv" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileSpreadsheet className="size-4" aria-hidden="true" />
              )}
              Scholarships (CSV)
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium text-foreground mb-1">Import</p>
          <p className="text-xs text-muted-foreground mb-3">
            Add universities or scholarships from a CSV file. Each row creates a
            new record; this never updates or overwrites existing entries. Use
            the same column headers as the CSV export above.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={uniFileInput}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFileSelected("universities", e)}
            />
            <input
              ref={scholFileInput}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => handleFileSelected("scholarships", e)}
            />
            <button
              onClick={() => uniFileInput.current?.click()}
              className="inline-flex items-center gap-2 px-3 h-9 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent transition-colors"
            >
              <Upload className="size-4" aria-hidden="true" />
              Import Universities (CSV)
            </button>
            <button
              onClick={() => scholFileInput.current?.click()}
              className="inline-flex items-center gap-2 px-3 h-9 border border-border text-foreground text-sm font-medium rounded-md hover:bg-accent transition-colors"
            >
              <Upload className="size-4" aria-hidden="true" />
              Import Scholarships (CSV)
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {importKind && (
          <ImportPreviewModal
            kind={importKind}
            text={pendingText}
            cycles={cycles}
            onClose={() => setImportKind(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ImportPreviewModal({
  kind,
  text,
  cycles,
  onClose,
}: {
  kind: ImportKind;
  text: string;
  cycles: { id: string; name: string }[];
  onClose: () => void;
}) {
  const isUni = kind === "universities";
  const parsed = isUni ? parseUniversityCsv(text) : parseScholarshipCsv(text);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    failures: string[];
  } | null>(null);

  const cycleIdByName = new Map(
    cycles.map((c) => [c.name.toLowerCase(), c.id]),
  );

  const resolveCycleId = (cycleName: string): string | null =>
    cycleName ? (cycleIdByName.get(cycleName.toLowerCase()) ?? null) : null;

  const handleConfirm = async () => {
    setImporting(true);
    try {
      if (isUni) {
        const rows = parsed.valid as ParsedUniversityRow[];
        const res = await importUniversities(
          rows.map((r) => ({
            name: r.name,
            region: r.region,
            status: r.status,
            tuition: r.tuition,
            currency: r.currency,
            startDate: r.startDate,
            deadline: r.deadline,
            applicationLink: r.applicationLink,
            notes: r.notes,
            checklistItems: r.checklistItems,
            cycleId: resolveCycleId(r.cycleName),
          })),
        );
        setResult(res);
      } else {
        const rows = parsed.valid as ParsedScholarshipRow[];
        const res = await importScholarships(
          rows.map((r) => ({
            name: r.name,
            status: r.status,
            amount: r.amount,
            currency: r.currency,
            coverage: r.coverage,
            startDate: r.startDate,
            deadline: r.deadline,
            link: r.link,
            notes: r.notes,
            checklistItems: r.checklistItems,
            cycleId: resolveCycleId(r.cycleName),
          })),
        );
        setResult(res);
      }
    } catch (e: any) {
      toast.error("Import failed", { description: e.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && !importing && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="bg-card rounded-xl border card-raised w-full sm:max-w-lg sm:max-h-[85vh] h-full sm:h-auto overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            Import {isUni ? "Universities" : "Scholarships"}
          </h2>
          <button
            onClick={onClose}
            disabled={importing}
            aria-label="Close dialog"
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-accent disabled:opacity-50 transition-colors"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {result ? (
            <>
              <div className="flex items-center gap-2 text-sm text-foreground bg-secondary/50 border border-border rounded-lg px-3 py-3">
                <CheckCircle2
                  className="size-5 text-green-600 dark:text-green-400 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Created <strong>{result.created}</strong>{" "}
                  {result.created === 1
                    ? isUni
                      ? "university"
                      : "scholarship"
                    : isUni
                      ? "universities"
                      : "scholarships"}
                  .
                </span>
              </div>
              {result.failures.length > 0 && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-3">
                  <p className="font-medium mb-1.5">
                    {result.failures.length} row(s) failed to import:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {result.failures.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={onClose}
                className="w-full h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-foreground bg-secondary/50 border border-border rounded-lg px-3 py-3">
                <FileSpreadsheet
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  Found <strong>{parsed.valid.length}</strong> valid row(s)
                  ready to import.
                </span>
              </div>
              {parsed.errors.length > 0 && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-3 max-h-40 overflow-y-auto">
                  <p className="font-medium mb-1.5 flex items-center gap-1.5">
                    <AlertCircle
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    {parsed.errors.length} row(s) will be skipped:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {parsed.errors.map((e, i) => (
                      <li key={i}>
                        Row {e.rowNumber}: {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Each row will be created as a new, independent record. Rows with
                a cycle_name that matches an existing cycle will be assigned to
                it; unmatched or blank cycle names import with no cycle.
              </p>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={importing}
                  className="flex-1 h-9 border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={importing || parsed.valid.length === 0}
                  className="flex-1 h-9 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-2"
                >
                  {importing && (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  Import {parsed.valid.length} Row(s)
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
