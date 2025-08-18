// src/pages/Upload.tsx
// Guided CSV/JSON uploader: Products → Deliveries → Inventory → Machines
// - KISS UI + Mini Preview (first 10 rows)
// - Schema-aligned to your posted DDL
// - Optional toggle: ignore inventory.batch_id (DB trigger fills it)
// - Handy: one-click sample CSV downloads per table
// Comments are in English per your preference

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabaseClient";

type Target = "products" | "deliveries" | "inventory" | "machines";

// Strict whitelists per table (unknown columns are dropped)
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

// Columns we never send even if present
const HARD_BLOCK = new Set(["inventory_id", "created_at", "updated_at", "created_by"]);

// Order-by hints per table for "Show last 5" button
const ORDER_HINTS: Record<Target, { column: string; asc?: boolean }> = {
  products: { column: "product_id", asc: false },
  deliveries: { column: "delivery_date", asc: false },
  inventory: { column: "created_at", asc: false },
  machines: { column: "created_at", asc: false },
};

export default function Upload() {
  const [target, setTarget] = useState<Target>("products");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [sep, setSep] = useState<string>(",");
  const [ignoreBatchId, setIgnoreBatchId] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [lastRows, setLastRows] = useState<any[] | null>(null);
  const [checking, setChecking] = useState(false);

  // --- Parsing ---
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

  // --- Casting + Filtering ---
  const filteredRows = useMemo(() => {
    if (rows.length === 0) return [];
    const allowed = new Set(ALLOWED[target]);

    return rows.map((r) => {
      const o: Record<string, any> = {};

      for (const [k, v] of Object.entries(r)) {
        if (HARD_BLOCK.has(k)) continue;
        if (!allowed.has(k)) continue;

        // integers
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

        // numerics (float)
        if (["price", "machine_revenue"].includes(k)) {
          const n = parseFloat(String(v).replace(",", "."));
          o[k] = Number.isNaN(n) ? null : n;
          continue;
        }

        // dates → ISO
        if (["restocked_at", "best_before_date", "delivery_date"].includes(k)) {
          const d = new Date(String(v));
          o[k] = Number.isNaN(+d) ? null : d.toISOString();
          continue;
        }

        // default
        o[k] = v === "" ? null : v;
      }

      // let DB trigger create batch when omitted
      if (target === "inventory" && ignoreBatchId) delete o["batch_id"];

      return o;
    });
  }, [rows, target, ignoreBatchId]);

  // Minimal friendly guards for obvious NOT NULL constraints
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

  // --- Insert ---
  const insertNow = async () => {
    setMsg(null);
    const err = validateRequired?.();
    if (err) { setMsg(err); return; }
    if (!file || filteredRows.length === 0) { setMsg("No data to upload."); return; }

    setBusy(true);
    const { data, error } = await supabase.from(target).insert(filteredRows as any[]).select();
    setBusy(false);
    if (error) { setMsg(`${error.code ?? "error"}: ${error.message}`); return; }
    setMsg(`✅ Inserted ${data?.length ?? 0} rows into '${target}'.`);
  };

  // Fetch last 5 rows for current target
  const fetchLastFive = async () => {
    setChecking(true);
    setMsg(null);
    const hint = ORDER_HINTS[target];
    let q = supabase.from(target).select("*").limit(5);
    if (hint?.column) {
      // @ts-ignore – we trust the column names per table
      q = q.order(hint.column as any, { ascending: !!hint.asc, nullsFirst: false });
    }
    const { data, error } = await q;
    setChecking(false);
    if (error) { setMsg(`${error.code ?? "error"}: ${error.message}`); setLastRows(null); return; }
    setLastRows(data ?? []);
  };

  // --- Sample CSV download helpers ---
  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const samples: Record<Target, string> = {
    products: `name,price,shelf_life_days\nCola 0.5L,1.50,180\nWater 0.5L,1.20,365\n`,
    deliveries: `product_id,delivery_date,best_before_date,quantity\n1,2025-08-01,2025-12-01,50\n2,2025-08-05,2026-08-05,100\n`,
    inventory: `machine_id,product_id,current_stock,capacity,restocked_at,best_before_date,status,position_id,shelf_row,shelf_column\n<uuid_of_machine>,1,25,50,2025-08-10,2025-12-01,OK,1,1,1\n<uuid_of_machine>,2,40,60,2025-08-11,2026-08-05,OK,2,1,2\n`,
    machines: `machine_name,machine_location,machine_revenue\nMain Station,Central Hall,0\nCampus North,Cafeteria,0\n`,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Upload (Simple)</h1>
      <p className="text-sm text-gray-600">CSV/JSON guided uploader. Products → Deliveries → Inventory → Machines.</p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm">Target table</label>
        <select className="border rounded-md p-2" value={target} onChange={(e) => setTarget(e.target.value as Target)}>
          <option value="products">products</option>
          <option value="deliveries">deliveries</option>
          <option value="inventory">inventory</option>
          <option value="machines">machines</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">CSV separator</label>
          <select className="border rounded-md p-2" value={sep} onChange={(e) => setSep(e.target.value)}>
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab (\\t)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
      </div>

      {target === "inventory" && (
        <div className="rounded-md border p-3 bg-white flex items-center gap-2">
          <input id="ignore-batch" type="checkbox" className="h-4 w-4" checked={ignoreBatchId} onChange={(e) => setIgnoreBatchId(e.target.checked)} />
          <label htmlFor="ignore-batch" className="text-sm">Ignore <code className="font-mono">batch_id</code> (let DB trigger create it)</label>
        </div>
      )}

      <input type="file" accept=".csv,.json" onChange={onFile} className="block w-full border rounded-md p-2" />

      <div className="flex items-center gap-3">
        <button className="bg-slate-900 text-white px-4 py-2 rounded disabled:opacity-50" onClick={insertNow} disabled={busy || filteredRows.length === 0}>
          {busy ? "Uploading…" : `Upload → ${target}`}
        </button>
        <button className="border px-3 py-2 rounded" onClick={fetchLastFive} disabled={checking}>
          {checking ? "Checking…" : `Show last 5 (${target})`}
        </button>
        {rows.length > 0 && <span className="text-sm text-gray-700">Parsed rows: {rows.length}</span>}
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
            <p className="text-xs text-gray-500 px-2 py-1">Only first 10 of {rows.length} rows shown.</p>
          )}
        </div>
      )}

      {/* Live check: last 5 rows from DB */}
      {lastRows && (
        <div className="overflow-x-auto mt-4 border rounded-md">
          <div className="px-2 pt-2 text-sm font-semibold">Last 5 from '{target}'</div>
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
            <div className="px-2 py-2 text-sm text-gray-600">No rows.</div>
          )}
        </div>
      )}

      {/* Sample CSVs */}
      <div className="rounded-md border p-3 bg-white">
        <div className="font-semibold text-sm mb-2">Sample CSV templates</div>
        <div className="flex flex-wrap gap-2">
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("products.csv", samples.products)}>Download products.csv</button>
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("deliveries.csv", samples.deliveries)}>Download deliveries.csv</button>
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("inventory.csv", samples.inventory)}>Download inventory.csv</button>
          <button className="border rounded px-3 py-1 text-sm" onClick={() => download("machines.csv", samples.machines)}>Download machines.csv</button>
        </div>
        <p className="text-xs text-gray-600 mt-2">Tip: For inventory, you can leave <code className="font-mono">batch_id</code> empty and enable the toggle so the DB trigger creates it.</p>
      </div>

      {/* Expected columns legend */}
      <div className="text-xs text-gray-600">
        <div className="font-semibold mb-1">Expected columns</div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="font-medium">products</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">product_id (auto), name, price, shelf_life_days</code>
          </div>
          <div>
            <div className="font-medium">deliveries</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">batch_id, product_id, delivery_date, best_before_date, quantity</code>
          </div>
          <div>
            <div className="font-medium">inventory</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">machine_id, product_id, (batch_id), current_stock, capacity, restocked_at, best_before_date, status, position_id, shelf_row, shelf_column</code>
          </div>
          <div>
            <div className="font-medium">machines</div>
            <code className="block bg-gray-100 rounded p-2 mt-1">machine_id (auto), machine_name, machine_location, machine_revenue</code>
          </div>
        </div>
      </div>
    </div>
  );
}
