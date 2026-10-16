import { parse } from "csv-parse/sync";

import {
  ADMIN_CSV_MAX_BYTES,
  ADMIN_CSV_MAX_ROWS,
} from "@/lib/admin/constants";
import {
  parseTagsInput,
  templateBodySchema,
  templateTagsSchema,
} from "@/lib/templates/validation";

export type CsvTemplateRow = {
  body: string;
  tags: string[];
  isPublic: boolean;
};

export type CsvRowError = {
  row: number;
  message: string;
};

export type CsvParseResult =
  | { ok: true; rows: CsvTemplateRow[]; errors: CsvRowError[] }
  | { ok: false; errors: CsvRowError[] };

const REQUIRED_HEADERS = ["body", "tags", "is_public"] as const;

function parseIsPublic(raw: string | undefined): boolean {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return true;
  if (value === "true" || value === "1" || value === "yes") return true;
  if (value === "false" || value === "0" || value === "no") return false;
  throw new Error(`Invalid is_public: ${raw}`);
}

function normalizeHeader(cell: string): string {
  return cell.trim().toLowerCase().replace(/\s+/g, "_");
}

export function parseTemplatesCsv(buffer: Buffer): CsvParseResult {
  if (buffer.length > ADMIN_CSV_MAX_BYTES) {
    return {
      ok: false,
      errors: [
        {
          row: 0,
          message: `File exceeds ${ADMIN_CSV_MAX_BYTES} bytes`,
        },
      ],
    };
  }

  let records: string[][];

  try {
    records = parse(buffer, {
      bom: true,
      relax_column_count: true,
      skip_empty_lines: true,
    }) as string[][];
  } catch {
    return {
      ok: false,
      errors: [{ row: 0, message: "Invalid CSV format" }],
    };
  }

  if (records.length === 0) {
    return {
      ok: false,
      errors: [{ row: 0, message: "CSV is empty" }],
    };
  }

  const headerRow = records[0].map(normalizeHeader);
  for (const required of REQUIRED_HEADERS) {
    if (!headerRow.includes(required)) {
      return {
        ok: false,
        errors: [
          {
            row: 1,
            message: `Missing required column: ${required}`,
          },
        ],
      };
    }
  }

  const colIndex = {
    body: headerRow.indexOf("body"),
    tags: headerRow.indexOf("tags"),
    is_public: headerRow.indexOf("is_public"),
  };

  const dataRows = records.slice(1);
  if (dataRows.length > ADMIN_CSV_MAX_ROWS) {
    return {
      ok: false,
      errors: [
        {
          row: 0,
          message: `Too many rows (max ${ADMIN_CSV_MAX_ROWS})`,
        },
      ],
    };
  }

  const rows: CsvTemplateRow[] = [];
  const errors: CsvRowError[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const csvRowNumber = i + 2;
    const record = dataRows[i];

    try {
      const bodyRaw = record[colIndex.body] ?? "";
      const bodyParsed = templateBodySchema.safeParse(bodyRaw);
      if (!bodyParsed.success) {
        errors.push({
          row: csvRowNumber,
          message: bodyParsed.error.issues[0]?.message ?? "Invalid body",
        });
        continue;
      }

      const tagsRaw = record[colIndex.tags] ?? "";
      const tagNames = parseTagsInput(tagsRaw);
      const tagsParsed = templateTagsSchema.safeParse(tagNames);
      if (!tagsParsed.success) {
        errors.push({
          row: csvRowNumber,
          message: tagsParsed.error.issues[0]?.message ?? "Invalid tags",
        });
        continue;
      }

      let isPublic: boolean;
      try {
        isPublic = parseIsPublic(record[colIndex.is_public]);
      } catch (err) {
        errors.push({
          row: csvRowNumber,
          message: err instanceof Error ? err.message : "Invalid is_public",
        });
        continue;
      }

      rows.push({
        body: bodyParsed.data,
        tags: tagsParsed.data,
        isPublic,
      });
    } catch {
      errors.push({ row: csvRowNumber, message: "Failed to parse row" });
    }
  }

  if (rows.length === 0) {
    return { ok: false, errors };
  }

  return { ok: true, rows, errors };
}
