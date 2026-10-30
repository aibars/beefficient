import { fireEvent, render, screen } from '@testing-library/react';
import { BotonBorrar } from './BotonBorrar';

describe('BotonBorrar', () => {
  it('un clic no borra; el segundo, sobre «Confirmar», sí', () => {
    const onConfirmar = jest.fn();
    render(<BotonBorrar onConfirmar={onConfirmar}>Borrar</BotonBorrar>);
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }));
    expect(onConfirmar).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));
    expect(onConfirmar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeTruthy();
  });

  it('al salir del botón vuelve a «Borrar» sin borrar', () => {
    const onConfirmar = jest.fn();
    render(
      <BotonBorrar etiqueta="Borrar La Loma" onConfirmar={onConfirmar}>
        Borrar
      </BotonBorrar>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Borrar La Loma' }));
    fireEvent.blur(screen.getByRole('button', { name: 'Confirmar borrar La Loma' }));
    fireEvent.click(screen.getByRole('button', { name: 'Borrar La Loma' }));
    expect(onConfirmar).not.toHaveBeenCalled();
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'Confirmar borrar La Loma' }));
    expect(screen.getByRole('button', { name: 'Borrar La Loma' })).toBeTruthy();
    expect(onConfirmar).not.toHaveBeenCalled();
  });
});
