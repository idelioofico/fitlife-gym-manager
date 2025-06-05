import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Add your test assertions here based on what should be visible in your app
    expect(document.body).toBeInTheDocument();
  });
}); 