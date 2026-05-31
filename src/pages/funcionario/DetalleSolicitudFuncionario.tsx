import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import {
  arrowBackOutline,
  businessOutline,
  calendarOutline,
  chatboxEllipsesOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  chevronUpOutline,
  closeCircleOutline,
  cloudDownloadOutline,
  documentAttachOutline,
  documentTextOutline,
  homeOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  personOutline,
  refreshOutline,
  saveOutline,
  sendOutline,
  swapHorizontalOutline,
  timeOutline,
  warningOutline,
} from "ionicons/icons";

import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import "./DetalleSolicitudFuncionario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rol?: string;
}

interface DocumentoAdjunto {
  nombre: string;
  tipo: string;
  tamano: string;
  fecha: string;
  autor: string;
}

interface EventoHistorial {
  titulo: string;
  descripcion: string;
  fecha: string;
  autor: string;
  tipo: "ingreso" | "asignacion" | "estado" | "comentario" | "documentos";
}

const documentosDisponibles = [
  "Cédula de identidad",
  "Certificado de residencia",
  "Patente anterior",
  "Croquis del local",
  "Fotografía del local",
  "Certificado de cumplimiento tributario",
];

const DetalleSolicitudFuncionario: React.FC = () => {
  const history = useHistory();
  const params = useParams<{ id?: string; solicitudId?: string }>();
  const idParametro = params.id || params.solicitudId || "";

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Funcionario",
    correo: "",
    rol: "funcionario",
  });

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("En revisión");
  const [observacionInterna, setObservacionInterna] = useState("");
  const [fechaLimite, setFechaLimite] = useState("2026-05-27");
  const [mostrarDocumentosRequeridos, setMostrarDocumentosRequeridos] =
    useState(false);
  const [documentosRequeridos, setDocumentosRequeridos] = useState<
    Record<string, boolean>
  >({});
  const [mensajeSistema, setMensajeSistema] = useState("");

  const obtenerValor = (objeto: any, campo: string, respaldo = "") => {
    return objeto?.[campo] || respaldo;
  };

  const obtenerId = (item: any) => {
    if (!item) return "SIN-ID";
    return obtenerValor(item, "id") || obtenerValor(item, "codigo") || "SIN-ID";
  };

  const obtenerTramite = (item: any) => {
    if (!item) return "Patente Comercial";

    return (
      obtenerValor(item, "tipoTramite") ||
      obtenerValor(item, "tipoPatente") ||
      obtenerValor(item, "tramite") ||
      "Patente Comercial"
    );
  };

  const obtenerEstado = (item: any) => {
    if (!item) return "En revisión";
    return obtenerValor(item, "estado", "En revisión");
  };

  const obtenerFecha = (item: any) => {
    if (!item) return "18/04/2026 10:24";

    return (
      obtenerValor(item, "fechaRecibo") ||
      obtenerValor(item, "fechaIngreso") ||
      obtenerValor(item, "fecha") ||
      "18/04/2026 10:24"
    );
  };

  const obtenerArea = (item: any) => {
    if (!item) return "Atención General";

    return (
      obtenerValor(item, "area") ||
      obtenerValor(item, "departamento") ||
      "Atención General"
    );
  };

  const obtenerEncargado = (item: any) => {
    if (!item) return usuarioActual.nombre || "Funcionario municipal";

    return (
      obtenerValor(item, "encargado") ||
      obtenerValor(item, "funcionario") ||
      usuarioActual.nombre ||
      "Funcionario municipal"
    );
  };

  const obtenerSolicitante = (item: any) => {
    if (!item) return "Almacén El Parque";

    return (
      obtenerValor(item, "razonSocial") ||
      obtenerValor(item, "nombreSolicitante") ||
      obtenerValor(item, "solicitante") ||
      "Almacén El Parque"
    );
  };

  const obtenerRut = (item: any) => {
    if (!item) return "76.123.456-7";

    return (
      obtenerValor(item, "rut") ||
      obtenerValor(item, "rutSolicitante") ||
      "76.123.456-7"
    );
  };

  const obtenerCorreo = (item: any) => {
    if (!item) return "contacto@ejemplo.cl";

    return (
      obtenerValor(item, "correo") ||
      obtenerValor(item, "email") ||
      obtenerValor(item, "correoElectronico") ||
      "contacto@ejemplo.cl"
    );
  };

  const obtenerTelefono = (item: any) => {
    if (!item) return "+56 9 1234 5678";

    return (
      obtenerValor(item, "telefono") ||
      obtenerValor(item, "celular") ||
      "+56 9 1234 5678"
    );
  };

  const obtenerDireccion = (item: any) => {
    if (!item) return "Av. Libertador Bernardo O'Higgins 1234, Santo Domingo";

    return (
      obtenerValor(item, "direccion") ||
      obtenerValor(item, "direccionLocal") ||
      "Av. Libertador Bernardo O'Higgins 1234, Santo Domingo"
    );
  };

  const obtenerGiro = (item: any) => {
    if (!item) return "Venta de abarrotes y artículos de primera necesidad";

    return (
      obtenerValor(item, "giro") ||
      obtenerValor(item, "giroComercial") ||
      "Venta de abarrotes y artículos de primera necesidad"
    );
  };

  const obtenerSuperficie = (item: any) => {
    if (!item) return "120 m²";

    return (
      obtenerValor(item, "superficie") ||
      obtenerValor(item, "superficieLocal") ||
      "120 m²"
    );
  };

  const obtenerObservacionSolicitante = (item: any) => {
    if (!item) {
      return "Solicita patente comercial para iniciar actividades en el local indicado.";
    }

    return (
      obtenerValor(item, "observacionSolicitante") ||
      obtenerValor(item, "descripcion") ||
      obtenerValor(item, "observacionUsuario") ||
      "Solicita patente comercial para iniciar actividades en el local indicado."
    );
  };

  const normalizarEstado = (estado: string) => {
    const texto = estado.toLowerCase();

    if (texto.includes("aprob")) return "aprobada";
    if (texto.includes("rechaz")) return "rechazada";

    if (
      texto.includes("document") ||
      texto.includes("pendiente") ||
      texto.includes("falta")
    ) {
      return "pendiente";
    }

    if (texto.includes("deriv")) return "derivada";

    return "revision";
  };

  const claseEstado = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada") return "func-status aprobada";
    if (estadoNormalizado === "rechazada") return "func-status rechazada";
    if (estadoNormalizado === "pendiente") return "func-status pendiente";
    if (estadoNormalizado === "derivada") return "func-status derivada";

    return "func-status revision";
  };

  const documentosSeleccionados = Object.entries(documentosRequeridos)
    .filter(([, seleccionado]) => seleccionado)
    .map(([documento]) => documento);

  const cargarSolicitud = () => {
    const usuarioGuardado =
      localStorage.getItem("usuario_actual") ||
      localStorage.getItem("usuarioActual") ||
      localStorage.getItem("current_user");

    let usuario: UsuarioActual = {
      nombre: "Funcionario",
      correo: "",
      rol: "funcionario",
    };

    if (usuarioGuardado) {
      try {
        usuario = JSON.parse(usuarioGuardado);
      } catch {
        usuario = {
          nombre: "Funcionario",
          correo: "",
          rol: "funcionario",
        };
      }
    }

    setUsuarioActual(usuario);

    const solicitudes = solicitudesService.obtenerSolicitudes();

    const solicitudEncontrada =
      solicitudes.find((item: any) => obtenerId(item) === idParametro) ||
      solicitudes[solicitudes.length - 1] ||
      null;

    if (!solicitudEncontrada) {
      setSolicitud(null);
      return;
    }

    setSolicitud(solicitudEncontrada);
    setEstadoSeleccionado(obtenerEstado(solicitudEncontrada));

    const comentario =
      obtenerValor(solicitudEncontrada, "comentarioFuncionario") ||
      obtenerValor(solicitudEncontrada, "observacionFuncionario") ||
      obtenerValor(solicitudEncontrada, "observacion") ||
      "";

    setObservacionInterna(comentario);

    const fechaGuardada =
      obtenerValor(solicitudEncontrada, "fechaLimiteDocumentos") ||
      "2026-05-27";

    setFechaLimite(fechaGuardada);

    const docsGuardados = obtenerValor(
      solicitudEncontrada,
      "documentosFaltantes"
    );

    const seleccionInicial: Record<string, boolean> = {};

    documentosDisponibles.forEach((documento) => {
      seleccionInicial[documento] =
        Array.isArray(docsGuardados) && docsGuardados.includes(documento);
    });

    setDocumentosRequeridos(seleccionInicial);

    if (Array.isArray(docsGuardados) && docsGuardados.length > 0) {
      setMostrarDocumentosRequeridos(false);
    }
  };

  useEffect(() => {
    cargarSolicitud();

    const escucharCambios = () => {
      cargarSolicitud();
    };

    window.addEventListener("storage", escucharCambios);
    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);

    return () => {
      window.removeEventListener("storage", escucharCambios);
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
    };
  }, [idParametro]);

  const documentosAdjuntos: DocumentoAdjunto[] = useMemo(() => {
    const adjuntos = obtenerValor(solicitud, "documentosAdjuntos");

    if (Array.isArray(adjuntos) && adjuntos.length > 0) {
      return adjuntos;
    }

    return [
      {
        nombre: "Escritura_Sociedad.pdf",
        tipo: "PDF",
        tamano: "1.2 MB",
        fecha: "18/04/2026 10:24",
        autor: obtenerSolicitante(solicitud),
      },
      {
        nombre: "Cert_Residencia.pdf",
        tipo: "PDF",
        tamano: "458 KB",
        fecha: "18/04/2026 10:24",
        autor: obtenerSolicitante(solicitud),
      },
      {
        nombre: "Croquis_Local.jpg",
        tipo: "JPG",
        tamano: "1.1 MB",
        fecha: "18/04/2026 10:24",
        autor: obtenerSolicitante(solicitud),
      },
    ];
  }, [solicitud]);

  const historial: EventoHistorial[] = useMemo(() => {
    const historialGuardado = obtenerValor(solicitud, "historial");

    if (Array.isArray(historialGuardado) && historialGuardado.length > 0) {
      return historialGuardado;
    }

    return [
      {
        titulo: "Solicitud ingresada",
        descripcion: "La solicitud fue ingresada correctamente.",
        fecha: obtenerFecha(solicitud),
        autor: obtenerSolicitante(solicitud),
        tipo: "ingreso",
      },
      {
        titulo: "Asignada a funcionario",
        descripcion: `La solicitud fue asignada a ${obtenerEncargado(
          solicitud
        )}.`,
        fecha: "18/04/2026 10:26",
        autor: "Sistema",
        tipo: "asignacion",
      },
      {
        titulo: "Estado cambiado a En revisión",
        descripcion: `${obtenerEncargado(
          solicitud
        )} cambió el estado a En revisión.`,
        fecha: "18/04/2026 10:30",
        autor: obtenerEncargado(solicitud),
        tipo: "estado",
      },
    ];
  }, [solicitud]);

  const guardarEnLocalStorage = (solicitudActualizada: any) => {
    const posiblesKeys = [
      "solicitudes",
      "solicitudes_municipales",
      "solicitudes_usuario",
      "solicitudesUsuario",
      "solicitudes_local",
    ];

    let actualizadaEnKey = false;

    posiblesKeys.forEach((key) => {
      const raw = localStorage.getItem(key);

      if (!raw) return;

      try {
        const datos = JSON.parse(raw);

        if (!Array.isArray(datos)) return;

        const existe = datos.some(
          (item) => obtenerId(item) === obtenerId(solicitudActualizada)
        );

        if (!existe) return;

        const nuevasSolicitudes = datos.map((item) =>
          obtenerId(item) === obtenerId(solicitudActualizada)
            ? solicitudActualizada
            : item
        );

        localStorage.setItem(key, JSON.stringify(nuevasSolicitudes));
        actualizadaEnKey = true;
      } catch {
        return;
      }
    });

    if (!actualizadaEnKey) {
      const raw = localStorage.getItem("solicitudes");
      let solicitudesActuales: any[] = [];

      if (raw) {
        try {
          const datos = JSON.parse(raw);
          solicitudesActuales = Array.isArray(datos) ? datos : [];
        } catch {
          solicitudesActuales = [];
        }
      }

      const existe = solicitudesActuales.some(
        (item) => obtenerId(item) === obtenerId(solicitudActualizada)
      );

      const nuevasSolicitudes = existe
        ? solicitudesActuales.map((item) =>
            obtenerId(item) === obtenerId(solicitudActualizada)
              ? solicitudActualizada
              : item
          )
        : [solicitudActualizada, ...solicitudesActuales];

      localStorage.setItem("solicitudes", JSON.stringify(nuevasSolicitudes));
    }

    const servicio = solicitudesService as any;

    try {
      if (typeof servicio.actualizarSolicitud === "function") {
        servicio.actualizarSolicitud(
          obtenerId(solicitudActualizada),
          solicitudActualizada
        );
      }

      if (typeof servicio.guardarSolicitud === "function") {
        servicio.guardarSolicitud(solicitudActualizada);
      }
    } catch {
      console.warn("No se pudo actualizar mediante solicitudesService.");
    }
  };

  const crearNotificacionCiudadano = (
    solicitudActualizada: any,
    titulo: string,
    mensaje: string,
    tipo: "estado" | "documento" | "mensaje"
  ) => {
    const raw = localStorage.getItem("notificaciones_usuario");

    let notificaciones: any[] = [];

    if (raw) {
      try {
        const datos = JSON.parse(raw);
        notificaciones = Array.isArray(datos) ? datos : [];
      } catch {
        notificaciones = [];
      }
    }

    const nuevaNotificacion = {
      id: `NOT-${Date.now()}`,
      titulo,
      mensaje,
      fecha: new Date().toLocaleString("es-CL"),
      leida: false,
      tipo,
      solicitudId: obtenerId(solicitudActualizada),
      accionTexto: "Ver solicitud",
    };

    localStorage.setItem(
      "notificaciones_usuario",
      JSON.stringify([nuevaNotificacion, ...notificaciones])
    );

    window.dispatchEvent(new Event("notificacionesActualizadas"));
  };

  const agregarEventoHistorial = (
    solicitudBase: any,
    titulo: string,
    descripcion: string,
    tipo: EventoHistorial["tipo"]
  ) => {
    const historialActual = Array.isArray(solicitudBase.historial)
      ? solicitudBase.historial
      : historial;

    const nuevoEvento: EventoHistorial = {
      titulo,
      descripcion,
      fecha: new Date().toLocaleString("es-CL"),
      autor: usuarioActual.nombre || "Funcionario municipal",
      tipo,
    };

    return [nuevoEvento, ...historialActual];
  };

  const aplicarCambiosGuardados = () => {
    if (!solicitud) return;

    const estadoFinal = estadoSeleccionado;
    const estadoNormalizado = normalizarEstado(estadoFinal);
    const comentario = observacionInterna.trim();
    const ahora = new Date().toLocaleString("es-CL");

    if (
      estadoNormalizado === "pendiente" &&
      documentosSeleccionados.length === 0
    ) {
      setMensajeSistema(
        "Selecciona al menos un documento antes de guardar la solicitud como pendiente de documentos."
      );
      return;
    }

    let tituloNotificacion = "Actualización de solicitud";
    let mensajeNotificacion = `Tu solicitud ${obtenerId(
      solicitud
    )} fue actualizada por el funcionario municipal.`;
    let tipoNotificacion: "estado" | "documento" | "mensaje" = "estado";
    let tipoHistorial: EventoHistorial["tipo"] = "estado";

    if (estadoNormalizado === "pendiente") {
      tituloNotificacion = "Documentos solicitados";
      mensajeNotificacion = `Se solicitaron documentos adicionales para continuar con tu solicitud ${obtenerId(
        solicitud
      )}.`;
      tipoNotificacion = "documento";
      tipoHistorial = "documentos";
    } else if (estadoNormalizado === "aprobada") {
      tituloNotificacion = "Solicitud aprobada";
      mensajeNotificacion = `Tu solicitud ${obtenerId(
        solicitud
      )} fue aprobada por el municipio.`;
    } else if (estadoNormalizado === "rechazada") {
      tituloNotificacion = "Solicitud rechazada";
      mensajeNotificacion = `Tu solicitud ${obtenerId(
        solicitud
      )} fue rechazada. Revisa las observaciones del funcionario.`;
    } else if (estadoNormalizado === "derivada") {
      tituloNotificacion = "Solicitud derivada";
      mensajeNotificacion = `Tu solicitud ${obtenerId(
        solicitud
      )} fue derivada a otra área municipal.`;
    } else if (comentario) {
      tituloNotificacion = "Nuevo comentario del funcionario";
      mensajeNotificacion = `El funcionario dejó una observación en tu solicitud ${obtenerId(
        solicitud
      )}.`;
      tipoNotificacion = "mensaje";
      tipoHistorial = "comentario";
    }

    const solicitudActualizada: any = {
      ...(solicitud as any),
      estado: estadoFinal,
      encargado: usuarioActual.nombre || obtenerEncargado(solicitud),
      funcionario: usuarioActual.nombre || obtenerEncargado(solicitud),
      observacion: comentario,
      observaciones: comentario,
      comentarioFuncionario: comentario,
      observacionFuncionario: comentario,
      fechaComentario: ahora,
      fechaObservacion: ahora,
      fechaActualizacion: ahora,
      ultimaActualizacion: ahora,
      documentosFaltantes:
        estadoNormalizado === "pendiente" ? documentosSeleccionados : [],
      fechaLimiteDocumentos:
        estadoNormalizado === "pendiente" ? fechaLimite : "",
    };

    const descripcionHistorial =
      comentario ||
      (estadoNormalizado === "pendiente"
        ? `Se solicitaron los siguientes documentos: ${documentosSeleccionados.join(
            ", "
          )}.`
        : mensajeNotificacion);

    solicitudActualizada.historial = agregarEventoHistorial(
      solicitudActualizada,
      tituloNotificacion,
      descripcionHistorial,
      tipoHistorial
    );

    guardarEnLocalStorage(solicitudActualizada);
    crearNotificacionCiudadano(
      solicitudActualizada,
      tituloNotificacion,
      mensajeNotificacion,
      tipoNotificacion
    );

    setSolicitud(solicitudActualizada);
    setMensajeSistema(
      "Cambios guardados correctamente y notificación enviada al ciudadano."
    );

    window.dispatchEvent(new Event("solicitudesActualizadas"));

    setTimeout(() => {
      setMensajeSistema("");
    }, 3500);
  };

  const prepararAprobacion = () => {
    setEstadoSeleccionado("Aprobada");
    setMostrarDocumentosRequeridos(false);
    setMensajeSistema(
      "Solicitud preparada para aprobación. Presiona Guardar cambios para notificar al ciudadano."
    );
  };

  const prepararRechazo = () => {
    setEstadoSeleccionado("Rechazada");
    setMostrarDocumentosRequeridos(false);
    setMensajeSistema(
      "Solicitud preparada para rechazo. Agrega una observación y presiona Guardar cambios."
    );
  };

  const prepararDerivacion = () => {
    setEstadoSeleccionado("Derivada a otra área");
    setMostrarDocumentosRequeridos(false);
    setMensajeSistema(
      "Solicitud preparada para derivación. Presiona Guardar cambios para confirmar."
    );
  };

  const alternarSolicitudDocumentos = () => {
    setMostrarDocumentosRequeridos((prev) => !prev);
    setEstadoSeleccionado("Pendiente de documentos");
    setMensajeSistema(
      "Selecciona los documentos faltantes y presiona Guardar cambios para notificar al ciudadano."
    );
  };

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  if (!solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-funcionario-content">
          <div className="detalle-funcionario-wrapper">
            <main className="detalle-funcionario-empty">
              <IonIcon icon={documentTextOutline} />
              <h2>No se encontró la solicitud</h2>
              <p>La solicitud seleccionada no existe o no está disponible.</p>
              <button onClick={() => history.push("/funcionario/solicitudes")}>
                Volver a solicitudes
              </button>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="detalle-funcionario-content">
        <div className="detalle-funcionario-wrapper">
          <header className="detalle-funcionario-header">
            <div className="detalle-funcionario-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />
              <h1>Municipalidad de Santo Domingo</h1>
            </div>

            <div className="detalle-funcionario-user-area">
              <div className="funcionario-avatar">CM</div>
              <div>
                <strong>{usuarioActual.nombre || "Funcionario"}</strong>
                <small>Funcionario municipal</small>
              </div>

              <button onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="detalle-funcionario-main">
            <section className="funcionario-breadcrumb">
              <IonIcon icon={homeOutline} />
              <span>Solicitudes</span>
              <p>/</p>
              <strong>Detalle de solicitud</strong>
            </section>

            <section className="funcionario-layout">
              <div className="funcionario-left-column">
                <section className="funcionario-summary-card">
                  <div className="summary-title-area">
                    <div className="summary-main-icon">
                      <IonIcon icon={documentTextOutline} />
                    </div>

                    <div>
                      <h2>{obtenerId(solicitud)}</h2>
                      <p>{obtenerTramite(solicitud)}</p>
                    </div>

                    <span className={claseEstado(estadoSeleccionado)}>
                      {estadoSeleccionado}
                    </span>
                  </div>

                  <div className="summary-data-grid">
                    <div>
                      <IonIcon icon={documentAttachOutline} />
                      <span>Tipo de trámite</span>
                      <strong>{obtenerTramite(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={personOutline} />
                      <span>Solicitante</span>
                      <strong>{obtenerSolicitante(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={calendarOutline} />
                      <span>Fecha ingreso</span>
                      <strong>{obtenerFecha(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={personCircleOutline} />
                      <span>Encargado actual</span>
                      <strong>{obtenerEncargado(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={businessOutline} />
                      <span>Área</span>
                      <strong>{obtenerArea(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={warningOutline} />
                      <span>Prioridad</span>
                      <strong>Media</strong>
                    </div>

                    <div>
                      <IonIcon icon={timeOutline} />
                      <span>Contacto</span>
                      <strong>{obtenerTelefono(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={refreshOutline} />
                      <span>Sincronización</span>
                      <strong>Tiempo real</strong>
                    </div>
                  </div>
                </section>

                <section className="funcionario-card">
                  <h3>Datos del formulario</h3>

                  <div className="form-data-grid">
                    <div>
                      <span>Razón social</span>
                      <strong>{obtenerSolicitante(solicitud)}</strong>
                    </div>

                    <div>
                      <span>RUT</span>
                      <strong>{obtenerRut(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Representante legal</span>
                      <strong>María Fernández</strong>
                    </div>

                    <div>
                      <span>Correo electrónico</span>
                      <strong>{obtenerCorreo(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Teléfono</span>
                      <strong>{obtenerTelefono(solicitud)}</strong>
                    </div>
                  </div>

                  <div className="form-data-divider"></div>

                  <h4>Detalles de la solicitud</h4>

                  <div className="form-data-grid details">
                    <div>
                      <span>Dirección del local</span>
                      <strong>{obtenerDireccion(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Giro comercial</span>
                      <strong>{obtenerGiro(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Superficie del local</span>
                      <strong>{obtenerSuperficie(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Observaciones del solicitante</span>
                      <strong>{obtenerObservacionSolicitante(solicitud)}</strong>
                    </div>
                  </div>
                </section>

                <section className="funcionario-card">
                  <h3>Documentos adjuntos</h3>

                  <div className="attached-documents-list">
                    {documentosAdjuntos.map((documento) => (
                      <div
                        className="attached-document-row"
                        key={documento.nombre}
                      >
                        <div className="attached-document-icon">
                          <IonIcon icon={documentTextOutline} />
                        </div>

                        <div>
                          <strong>{documento.nombre}</strong>
                          <span>
                            {documento.tipo} · {documento.tamano}
                          </span>
                        </div>

                        <p>
                          {documento.fecha}
                          <small>Por: {documento.autor}</small>
                        </p>

                        <button title="Descargar documento">
                          <IonIcon icon={cloudDownloadOutline} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="funcionario-card">
                  <h3>Historial de la solicitud</h3>

                  <div className="funcionario-history-list">
                    {historial.map((evento, index) => (
                      <div
                        className={`funcionario-history-item ${evento.tipo}`}
                        key={`${evento.titulo}-${index}`}
                      >
                        <div className="history-icon-dot">
                          <IonIcon
                            icon={
                              evento.tipo === "comentario"
                                ? chatboxEllipsesOutline
                                : evento.tipo === "documentos"
                                ? sendOutline
                                : evento.tipo === "estado"
                                ? timeOutline
                                : checkmarkCircleOutline
                            }
                          />
                        </div>

                        <div>
                          <strong>{evento.titulo}</strong>
                          <p>{evento.descripcion}</p>

                          {evento.tipo === "comentario" && (
                            <span className="history-comment-box">
                              {evento.descripcion}
                            </span>
                          )}
                        </div>

                        <small>
                          {evento.fecha}
                          <b>{evento.autor}</b>
                        </small>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="funcionario-right-column">
                <section className="gestion-panel-card">
                  <h3>Panel de gestión funcionario</h3>

                  <label>
                    Estado de la solicitud
                    <select
                      value={estadoSeleccionado}
                      onChange={(event) =>
                        setEstadoSeleccionado(event.target.value)
                      }
                    >
                      <option value="En revisión">En revisión</option>
                      <option value="Pendiente de documentos">
                        Pendiente de documentos
                      </option>
                      <option value="Aprobada">Aprobada</option>
                      <option value="Rechazada">Rechazada</option>
                      <option value="Derivada a otra área">
                        Derivada a otra área
                      </option>
                    </select>
                  </label>

                  <label>
                    Observaciones internas / comentario al ciudadano
                    <textarea
                      value={observacionInterna}
                      onChange={(event) =>
                        setObservacionInterna(event.target.value)
                      }
                      maxLength={1000}
                      placeholder="Agrega observaciones sobre la revisión de esta solicitud..."
                    />
                    <small>{observacionInterna.length}/1000 caracteres</small>
                  </label>

                  <div className="gestion-actions">
                    <button className="approve" onClick={prepararAprobacion}>
                      <IonIcon icon={checkmarkCircleOutline} />
                      Aprobar solicitud
                    </button>

                    <button
                      className={`request-docs ${
                        mostrarDocumentosRequeridos ? "open" : ""
                      }`}
                      onClick={alternarSolicitudDocumentos}
                    >
                      <IonIcon icon={documentAttachOutline} />
                      Solicitar documentos
                      <IonIcon
                        icon={
                          mostrarDocumentosRequeridos
                            ? chevronUpOutline
                            : chevronDownOutline
                        }
                      />
                    </button>

                    {mostrarDocumentosRequeridos && (
                      <div className="required-documents-box">
                        <h4>Documentos faltantes / requeridos</h4>
                        <p>
                          Marca los documentos que se solicitarán al ciudadano.
                          Se enviarán recién al presionar Guardar cambios.
                        </p>

                        {documentosDisponibles.map((documento) => (
                          <label
                            className="document-checkbox-row"
                            key={documento}
                          >
                            <input
                              type="checkbox"
                              checked={Boolean(
                                documentosRequeridos[documento]
                              )}
                              onChange={(event) =>
                                setDocumentosRequeridos((prev) => ({
                                  ...prev,
                                  [documento]: event.target.checked,
                                }))
                              }
                            />
                            <span>{documento}</span>
                          </label>
                        ))}

                        <label className="fecha-limite-label">
                          Fecha límite para envío
                          <input
                            type="date"
                            value={fechaLimite}
                            onChange={(event) =>
                              setFechaLimite(event.target.value)
                            }
                          />
                        </label>
                      </div>
                    )}

                    <button className="reject" onClick={prepararRechazo}>
                      <IonIcon icon={closeCircleOutline} />
                      Rechazar solicitud
                    </button>

                    <button className="derive" onClick={prepararDerivacion}>
                      <IonIcon icon={swapHorizontalOutline} />
                      Derivar a otra área
                    </button>

                    <button className="save" onClick={aplicarCambiosGuardados}>
                      <IonIcon icon={saveOutline} />
                      Guardar cambios
                    </button>
                  </div>

                  {mensajeSistema && (
                    <div
                      className={`system-message-box ${
                        mensajeSistema.includes("Selecciona")
                          ? "warning"
                          : ""
                      }`}
                    >
                      <IonIcon
                        icon={
                          mensajeSistema.includes("Selecciona")
                            ? warningOutline
                            : checkmarkCircleOutline
                        }
                      />
                      <span>{mensajeSistema}</span>
                    </div>
                  )}
                </section>

                <section className="auto-notification-card">
                  <div>
                    <IonIcon icon={notificationsOutline} />
                  </div>

                  <h3>Notificación automática al ciudadano</h3>

                  <p>
                    Los cambios se enviarán al ciudadano solo cuando presiones
                    Guardar cambios. Esto evita notificaciones accidentales y
                    mantiene el historial ordenado.
                  </p>

                  <span>
                    <b></b>
                    Sincronización en tiempo real
                  </span>
                </section>
              </aside>
            </section>

            <section className="detalle-funcionario-bottom-actions">
              <button onClick={() => history.push("/funcionario/solicitudes")}>
                <IonIcon icon={arrowBackOutline} />
                Volver a solicitudes
              </button>
            </section>
          </main>

          <footer className="detalle-funcionario-footer">
            <span>© 2026 I. Municipalidad de Santo Domingo</span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudFuncionario;