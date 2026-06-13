describe("Acceso y proteccion por roles", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("redirige al login correcto cuando no existe una sesion", () => {
    cy.visit("/usuario/inicio");
    cy.url().should("include", "/login-usuario");

    cy.visit("/funcionario/inicio");
    cy.url().should("include", "/login-funcionario");
  });

  it("completa el flujo de login ciudadano con una respuesta valida", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 200,
      body: {
        token: "jwt-e2e",
        usuario: {
          id: 1,
          nombre: "Usuario E2E",
          rut: "11.111.111-1",
          correo: "usuario.e2e@example.com",
          rol: "usuario",
        },
      },
    }).as("login");
    cy.intercept("GET", "**/api/solicitudes/mis-solicitudes*", {
      statusCode: 200,
      body: { ok: true, solicitudes: [] },
    });

    cy.visit("/login-usuario");
    cy.get('ion-input[type="email"] input').type("usuario.e2e@example.com");
    cy.get('ion-input[type="password"] input').type("Password123");
    cy.contains("ion-button", "Ingresar").click();
    cy.wait("@login");

    cy.url().should("include", "/usuario/inicio");
    cy.contains("Bienvenido, Usuario E2E").should("be.visible");
    cy.window().its("localStorage.token").should("eq", "jwt-e2e");
  });
});
