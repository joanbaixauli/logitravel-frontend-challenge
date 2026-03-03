import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ItemList } from './ItemList';
import type { ListItem } from '../../types/list';

type ItemProps = {
  item: ListItem;
  selected: boolean;
  onClickItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
};

// Mock del componente Item para inspeccionar props
const mockItemComponent = vi.fn();

vi.mock('./Item', () => ({
  Item: (props: ItemProps) => {
    mockItemComponent(props);
    return <li>{props.item.text}</li>;
  },
}));

const items: ListItem[] = [
  { id: 'a', text: 'Item A' },
  { id: 'b', text: 'Item B' },
  { id: 'c', text: 'Item C' },
];

describe('ItemList', () => {
  beforeEach(() => {
    mockItemComponent.mockClear();
  });

  it('renderiza todos los items', () => {
    render(<ItemList items={items} selectedIds={[]} onClickItem={vi.fn()} onDeleteItem={vi.fn()} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it('marca selected correctamente según selectedIds', () => {
    render(<ItemList items={items} selectedIds={['b']} onClickItem={vi.fn()} onDeleteItem={vi.fn()} />);

    // El mock guarda todas las llamadas a <Item />
    const propsB = mockItemComponent.mock.calls.find(([props]) => props.item.id === 'b')![0];
    const propsA = mockItemComponent.mock.calls.find(([props]) => props.item.id === 'a')![0];

    expect(propsB.selected).toBe(true);
    expect(propsA.selected).toBe(false);
  });

  it('pasa correctamente los callbacks', () => {
    const onClickItem = vi.fn();
    const onDeleteItem = vi.fn();

    render(<ItemList items={items} selectedIds={[]} onClickItem={onClickItem} onDeleteItem={onDeleteItem} />);

    const firstCallProps = mockItemComponent.mock.calls[0][0];

    expect(firstCallProps.onClickItem).toBe(onClickItem);
    expect(firstCallProps.onDeleteItem).toBe(onDeleteItem);
  });
});
