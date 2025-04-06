import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

test('renders app component', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  // Updated test to check for something that should exist in your app
  const appElement = screen.getByText(/FaithTalk/i);
  expect(appElement).toBeInTheDocument();
});
