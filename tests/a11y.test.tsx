import { describe, expect, it, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MemoryRouter } from 'react-router-dom';
import Help from '../src/pages/Help';

expect.extend(toHaveNoViolations);

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }

  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

afterEach(() => {
  cleanup();
});

describe('Accesibilidad', () => {
  it('La página de ayuda no presenta violaciones críticas', async () => {
    const { container } = render(
      <MemoryRouter>
        <Help />
      </MemoryRouter>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
