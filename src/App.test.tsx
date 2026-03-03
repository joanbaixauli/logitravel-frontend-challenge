import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { useList } from './hooks/useList';
import { vi, type Mock } from 'vitest';

// 1) Mock del hook useList (lo controlamos por test)
vi.mock('./hooks/useList', () => ({
  useList: vi.fn(),
}));

// 2) Mock del icono (para que no moleste en DOM)
vi.mock('lucide-react', () => ({
  RotateCcw: (props: React.SVGProps<SVGSVGElement>) => <svg aria-hidden {...props} />,
}));

// 3) Mock de Card y Button para simplificar
vi.mock('./components/ui/Card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./components/ui/Button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  } & Record<string, unknown>) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

// 4) Mock de ItemList: expone botones para disparar callbacks
vi.mock('./components/list/ItemList', () => ({
  ItemList: ({
    items,
    onClickItem,
    onDeleteItem,
  }: {
    items: { id: string }[];
    onClickItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
  }) => (
    <div role="list">
      {items.map((it) => (
        <div key={it.id}>
          <button onClick={() => onClickItem(it.id)}>toggle-{it.id}</button>
          <button onClick={() => onDeleteItem(it.id)}>delete-{it.id}</button>
        </div>
      ))}
    </div>
  ),
}));

// 5) Mock de AddItemModal: render condicional + botón cerrar + botón addItem
vi.mock('./components/AddItemModal', () => ({
  AddItemModal: ({
    isOpen,
    onClose,
    addItem,
  }: {
    isOpen: boolean;
    onClose: () => void;
    addItem: (item: { id: string; name: string }) => void;
  }) =>
    isOpen ? (
      <div role="dialog" aria-modal="true">
        <p>Modal Open</p>
        <button onClick={onClose}>close-modal</button>
        <button onClick={() => addItem({ id: 'new', name: 'New Item' })}>add-item</button>
      </div>
    ) : null,
}));

type UseListReturn = {
  items: Array<{ id: string; name?: string }>;
  selectedIds: string[];
  canUndo: boolean;
  setSelectedIds: Mock;
  addItem: Mock;
  removeItem: Mock;
  removeItems: Mock;
  undo: Mock;
};

function mockUseList(overrides: Partial<UseListReturn> = {}) {
  const base: UseListReturn = {
    items: [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ],
    selectedIds: [],
    canUndo: false,
    setSelectedIds: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn(),
    removeItems: vi.fn(),
    undo: vi.fn(),
  };

  (useList as Mock).mockReturnValue({ ...base, ...overrides });
  return { ...base, ...overrides };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza el título y la descripción', () => {
    mockUseList();
    render(<App />);

    expect(screen.getByRole('heading', { name: /this is a technical proof/i })).toBeInTheDocument();

    expect(screen.getByText(/lorem ipsum/i)).toBeInTheDocument();
  });

  it('botón UNDO deshabilitado cuando canUndo=false', () => {
    mockUseList({ canUndo: false });
    render(<App />);

    expect(screen.getByRole('button', { name: /undo/i })).toBeDisabled();
  });

  it('click en UNDO llama a undo() cuando canUndo=true', () => {
    const undo = vi.fn();
    mockUseList({ canUndo: true, undo });

    render(<App />);

    const undoButton = screen.getByRole('button', { name: /undo/i });
    expect(undoButton).not.toBeDisabled();

    fireEvent.click(undoButton);
    expect(undo).toHaveBeenCalledTimes(1);
  });

  it('botón DELETE deshabilitado cuando no hay seleccionados', () => {
    mockUseList({ selectedIds: [] });
    render(<App />);

    expect(screen.getByRole('button', { name: /^delete$/i })).toBeDisabled();
  });

  it('click en DELETE llama removeItems(selectedIds) cuando hay seleccionados', () => {
    const removeItems = vi.fn();
    mockUseList({ selectedIds: ['a', 'b'], removeItems });

    render(<App />);

    const deleteButton = screen.getByRole('button', { name: /^delete$/i });
    expect(deleteButton).not.toBeDisabled();

    fireEvent.click(deleteButton);
    expect(removeItems).toHaveBeenCalledTimes(1);
    expect(removeItems).toHaveBeenCalledWith(['a', 'b']);
  });

  it('click en ADD abre el modal y close lo cierra', () => {
    mockUseList();
    render(<App />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close-modal/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('click en un item NO seleccionado añade su id (setSelectedIds([...selectedIds, id]))', () => {
    const setSelectedIds = vi.fn();
    mockUseList({ selectedIds: [], setSelectedIds });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'toggle-a' }));
    expect(setSelectedIds).toHaveBeenCalledTimes(1);
    expect(setSelectedIds).toHaveBeenCalledWith(['a']);
  });

  it('click en un item YA seleccionado lo quita (setSelectedIds(selectedIds.filter...))', () => {
    const setSelectedIds = vi.fn();
    mockUseList({ selectedIds: ['a', 'b'], setSelectedIds });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'toggle-a' }));
    expect(setSelectedIds).toHaveBeenCalledTimes(1);
    expect(setSelectedIds).toHaveBeenCalledWith(['b']);
  });

  it('onDeleteItem(id) llama removeItem(id)', () => {
    const removeItem = vi.fn();
    mockUseList({ removeItem });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'delete-b' }));
    expect(removeItem).toHaveBeenCalledTimes(1);
    expect(removeItem).toHaveBeenCalledWith('b');
  });

  it('desde el modal se llama addItem(...) cuando está abierto', () => {
    const addItem = vi.fn();
    mockUseList({ addItem });

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /add/i }));
    fireEvent.click(screen.getByRole('button', { name: /add-item/i }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem).toHaveBeenCalledWith({ id: 'new', name: 'New Item' });
  });
});
