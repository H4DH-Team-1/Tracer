import { render, screen } from '@testing-library/react';
import App from './App';

test('there aint no time for tests buddy, this is a hackathon!', () => {
  render(<App />);
  const linkElement = screen.getByText(/We all shall fail/i);
  expect(true).toBeFalse();
});
