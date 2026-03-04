import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ItemList } from './ItemList';
import type { ListItem } from '../../types/list';

const items: ListItem[] = [
  { id: 'a', text: 'Item A' },
  { id: 'b', text: 'Item B' },
  { id: 'c', text: 'Item C' },
];

describe('ItemList', () => {
  it('renderiza todos los items', () => {
    render(<ItemList items={items} selectedIds={[]} onClickItem={vi.fn()} onDeleteItem={vi.fn()} />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });
});
