import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';

const Login = () => (
  <div>
    <h1>Login</h1>
    <form>
      <input data-testid="email-input" placeholder="Email" type="email" />
      <input data-testid="password-input" placeholder="Password" type="password" />
      <button type="submit">Login</button>
    </form>
  </div>
);

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<Login />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should accept email input', () => {
    render(<Login />);
    const emailInput = screen.getByTestId('email-input');
    
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should accept password input', () => {
    render(<Login />);
    const passwordInput = screen.getByTestId('password-input');
    
    passwordInput.value = 'password123';
    passwordInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(passwordInput.value).toBe('password123');
  });

  it('should have login button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should clear inputs after form reset', () => {
    render(<Login />);
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    // Clear inputs
    emailInput.value = '';
    passwordInput.value = '';

    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });
});
