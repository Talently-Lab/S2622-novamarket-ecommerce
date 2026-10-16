import rawCsv from './MOCK_DATA.csv?raw';
import type { Product } from '../types/product.ts';

export type { Product };

const EXPECTED_HEADERS = [
  'nombre',
  'descripcion',
  'precio',
  'stock',
  'categoria',
  'imagenUrl',
] as const;

/**
 * Split CSV text into rows of fields, honoring RFC 4180 quoting:
 * quoted fields may contain commas, CRLF and doubled quotes ("").
 */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let fields: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  const pushField = () => {
    fields.push(field);
    field = '';
  };
  const pushRow = () => {
    pushField();
    // Skip the artifact row produced by a trailing newline.
    if (!(fields.length === 1 && fields[0] === '')) {
      rows.push(fields);
    }
    fields = [];
  };

  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
        } else {
          inQuotes = false;
          i += 1;
        }
      } else {
        field += char;
        i += 1;
      }
    } else if (char === '"') {
      inQuotes = true;
      i += 1;
    } else if (char === ',') {
      pushField();
      i += 1;
    } else if (char === '\r' && text[i + 1] === '\n') {
      pushRow();
      i += 2;
    } else if (char === '\n' || char === '\r') {
      pushRow();
      i += 1;
    } else {
      field += char;
      i += 1;
    }
  }
  if (inQuotes) {
    throw new Error('Invalid CSV: unterminated quoted field');
  }
  // Flush the last row when the file does not end with a newline.
  if (field !== '' || fields.length > 0) {
    pushRow();
  }
  return rows;
}

/**
 * Convert CSV source text into catalog products.
 * The CSV carries no id column, so ids are deterministic
 * 1-based data-row numbers.
 */
export function parseProductsCsv(csvText: string): Product[] {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) {
    throw new Error('Invalid CSV: missing header row');
  }
  const [header, ...dataRows] = rows;
  if (
    header.length !== EXPECTED_HEADERS.length ||
    !EXPECTED_HEADERS.every((name, index) => header[index] === name)
  ) {
    throw new Error(
      `Invalid CSV headers: expected ${EXPECTED_HEADERS.join(',')}`,
    );
  }
  return dataRows.map((columns, index) => {
    if (columns.length !== EXPECTED_HEADERS.length) {
      throw new Error(`Invalid CSV row ${index + 1}: expected 6 columns`);
    }
    const [nombre, descripcion, precioRaw, stockRaw, categoria, imagenUrl] =
      columns as [string, string, string, string, string, string];
    const precio = Number(precioRaw);
    const stock = Number(stockRaw);
    if (!Number.isFinite(precio)) {
      throw new Error(`Invalid CSV row ${index + 1}: bad precio`);
    }
    if (!Number.isInteger(stock)) {
      throw new Error(`Invalid CSV row ${index + 1}: bad stock`);
    }
    return {
      id: index + 1,
      name: nombre,
      description: descripcion,
      price: precio,
      stock,
      category: categoria,
      imageUrl: imagenUrl,
    };
  });
}

/**
 * Temporary catalog fixture parsed from the user-provided CSV.
 * Replaces the old hardcoded mocks until the backend catalog is live.
 */
export const products: Product[] = parseProductsCsv(rawCsv);
