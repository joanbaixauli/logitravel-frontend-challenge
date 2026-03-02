import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

// Mock CSS module
jest.mock("./Button.module.css", () => ({
  button: "button",
  primary: "primary",
  secondary: "secondary",
}));

describe("Button", () => {
  it("renderiza el contenido (children)", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("usa variant primary por defecto", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button", { name: "Default" });

    expect(btn).toHaveClass("button");
    expect(btn).toHaveClass("primary");
  });

  it("usa variant secondary cuando se especifica", () => {
    render(<Button variant="secondary">Sec</Button>);
    const btn = screen.getByRole("button", { name: "Sec" });

    expect(btn).toHaveClass("secondary");
  });

  it("propaga props HTML como onClick", () => {
    const onClick = jest.fn();

    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Click" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("respeta disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button", { name: "Disabled" });

    expect(btn).toBeDisabled();
  });
});