const viewports = [
  { name: "movil", width: 375, height: 667 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "escritorio", width: 1440, height: 900 },
];

describe("Diseno responsive", () => {
  viewports.forEach(({ name, width, height }) => {
    it(`no presenta desbordamiento horizontal en ${name}`, () => {
      cy.viewport(width, height);
      cy.visit("/");
      cy.contains("Municipalidad de Santo Domingo").should("be.visible");
      cy.document().then((document) => {
        expect(document.documentElement.scrollWidth).to.be.at.most(
          document.documentElement.clientWidth + 1,
        );
      });
    });
  });
});
