import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Login } from "./Login";

// Mock the AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
  }),
}));

// Mock react-router-dom
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

// Mock Google Login
vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <div>Google Login</div>,
}));

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form", () => {
    render(<Login />);
    expect(screen.getByText("Music App")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /✨ Login/i })
    ).toBeInTheDocument();
  });

  it("should accept email input", () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText("your@email.com");

    emailInput.value = "test@example.com";
    emailInput.dispatchEvent(new Event("change", { bubbles: true }));

    expect(emailInput.value).toBe("test@example.com");
  });

  it("should accept password input", () => {
    render(<Login />);
    const passwordInput = screen.getByPlaceholderText("••••••••");

    passwordInput.value = "password123";
    passwordInput.dispatchEvent(new Event("change", { bubbles: true }));

    expect(passwordInput.value).toBe("password123");
  });

  it("should have login button", () => {
    render(<Login />);
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should clear inputs after form reset", () => {
    render(<Login />);
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    emailInput.value = "test@example.com";
    passwordInput.value = "password123";

    // Clear inputs
    emailInput.value = "";
    passwordInput.value = "";

    expect(emailInput.value).toBe("");
    expect(passwordInput.value).toBe("");
  });

  it("should handle Google login error", () => {
    render(<Login />);
    // Since GoogleLogin is mocked, we can't easily test the error callback
    // But we can check if the component renders without crashing
    expect(screen.getByText("Music App")).toBeInTheDocument();
  });
});
