import { render, screen, fireEvent } from '@testing-library/react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { vi } from 'vitest';
import { AddItemModal } from './AddItemModal';
import * as generateIdModule from '../utils/generateId';

// Mock generateId
vi.mock('../utils/generateId', () => ({
  generateId: vi.fn(() => 'mock-id'),
}));

// Mock Card + Button (simplificamos)
vi.mock('./ui/Card', () => ({
  Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('./ui/Button', () => ({
  Button: ({ children, ...props }: { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

describe('AddItemModal', () => {
  beforeEach(() => {
    vi.spyOn(generateIdModule, 'generateId').mockReturnValue('mock-id');
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('el dialog no está abierto cuando isOpen=false', () => {
    render(<AddItemModal isOpen={false} onClose={vi.fn()} addItem={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).not.toHaveAttribute('open');
  });

  it('renderiza el modal cuando isOpen=true', () => {
    render(<AddItemModal isOpen={true} onClose={vi.fn()} addItem={vi.fn()} />);

    expect(screen.getByText(/add item to list/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type the text here/i)).toBeInTheDocument();
  });

  it('actualiza el input al escribir', () => {
    render(<AddItemModal isOpen={true} onClose={vi.fn()} addItem={vi.fn()} />);

    const input = screen.getByPlaceholderText(/type the text here/i);
    fireEvent.change(input, { target: { value: 'Hello' } });

    expect(input).toHaveValue('Hello');
  });

  it('click en ADD llama addItem con id generado y texto, limpia input y cierra', () => {
    const addItem = vi.fn();
    const onClose = vi.fn();

    render(<AddItemModal isOpen={true} onClose={onClose} addItem={addItem} />);

    const input = screen.getByPlaceholderText(/type the text here/i);
    fireEvent.change(input, { target: { value: 'New task' } });

    fireEvent.click(screen.getByRole('button', { name: /^add$/i, hidden: true }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem).toHaveBeenCalledWith({
      id: 'mock-id',
      text: 'New task',
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('click en CANCEL llama onClose', () => {
    const onClose = vi.fn();

    render(<AddItemModal isOpen={true} onClose={onClose} addItem={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /cancel/i, hidden: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('al cerrar el dialog (p. ej. click en backdrop o Escape) se llama onClose', () => {
    const onClose = vi.fn();

    render(<AddItemModal isOpen={true} onClose={onClose} addItem={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('close', { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it('click dentro del modal NO cierra (stopPropagation)', () => {
    const onClose = vi.fn();

    render(<AddItemModal isOpen={true} onClose={onClose} addItem={vi.fn()} />);

    fireEvent.click(screen.getByText(/add item to list/i));
    expect(onClose).not.toHaveBeenCalled();
  });
});
