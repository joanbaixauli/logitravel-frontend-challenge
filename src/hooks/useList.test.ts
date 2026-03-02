import { renderHook, act } from "@testing-library/react";
import { useList } from "./useList";
import type { ListItem } from "../types/list";

const item = (id: string, text = id): ListItem => ({ id, text });

describe("useList", () => {
  it("estado inicial", () => {
    const { result } = renderHook(() => useList());

    expect(result.current.items).toEqual([]);
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("addItem añade al final y habilita canUndo; undo revierte el add", () => {
    const { result } = renderHook(() => useList());

    act(() => result.current.addItem(item("a")));
    expect(result.current.items.map(i => i.id)).toEqual(["a"]);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.items).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("removeItem elimina el item y lo quita de selectedIds; undo lo re-inserta en su índice original", () => {
    const { result } = renderHook(() => useList());

    act(() => {
      result.current.addItem(item("a"));
      result.current.addItem(item("b"));
      result.current.addItem(item("c"));
      result.current.setSelectedIds(["b"]);
    });

    act(() => result.current.removeItem("b"));
    expect(result.current.items.map(i => i.id)).toEqual(["a", "c"]);
    expect(result.current.selectedIds).toEqual([]); // b fuera

    act(() => result.current.undo());
    expect(result.current.items.map(i => i.id)).toEqual(["a", "b", "c"]); // vuelve en medio
  });

  it("removeItem con id inexistente es no-op (no cambia nada ni añade history)", () => {
    const { result } = renderHook(() => useList());

    act(() => {
      result.current.addItem(item("a"));
      result.current.addItem(item("b"));
    });

    const beforeItems = result.current.items;
    const beforeCanUndo = result.current.canUndo;

    act(() => result.current.removeItem("zzz"));

    // should be same references/values logically
    expect(result.current.items).toEqual(beforeItems);
    expect(result.current.canUndo).toBe(beforeCanUndo);
  });

  it("removeItems elimina varios, limpia selectedIds, y undo los recupera (group-remove atómico)", () => {
    const { result } = renderHook(() => useList());

    act(() => {
      result.current.addItem(item("a"));
      result.current.addItem(item("b"));
      result.current.addItem(item("c"));
      result.current.addItem(item("d"));
      result.current.setSelectedIds(["b", "d"]);
    });

    act(() => result.current.removeItems(["b", "d"]));
    expect(result.current.items.map(i => i.id)).toEqual(["a", "c"]);
    expect(result.current.selectedIds).toEqual([]); // limpia los borrados

    act(() => result.current.undo());
    expect(result.current.items.map(i => i.id)).toEqual(["a", "b", "c", "d"]); // vuelven en sus índices
  });

  it("removeItems con array vacío / sin matches no añade history (canUndo no cambia)", () => {
    const { result } = renderHook(() => useList());

    act(() => {
      result.current.addItem(item("a"));
      result.current.addItem(item("b"));
    });

    // canUndo ya es true por los adds; hacemos undo hasta dejarlo limpio para probar bien
    act(() => result.current.undo());
    act(() => result.current.undo());
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.removeItems([]));
    expect(result.current.items.map(i => i.id)).toEqual([]);
    expect(result.current.canUndo).toBe(false);

    act(() => result.current.removeItems(["x", "y"]));
    expect(result.current.items.map(i => i.id)).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("SET_SELECTED actualiza selectedIds y RESET_SELECTION lo limpia", () => {
    const { result } = renderHook(() => useList());

    act(() => result.current.setSelectedIds(["a", "b"]));
    expect(result.current.selectedIds).toEqual(["a", "b"]);

    act(() => result.current.resetSelection());
    expect(result.current.selectedIds).toEqual([]);
  });

  it("undo con history vacío es no-op", () => {
    const { result } = renderHook(() => useList());

    act(() => result.current.undo());
    expect(result.current.items).toEqual([]);
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.canUndo).toBe(false);
  });

  it("undo tras remove (single) no toca selectedIds si no tenía el item", () => {
    const { result } = renderHook(() => useList());

    act(() => {
      result.current.addItem(item("a"));
      result.current.addItem(item("b"));
      result.current.setSelectedIds(["a"]); // b no está seleccionado
    });

    act(() => result.current.removeItem("b"));
    expect(result.current.selectedIds).toEqual(["a"]);

    act(() => result.current.undo()); // reinsert b
    expect(result.current.items.map(i => i.id)).toEqual(["a", "b"]);
    expect(result.current.selectedIds).toEqual(["a"]); // sigue igual
  });
});