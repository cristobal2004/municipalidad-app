const escaparHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const layout = (title, content) => `
<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f3f6f9;font-family:Arial,sans-serif;color:#17324d">
    <div style="max-width:620px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden">
      <div style="padding:22px;background:#0068a8;color:#fff">
        <strong>Municipalidad de Santo Domingo</strong>
        <h1 style="margin:8px 0 0;font-size:22px">${escaparHtml(title)}</h1>
      </div>
      <div style="padding:24px;line-height:1.55">${content}</div>
      <div style="padding:16px 24px;background:#eef5f9;font-size:12px;color:#516779">
        Este es un mensaje automático de la Oficina Virtual Municipal.
      </div>
    </div>
  </body>
</html>`;

const solicitudCreadaTemplate = (solicitud) => ({
  subject: `Solicitud ${solicitud.codigo} recibida`,
  text: `Recibimos tu solicitud ${solicitud.codigo} de ${solicitud.tipoTramite}.`,
  html: layout(
    "Solicitud recibida",
    `<p>Hola ${escaparHtml(solicitud.usuarioNombre || "ciudadano/a")},</p>
     <p>Recibimos correctamente tu solicitud.</p>
     <p><strong>Código:</strong> ${escaparHtml(solicitud.codigo)}<br>
     <strong>Trámite:</strong> ${escaparHtml(solicitud.tipoTramite)}<br>
     <strong>Área responsable:</strong> ${escaparHtml(solicitud.areaResponsable)}</p>
     <p>Podrás revisar su avance desde la Oficina Virtual.</p>`,
  ),
});

const solicitudAsignadaTemplate = (solicitud) => ({
  subject: `Nueva solicitud asignada: ${solicitud.codigo}`,
  text: `Se asignó la solicitud ${solicitud.codigo} de ${solicitud.tipoTramite}.`,
  html: layout(
    "Nueva solicitud asignada",
    `<p>Se asignó una nueva solicitud a tu bandeja municipal.</p>
     <p><strong>Código:</strong> ${escaparHtml(solicitud.codigo)}<br>
     <strong>Trámite:</strong> ${escaparHtml(solicitud.tipoTramite)}<br>
     <strong>Solicitante:</strong> ${escaparHtml(solicitud.usuarioNombre)}</p>`,
  ),
});

const solicitudActualizadaTemplate = (solicitud) => ({
  subject: `Actualización de solicitud ${solicitud.codigo}`,
  text: `Tu solicitud ${solicitud.codigo} cambió al estado ${solicitud.estado}.`,
  html: layout(
    "Tu solicitud fue actualizada",
    `<p>La solicitud <strong>${escaparHtml(solicitud.codigo)}</strong> ahora está en estado:</p>
     <p style="font-size:18px"><strong>${escaparHtml(solicitud.estado)}</strong></p>
     ${
       solicitud.comentarioFuncionario
         ? `<p><strong>Observación:</strong> ${escaparHtml(solicitud.comentarioFuncionario)}</p>`
         : ""
     }`,
  ),
});

const citaTemplate = (agendamiento, action = "agendada") => ({
  subject: `Cita ${action}: ${agendamiento.codigoSolicitud}`,
  text: `Tu cita fue ${action} para ${agendamiento.fechaFormateada}.`,
  html: layout(
    `Cita ${action}`,
    `<p>La cita asociada a la solicitud <strong>${escaparHtml(
      agendamiento.codigoSolicitud,
    )}</strong> fue ${escaparHtml(action)}.</p>
     <p><strong>Fecha y hora:</strong> ${escaparHtml(
       agendamiento.fechaFormateada,
     )}<br>
     <strong>Funcionario:</strong> ${escaparHtml(
       agendamiento.funcionarioNombre,
     )}</p>`,
  ),
});

module.exports = {
  citaTemplate,
  solicitudActualizadaTemplate,
  solicitudAsignadaTemplate,
  solicitudCreadaTemplate,
};
