import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("muestra la portada publica de la municipalidad", async () => {
    render(<App />);

    expect(
      await screen.findByText("Municipalidad de Santo Domingo")
    ).toBeInTheDocument();
  });
});
