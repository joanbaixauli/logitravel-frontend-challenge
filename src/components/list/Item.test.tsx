import { render, screen, fireEvent } from '@testing-library/react';
import { Item } from './Item';
import type { ListItem } from '../../types/list';
import { vi } from 'vitest';

const mockItem: ListItem = {
  id: '1',
  text: 'Test item',
};

describe('Item', () => {
  it('renderiza el texto correctamente', () => {
    render(<Item item={mockItem} selected={false} onClickItem={vi.fn()} onDeleteItem={vi.fn()} />);

    expect(screen.getByText('Test item')).toBeInTheDocument();
  });

  it('expone selected cuando selected=true (accesible)', () => {
    render(<Item item={mockItem} selected={true} onClickItem={vi.fn()} onDeleteItem={vi.fn()} />);

    const li = screen.getByRole('listitem');
    expect(li).toHaveAttribute('aria-selected', 'true');
    expect(li).toHaveTextContent('Test item');
  });

  it('expone no selected cuando selected=false (accesible)', () => {
    render(<Item item={mockItem} selected={false} onClickItem={vi.fn()} onDeleteItem={vi.fn()} />);

    const li = screen.getByRole('listitem');
    expect(li).toHaveAttribute('aria-selected', 'false');
  });

  it('click llama onClickItem con el id correcto', () => {
    const onClickItem = vi.fn();

    render(<Item item={mockItem} selected={false} onClickItem={onClickItem} onDeleteItem={vi.fn()} />);

    fireEvent.click(screen.getByText('Test item'));
    expect(onClickItem).toHaveBeenCalledWith('1');
  });

  it('double click llama onDeleteItem con el id correcto', () => {
    const onDeleteItem = vi.fn();

    render(<Item item={mockItem} selected={false} onClickItem={vi.fn()} onDeleteItem={onDeleteItem} />);

    fireEvent.doubleClick(screen.getByText('Test item'));
    expect(onDeleteItem).toHaveBeenCalledWith('1');
  });
});
