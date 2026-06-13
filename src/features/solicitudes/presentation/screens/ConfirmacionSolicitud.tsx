import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  addCircleOutline,
  arrowForwardOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  folderOpenOutline,
  homeOutline,
  listOutline,
  logOutOutline,
  mailOutline,
  notificationsOutline,
  personCircleOutline,
  syncOutline,
  timeOutline,
} from "ionicons/icons";

import { useLatestCallback } from "../../../../core/presentation/hooks/useLatestCallback";
import type { Solicitud } from "../../domain/entities/Solicitud";
import { solicitudesService } from "../../data/local/solicitudesLocalService";
import { authService } from "../../../auth/composition/authService";
import "./ConfirmacionSolicitud.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  email?: string;
  rol?: string;
}

interface FuncionarioMunicipal {
  id: string;
  nombre: string;
  numeroEmpleado: string;
  password: string;
  area: string;
  cargo: string;
}

const funcionariosDisponibles: FuncionarioMunicipal[] = [
  {
    id: "FUN-001",
    nombre: "Cristian Mejías",
    numeroEmpleado: "12345678",
    password: "admin123",
    area: "Atención General",
    cargo: "Funcionario Municipal",
  },
  {
    id: "FUN-002",
    nombre: "Benjamin Gomez",
    numeroEmpleado: "87654321",
    password: "funcionario123",
    area: "Servicio Ciudadano",
    cargo: "Ejecutivo de Atención",
  },
  {
    id: "FUN-003",
    nombre: "Oscar Ruiz",
    numeroEmpleado: "11223344",
    password: "finanzas123",
    area: "Finanzas",
    cargo: "Analista Municipal",
  },
  {
    id: "FUN-004",
    nombre: "Pablo Aguilera",
    numeroEmpleado: "44556677",
    password: "obras123",
    area: "Obras Municipales",
    cargo: "Revisor Técnico",
  },
  {
    id: "FUN-005",
    nombre: "Martina Ponce",
    numeroEmpleado: "99887766",
    password: "patentes123",
    area: "Patentes Comerciales",
    cargo: "Encargada de Patentes",
  },
];

const solicitudDemo = {
  id: "SOL-2026-0001",
  codigo: "SOL-2026-0001",
  tramite: "Patente Comercial",
  estado: "Ingresada",
  area: "Patentes Comerciales",
  encargado: "Martina Ponce",
  funcionario: "Martina Ponce",
  asignadoA: "Martina Ponce",
  funcionarioAsignado: "Martina Ponce",
  fechaIngreso: "18/04/2026 10:24",
};

const ConfirmacionSolicitud: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Usuario",
    correo: "usuario@email.com",
    rol: "usuario",
  });

  const [solicitud, setSolicitud] = useState<any>(solicitudDemo);

  const obtenerValor = (objeto: any, campo: string, respaldo = "") => {
    return objeto?.[campo] || respaldo;
  };

  const normalizarTexto = (texto: string) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const funcionarioExiste = (nombre: string) => {
    return funcionariosDisponibles.some(
      (funcionario) =>
        normalizarTexto(funcionario.nombre) === normalizarTexto(nombre)
    );
  };

  const obtenerFuncionarioPorNombre = (nombre: string) => {
    return funcionariosDisponibles.find(
      (funcionario) =>
        normalizarTexto(funcionario.nombre) === normalizarTexto(nombre)
    );
  };

  const obtenerFuncionarioPorArea = (area: string, idSolicitud = "") => {
    const areaNormalizada = normalizarTexto(area);

    const funcionarioArea = funcionariosDisponibles.find((funcionario) => {
      const areaFuncionario = normalizarTexto(funcionario.area);

      return (
        areaNormalizada.includes(areaFuncionario) ||
        areaFuncionario.includes(areaNormalizada)
      );
    });

    if (funcionarioArea) return funcionarioArea;

    const numero =
      idSolicitud
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      funcionariosDisponibles.length;

    return funcionariosDisponibles[numero] || funcionariosDisponibles[0];
  };

  const obtenerUsuarioActual = (): UsuarioActual => {
    const posiblesKeys = [
      "usuario_actual",
      "usuarioActual",
      "current_user",
      "usuarioLogueado",
      "sesion_usuario",
      "ciudadano_actual",
      "ciudadanoActual",
      "current_ciudadano",
    ];

    for (const key of posiblesKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const usuario = JSON.parse(raw);

        const nombre =
          usuario.nombre ||
          usuario.name ||
          usuario.usuario ||
          usuario.nombreCompleto ||
          usuario.fullName ||
          "";

        if (nombre && String(nombre).trim() !== "") {
          return {
            nombre,
            correo: usuario.correo || usuario.email || usuario.mail || "",
            email: usuario.email || usuario.correo || usuario.mail || "",
            rol: usuario.rol || usuario.role || "usuario",
          };
        }
      } catch {
        if (raw.trim() !== "") {
          return {
            nombre: raw,
            correo: "",
            rol: "usuario",
          };
        }
      }
    }

    return {
      nombre: "Usuario",
      correo: "usuario@email.com",
      rol: "usuario",
    };
  };

  const obtenerIniciales = (nombre: string) => {
    const partes = nombre.trim().split(" ").filter(Boolean);

    if (partes.length === 0) return "US";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  };

  const obtenerIdSolicitud = (item: any) => {
    return (
      obtenerValor(item, "codigo") ||
      obtenerValor(item, "id") ||
      obtenerValor(item, "solicitudId") ||
      "SOL-2026-0001"
    );
  };

  const obtenerTramite = (item: any) => {
    return (
      obtenerValor(item, "tramite") ||
      obtenerValor(item, "tipoTramite") ||
      obtenerValor(item, "tipoPatente") ||
      "Patente Comercial"
    );
  };

  const obtenerEstado = (item: any) => {
    return obtenerValor(item, "estado", "Ingresada");
  };

  const obtenerArea = (item: any) => {
    return (
      obtenerValor(item, "area") ||
      obtenerValor(item, "departamento") ||
      obtenerValor(item, "areaResponsable") ||
      "Atención General"
    );
  };

  const obtenerEncargadoValido = (item: any) => {
    const encargadoGuardado =
      obtenerValor(item, "encargado") ||
      obtenerValor(item, "funcionario") ||
      obtenerValor(item, "asignadoA") ||
      obtenerValor(item, "funcionarioAsignado") ||
      "";

    if (encargadoGuardado && funcionarioExiste(encargadoGuardado)) {
      return encargadoGuardado;
    }

    const areaSolicitud = obtenerArea(item);
    const idSolicitud = obtenerIdSolicitud(item);

    return obtenerFuncionarioPorArea(areaSolicitud, idSolicitud).nombre;
  };

  const obtenerFuncionarioAsignado = (item: any) => {
    const encargado = obtenerEncargadoValido(item);

    return (
      obtenerFuncionarioPorNombre(encargado) ||
      obtenerFuncionarioPorArea(obtenerArea(item), obtenerIdSolicitud(item))
    );
  };

  const obtenerFecha = (item: any) => {
    return (
      obtenerValor(item, "fechaIngreso") ||
      obtenerValor(item, "fecha") ||
      obtenerValor(item, "createdAt") ||
      "18/04/2026 10:24"
    );
  };

  const obtenerCorreoUsuario = (usuario: UsuarioActual) => {
    return (
      usuario.correo ||
      usuario.email ||
      localStorage.getItem("correo_usuario") ||
      "usuario@email.com"
    );
  };

  const corregirSolicitudConFuncionarioValido = (solicitudActual: any) => {
    const funcionarioAsignado = obtenerFuncionarioAsignado(solicitudActual);

    return {
      ...solicitudActual,
      area:
        obtenerArea(solicitudActual) ||
        funcionarioAsignado.area ||
        "Atención General",
      encargado: funcionarioAsignado.nombre,
      funcionario: funcionarioAsignado.nombre,
      asignadoA: funcionarioAsignado.nombre,
      funcionarioAsignado: funcionarioAsignado.nombre,
      funcionarioId: funcionarioAsignado.id,
      cargoFuncionario: funcionarioAsignado.cargo,
      numeroEmpleadoFuncionario: funcionarioAsignado.numeroEmpleado,
    };
  };

  const guardarSolicitudCorregida = (solicitudCorregida: any) => {
    const idSolicitud = obtenerIdSolicitud(solicitudCorregida);

    let solicitudesGuardadas: any[] = [];

    try {
      const raw = localStorage.getItem("solicitudes");
      const data = raw ? JSON.parse(raw) : [];
      solicitudesGuardadas = Array.isArray(data) ? data : [];
    } catch {
      solicitudesGuardadas = [];
    }

    const existe = solicitudesGuardadas.some((item) => {
      return (
        item?.id === idSolicitud ||
        item?.codigo === idSolicitud ||
        item?.solicitudId === idSolicitud
      );
    });

    const actualizadas = existe
      ? solicitudesGuardadas.map((item) => {
          const idItem =
            item?.codigo || item?.id || item?.solicitudId || "SIN-ID";

          return idItem === idSolicitud ? solicitudCorregida : item;
        })
      : [solicitudCorregida, ...solicitudesGuardadas];

    localStorage.setItem("solicitudes", JSON.stringify(actualizadas));
    localStorage.setItem(
      "ultima_solicitud_creada",
      JSON.stringify(solicitudCorregida)
    );
    localStorage.setItem(
      "ultimaSolicitudCreada",
      JSON.stringify(solicitudCorregida)
    );
    localStorage.setItem(
      "solicitud_confirmada",
      JSON.stringify(solicitudCorregida)
    );
    localStorage.setItem(
      "solicitudConfirmada",
      JSON.stringify(solicitudCorregida)
    );
    localStorage.setItem("ultimaSolicitudId", idSolicitud);

    window.dispatchEvent(new Event("solicitudesActualizadas"));
  };

  const obtenerUltimaSolicitud = () => {
    const keysSolicitud = [
      "ultima_solicitud_creada",
      "ultimaSolicitudCreada",
      "solicitud_confirmada",
      "solicitudConfirmada",
      "ultima_solicitud",
      "ultimaSolicitud",
    ];

    for (const key of keysSolicitud) {
      const raw = localStorage.getItem(key);

      if (!raw) continue;

      try {
        const data = JSON.parse(raw);

        if (data && typeof data === "object") {
          return corregirSolicitudConFuncionarioValido(data);
        }
      } catch {
        continue;
      }
    }

    const ultimoId =
      localStorage.getItem("ultimaSolicitudId") ||
      localStorage.getItem("ultimo_id_solicitud") ||
      localStorage.getItem("solicitudIdConfirmada") ||
      "";

    let solicitudes: Solicitud[] = [];

    try {
      solicitudes = solicitudesService.obtenerSolicitudes();
    } catch {
      solicitudes = [];
    }

    if (!Array.isArray(solicitudes) || solicitudes.length === 0) {
      try {
        const raw = localStorage.getItem("solicitudes");
        const parseadas = raw ? JSON.parse(raw) : [];
        solicitudes = Array.isArray(parseadas) ? parseadas : [];
      } catch {
        solicitudes = [];
      }
    }

    if (solicitudes.length > 0) {
      if (ultimoId) {
        const encontrada = solicitudes.find((item: any) => {
          return (
            item.id === ultimoId ||
            item.codigo === ultimoId ||
            item.solicitudId === ultimoId
          );
        });

        if (encontrada) {
          return corregirSolicitudConFuncionarioValido(encontrada);
        }
      }

      return corregirSolicitudConFuncionarioValido(solicitudes[0]);
    }

    return corregirSolicitudConFuncionarioValido(solicitudDemo);
  };

  const crearNotificacionUsuario = (
    solicitudActual: any,
    usuario: UsuarioActual
  ) => {
    const idSolicitud = obtenerIdSolicitud(solicitudActual);

    const nuevaNotificacion = {
      id: `NU-CONF-${idSolicitud}`,
      titulo: "Solicitud ingresada correctamente",
      mensaje: `Tu solicitud ${idSolicitud} fue registrada en el sistema municipal.`,
      fecha: obtenerFecha(solicitudActual),
      leida: false,
      tipo: "tramite",
      solicitudId: idSolicitud,
      accionTexto: "Ver seguimiento",
      usuario: usuario.nombre || "Usuario",
    };

    let notificacionesUsuario: any[] = [];

    try {
      const raw = localStorage.getItem("notificaciones_usuario");
      const data = raw ? JSON.parse(raw) : [];
      notificacionesUsuario = Array.isArray(data) ? data : [];
    } catch {
      notificacionesUsuario = [];
    }

    const existe = notificacionesUsuario.some(
      (notificacion) => notificacion.id === nuevaNotificacion.id
    );

    if (!existe) {
      const actualizadas = [nuevaNotificacion, ...notificacionesUsuario];

      localStorage.setItem(
        "notificaciones_usuario",
        JSON.stringify(actualizadas)
      );

      window.dispatchEvent(new Event("notificacionesUsuarioActualizadas"));
    }
  };

  const inicializarConfirmacion = useLatestCallback(() => {
    const usuario = obtenerUsuarioActual();
    const solicitudActual = obtenerUltimaSolicitud();
    const solicitudCorregida =
      corregirSolicitudConFuncionarioValido(solicitudActual);

    setUsuarioActual(usuario);
    setSolicitud(solicitudCorregida);

    guardarSolicitudCorregida(solicitudCorregida);
    crearNotificacionUsuario(solicitudCorregida, usuario);

    window.dispatchEvent(new Event("solicitudesActualizadas"));
  });

  useEffect(() => {
    inicializarConfirmacion();
  }, [inicializarConfirmacion]);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const irSeguimiento = () => {
    history.push(`/usuario/solicitud/${obtenerIdSolicitud(solicitud)}`);
  };

  const irMisTramites = () => {
    history.push("/usuario/mis-tramites");
  };

  const crearOtroTramite = () => {
    history.push("/usuario/seleccionar-tramite");
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="confirmacion-content">
        <div className="confirmacion-wrapper">
          <header className="confirmacion-header">
            <div className="confirmacion-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />

              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>

            <div className="confirmacion-user-area">
              <div className="confirmacion-user-avatar">
                {obtenerIniciales(usuarioActual.nombre || "Usuario")}
              </div>

              <div>
                <strong>{usuarioActual.nombre || "Usuario"}</strong>
                <small>Usuario ciudadano</small>
              </div>

              <button type="button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="confirmacion-main">
            <section className="confirmacion-hero">
              <div className="confirmacion-success-icon">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>

              <h2>Solicitud enviada correctamente</h2>

              <p>
                Hemos registrado tu solicitud en el sistema municipal. Ahora
                puedes revisar su avance desde Mis trámites o Ver seguimiento.
              </p>
            </section>

            <section className="confirmacion-card resumen-card">
              <h3>Resumen de tu solicitud</h3>

              <div className="resumen-grid">
                <article>
                  <div className="resumen-icon blue">
                    <IonIcon icon={documentTextOutline} />
                  </div>

                  <div>
                    <span>ID solicitud</span>
                    <strong>{obtenerIdSolicitud(solicitud)}</strong>
                  </div>
                </article>

                <article>
                  <div className="resumen-icon green">
                    <IonIcon icon={timeOutline} />
                  </div>

                  <div>
                    <span>Estado inicial</span>
                    <strong className="estado-ingresada">
                      {obtenerEstado(solicitud)}
                    </strong>
                  </div>
                </article>

                <article>
                  <div className="resumen-icon blue">
                    <IonIcon icon={folderOpenOutline} />
                  </div>

                  <div>
                    <span>Trámite</span>
                    <strong>{obtenerTramite(solicitud)}</strong>
                  </div>
                </article>

                <article>
                  <div className="resumen-icon purple">
                    <IonIcon icon={businessOutline} />
                  </div>

                  <div>
                    <span>Área responsable</span>
                    <strong>{obtenerArea(solicitud)}</strong>
                  </div>
                </article>

                <article>
                  <div className="resumen-icon blue">
                    <IonIcon icon={calendarOutline} />
                  </div>

                  <div>
                    <span>Fecha de ingreso</span>
                    <strong>{obtenerFecha(solicitud)}</strong>
                  </div>
                </article>

                <article>
                  <div className="resumen-icon orange">
                    <IonIcon icon={personCircleOutline} />
                  </div>

                  <div>
                    <span>Funcionario asignado</span>
                    <strong>{obtenerEncargadoValido(solicitud)}</strong>
                  </div>
                </article>
              </div>
            </section>

            <section className="confirmacion-card pasos-card">
              <h3>Próximos pasos</h3>

              <div className="pasos-grid">
                <article>
                  <span>1</span>

                  <div className="paso-icon blue">
                    <IonIcon icon={documentTextOutline} />
                  </div>

                  <div>
                    <strong>Revisaremos tu solicitud</strong>
                    <p>Validaremos la información y documentos ingresados.</p>
                  </div>

                  <IonIcon className="paso-arrow" icon={arrowForwardOutline} />
                </article>

                <article>
                  <span>2</span>

                  <div className="paso-icon purple">
                    <IonIcon icon={folderOpenOutline} />
                  </div>

                  <div>
                    <strong>Podríamos solicitar documentos</strong>
                    <p>Te notificaremos si necesitamos más información.</p>
                  </div>

                  <IonIcon className="paso-arrow" icon={arrowForwardOutline} />
                </article>

                <article>
                  <span>3</span>

                  <div className="paso-icon orange">
                    <IonIcon icon={notificationsOutline} />
                  </div>

                  <div>
                    <strong>Te notificaremos cada cambio</strong>
                    <p>Recibirás actualizaciones en Notificaciones.</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="confirmacion-card seguimiento-card">
              <h3>Seguimiento inicial de tu solicitud</h3>

              <div className="seguimiento-linea">
                <div className="seguimiento-step completado">
                  <div>
                    <IonIcon icon={checkmarkCircleOutline} />
                  </div>
                  <strong>Ingresada</strong>
                  <span>{obtenerFecha(solicitud)}</span>
                </div>

                <div className="seguimiento-step activo">
                  <div></div>
                  <strong>En revisión</strong>
                  <span>Actual</span>
                </div>

                <div className="seguimiento-step">
                  <div></div>
                  <strong>Documentos pendientes</strong>
                  <span>Por confirmar</span>
                </div>

                <div className="seguimiento-step">
                  <div></div>
                  <strong>Finalizada</strong>
                  <span>Pendiente</span>
                </div>
              </div>

              <div className="confirmacion-sync">
                <span></span>
                <IonIcon icon={syncOutline} />
                Actualizado en tiempo real
              </div>
            </section>

            <section className="confirmacion-actions">
              <button type="button" className="primary" onClick={irSeguimiento}>
                <IonIcon icon={arrowForwardOutline} />
                Ver seguimiento
              </button>

              <button type="button" onClick={irMisTramites}>
                <IonIcon icon={listOutline} />
                Ir a mis trámites
              </button>

              <button type="button" onClick={crearOtroTramite}>
                <IonIcon icon={addCircleOutline} />
                Crear otro trámite
              </button>
            </section>

            <section className="confirmacion-email-box">
              <IonIcon icon={mailOutline} />

              <p>
                {obtenerValor(solicitud, "correoEnviado")
                  ? "Hemos enviado una confirmación a"
                  : "La solicitud quedó registrada. Cuando el correo saliente esté configurado, enviaremos confirmaciones a"}{" "}
                <strong>{obtenerCorreoUsuario(usuarioActual)}</strong>. También
                puedes revisar el avance de tu trámite en{" "}
                <button
                  type="button"
                  onClick={() => history.push("/usuario/notificaciones")}
                >
                  Notificaciones
                </button>
                .
              </p>
            </section>

            <section className="confirmacion-bottom-actions">
              <button
                type="button"
                onClick={() => history.push("/usuario/inicio")}
              >
                <IonIcon icon={homeOutline} />
                Volver al inicio
              </button>
            </section>
          </main>

          <footer className="confirmacion-footer">
            <span>© 2026 Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ConfirmacionSolicitud;
