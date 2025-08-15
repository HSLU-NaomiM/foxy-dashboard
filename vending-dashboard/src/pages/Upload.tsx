// src/pages/Upload.tsx
import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../lib/supabaseClient";
import { useTranslation } from "react-i18next";

export default function Upload() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [fileType, setFileType] = useState<"csv" | "json" | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();
    if (fileExtension === "csv") {
      setFileType("csv");
      parseCSV(uploadedFile);
    } else if (fileExtension === "json") {
      setFileType("json");
      parseJSON(uploadedFile);
    } else {
      alert(t('upload.supportedTypes'));
    }
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setData(results.data as any[]);
      },
    });
  };

  const parseJSON = async (file: File) => {
    const text = await file.text();
    try {
      const jsonData = JSON.parse(text);
      setData(Array.isArray(jsonData) ? jsonData : [jsonData]);
    } catch (err) {
      alert(t('upload.invalidJson'));
    }
  };
  
  const normalizeData = (rawData: any[]) => {
    return rawData.map((row) => ({
        name: row.name || row.Name || row["Produktname"] || "Unbekannt",
        price: parseFloat(row.price || row["Preis"] || "0"),
        product_id: parseInt(row.product_id || row["ProduktID"] || "0"),
        shelf_life_days: parseInt(row.shelf_life_days || row["Haltbarkeit"] || "0"),
    }));
    };

  const uploadToSupabase = async () => {
    if (data.length === 0) return alert("Keine Daten vorhanden!");

    // 👉 optional normalisieren
    const normalized = normalizeData(data);

    const { error } = await supabase.from("products").insert(normalized);

    if (error) {
        console.error(error);
        alert("Fehler beim Hochladen: " + error.message);
    } else {
        alert("✅ Daten erfolgreich hochgeladen!");
    }
    };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{t('upload.title')}</h1>

      <input
        type="file"
        accept=".csv,.json"
        onChange={handleFileChange}
        className="mb-4 block w-full border border-gray-300 rounded-md p-2"
        placeholder={t('upload.selectFile')}
      />

      {data.length > 0 && (
        <div className="overflow-x-auto mt-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2 px-4 pt-4">{t('upload.title')} {t('upload.selectFile')}</h2>
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-4 py-2">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="px-4 py-2">{String(val)}</td>
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
      <button
        onClick={uploadToSupabase}
        className="mt-4 bg-[#3ECF8E] hover:bg-[#36b67c] text-white font-semibold py-2 px-4 rounded"
        disabled={!file}
      >
        Upload to Supabase
      </button>
    </div>
  );
}
