// src/pages/Upload.tsx
// File Summary:
// The Upload page allows administrators to bulk insert or check data for core tables
// (`products`, `deliveries`, `inventory`, `machines`) by uploading CSV or JSON files.
// It ensures safety by whitelisting allowed columns per table and filtering out blocked fields.
// Users can preview parsed data, validate required fields, and insert rows directly into Supabase.
// It also supports checking the last 5 rows of a table, and downloading sample CSV templates.
//
// Key responsibilities:
// - Parse uploaded CSV/JSON files with PapaParse (CSV) or native JSON parsing.
// - Clean and normalize data (trim strings, cast numbers, convert dates).
// - Filter columns strictly by table-specific whitelists; block unsafe/managed columns.
// - Provide validation for required fields per target table.
// - Insert cleaned rows into Supabase, with optional batch ID omission for `inventory`.
// - Fetch last 5 rows from Supabase for verification.
// - Provide downloadable sample templates and display expected column legends.
//
// Dependencies:
// - supabase-js: used for `insert()` and `select()` queries.
// - papaparse: CSV parsing.
// - i18next: text translations.
// - Browser APIs: Blob & URL for sample CSV download.
//
// Folder structure notes:
// - Resides in `src/pages/` as `/upload` route.
// - Complements dashboard and detail pages by offering data import functionality.
//
// Security notes:
// - Supabase RLS must strictly enforce permissions:
//   • `products`, `deliveries`, `inventory`, `machines`:  
//     - INSERT allowed only for authenticated users with admin/editor role.  
//     - SELECT limited to relevant rows for the current user/org.  
//     - System-managed columns (`created_at`, `created_by`, etc.) must remain server-side only.  
// - Clients cannot override IDs or ownership metadata due to hard column blocking.
// - Always validate/clean incoming data server-side (e.g., via triggers or constraints) in addition to client checks.

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";

type Target = "products" | "deliveries" | "inventory" | "machines";

// Allowed columns per table (whitelisting)
const ALLOWED: Record<Target, string[]> = {
  products: ["product_id", "name", "price", "shelf_life_days"],
  deliveries: ["batch_id", "product_id", "delivery_date", "best_before_date", "quantity"],
  inventory: [
    "machine_id",
    "product_id",
    "batch_id",
    "current_stock",
    "capacity",
    "restocked_at",
    "best_before_date",
    "status",
    "position_id",
    "shelf_row",
    "shelf_column",
  ],
  machines: ["machine_id", "machine_name", "machine_location", "machine_revenue"],
};

// Columns never allowed to be uploaded
const HARD_BLOCK = new Set(["inventory_id", "created_at", "updated_at", "created_by"]);

// Order-by hints for "show last 5 rows"
const ORDER_HINTS: Record<Target, { column: string; asc?: boolean }> = {
  products: { column: "product_id", asc: false },
  deliveries: { column: "delivery_date", asc: false },
  inventory: { column: "created_at", asc: false },
  machines: { column: "created_at", asc: false },
};

export default function Upload() {
  const { t } = useTranslation();
  const [target, setTarget] = useState<Target>("products");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [sep, setSep] = useState<string>(",");
  const [ignoreBatchId, setIgnoreBatchId] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [lastRows, setLastRows] = useState<any[] | null>(null);
  const [checking, setChecking] = useState(false);

  /**
   * Parse uploaded CSV file into row objects.
   * Cleans keys/values (trim strings).
   */
  const parseCSV = (f: File) => {
    const delimiter = sep === "\\t" ? "\t" : sep;
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      delimiter,
      complete: ({ data, errors }) => {
        if (errors?.length) setMsg(`Parse warning: ${errors[0].message}`);
        const cleaned = (data as any[]).map((r) => {
          const out: Record<string, any> = {};
          Object.entries(r).forEach(([k, v]) => {
            const key = typeof k === "string" ? k.trim() : k;
            out[key] = typeof v === "string" ? v.trim() : v;
          });
          return out;
        });
        setRows(cleaned);
      },
      error: (e) => setMsg(`Parse failed: ${e.message}`),
    });
  };

  /**
   * Parse uploaded JSON file into row objects.
   * Cleans keys/values (trim strings).
   */
  const parseJSON = async (f: File) => {
    try {
      const text = await f.text();
      const json = JSON.parse(text);
      const arr = Array.isArray(json) ? json : [json];
      const cleaned = (arr as any[]).map((r) => {
        const out: Record<string, any> = {};
        Object.entries(r).forEach(([k, v]) => {
          const key = typeof k === "string" ? k.trim() : k;
          out[key] = typeof v === "string" ? v.trim() : v;
        });
        return out;
      });
      setRows(cleaned);
    } catch (e: any) {
      setMsg(`Invalid JSON: ${e?.message ?? e}`);
    }
  };

  /**
   * File input change handler.
   * Routes to CSV or JSON parser based on extension.
   */
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setRows([]);
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") parseCSV(f);
    else if (ext === "json") parseJSON(f);
    else setMsg("Please upload .csv or .json");
  };

  /**
   * Filter and cast parsed rows:
   * - Drop disallowed columns
   * - Cast numbers, floats, dates
   * - Normalize empty strings → null
   */
  const filteredRows = useMemo(() => {
    if (rows.length === 0) return [];
    const allowed = new Set(ALLOWED[target]);

    return rows.map((r) => {
      const o: Record<string, any> = {};

      for (const [k, v] of Object.entries(r)) {
        if (HARD_BLOCK.has(k)) continue;
        if (!allowed.has(k)) continue;

        // Integers
        if (
          [
            "current_stock",
            "capacity",
            "position_id",
            "shelf_row",
            "shelf_column",
            "product_id",
            "shelf_life_days",
            "quantity",
          ].includes(k)
        ) {
          const n = parseInt(String(v), 10);
          o[k] = Number.isNaN(n) ? null : n;
          continue;
        }

        // Floats
        if (["price", "machine_revenue"].includes(k)) {
          const n = parseFloat(String(v).replace(",", "."));
          o[k] = Number.isNaN(n) ? null : n;
          continue;
        }

        // Dates
        if (["restocked_at", "best_before_date", "delivery_date"].includes(k)) {
          const d = new Date(String(v));
          o[k] = Number.isNaN(+d) ? null : d.toISOString();
          continue;
        }

        o[k] = v === "" ? null : v;
      }

      // Special case: let DB trigger auto-generate batch_id
      if (target === "inventory" && ignoreBatchId) delete o["batch_id"];

      return o;
    });
  }, [rows, target, ignoreBatchId]);

  /**
   * Validate required fields for each target table.
   * Guards against obvious NOT NULL violations.
   */
  const validateRequired = (): string | null => {
    if (filteredRows.length === 0) return "No data to upload.";

    if (target === "products") {
      const bad = filteredRows.find(
        (r) => !r.name || typeof r.price !== "number" || Number.isNaN(r.price) ||
               typeof r.shelf_life_days !== "number" || Number.isNaN(r.shelf_life_days)
      );
      return bad ? "products: each row needs name, price (number), shelf_life_days (number)." : null;
    }
    if (target === "deliveries") {
      const bad = filteredRows.find(
        (r) => !r.delivery_date || !r.best_before_date ||
               typeof r.quantity !== "number" || Number.isNaN(r.quantity)
      );
      return bad ? "deliveries: delivery_date, best_before_date, quantity (number) are required." : null;
    }
    if (target === "inventory") {
      const bad = filteredRows.find((r) => !r.machine_id || typeof r.product_id !== "number");
      return bad ? "inventory: machine_id (uuid) and product_id (int) are required." : null;
    }
    if (target === "machines") {
      const bad = filteredRows.find((r) => !r.machine_name || !r.machine_location);
      return bad ? "machines: machine_name and machine_location are required." : null;
    }
    return null;
  };

  /**
   * Insert filtered + validated rows into Supabase.
   */
  const insertNow = async () => {
    setMsg(null);
    const err = validateRequired?.();
    if (err) { setMsg(err); return; }
    if (!file || filteredRows.length === 0) { setMsg("No data to upload."); return; }

    setBusy(true);
    const { data, error } = await supabase.from(target).insert(filteredRows as any[]).select();
    setBusy(false);
    if (error) { setMsg(`${error.code ?? "error"}: ${error.message}`); return; }
    setMsg(`Inserted ${data?.length ?? 0} rows into '${target}'.`);
  };

  /**
   * Fetch last 5 rows from Supabase for verification.
   */
  const fetchLastFive = async () => {
    setChecking(true);
    setMsg(null);
    const hint = ORDER_HINTS[target];
    let q = supabase.from(target).select("*").limit(5);
    if (hint?.column) {
      // @ts-ignore – trusted column names per table
      q = q.order(hint.column as any, { ascending: !!hint.asc, nullsFirst: false });
    }
    const { data, error } = await q;
    setChecking(false);
    if (error) { setMsg(`${error.code ?? "error"}: ${error.message}`); setLastRows(null); return; }
    setLastRows(data ?? []);
  };

  /**
   * Trigger download of sample CSV template.
   */
  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // Example CSV templates
  const samples: Record<Target, string> = {
    products: `name,price,shelf_life_days\nCola 0.5L,1.50,180\nWater 0.5L,1.20,365\n`,
    deliveries: `product_id,delivery_date,best_before_date,quantity\n1,2025-08-01,2025-12-01,50\n2,2025-08-05,2026-08-05,100\n`,
    inventory: `machine_id,product_id,current_stock,capacity,restocked_at,best_before_date,status,position_id,shelf_row,shelf_column\n<uuid_of_machine>,1,25,50,2025-08-10,2025-12-01,OK,1,1,1\n<uuid_of_machine>,2,40,60,2025-08-11,2026-08-05,OK,2,1,2\n`,
    machines: `machine_name,machine_location,machine_revenue\nMain Station,Central Hall,0\nCampus North,Cafeteria,0\n`,
  };

  // JSX UI follows...
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">{t("upload.title")}</h1>
      <p className="text-sm text-gray-600">{t("upload.description")}</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">{t("upload.targetTable")}</label>
        <select className="border rounded-md p-2" value={target} onChange={(e) => setTarget(e.target.value as Target)}>
          <option value="products">{t("upload.products")}</option>
          <option value="deliveries">{t("upload.deliveries")}</option>
          <option value="machines">{t("upload.machines")}</option>
          <option value="inventory">{t("upload.inventory")}</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">{t("upload.csvSeparator")}</label>
          <select className="border rounded-md p-2" value={sep} onChange={(e) => setSep(e.target.value)}>
            <option value=",">{t("upload.comma")}</option>
            <option value=";">{t("upload.semicolon")}</option>
            <option value="\t">{t("upload.tab")}</option>
            <option value="|">{t("upload.pipe")}</option>
          </select>
        </div>
      </div>

      {target === "inventory" && (
        <div className="rounded-md border p-3 bg-white flex items-center gap-2">
          <input id="ignore-batch" type="checkbox" className="h-4 w-4" checked={ignoreBatchId} onChange={(e) => setIgnoreBatchId(e.target.checked)} />
          <label htmlFor="ignore-batch" className="text-sm">{t("upload.ignoreBatchId")}</label>
        </div>
      )}

      <input type="file" accept=".csv,.json" onChange={onFile} className="block w-full border rounded-md p-2" />

      <div className="flex items-center gap-3">
        <button className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50" onClick={insertNow} disabled={busy || filteredRows.length === 0}>
          {busy ? t("upload.uploading") : t("upload.uploadTo", { target: t(`upload.${target}`) })}
        </button>
        <button className="border px-3 py-2 rounded" onClick={fetchLastFive} disabled={checking}>
          {checking ? t("upload.checking") : t("upload.showLast5", { target: t(`upload.${target}`) })}
        </button>
        {rows.length > 0 && <span className="text-sm text-gray-700">{t("upload.parsedRows", { count: rows.length })}</span>}
      </div>
      {msg && (
        <div className="text-sm rounded-md border p-3 bg-gray-50">
          <div className="font-mono break-all">{msg}</div>
        </div>
      )}

      {/* Mini Preview */}
      {rows.length > 0 && (
        <div className="overflow-x-auto mt-4 border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-2 py-1 text-left font-mono">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((row, idx) => (
                <tr key={idx} className="odd:bg-white even:bg-gray-50">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="px-2 py-1 font-mono">{String(val)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 10 && (
            <p className="text-xs text-gray-500 px-2 py-1">{t("upload.onlyFirst10", { count: rows.length })}</p>
          )}
        </div>
      )}

      {/* Live check: last 5 rows from DB */}
      {lastRows && (
        <div className="overflow-x-auto mt-4 border rounded-md">
          <div className="px-2 pt-2 text-sm font-semibold">{t("upload.last5From", { target: t(`upload.${target}`) })}</div>
          {lastRows.length > 0 ? (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-200">
                <tr>
                  {Object.keys(lastRows[0]).map((key) => (
                    <th key={key} className="px-2 py-1 text-left font-mono">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lastRows.map((row, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-gray-50">
                    {Object.values(row).map((val, i) => (
                      <td key={i} className="px-2 py-1 font-mono">{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-2 py-2 text-sm text-gray-600">{t("upload.noRows")}</div>
          )}
        </div>
      )}

      {/* Sample CSVs */}
      <div className="rounded-md border p-3 bg-white">
        <div className="font-semibold text-sm mb-2">{t("upload.sampleTemplates")}</div>
        <div className="flex flex-wrap gap-2">
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("products.csv", samples.products)}>{t("upload.downloadProducts")}</button>
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("deliveries.csv", samples.deliveries)}>{t("upload.downloadDeliveries")}</button>
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("inventory.csv", samples.inventory)}>{t("upload.downloadInventory")}</button>
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("machines.csv", samples.machines)}>{t("upload.downloadMachines")}</button>
        </div>
        <p className="text-xs text-gray-600 mt-2">{t("upload.tipBatchId")}</p>
      </div>

      {/* Expected columns legend */}
      <div className="text-xs text-gray-600">
        <div className="font-semibold mb-1">{t("upload.expectedColumns")}</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="font-medium">{t("upload.products")}</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">{t("upload.productsColumns")}</code>
          </div>
          <div>
            <div className="font-medium">{t("upload.deliveries")}</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">{t("upload.deliveriesColumns")}</code>
          </div>
          <div>
            <div className="font-medium">{t("upload.inventory")}</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">{t("upload.inventoryColumns")}</code>
          </div>
          <div>
            <div className="font-medium">{t("upload.machines")}</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">{t("upload.machinesColumns")}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
