// src/pages/Upload.tsx
// Guided CSV/JSON uploader with recommended order: Products → Deliveries (optional) → Inventory.
// - Shows current auth user (useful for RLS).
// - Per-table mapping + type casting.
// - Preflight FK checks:
//     * deliveries → requires products.product_id to exist
//     * inventory → requires products.product_id & machines.machine_id
//       and (optionally) deliveries.batch_id if you choose to use provided batch_ids
// - Inventory can omit batch_id: a DB trigger (ensure_delivery_for_inventory) will create a delivery and set batch_id.
// - Simple stepper UI to guide users through the correct upload sequence.
//
// Notes:
// * Comments are in English (per user preference).
// * Tailwind + shadcn-style classes for a clean UI.

import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";
import {
  databaseSchemas,
  type TableName,
} from "@/types/databaseSchema";

// ---------- Small helpers ----------
const s = (v: unknown) => {
  try {
    if (v === null || v === undefined) return String(v);
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  } catch {
    return "<unserializable>";
  }
};

const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));
const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

// ---------- Types ----------
type MissingReport = {
  products: number[];
  machines: string[]; // uuid
  deliveries: string[]; // batch_id (uuid) — only relevant if we actually rely on provided batch_ids
};

type StepKey = "products" | "deliveries" | "inventory";

// Recommended order definition (deliveries is optional now)
const RECOMMENDED_STEPS: { key: StepKey; title: string; note: string }[] = [
  {
    key: "products",
    title: "1) Products",
    note: "Create product catalog first (name, price, shelf_life_days). product_id is auto-generated.",
  },
  {
    key: "deliveries",
    title: "2) Deliveries (optional)",
    note: "Stock arrivals per batch (batch_id, product_id, delivery_date, best_before_date, quantity). You can skip this if Inventory omits batch_id.",
  },
  {
    key: "inventory",
    title: "3) Inventory",
    note: "Place products into machines. batch_id is optional — if omitted, the DB trigger will create a delivery and set batch_id automatically.",
  },
];

// ---------- Component ----------
export default function Upload() {
  const { t } = useTranslation();

  // ---------- Auth / Session (handy for RLS debugging) ----------
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [jwtTail, setJwtTail] = useState<string | null>(null); // last 8 chars

  useEffect(() => {
    let isMounted = true;

    const fetchAuth = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (isMounted) {
        setAuthEmail(userData.user?.email ?? null);
        setAuthUserId(userData.user?.id ?? null);
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token ?? null;
      if (isMounted) {
        setJwtTail(token ? token.slice(-8) : null);
      }
    };

    fetchAuth();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthEmail(session?.user?.email ?? null);
      setAuthUserId(session?.user?.id ?? null);
      setJwtTail(session?.access_token ? session.access_token.slice(-8) : null);
    });

    return () => {
      isMounted = false;
      sub?.subscription.unsubscribe();
    };
  }, []);

  // ---------- Stepper state ----------
  const [activeStep, setActiveStep] = useState<StepKey>("products");
  // We keep selectedTable in sync with activeStep (they are the same names here)
  const selectedTable: TableName = activeStep as TableName;

  // Track successful uploads per step to enable "Next" buttons
  const [stepCompleted, setStepCompleted] = useState<Record<StepKey, boolean>>({
    products: false,
    deliveries: false,
    inventory: false,
  });

  // ---------- File & Data ----------
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [separator, setSeparator] = useState<string>(","); // ",", ";", "\t", "|"

  // Mapping: target column -> source header
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Inventory: ignore batch_id and let DB trigger create deliveries?
  const [ignoreBatchId, setIgnoreBatchId] = useState<boolean>(true);

  // Derived source headers
  const headers = useMemo(() => (data.length > 0 ? Object.keys(data[0]) : []), [data]);

  // Suggest initial mapping whenever table (step) or headers change
  useEffect(() => {
    if (headers.length === 0) {
      setMappings({});
      return;
    }
    const targetCols = databaseSchemas[selectedTable] || [];
    const initial: Record<string, string> = {};
    targetCols.forEach((col) => {
      const match = headers.find((h) => h.toLowerCase() === col.toLowerCase());
      initial[col] = match ?? "";
    });
    setMappings(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable, headers.join("|")]);

  // Re-parse CSV when separator changes (after a file is chosen)
  useEffect(() => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") parseCSV(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [separator]);

  // ---------- Parsing ----------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension === "csv") {
      parseCSV(uploadedFile);
    } else if (fileExtension === "json") {
      parseJSON(uploadedFile);
    } else {
      alert(t("upload.supportedTypes") || "Bitte .csv oder .json hochladen.");
    }
  };

  const parseCSV = (file: File) => {
    // Ensure Papa gets a real tab character if the user chose "\t"
    const delim = separator === "\\t" ? "\t" : separator;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: delim,
      complete: function (results) {
        const rows = (results.data as any[]).map((row) => {
          const cleaned: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            const val = (row as any)[k];
            const key = typeof k === "string" ? k.trim() : k;
            cleaned[key] = typeof val === "string" ? val.trim() : val;
          });
          return cleaned;
        });
        setData(rows);
      },
      error: function (err) {
        console.error("Papa parse error:", err);
        alert((t("upload.error") || "Fehler beim Parsen: ") + s(err?.message || err));
      },
    });
  };

  const parseJSON = async (file: File) => {
    const text = await file.text();
    try {
      const jsonData = JSON.parse(text);
      setData(Array.isArray(jsonData) ? jsonData : [jsonData]);
    } catch {
      alert(t("upload.invalidJson") || "Ungültige JSON-Datei.");
    }
  };

  // ---------- Type conversions (adapt to your schema) ----------
  // Integers:
  const INT_COLS = useMemo(
    () =>
      new Set<string>([
        // "product_id", // <-- not casting here for products; DB generates in products table
        "quantity",
        "position_id",
        "shelf_row",
        "shelf_column",
      ]),
    []
  );

  // Floats/Numbers:
  const NUM_COLS = useMemo(
    () =>
      new Set<string>([
        "price",
        "machine_revenue",
        "capacity",
        "current_stock",
        "total_price",
      ]),
    []
  );

  // ISO-Dates/Timestamps:
  const DATE_COLS = useMemo(
    () =>
      new Set<string>([
        "best_before_date",
        "delivery_date",
        "created_at",
        "updated_at",
        "restocked_at",
        "performed_at",
        "submitted_at",
        "purchased_at",
        "resolved_time",
        "start_time",
      ]),
    []
  );

  const toValue = (targetCol: string, raw: any) => {
    if (raw === undefined || raw === "") return null;

    // Integer
    if (INT_COLS.has(targetCol)) {
      const n = parseInt(String(raw), 10);
      return Number.isNaN(n) ? null : n;
    }

    // Float
    if (NUM_COLS.has(targetCol)) {
      const n = parseFloat(String(raw).replace(",", "."));
      return Number.isNaN(n) ? null : n;
    }

    // Date/ISO
    if (DATE_COLS.has(targetCol)) {
      const d = new Date(raw);
      return Number.isNaN(+d) ? null : d.toISOString();
    }

    // Default passthrough
    return raw;
  };

  // Filtered targets for mapping UI (hide products.product_id)
  const targetsForUI = useMemo(() => {
    const cols = databaseSchemas[selectedTable] || [];
    if (selectedTable === "products") {
      return cols.filter((c) => c !== "product_id");
    }
    return cols;
  }, [selectedTable]);

  const buildMappedRows = (
    raw: any[],
    table: TableName,
    map: Record<string, string>
  ) => {
    const targetCols = databaseSchemas[table] || [];
    return raw.map((row) => {
      const out: Record<string, any> = {};
      for (const target of targetCols) {
        // Skip auto-generated product_id for products table
        if (table === "products" && target === "product_id") continue;

        // For inventory with Option B: optionally ignore batch_id so DB trigger can create it
        if (table === "inventory" && target === "batch_id" && ignoreBatchId) {
          out[target] = null;
          continue;
        }

        const source = map[target];
        if (!source) {
          out[target] = null;
          continue;
        }
        out[target] = toValue(target, (row as any)[source]);
      }
      return out;
    });
  };

  // ---------- FK Preflight checks ----------
  const [missingReport, setMissingReport] = useState<MissingReport | null>(null);

  // deliveries → requires product_id exists
  const checkDeliveriesDependencies = async (raw: any[]) => {
    const productCol = mappings["product_id"];
    if (!productCol) return { products: [], machines: [], deliveries: [] };

    const productIds = uniq(
      raw
        .map((r) => productCol ? (r as any)[productCol] : undefined)
        .filter((v) => v !== null && v !== undefined)
        .map((v) => parseInt(String(v), 10))
        .filter((n) => Number.isFinite(n)) as number[]
    );

    const existingProductsQ = productIds.length
      ? supabase.from("products").select("product_id").in("product_id", productIds)
      : null;

    const [pRes] = await Promise.all([
      existingProductsQ ?? Promise.resolve({ data: [] as any[] }),
    ]);

    const existingProductIds = new Set<number>(
      (pRes as any).data?.map((r: any) => r.product_id) ?? []
    );

    const missing: MissingReport = {
      products: productIds.filter((id) => !existingProductIds.has(id)),
      machines: [],
      deliveries: [],
    };

    return missing;
  };

  // inventory → requires products, machines, and (optionally) deliveries if provided
  const checkInventoryDependencies = async (raw: any[]) => {
    const productCol = mappings["product_id"];
    const machineCol = mappings["machine_id"];
    const batchCol = mappings["batch_id"];

    const productIds = uniq(
      raw
        .map((r) => productCol ? (r as any)[productCol] : undefined)
        .filter((v) => v !== null && v !== undefined)
        .map((v) => parseInt(String(v), 10))
        .filter((n) => Number.isFinite(n)) as number[]
    );

    const machineIds = uniq(
      raw
        .map((r) => machineCol ? (r as any)[machineCol] : undefined)
        .filter(isNonEmptyString)
    );

    // Only check deliveries if we intend to use provided batch_ids (ignoreBatchId === false)
    const batchIds = ignoreBatchId
      ? []
      : uniq(
          raw
            .map((r) => batchCol ? (r as any)[batchCol] : undefined)
            .filter(isNonEmptyString)
        );

    const existingProductsQ = productIds.length
      ? supabase.from("products").select("product_id").in("product_id", productIds)
      : null;

    const existingMachinesQ = machineIds.length
      ? supabase.from("machines").select("machine_id").in("machine_id", machineIds)
      : null;

    const existingDeliveriesQ = batchIds.length
      ? supabase.from("deliveries").select("batch_id").in("batch_id", batchIds)
      : null;

    const [pRes, mRes, dRes] = await Promise.all([
      existingProductsQ ?? Promise.resolve({ data: [] as any[] }),
      existingMachinesQ ?? Promise.resolve({ data: [] as any[] }),
      existingDeliveriesQ ?? Promise.resolve({ data: [] as any[] }),
    ]);

    const existingProductIds = new Set<number>(
      (pRes as any).data?.map((r: any) => r.product_id) ?? []
    );
    const existingMachineIds = new Set<string>(
      (mRes as any).data?.map((r: any) => r.machine_id) ?? []
    );
    const existingBatchIds = new Set<string>(
      (dRes as any).data?.map((r: any) => r.batch_id) ?? []
    );

    const missing: MissingReport = {
      products: productIds.filter((id) => !existingProductIds.has(id)),
      machines: machineIds.filter((id) => !existingMachineIds.has(id)),
      deliveries: ignoreBatchId
        ? [] // we don't rely on provided batch_ids, so no FK check here
        : batchIds.filter((id) => !existingBatchIds.has(id)),
    };

    return missing;
  };

  // ---------- Upload orchestration ----------
  const [isUploading, setIsUploading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastRowCount, setLastRowCount] = useState<number | null>(null);

  const performInsert = async (table: TableName, rows: any[]) => {
    // select() after insert helps surface constraint/RLS errors
    return await supabase.from(table).insert(rows as any[]).select();
  };

  const uploadToSupabase = async () => {
    setLastError(null);
    setLastRowCount(null);

    if (data.length === 0) {
      alert(t("upload.noData") || "Keine Daten vorhanden!");
      return;
    }

    // Build rows from mappings
    const rows = buildMappedRows(data, selectedTable, mappings);

    // Step-specific validations and FK preflight
    if (selectedTable === "deliveries") {
      const missing = await checkDeliveriesDependencies(data);
      setMissingReport(missing);
      if (missing.products.length > 0) {
        alert(
          "Foreign keys missing:\n" +
            `- products.product_id missing: ${missing.products.join(", ")}\n`
        );
        return;
      }
    }

    if (selectedTable === "inventory") {
      const missing = await checkInventoryDependencies(data);
      setMissingReport(missing);

      const hasBlockingMissing =
        missing.products.length > 0 ||
        missing.machines.length > 0 ||
        (!ignoreBatchId && missing.deliveries.length > 0);

      if (hasBlockingMissing) {
        alert(
          "Foreign keys missing:\n" +
            (missing.products.length
              ? `- products.product_id missing: ${missing.products.join(", ")}\n`
              : "") +
            (missing.machines.length
              ? `- machines.machine_id missing: ${missing.machines.join(", ")}\n`
              : "") +
            (!ignoreBatchId && missing.deliveries.length
              ? `- deliveries.batch_id missing: ${missing.deliveries.join(", ")}\n`
              : "")
        );
        return;
      }
    }

    // Normal path
    setIsUploading(true);
    const { error, data: inserted } = await performInsert(selectedTable, rows);
    setIsUploading(false);

    if (error) {
      console.error("Supabase insert error:", error);
      setLastError(`${error.code ?? "error"}: ${error.message}`);
      alert((t("upload.error") || "Fehler beim Hochladen: ") + error.message);
      return;
    }

    setLastRowCount(inserted?.length ?? 0);
    setStepCompleted((prev) => ({ ...prev, [activeStep]: true }));
    alert(t("upload.success") || "✅ Daten erfolgreich hochgeladen!");
  };

  // ---------- UI helpers ----------
  const gotoNextStep = () => {
    const idx = RECOMMENDED_STEPS.findIndex((s) => s.key === activeStep);
    if (idx >= 0 && idx < RECOMMENDED_STEPS.length - 1) {
      setActiveStep(RECOMMENDED_STEPS[idx + 1].key);
      // Keep the same file input if user prefers; alternatively reset per step:
      // setFile(null); setData([]); setMappings({});
    }
  };

  const resetAll = () => {
    setFile(null);
    setData([]);
    setMappings({});
    setMissingReport(null);
    setIsUploading(false);
    setLastError(null);
    setLastRowCount(null);
    setStepCompleted({ products: false, deliveries: false, inventory: false });
    setActiveStep("products");
    setIgnoreBatchId(true);
  };

  const stepIsEnabled = (step: StepKey) => {
    // New gating: Inventory is allowed after Products (Deliveries optional)
    if (step === "products") return true;
    if (step === "deliveries") return stepCompleted.products; // still makes sense after products
    if (step === "inventory") return stepCompleted.products;  // no longer depends on deliveries
    return true;
  };

  // ---------- UI ----------
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">
        {t("upload.title") || "Upload"}
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        {t("upload.guidedIntro") ||
          "Recommended order: Products → Deliveries (optional) → Inventory. Inventory can omit batch_id — the DB will create deliveries automatically."}
      </p>

      {/* Auth info banner */}
      <div className="mb-5 rounded-lg border p-3 bg-gray-50">
        <p className="text-sm">
          <span className="font-medium">
            {t("upload.authStatus") || "Auth status"}:
          </span>{" "}
          {authEmail ? (
            <>
              {t("upload.signedInAs") || "Signed in as"}{" "}
              <span className="font-mono">{authEmail}</span>
              {" · "}
              <span className="text-gray-600">
                {t("upload.userId") || "user_id"}:
              </span>{" "}
              <span className="font-mono">{authUserId}</span>
              {jwtTail && (
                <>
                  {" · "}
                  <span className="text-gray-600">JWT</span>:
                  <span className="font-mono">…{jwtTail}</span>
                </>
              )}
            </>
          ) : (
            <span className="text-red-600">
              {t("upload.notSignedIn") || "Not signed in. Inserts will fail if RLS requires auth."}
            </span>
          )}
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {t("upload.authHint") ||
            "Supabase attaches your access token to requests. RLS uses auth.uid() to decide access. If inserts fail with RLS errors, verify you are signed in and that your policies allow INSERT for this user_id."}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <ol className="flex flex-col md:flex-row md:items-center gap-3">
          {RECOMMENDED_STEPS.map((s, i) => {
            const enabled = stepIsEnabled(s.key);
            const isActive = activeStep === s.key;
            const done = stepCompleted[s.key];
            return (
              <li key={s.key} className="flex-1">
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => setActiveStep(s.key)}
                  className={[
                    "w-full text-left rounded-lg border p-3 transition",
                    isActive
                      ? "border-slate-900 bg-white shadow"
                      : done
                      ? "border-emerald-300 bg-emerald-50"
                      : enabled
                      ? "border-slate-200 hover:bg-slate-50"
                      : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{s.title}</div>
                    {done && (
                      <span className="text-emerald-700 text-xs font-semibold">
                        Done
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{s.note}</div>
                  {i < RECOMMENDED_STEPS.length - 1 && (
                    <div className="mt-2 text-xs text-gray-400">
                      {t("upload.nextHint") ||
                        "After this step, proceed to the next one."}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Active table is derived from step */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("upload.activeTable") || "Active table"}
          </label>
        <input
            value={selectedTable}
            readOnly
            className="w-56 border rounded-md p-2 bg-gray-100 font-mono"
          />
        </div>

        {/* CSV Separator */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("upload.separator") || "CSV Separator"}
          </label>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="w-48 border rounded-md p-2"
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab (\\t)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>

        {/* Inventory: Ignore batch_id toggle */}
        {selectedTable === "inventory" && (
          <div className="ml-auto flex items-center gap-3 rounded-md border p-2 bg-white">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={ignoreBatchId}
                onChange={(e) => setIgnoreBatchId(e.target.checked)}
              />
              <span>
                Ignore <code className="font-mono">batch_id</code> (let DB create via trigger)
              </span>
            </label>
          </div>
        )}

        {selectedTable !== "inventory" && (
          <div className="ml-auto" />
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={resetAll}
            className="border rounded-md px-3 py-2 text-sm hover:bg-gray-50"
          >
            {t("upload.resetAll") || "Reset all"}
          </button>
          <button
            disabled={!stepCompleted[activeStep]}
            onClick={gotoNextStep}
            className="rounded-md px-3 py-2 text-sm bg-slate-900 text-white disabled:opacity-50"
          >
            {t("upload.next") || "Next step"}
          </button>
        </div>
      </div>

      {/* File input */}
      <input
        type="file"
        accept=".csv,.json"
        onChange={handleFileChange}
        className="mb-4 block w-full border border-gray-300 rounded-md p-2"
        placeholder={t("upload.selectFile") || "Datei auswählen"}
      />

      {/* Mapping Grid */}
      {headers.length > 0 && (
        <div className="mt-4 border rounded-lg p-4">
          <h2 className="font-semibold mb-3">
            {t("upload.columnMapping") || "Spalten-Mapping"}{" "}
            <span className="ml-2 text-xs text-gray-500">
              ({String(selectedTable)})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {targetsForUI.map((target) => {
              const disabled =
                selectedTable === "inventory" &&
                target === "batch_id" &&
                ignoreBatchId;
              return (
                <div key={target} className="flex flex-col">
                  <label className="text-xs font-medium text-gray-600 mb-1">
                    {t("upload.mapTo") || "Map to"}:{" "}
                    <span className="font-mono">{target}</span>
                    {selectedTable === "inventory" && target === "batch_id" && (
                      <span className="ml-2 text-[10px] rounded px-1.5 py-0.5 border bg-gray-50">
                        {ignoreBatchId ? "auto (ignored)" : "manual"}
                      </span>
                    )}
                  </label>
                  <select
                    value={mappings[target] ?? ""}
                    onChange={(e) =>
                      setMappings((prev) => ({
                        ...prev,
                        [target]: e.target.value,
                      }))
                    }
                    className="border rounded-md p-2 disabled:opacity-60"
                    disabled={disabled}
                    title={
                      disabled
                        ? "batch_id is ignored; DB trigger will create deliveries."
                        : undefined
                    }
                  >
                    <option value="">
                      {t("upload.ignoreColumn") || "-- Spalte ignorieren --"}
                    </option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* Legacy helper note */}
          {selectedTable === "inventory" && (
            <div className="mt-3 text-xs text-gray-600">
              If <code className="font-mono">batch_id</code> is ignored, the database will:
              create a delivery with <code>product_id</code>, use{" "}
              <code>restocked_at</code> (or now) as <code>delivery_date</code>,
              set <code>best_before_date</code> (from the trigger logic),
              and attach the generated <code>batch_id</code> to the inventory row.
            </div>
          )}
        </div>
      )}

      {/* Data preview */}
      {data.length > 0 && (
        <div className="overflow-x-auto mt-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2 px-4 pt-4">
            {t("upload.title") || "Upload"} {t("upload.selectFile") || "Vorschau"}
          </h2>
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-4 py-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="px-4 py-2 align-top">
                      {String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <p className="px-4 py-2 text-xs text-gray-500">
              {`Nur erste 10 von ${data.length} Zeilen dargestellt.`}
            </p>
          )}
        </div>
      )}

      {/* Upload + outcome */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          onClick={uploadToSupabase}
          className="bg-[#3ECF8E] hover:bg-[#36b67c] text-white font-semibold py-2 px-4 rounded disabled:opacity-60"
          disabled={!file || data.length === 0 || isUploading}
        >
          {isUploading
            ? t("upload.uploading") || "Uploading…"
            : `Upload to Supabase (${selectedTable})`}
        </button>
        {lastRowCount !== null && (
          <span className="text-sm text-gray-700">
            {t("upload.rowsInserted") || "Rows inserted"}: {lastRowCount}
          </span>
        )}
      </div>

      {/* Missing FK report (contextual) */}
      {missingReport && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="font-semibold mb-1">
            {t("upload.missingDeps") || "Missing foreign key dependencies"}
          </div>
          {(missingReport.products.length > 0 ||
            missingReport.machines.length > 0 ||
            (!ignoreBatchId && missingReport.deliveries.length > 0)) ? (
            <ul className="list-disc pl-5">
              {missingReport.products.length > 0 && (
                <li>
                  products.product_id:&nbsp;
                  <span className="font-mono">
                    {missingReport.products.join(", ")}
                  </span>
                </li>
              )}
              {missingReport.machines.length > 0 && (
                <li>
                  machines.machine_id:&nbsp;
                  <span className="font-mono">
                    {missingReport.machines.join(", ")}
                  </span>
                </li>
              )}
              {!ignoreBatchId && missingReport.deliveries.length > 0 && (
                <li>
                  deliveries.batch_id:&nbsp;
                  <span className="font-mono">
                    {missingReport.deliveries.join(", ")}
                  </span>
                </li>
              )}
            </ul>
          ) : (
            <div>{t("upload.noMissingDeps") || "No missing dependencies."}</div>
          )}
        </div>
      )}

      {/* Error box */}
      {lastError && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <div className="font-semibold mb-1">
            {t("upload.errorDetails") || "Fehlerdetails"}
          </div>
          <div className="font-mono break-all">{lastError}</div>
          <ul className="mt-2 list-disc pl-5 text-red-900">
            <li>
              {t("upload.hintRls1") ||
                "If this is an RLS error, confirm you are signed in and that your policies allow INSERT for auth.uid()."}
            </li>
            <li>
              {t("upload.hintRls2") ||
                "If your table has a column like created_by referencing auth.uid(), ensure you either default it in the DB (DEFAULT auth.uid()) or include it in the payload mapping."}
            </li>
            <li>
              {t("upload.hintRls3") ||
                "If you rely on a specific role, make sure you are not using the service_role key on the client. The client should use the anon key with a user session."}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
