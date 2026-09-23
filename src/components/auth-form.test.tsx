import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "./auth-form";

type AuthResult = { error: { message?: string } | null };
type Credentials = { email: string; password: string };

const { signIn, signUp } = vi.hoisted(() => ({
  signIn: {
    email: vi.fn<(input: Credentials) => Promise<AuthResult>>(),
    social:
      vi.fn<
        (input: {
          provider: string;
          callbackURL: string;
        }) => Promise<AuthResult>
      >(),
  },
  signUp: {
    email:
      vi.fn<(input: Credentials & { name: string }) => Promise<AuthResult>>(),
  },
}));

vi.mock("@/lib/auth-client", () => ({ signIn, signUp }));

const defaultProps = {
  isSignUp: false,
  onToggle: vi.fn<() => void>(),
  googleEnabled: false,
  emailEnabled: false,
};

describe("AuthForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("signs in with email and password", async () => {
    signIn.email.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<AuthForm {...defaultProps} />);

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter22");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(signIn.email).toHaveBeenCalledWith({
      email: "jane@example.com",
      password: "hunter22",
    });
  });

  it("signs up with name, email and password", async () => {
    signUp.email.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<AuthForm {...defaultProps} isSignUp />);

    await user.type(screen.getByLabelText("Name"), "Jane");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "hunter22");
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(signUp.email).toHaveBeenCalledWith({
      name: "Jane",
      email: "jane@example.com",
      password: "hunter22",
    });
  });

  it("shows the error returned by the auth client", async () => {
    signIn.email.mockResolvedValue({ error: { message: "Invalid password" } });
    const user = userEvent.setup();
    render(<AuthForm {...defaultProps} />);

    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Invalid password")).toBeInTheDocument();
  });

  it("calls onToggle when switching modes", async () => {
    const onToggle = vi.fn<() => void>();
    const user = userEvent.setup();
    render(<AuthForm {...defaultProps} onToggle={onToggle} />);

    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("hides Google and password reset when disabled", () => {
    render(<AuthForm {...defaultProps} />);

    expect(
      screen.queryByRole("button", { name: "Continue with Google" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Forgot password?")).not.toBeInTheDocument();
  });

  it("links to password reset when email is enabled", () => {
    render(<AuthForm {...defaultProps} emailEnabled />);

    expect(
      screen.getByRole("link", { name: "Forgot password?" }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("signs in with Google", async () => {
    signIn.social.mockResolvedValue({ error: null });
    const user = userEvent.setup();
    render(<AuthForm {...defaultProps} googleEnabled />);

    await user.click(
      screen.getByRole("button", { name: "Continue with Google" }),
    );

    expect(signIn.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/",
    });
  });
});
