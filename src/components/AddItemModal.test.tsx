import { render, screen, fireEvent } from "@testing-library/react";
import { AddItemModal } from "./AddItemModal";
import * as generateIdModule from "../utils/generateId"

// Mock CSS
jest.mock("./AddItemModal.module.css", () => ({
  modalOverlay: "modalOverlay",
  modalTitle: "modalTitle",
  modalInput: "modalInput",
  modalButtons: "modalButtons",
}));

// Mock generateId
jest.mock("../utils/generateId", () => ({
  generateId: jest.fn(() => "mock-id"),
}));

// Mock Card + Button (simplificamos)
jest.mock("./ui/Card", () => ({
  Card: ({ children }: any) => <div>{children}</div>,
}));

jest.mock("./ui/Button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

describe("AddItemModal", () => {
  beforeEach(() => {
    // Crear modal-root para el portal
    const modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
    jest.spyOn(generateIdModule, "generateId").mockReturnValue("mock-id");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  it("no renderiza nada cuando isOpen=false", () => {
    render(
      <AddItemModal isOpen={false} onClose={jest.fn()} addItem={jest.fn()} />
    );

    expect(screen.queryByText(/add item to list/i)).not.toBeInTheDocument();
  });

  it("renderiza el modal cuando isOpen=true", () => {
    render(
      <AddItemModal isOpen={true} onClose={jest.fn()} addItem={jest.fn()} />
    );

    expect(screen.getByText(/add item to list/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/type the text here/i)
    ).toBeInTheDocument();
  });

  it("actualiza el input al escribir", () => {
    render(
      <AddItemModal isOpen={true} onClose={jest.fn()} addItem={jest.fn()} />
    );

    const input = screen.getByPlaceholderText(/type the text here/i);
    fireEvent.change(input, { target: { value: "Hello" } });

    expect(input).toHaveValue("Hello");
  });

  it("click en ADD llama addItem con id generado y texto, limpia input y cierra", () => {
    const addItem = jest.fn();
    const onClose = jest.fn();
  
    render(
      <AddItemModal isOpen={true} onClose={onClose} addItem={addItem} />
    );
  
    const input = screen.getByPlaceholderText(/type the text here/i);
    fireEvent.change(input, { target: { value: "New task" } });
  
    fireEvent.click(screen.getByRole("button", { name: /^add$/i }));
  
    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem).toHaveBeenCalledWith({
      id: "mock-id",
      text: "New task",
    });
  
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("click en CANCEL llama onClose", () => {
    const onClose = jest.fn();

    render(
      <AddItemModal isOpen={true} onClose={onClose} addItem={jest.fn()} />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("click en backdrop llama onClose", () => {
    const onClose = jest.fn();

    render(
      <AddItemModal isOpen={true} onClose={onClose} addItem={jest.fn()} />
    );

    fireEvent.click(screen.getByRole("presentation"));
    expect(onClose).toHaveBeenCalled();
  });

  it("click dentro del modal NO cierra (stopPropagation)", () => {
    const onClose = jest.fn();

    render(
      <AddItemModal isOpen={true} onClose={onClose} addItem={jest.fn()} />
    );

    fireEvent.click(screen.getByText(/add item to list/i));
    expect(onClose).not.toHaveBeenCalled();
  });
});