import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza el contenido (children)', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('propaga props HTML como onClick', () => {
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Click' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('respeta disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button', { name: 'Disabled' });

    expect(btn).toBeDisabled();
  });
});
