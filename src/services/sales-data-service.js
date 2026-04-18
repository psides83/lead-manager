const LEGACY_SALES_JSON_URL =
  "https://psides83.github.io/listJSON/salesByMonth.json";

const GOOGLE_SHEETS_HOST = "https://docs.google.com/spreadsheets";

const normalizeKey = (value = "") =>
  String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toMonth = (value) => String(value || "").padStart(2, "0");

const normalizeRow = (row, index) => {
  const keyed = {};

  Object.entries(row || {}).forEach(([rawKey, rawValue]) => {
    keyed[normalizeKey(rawKey)] = rawValue;
  });

  const year = String(
    keyed.year || keyed.yyyy || keyed.fiscalyear || keyed.fiscal || ""
  );
  const month = toMonth(keyed.month || keyed.mm || keyed.period || "");
  const date = String(keyed.date || keyed.ym || keyed.yearmonth || "");

  const resolvedYear = year || date.slice(0, 4);
  const resolvedMonth = month || toMonth(date.slice(5, 7));
  const resolvedDate =
    date && date.length >= 7
      ? `${date.slice(0, 4)}-${toMonth(date.slice(5, 7))}`
      : `${resolvedYear}-${resolvedMonth}`;

  const id =
    String(keyed.id || "").trim() ||
    `${resolvedYear || "0000"}${resolvedMonth || "00"}`;

  const sales = toNumber(keyed.sales);
  const margin = toNumber(keyed.margin);
  const commission = toNumber(keyed.commission);
  const bonus = toNumber(keyed.bonus);

  return {
    id: id || `row-${index + 1}`,
    date: resolvedDate,
    month: resolvedMonth,
    year: resolvedYear,
    sales,
    margin,
    cost: sales - margin,
    commission,
    bonus,
  };
};

const normalizeRows = (rows = []) =>
  rows
    .map(normalizeRow)
    .filter(
      (row) =>
        row.year &&
        row.month &&
        Number.isFinite(row.sales) &&
        Number.isFinite(row.margin)
    )
    .sort((a, b) => a.id.localeCompare(b.id));

const parseGoogleVisualizationResponse = (rawText) => {
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("Unexpected Google Sheets response format.");
  }

  const json = JSON.parse(rawText.slice(jsonStart, jsonEnd + 1));
  const cols = json?.table?.cols || [];
  const rows = json?.table?.rows || [];

  return rows.map((row) => {
    const mappedRow = {};
    row.c?.forEach((cell, cellIndex) => {
      const col = cols[cellIndex];
      const key = col?.label || col?.id || `col${cellIndex + 1}`;
      mappedRow[key] = cell?.v ?? "";
    });
    return mappedRow;
  });
};

const parseSheetConfig = () => {
  const rawSheetId = (process.env.REACT_APP_SALES_SHEET_ID || "").trim();
  const sheetName = (process.env.REACT_APP_SALES_SHEET_NAME || "").trim();
  const sheetGid = (process.env.REACT_APP_SALES_SHEET_GID || "").trim();

  if (!rawSheetId) {
    throw new Error("Missing REACT_APP_SALES_SHEET_ID.");
  }

  // Accept any of:
  // 1) Spreadsheet ID: 1Abc...
  // 2) Published key: 2PACX-...
  // 3) Full Google Sheets URL containing /d/<id>/... or /d/e/<id>/...
  const publishedMatch = rawSheetId.match(/\/d\/e\/([^/]+)/);
  const spreadsheetMatch = rawSheetId.match(/\/d\/([^/]+)/);

  const isPublished =
    rawSheetId.startsWith("2PACX-") || Boolean(publishedMatch);

  const resolvedId = isPublished
    ? rawSheetId.startsWith("2PACX-")
      ? rawSheetId
      : publishedMatch?.[1] || ""
    : spreadsheetMatch?.[1] || rawSheetId;

  if (!resolvedId) {
    throw new Error("Could not parse a valid Google Sheet ID.");
  }

  return { isPublished, resolvedId, sheetName, sheetGid };
};

const buildGoogleSheetGvizUrl = () => {
  const { isPublished, resolvedId, sheetName, sheetGid } = parseSheetConfig();
  const path = isPublished
    ? `/d/e/${resolvedId}/gviz/tq`
    : `/d/${resolvedId}/gviz/tq`;
  const params = new URLSearchParams({ tqx: "out:json" });

  if (sheetName) params.set("sheet", sheetName);
  if (sheetGid) params.set("gid", sheetGid);

  return `${GOOGLE_SHEETS_HOST}${path}?${params.toString()}`;
};

const buildPublishedCsvUrl = () => {
  const { isPublished, resolvedId, sheetGid } = parseSheetConfig();
  if (!isPublished) return "";

  const params = new URLSearchParams({ output: "csv", single: "true" });
  if (sheetGid) params.set("gid", sheetGid);

  return `${GOOGLE_SHEETS_HOST}/d/e/${resolvedId}/pub?${params.toString()}`;
};

const parseCsvRows = (rawCsv = "") => {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < rawCsv.length; i += 1) {
    const char = rawCsv[i];
    const nextChar = rawCsv[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      row.push(current);
      current = "";
      if (row.some((cell) => String(cell).trim() !== "")) {
        rows.push(row);
      }
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((cell) => String(cell).trim() !== "")) {
      rows.push(row);
    }
  }

  if (!rows.length) return [];

  const [header, ...dataRows] = rows;
  return dataRows.map((dataRow) => {
    const mapped = {};
    header.forEach((key, index) => {
      mapped[key] = dataRow[index] ?? "";
    });
    return mapped;
  });
};

const fetchFromGoogleSheetGviz = async () => {
  const url = buildGoogleSheetGvizUrl();

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Google Sheets fetch failed with ${response.status} at ${url}.`
    );
  }

  const text = await response.text();
  const rows = parseGoogleVisualizationResponse(text);
  return normalizeRows(rows);
};

const fetchFromPublishedCsv = async () => {
  const url = buildPublishedCsvUrl();
  if (!url) {
    throw new Error("CSV URL unavailable for non-published sheet configuration.");
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Published CSV fetch failed with ${response.status} at ${url}.`
    );
  }

  const text = await response.text();
  const rows = parseCsvRows(text);
  return normalizeRows(rows);
};

const fetchFromGoogleSheet = async () => {
  const { isPublished } = parseSheetConfig();
  const data = isPublished
    ? await fetchFromPublishedCsv()
    : await fetchFromGoogleSheetGviz();

  return {
    data,
    source: "Google Sheets",
    syncedAt: new Date().toISOString(),
  };
};

const fetchFromLegacyJson = async () => {
  const response = await fetch(LEGACY_SALES_JSON_URL);
  if (!response.ok) {
    throw new Error(`Legacy JSON fetch failed with ${response.status}.`);
  }

  const json = await response.json();

  return {
    data: normalizeRows(json),
    source: "Legacy JSON",
    syncedAt: new Date().toISOString(),
  };
};

export const fetchSalesData = async () => {
  try {
    return await fetchFromGoogleSheet();
  } catch (googleSheetsError) {
    // Keep dashboard available even if sheet config/network is unavailable.
    console.warn("Google Sheets source unavailable:", googleSheetsError);
    return fetchFromLegacyJson();
  }
};
