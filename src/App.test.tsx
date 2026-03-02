import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import App from "./App";
import { useList } from "./hooks/useList";

// 1) Mock del hook useList (lo controlamos por test)
jest.mock("./hooks/useList", () => ({
  useList: jest.fn(),
}));


// 2) Mock del icono (para que no moleste en DOM)
jest.mock("lucide-react", () => ({
  RotateCcw: (props: any) => <svg data-testid="rotate-icon" {...props} />,
}));

// 3) Mock de Card y Button para simplificar
jest.mock("./components/ui/Card", () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
}));

jest.mock("./components/ui/Button", () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

// 4) Mock de ItemList: expone botones para disparar callbacks
jest.mock("./components/list/ItemList", () => ({
  ItemList: ({ items, onClickItem, onDeleteItem }: any) => (
    <div data-testid="item-list">
      {items.map((it: any) => (
        <div key={it.id}>
          <button onClick={() => onClickItem(it.id)}>toggle-{it.id}</button>
          <button onClick={() => onDeleteItem(it.id)}>delete-{it.id}</button>
        </div>
      ))}
    </div>
  ),
}));

// 5) Mock de AddItemModal: render condicional + botón cerrar + botón addItem
jest.mock("./components/AddItemModal", () => ({
  AddItemModal: ({ isOpen, onClose, addItem }: any) =>
    isOpen ? (
      <div data-testid="add-item-modal">
        <p>Modal Open</p>
        <button onClick={onClose}>close-modal</button>
        <button onClick={() => addItem({ id: "new", name: "New Item" })}>
          add-item
        </button>
      </div>
    ) : null,
}));

type UseListReturn = {
  items: Array<{ id: string; name?: string }>;
  selectedIds: string[];
  canUndo: boolean;
  setSelectedIds: jest.Mock;
  addItem: jest.Mock;
  removeItem: jest.Mock;
  removeItems: jest.Mock;
  undo: jest.Mock;
};

function mockUseList(overrides: Partial<UseListReturn> = {}) {
  const base: UseListReturn = {
    items: [
      { id: "a", name: "A" },
      { id: "b", name: "B" },
    ],
    selectedIds: [],
    canUndo: false,
    setSelectedIds: jest.fn(),
    addItem: jest.fn(),
    removeItem: jest.fn(),
    removeItems: jest.fn(),
    undo: jest.fn(),
  };

  (useList as jest.Mock).mockReturnValue({ ...base, ...overrides });
  return { ...base, ...overrides };
}

describe("App", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el título y la descripción", () => {
    mockUseList();
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /this is a technical proof/i })
    ).toBeInTheDocument();

    expect(screen.getByText(/lorem ipsum/i)).toBeInTheDocument();
  });

  it("botón UNDO deshabilitado cuando canUndo=false", () => {
    mockUseList({ canUndo: false });
    render(<App />);

    // El botón de undo es el que contiene el icono
    const buttons = screen.getAllByRole("button");
    const undoButton = buttons.find(button => 
      within(button).queryByTestId("rotate-icon") !== null
    )!;
    expect(undoButton).toBeDisabled();
  });

  it("click en UNDO llama a undo() cuando canUndo=true", () => {
    const undo = jest.fn();
    mockUseList({ canUndo: true, undo });

    render(<App />);

    const buttons = screen.getAllByRole("button");
    const undoButton = buttons.find(button => 
      within(button).queryByTestId("rotate-icon") !== null
    )!;
    expect(undoButton).not.toBeDisabled();

    fireEvent.click(undoButton);
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it("botón DELETE deshabilitado cuando no hay seleccionados", () => {
    mockUseList({ selectedIds: [] });
    render(<App />);

    expect(screen.getByRole("button", { name: /^delete$/i })).toBeDisabled();
  });

  it("click en DELETE llama removeItems(selectedIds) cuando hay seleccionados", () => {
    const removeItems = jest.fn();
    mockUseList({ selectedIds: ["a", "b"], removeItems });

    render(<App />);

    const deleteButton = screen.getByRole("button", { name: /^delete$/i });
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);
    expect(removeItems).toHaveBeenCalledTimes(1);
    expect(removeItems).toHaveBeenCalledWith(["a", "b"]);
  });

  it("click en ADD abre el modal y close lo cierra", () => {
    mockUseList();
    render(<App />);

    expect(screen.queryByTestId("add-item-modal")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    expect(screen.getByTestId("add-item-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close-modal/i }));
    expect(screen.queryByTestId("add-item-modal")).not.toBeInTheDocument();
  });

  it("click en un item NO seleccionado añade su id (setSelectedIds([...selectedIds, id]))", () => {
    const setSelectedIds = jest.fn();
    mockUseList({ selectedIds: [], setSelectedIds });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "toggle-a" }));
    expect(setSelectedIds).toHaveBeenCalledTimes(1);
    expect(setSelectedIds).toHaveBeenCalledWith(["a"]);
  });

  it("click en un item YA seleccionado lo quita (setSelectedIds(selectedIds.filter...))", () => {
    const setSelectedIds = jest.fn();
    mockUseList({ selectedIds: ["a", "b"], setSelectedIds });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "toggle-a" }));
    expect(setSelectedIds).toHaveBeenCalledTimes(1);
    expect(setSelectedIds).toHaveBeenCalledWith(["b"]);
  });

  it("onDeleteItem(id) llama removeItem(id)", () => {
    const removeItem = jest.fn();
    mockUseList({ removeItem });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "delete-b" }));
    expect(removeItem).toHaveBeenCalledTimes(1);
    expect(removeItem).toHaveBeenCalledWith("b");
  });

  it("desde el modal se llama addItem(...) cuando está abierto", () => {
    const addItem = jest.fn();
    mockUseList({ addItem });

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /add/i }));
    fireEvent.click(screen.getByRole("button", { name: /add-item/i }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem).toHaveBeenCalledWith({ id: "new", name: "New Item" });
  });
});