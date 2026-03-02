import { generateId } from "./generateId";

describe("generateId", () => {
  it("devuelve un string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
  });

  it("no está vacío", () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });

  it("tiene longitud máxima esperada (13 caracteres)", () => {
    const id = generateId();
    expect(id.length).toBeLessThanOrEqual(13);
  });

  it("solo contiene caracteres alfanuméricos", () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("genera valores distintos en múltiples llamadas", () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});