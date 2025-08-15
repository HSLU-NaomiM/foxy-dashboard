import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "../lib/supabaseClient";

export default function Upload() {
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
      alert("Nur CSV oder JSON wird unterstützt.");
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
      alert("Ungültige JSON-Datei");
    }
  };
  
  const normalizeData = (rawData: any[]) => {
    return rawData.map((row) => ({
        name: row.name || row.Name || row["Produktname"] || "Unbekannt",
        price: parseFloat(row.price || row["Preis"] || "0"),
        // füge hier weitere Felder hinzu
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
      <h1 className="text-2xl font-bold mb-4">Daten hochladen</h1>

      <input
        type="file"
        accept=".csv,.json"
        onChange={handleFileChange}
        className="mb-4"
      />

      {data.length > 0 && (
        <div className="overflow-x-auto mt-6 border rounded-lg">
          <h2 className="font-semibold text-lg mb-2 px-4 pt-4">Tabellarische Vorschau</h2>
          <table className="min-w-full text-sm text-left text-gray-800">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-4 py-2 font-semibold border-b">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-gray-50">
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} className="px-4 py-2 border-b">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm text-gray-500 p-4">
            {data.length > 10 && `Nur erste 10 von ${data.length} Zeilen dargestellt.`}
          </p>
        </div>
      )}
      <button
  onClick={uploadToSupabase}
  className="mt-4 bg-[#3ECF8E] hover:bg-[#36b67c] text-white font-semibold py-2 px-4 rounded"
    >
    Uplaod to Supabase
    </button>
    </div>
  );
}
