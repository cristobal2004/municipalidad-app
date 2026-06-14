const nodemailer = require("nodemailer");
const { environment } = require("../../../core/config/environment");

let transporter;

const isConfigured = () =>
  environment.email.enabled && Boolean(environment.email.host);

const getTransporter = () => {
  if (!isConfigured()) {
    return null;
  }

  if (!transporter) {
    const transportOptions = {
      host: environment.email.host,
      port: environment.email.port,
      secure: environment.email.secure,
    };

    if (environment.email.user && environment.email.password) {
      transportOptions.auth = {
        user: environment.email.user,
        pass: environment.email.password,
      };
    }

    transporter = nodemailer.createTransport(transportOptions);
  }

  return transporter;
};

const enviarCorreo = async ({ to, subject, text, html }) => {
  const smtp = getTransporter();

  if (!smtp || !to) {
    return {
      sent: false,
      reason: !to ? "missing-recipient" : "email-disabled",
    };
  }

  const info = await smtp.sendMail({
    from: environment.email.from,
    to,
    replyTo: environment.email.replyTo,
    subject,
    text,
    html,
  });

  return {
    sent: true,
    messageId: info.messageId,
  };
};

const enviarCorreoSeguro = async (message) => {
  try {
    return await enviarCorreo(message);
  } catch (error) {
    console.error("No fue posible enviar el correo:", error.message);
    return {
      sent: false,
      reason: "delivery-error",
    };
  }
};

module.exports = {
  enviarCorreo,
  enviarCorreoSeguro,
  isConfigured,
};
