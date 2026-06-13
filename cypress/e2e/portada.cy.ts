describe("Portada municipal", () => {
  it("muestra la identidad y los accesos principales", () => {
    cy.visit("/");
    cy.contains("h1", "Municipalidad de Santo Domingo").should("be.visible");
    cy.contains("Bienvenidos a Santo Domingo").should("be.visible");
    cy.title().should("contain", "Municipalidad de Santo Domingo");
  });

  it("permite navegar a ambos accesos de autenticacion", () => {
    cy.visit("/");
    cy.contains("Iniciar Sesión Usuario").click();
    cy.url().should("include", "/login-usuario");
    cy.contains("h2", "Iniciar Sesión").should("be.visible");

    cy.visit("/");
    cy.contains("Iniciar Sesión Funcionario").click();
    cy.url().should("include", "/login-funcionario");
    cy.contains("Correo institucional").should("be.visible");
  });
});
