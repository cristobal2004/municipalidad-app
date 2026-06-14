describe("integración real con la API y el correo", () => {
  const apiUrl = Cypress.env("apiUrl") || "http://localhost:3000/api";
  const mailpitUrl = Cypress.env("mailpitUrl") || "http://localhost:8025";
  const identificadorUsuario = Date.now().toString().slice(-8);
  const correoPrueba = `cypress.${identificadorUsuario}@test.cl`;
  const rutPrueba = `99${identificadorUsuario}`;
  let token = "";
  let codigoSolicitud = "";

  before(() => {
    cy.request("POST", `${apiUrl}/auth/register`, {
      nombre: "Ciudadano Cypress",
      rut: rutPrueba,
      correo: correoPrueba,
      password: "Cypress123",
      region: "Valparaiso",
      comuna: "Santo Domingo",
      tipoUsuario: "ciudadano",
    }).then((response) => {
      expect(response.status).to.equal(201);
      token = response.body.token;
    });
  });

  after(() => {
    if (!codigoSolicitud || !token) return;

    cy.request({
      method: "DELETE",
      url: `${apiUrl}/solicitudes/${codigoSolicitud}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      failOnStatusCode: false,
    });
  });

  it("crea, consulta y elimina una solicitud persistida", () => {
    const identificador = Date.now().toString().slice(-6);

    cy.request({
      method: "POST",
      url: `${apiUrl}/solicitudes`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        tipoTramite: "Permiso de circulación",
        rut: rutPrueba,
        correoContacto: correoPrueba,
        telefonoContacto: "+56911111111",
        observacionesSolicitante: "Prueba automática de integración.",
        datosTramite: {
          rut: rutPrueba,
          patenteVehiculo: `CI${identificador}`,
          marca: "Toyota",
          modelo: "Corolla",
          anio: "2024",
          tipoVehiculo: "Automóvil",
          domicilio: "Santo Domingo",
        },
      },
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.ok).to.equal(true);
      expect(response.body.solicitud.tipoTramite).to.equal(
        "Permiso de circulación",
      );
      codigoSolicitud = response.body.solicitud.codigo;
    });

    cy.then(() =>
      cy.request({
        method: "GET",
        url: `${apiUrl}/solicitudes/${codigoSolicitud}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.solicitud.codigo).to.equal(codigoSolicitud);
      expect(response.body.solicitud.historial)
        .to.be.an("array")
        .and.have.length.greaterThan(0);
    });

    cy.request(`${mailpitUrl}/api/v1/messages`).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.total).to.be.greaterThan(0);
    });
  });
});
