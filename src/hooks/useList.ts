import { useReducer } from "react";
import { ListItem } from "../types/list";

// Guardamos índice + item para poder reconstruir el estado exacto en UNDO.
type HistoryAction =
  | { type: "add"; item: ListItem; index: number }
  | { type: "remove"; item: ListItem; index: number }
  | { type: "group-remove"; items: Array<{ item: ListItem; index: number }> };

type State = {
  items: ListItem[];
  selectedIds: string[];
  history: HistoryAction[];
};

// useReducer simplifica la coordinación entre items, selección e historial.
type Action =
  | { type: "ADD_ITEM"; item: ListItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "REMOVE_ITEMS"; ids: string[] }
  | { type: "SET_SELECTED"; ids: string[] }
  | { type: "RESET_SELECTION" }
  | { type: "UNDO" };

// Insert helper para evitar repetir lógica de inserción inmutable.
const insertAt = (list: ListItem[], item: ListItem, index: number) =>
  list.slice(0, index).concat(item, list.slice(index));

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_ITEM": {
      const index = state.items.length; // Añadimos al final y guardamos posición para UNDO.
      return {
        ...state,
        items: [...state.items, action.item],
        history: [...state.history, { type: "add", item: action.item, index }],
      };
    }

    case "REMOVE_ITEM": {
      const index = state.items.findIndex(i => i.id === action.id);
      if (index === -1) return state; // Reducer seguro ante acciones inválidas.

      const item = state.items[index];

      return {
        ...state,
        items: state.items.filter(i => i.id !== action.id),
        selectedIds: state.selectedIds.filter(x => x !== action.id), // Evitamos selección huérfana.
        history: [...state.history, { type: "remove", item, index }],
      };
    }

    case "REMOVE_ITEMS": {
      const removed: Array<{ item: ListItem; index: number }> = [];

      const nextItems = state.items.filter((it, idx) => {
        if (action.ids.includes(it.id)) {
          removed.push({ item: it, index: idx });
          return false;
        }
        return true;
      });

      return {
        ...state,
        items: nextItems,
        selectedIds: state.selectedIds.filter(x => !action.ids.includes(x)),
        history: removed.length
          ? [...state.history, { type: "group-remove", items: removed }] // Agrupamos para UNDO atómico.
          : state.history,
      };
    }

    case "SET_SELECTED":
      return { ...state, selectedIds: action.ids }; // Política de selección delegada a la UI.

    case "RESET_SELECTION":
      return { ...state, selectedIds: [] };

    case "UNDO": {
      const last = state.history[state.history.length - 1];
      if (!last) return state; // UNDO no-op si no hay historial.

      const history = state.history.slice(0, -1);

      if (last.type === "add") {
        return {
          ...state,
          items: state.items.filter(i => i.id !== last.item.id),
          selectedIds: state.selectedIds.filter(x => x !== last.item.id),
          history,
        };
      }

      if (last.type === "remove") {
        return {
          ...state,
          items: insertAt(state.items, last.item, last.index), // Reinsertamos en posición original.
          history,
        };
      }

      const sorted = [...last.items].sort((a, b) => a.index - b.index); // Insertamos en orden para mantener índices.
      let next = [...state.items];
      for (const { item, index } of sorted) next = insertAt(next, item, index);

      return { ...state, items: next, history };
    }

    default:
      return state;
  }
};

export const useList = () => {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    selectedIds: [],
    history: [],
  });

  return {
    items: state.items,
    selectedIds: state.selectedIds,
    canUndo: state.history.length > 0,
    setSelectedIds: (ids: string[]) => dispatch({ type: "SET_SELECTED", ids }),
    resetSelection: () => dispatch({ type: "RESET_SELECTION" }),
    addItem: (item: ListItem) => dispatch({ type: "ADD_ITEM", item }),
    removeItem: (id: string) => dispatch({ type: "REMOVE_ITEM", id }),
    removeItems: (ids: string[]) => dispatch({ type: "REMOVE_ITEMS", ids }),
    undo: () => dispatch({ type: "UNDO" }),
  };
};