import { describe, expect, it } from 'vitest';
import { parseProductsCsv, products } from './products.ts';

describe('parseProductsCsv', () => {
  it('loads the 20 fixture rows with deterministic 1-based ids', () => {
    expect(products).toHaveLength(20);
    expect(products.map((product) => product.id)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 1),
    );
  });

  it('keeps the quoted Hub USB description with its comma intact', () => {
    const hub = products.find((product) =>
      product.name.includes('Hub USB NovaConnect'),
    );

    expect(hub).toBeDefined();
    expect(hub?.description).toBe(
      'Hub multipuerto con USB 3.0, HDMI y lector de tarjetas SD',
    );
    expect(hub?.price).toBe(24300.0);
    expect(hub?.stock).toBe(30);
    expect(hub?.category).toBe('accesorios');
    expect(hub?.imageUrl).toContain('https://images.unsplash.com/');
  });

  it('maps number, category and image fields', () => {
    const first = products[0];

    expect(first?.name).toBe('Auriculares Bluetooth NovaSound X1');
    expect(typeof first?.price).toBe('number');
    expect(first?.price).toBe(45999.9);
    expect(typeof first?.stock).toBe('number');
    expect(first?.stock).toBe(24);
    expect(first?.category).toBe('accesorios');
    expect(first?.imageUrl).toContain('https://images.unsplash.com/');
  });

  it('handles CRLF endings, doubled quotes and commas in quotes', () => {
    const csv =
      'nombre,descripcion,precio,stock,categoria,imagenUrl\r\n' +
      '"Widget, deluxe","Dice ""hola"", adios",10.5,3,gadgets,https://example.com/w.png\r\n';

    const parsed = parseProductsCsv(csv);

    expect(parsed).toEqual([
      {
        id: 1,
        name: 'Widget, deluxe',
        description: 'Dice "hola", adios',
        price: 10.5,
        stock: 3,
        category: 'gadgets',
        imageUrl: 'https://example.com/w.png',
      },
    ]);
  });

  it('rejects bad headers and non-numeric fields', () => {
    expect(() =>
      parseProductsCsv('a,b,c,d,e,f\n1,2,3,4,5,6\n'),
    ).toThrow(/headers/i);
    expect(() =>
      parseProductsCsv(
        'nombre,descripcion,precio,stock,categoria,imagenUrl\nW,D,free,3,gadgets,https://example.com/w.png\n',
      ),
    ).toThrow(/precio/i);
    expect(() =>
      parseProductsCsv(
        'nombre,descripcion,precio,stock,categoria,imagenUrl\nW,D,10,many,gadgets,https://example.com/w.png\n',
      ),
    ).toThrow(/stock/i);
  });
});
