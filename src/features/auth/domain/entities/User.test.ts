import { describe, expect, it } from "vitest";

import { normalizeUserRole } from "./User";

describe("normalizeUserRole", () => {
  it("normaliza los roles admitidos por la aplicacion", () => {
    expect(normalizeUserRole(" Funcionario ")).toBe("funcionario");
    expect(normalizeUserRole("usuario")).toBe("usuario");
    expect(normalizeUserRole("CIUDADANO")).toBe("usuario");
  });

  it("rechaza roles desconocidos", () => {
    expect(() => normalizeUserRole("administrador")).toThrow(
      "rol valido",
    );
  });
});
