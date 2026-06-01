import React, { useEffect, useMemo, useRef, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import {
  alertCircleOutline,
  arrowBackOutline,
  arrowForwardOutline,
  businessOutline,
  calendarOutline,
  callOutline,
  chatboxEllipsesOutline,
  checkmarkCircleOutline,
  cloudUploadOutline,
  documentAttachOutline,
  documentTextOutline,
  downloadOutline,
  folderOpenOutline,
  informationCircleOutline,
  logOutOutline,
  mailOutline,
  notificationsOutline,
  personCircleOutline,
  refreshOutline,
  timeOutline,
} from "ionicons/icons";

import api from "../../services/api";
import type { Solicitud } from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import { solicitudesApiService } from "../../services/solicitudesApiService";
import "./DetalleSolicitudUsuario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rut?: string;
}

interface DocumentoSolicitud {
  nombre: string;
  descripcion: string;
  estado: "Pendiente" | "Recibido" | "Rechazado";
  tipo: "pdf" | "imagen" | "doc";
}

interface DocumentoAdjunto {
  id?: number | string;
  nombre?: string;
  nombre_archivo?: string;
  descripcion?: string;
  description?: string;
  estado?: string;
  tipo?: string;
  type?: string;
  size?: number;
  url?: string;
  rutaArchivo?: string;
  ruta_archivo?: string;
}

interface EventoHistorial {
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo:
    | "ingresada"
    | "revision"
    | "pendiente"
    | "aprobada"
    | "rechazada"
    | "comentario";
}

const API_BACKEND_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
  "http://localhost:3000";

const DetalleSolicitudUsuario: React.FC = () => {
  const history = useHistory();
  const params = useParams<{ id?: string; solicitudId?: string }>();
  const idParametro = params.id || params.solicitudId || "";

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Usuario",
    correo: "",
  });

  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);
  const [ultimaSincronizacion, setUltimaSincronizacion] =
    useState("hace unos segundos");

  const [mensajeTiempoReal, setMensajeTiempoReal] = useState(
    "La información de esta solicitud se mantiene sincronizada automáticamente."
  );

  const [archivosSubidos, setArchivosSubidos] = useState<File[]>([]);
  const [cargando, setCargando] = useState(false);
  const [subiendoDocumentos, setSubiendoDocumentos] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [mensajeAccion, setMensajeAccion] = useState("");
  const [tipoMensajeAccion, setTipoMensajeAccion] = useState<
    "exito" | "error" | ""
  >("");

  const solicitudAnteriorRef = useRef<Solicitud | null>(null);

  const obtenerValor = (objeto: any, campo: string, respaldo: any = ""): any => {
    const valor = objeto?.[campo];

    if (valor === undefined || valor === null) {
      return respaldo;
    }

    return valor;
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha || fecha === "Sin fecha" || fecha === "Sin actualización") {
      return fecha;
    }

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getTime())) {
      return fecha;
    }

    return fechaDate.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const obtenerId = (item: any) => {
    if (!item) return "SIN-ID";

    return (
      obtenerValor(item, "id") ||
      obtenerValor(item, "codigo") ||
      obtenerValor(item, "solicitudId") ||
      "SIN-ID"
    );
  };

  const obtenerTramite = (item: any) => {
    if (!item) return "Trámite municipal";

    return (
      obtenerValor(item, "tipoTramite") ||
      obtenerValor(item, "tipoPatente") ||
      obtenerValor(item, "tramite") ||
      "Trámite municipal"
    );
  };

  const obtenerEstado = (item: any) => {
    if (!item) return "Ingresada";
    return obtenerValor(item, "estado", "Ingresada");
  };

  const obtenerFechaIngreso = (item: any) => {
    if (!item) return "Sin fecha";

    const fecha =
      obtenerValor(item, "fechaRecibo") ||
      obtenerValor(item, "fechaIngreso") ||
      obtenerValor(item, "fecha") ||
      "Sin fecha";

    return formatearFecha(fecha);
  };

  const obtenerUltimaActualizacion = (item: any) => {
    if (!item) return "Sin actualización";

    const fecha =
      obtenerValor(item, "ultimaActualizacion") ||
      obtenerValor(item, "fechaActualizacion") ||
      obtenerValor(item, "updatedAt") ||
      obtenerValor(item, "fechaIngreso") ||
      obtenerValor(item, "fechaRecibo") ||
      "Sin actualización";

    return formatearFecha(fecha);
  };

  const obtenerArea = (item: any) => {
    if (!item) return "Área municipal";

    return (
      obtenerValor(item, "area") ||
      obtenerValor(item, "areaResponsable") ||
      obtenerValor(item, "departamento") ||
      "Dirección General"
    );
  };

  const obtenerEncargado = (item: any) => {
    if (!item) return "Funcionario municipal";

    return (
      obtenerValor(item, "encargado") ||
      obtenerValor(item, "funcionarioAsignado") ||
      obtenerValor(item, "funcionario") ||
      "Funcionario municipal"
    );
  };

  const obtenerObservacionSolicitante = (item: any) => {
    if (!item) return "";

    return (
      obtenerValor(item, "observacionesSolicitante") ||
      obtenerValor(item, "observacionSolicitante") ||
      obtenerValor(item, "observacion") ||
      obtenerValor(item, "observaciones") ||
      ""
    );
  };

  const obtenerObservacionFuncionario = (item: any) => {
    if (!item) return "";

    return (
      obtenerValor(item, "comentarioFuncionario") ||
      obtenerValor(item, "observacionFuncionario") ||
      obtenerValor(item, "respuestaFuncionario") ||
      ""
    );
  };

  const obtenerFechaComentario = (item: any) => {
    if (!item) return "Sin fecha";

    return (
      obtenerValor(item, "fechaComentario") ||
      obtenerValor(item, "fechaObservacion") ||
      obtenerUltimaActualizacion(item)
    );
  };

  const obtenerDocumentosFaltantes = (item: any): string[] => {
    const documentosFaltantesRaw = obtenerValor(item, "documentosFaltantes");

    if (Array.isArray(documentosFaltantesRaw)) {
      return documentosFaltantesRaw
        .map((documento) => String(documento).trim())
        .filter((documento) => documento !== "");
    }

    if (
      typeof documentosFaltantesRaw === "string" &&
      documentosFaltantesRaw.trim() !== ""
    ) {
      try {
        const documentosParseados = JSON.parse(documentosFaltantesRaw);

        if (Array.isArray(documentosParseados)) {
          return documentosParseados
            .map((documento) => String(documento).trim())
            .filter((documento) => documento !== "");
        }
      } catch {
        return documentosFaltantesRaw
          .split(",")
          .map((documento) => documento.trim())
          .filter((documento) => documento !== "");
      }
    }

    return [];
  };

  const normalizarEstado = (estado: string) => {
    const texto = String(estado || "").toLowerCase();

    if (texto.includes("aprob")) return "aprobada";
    if (texto.includes("rechaz")) return "rechazada";

    if (
      texto.includes("falta") ||
      texto.includes("pendiente") ||
      texto.includes("document")
    ) {
      return "pendiente_documentos";
    }

    if (
      texto.includes("revisión") ||
      texto.includes("revision") ||
      texto.includes("proceso")
    ) {
      return "en_revision";
    }

    return "ingresada";
  };

  const textoEstado = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada") return "Aprobada";
    if (estadoNormalizado === "rechazada") return "Rechazada";

    if (estadoNormalizado === "pendiente_documentos") {
      return "Pendiente de documentos";
    }

    if (estadoNormalizado === "en_revision") return "En revisión";

    return "Ingresada";
  };

  const claseEstado = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada") return "status-badge status-approved";
    if (estadoNormalizado === "rechazada") return "status-badge status-rejected";

    if (estadoNormalizado === "pendiente_documentos") {
      return "status-badge status-pending-docs";
    }

    if (estadoNormalizado === "en_revision") {
      return "status-badge status-review";
    }

    return "status-badge status-entered";
  };

  const obtenerEtapaActual = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "aprobada") return 5;
    if (estadoNormalizado === "rechazada") return 5;
    if (estadoNormalizado === "pendiente_documentos") return 3;
    if (estadoNormalizado === "en_revision") return 2;

    return 1;
  };

  const obtenerUrlDocumento = (documento: DocumentoAdjunto) => {
    const url =
      documento.url || documento.rutaArchivo || documento.ruta_archivo || "";

    if (!url) return "";

    if (url.startsWith("http")) {
      return url;
    }

    if (url.startsWith("/")) {
      return `${API_BACKEND_URL}${url}`;
    }

    return `${API_BACKEND_URL}/${url}`;
  };

  const obtenerNombreDocumento = (documento: DocumentoAdjunto) => {
    return documento.nombre || documento.nombre_archivo || "Documento adjunto";
  };

  const obtenerDescripcionDocumento = (documento: DocumentoAdjunto) => {
    return (
      documento.description ||
      documento.descripcion ||
      "Documento adjuntado por el solicitante."
    );
  };

  const obtenerTipoDocumento = (documento: DocumentoAdjunto) => {
    const tipo = String(documento.type || documento.tipo || "").toLowerCase();
    const nombre = obtenerNombreDocumento(documento).toLowerCase();

    if (
      tipo.includes("image") ||
      nombre.endsWith(".jpg") ||
      nombre.endsWith(".jpeg") ||
      nombre.endsWith(".png")
    ) {
      return "imagen";
    }

    if (tipo.includes("pdf") || nombre.endsWith(".pdf")) {
      return "pdf";
    }

    return "doc";
  };

  const formatearTamanoArchivo = (size?: number) => {
    if (!size || Number.isNaN(size)) return "";

    if (size < 1024) {
      return `${size} bytes`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const registrarNotificacionLocal = (
    solicitudActualizada: Solicitud,
    estadoAnterior: string,
    estadoNuevo: string
  ) => {
    const notificacionesGuardadas = localStorage.getItem(
      "notificaciones_usuario"
    );

    let notificaciones: any[] = [];

    if (notificacionesGuardadas) {
      try {
        notificaciones = JSON.parse(notificacionesGuardadas);
      } catch {
        notificaciones = [];
      }
    }

    const nuevaNotificacion = {
      id: `NOT-${Date.now()}`,
      solicitudId: obtenerId(solicitudActualizada),
      titulo: "Estado actualizado",
      mensaje: `Tu solicitud cambió de "${textoEstado(
        estadoAnterior
      )}" a "${textoEstado(estadoNuevo)}".`,
      fecha: new Date().toLocaleString("es-CL"),
      leida: false,
      tipo: "estado",
      accionTexto: "Ver solicitud",
    };

    localStorage.setItem(
      "notificaciones_usuario",
      JSON.stringify([nuevaNotificacion, ...notificaciones])
    );

    window.dispatchEvent(new Event("notificacionesActualizadas"));
  };

  const cargarSolicitud = async (notificarCambio = false) => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = authService.getUsuarioActual();

      if (!usuario) {
        history.push("/login-usuario");
        return;
      }

      setUsuarioActual({
        nombre: usuario.nombre,
        correo: usuario.correo,
        rut: usuario.rut,
      });

      const solicitudEncontrada =
        await solicitudesApiService.obtenerSolicitudPorId(idParametro);

      if (!solicitudEncontrada) {
        setSolicitud(null);
        return;
      }

      const solicitudAnterior = solicitudAnteriorRef.current;

      if (solicitudAnterior && notificarCambio) {
        const estadoAnterior = obtenerEstado(solicitudAnterior);
        const estadoNuevo = obtenerEstado(solicitudEncontrada);

        if (estadoAnterior !== estadoNuevo) {
          setMensajeTiempoReal(
            `Cambio detectado: el funcionario actualizó el estado a "${textoEstado(
              estadoNuevo
            )}".`
          );

          registrarNotificacionLocal(
            solicitudEncontrada as Solicitud,
            estadoAnterior,
            estadoNuevo
          );
        }
      }

      solicitudAnteriorRef.current = solicitudEncontrada as Solicitud;
      setSolicitud(solicitudEncontrada as Solicitud);
      setUltimaSincronizacion("hace unos segundos");
    } catch (error: any) {
      console.error("Error al cargar detalle de solicitud:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo cargar el detalle de la solicitud.";

      setMensajeError(mensajeBackend);
      setSolicitud(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitud(false);

    const intervalo = window.setInterval(() => {
      cargarSolicitud(true);
    }, 10000);

    const escucharCambios = () => {
      cargarSolicitud(true);
    };

    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
    };
  }, [idParametro]);

  const documentosAdjuntos: DocumentoAdjunto[] = useMemo(() => {
    const documentosRaw = (solicitud as any)?.documentos;

    if (Array.isArray(documentosRaw)) {
      return documentosRaw;
    }

    return [];
  }, [solicitud]);

  const documentosSolicitados: DocumentoSolicitud[] = useMemo(() => {
    const documentosFaltantes = obtenerDocumentosFaltantes(solicitud);

    if (documentosFaltantes.length > 0) {
      return documentosFaltantes.map((documento) => {
        const nombreDocumento = documento.toLowerCase();

        const tipoDocumento: "pdf" | "imagen" =
          nombreDocumento.includes("foto") ||
          nombreDocumento.includes("fotografía") ||
          nombreDocumento.includes("imagen") ||
          nombreDocumento.includes("croquis")
            ? "imagen"
            : "pdf";

        return {
          nombre: documento,
          descripcion: "Documento solicitado por el funcionario municipal.",
          estado: "Pendiente",
          tipo: tipoDocumento,
        };
      });
    }

    return [];
  }, [solicitud]);

  const historial: EventoHistorial[] = useMemo(() => {
    const historialGuardado = obtenerValor(solicitud, "historial");

    if (Array.isArray(historialGuardado) && historialGuardado.length > 0) {
      return historialGuardado.map((evento: any) => ({
        fecha: evento.fecha || "Sin fecha",
        titulo: evento.titulo || "Actualización",
        descripcion: evento.descripcion || "La solicitud fue actualizada.",
        tipo:
          evento.tipo === "documentos"
            ? "pendiente"
            : evento.tipo === "estado"
            ? "revision"
            : evento.tipo === "comentario"
            ? "comentario"
            : evento.tipo || "revision",
      }));
    }

    const estadoActual = normalizarEstado(obtenerEstado(solicitud));
    const fechaIngreso = obtenerFechaIngreso(solicitud);
    const ultimaActualizacion = obtenerUltimaActualizacion(solicitud);
    const observacionFuncionario = obtenerObservacionFuncionario(solicitud);
    const documentosFaltantes = obtenerDocumentosFaltantes(solicitud);

    const eventos: EventoHistorial[] = [
      {
        fecha: fechaIngreso,
        titulo: "Solicitud ingresada",
        descripcion: "Tu solicitud fue registrada correctamente.",
        tipo: "ingresada",
      },
    ];

    if (
      estadoActual === "en_revision" ||
      estadoActual === "pendiente_documentos" ||
      estadoActual === "aprobada" ||
      estadoActual === "rechazada"
    ) {
      eventos.unshift({
        fecha: ultimaActualizacion,
        titulo: "En revisión",
        descripcion:
          "Tu solicitud está siendo revisada por el área responsable.",
        tipo: "revision",
      });
    }

    if (observacionFuncionario.trim() !== "") {
      eventos.unshift({
        fecha: obtenerFechaComentario(solicitud),
        titulo: "Comentario del funcionario",
        descripcion: observacionFuncionario,
        tipo: "comentario",
      });
    }

    if (
      estadoActual === "pendiente_documentos" ||
      documentosFaltantes.length > 0
    ) {
      eventos.unshift({
        fecha: ultimaActualizacion,
        titulo: "Documentos pendientes",
        descripcion:
          documentosFaltantes.length > 0
            ? `Se solicitaron los siguientes documentos: ${documentosFaltantes.join(
                ", "
              )}.`
            : "Se solicitaron documentos adicionales para continuar.",
        tipo: "pendiente",
      });
    }

    if (estadoActual === "aprobada") {
      eventos.unshift({
        fecha: ultimaActualizacion,
        titulo: "Solicitud aprobada",
        descripcion: "Tu solicitud fue aprobada por el municipio.",
        tipo: "aprobada",
      });
    }

    if (estadoActual === "rechazada") {
      eventos.unshift({
        fecha: ultimaActualizacion,
        titulo: "Solicitud rechazada",
        descripcion: "Tu solicitud fue rechazada. Revisa las observaciones.",
        tipo: "rechazada",
      });
    }

    return eventos;
  }, [solicitud]);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const manejarCargaArchivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(event.target.files || []);

    setArchivosSubidos(archivos);
    setMensajeAccion("");
    setTipoMensajeAccion("");
  };

  const enviarDocumentosPendientes = async () => {
    try {
      if (!solicitud) return;

      if (archivosSubidos.length === 0) {
        setTipoMensajeAccion("error");
        setMensajeAccion("Debes seleccionar al menos un documento para subir.");
        return;
      }

      setSubiendoDocumentos(true);
      setTipoMensajeAccion("");
      setMensajeAccion("");

      const formData = new FormData();

      archivosSubidos.forEach((archivo) => {
        formData.append("documentos", archivo);
      });

      const respuesta = await api.post(
        `/solicitudes/${obtenerId(solicitud)}/documentos`,
        formData
      );

      const solicitudActualizada = respuesta.data?.solicitud;

      if (solicitudActualizada) {
        setSolicitud(solicitudActualizada as Solicitud);
        solicitudAnteriorRef.current = solicitudActualizada as Solicitud;
      }

      setArchivosSubidos([]);
      setTipoMensajeAccion("exito");
      setMensajeAccion(
        "Documentos subidos correctamente. La solicitud volvió a estado En revisión."
      );
      setMensajeTiempoReal(
        "Documentos recibidos: tu solicitud fue actualizada y enviada nuevamente a revisión."
      );
      setUltimaSincronizacion("hace unos segundos");

      window.dispatchEvent(new Event("solicitudesActualizadas"));
      window.dispatchEvent(new Event("notificacionesActualizadas"));
    } catch (error: any) {
      console.error("Error al subir documentos pendientes:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron subir los documentos.";

      setTipoMensajeAccion("error");
      setMensajeAccion(mensajeBackend);
    } finally {
      setSubiendoDocumentos(false);
    }
  };

  const descargarComprobante = () => {
    const documentosFaltantes = obtenerDocumentosFaltantes(solicitud);

    const contenido = `
Comprobante de solicitud municipal
-----------------------------------
ID: ${obtenerId(solicitud)}
Trámite: ${obtenerTramite(solicitud)}
Estado actual: ${textoEstado(obtenerEstado(solicitud))}
Fecha de ingreso: ${obtenerFechaIngreso(solicitud)}
Área responsable: ${obtenerArea(solicitud)}
Funcionario asignado: ${obtenerEncargado(solicitud)}
Última actualización: ${obtenerUltimaActualizacion(solicitud)}
Observación del solicitante: ${
      obtenerObservacionSolicitante(solicitud) ||
      "Sin observaciones del solicitante"
    }
Observación funcionario: ${
      obtenerObservacionFuncionario(solicitud) ||
      "Sin observaciones del funcionario"
    }
Documentos adjuntos: ${
      documentosAdjuntos.length > 0
        ? documentosAdjuntos.map((doc) => obtenerNombreDocumento(doc)).join(", ")
        : "Sin documentos adjuntos"
    }
Documentos faltantes: ${
      documentosFaltantes.length > 0
        ? documentosFaltantes.join(", ")
        : "Sin documentos pendientes"
    }
`;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `comprobante-${obtenerId(solicitud)}.txt`;
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const irADocumentos = () => {
    const seccionDocumentos = document.getElementById("documentos-solicitados");
    seccionDocumentos?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const irAAgendarFuncionario = () => {
    history.push(
      `/usuario/agendar-funcionario?solicitudId=${obtenerId(solicitud)}`
    );
  };

  if (cargando && !solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-solicitud-content">
          <div className="detalle-solicitud-wrapper">
            <main className="detalle-solicitud-empty">
              <IonIcon icon={refreshOutline} />
              <h2>Cargando solicitud...</h2>
              <p>Estamos obteniendo el detalle desde el sistema municipal.</p>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (mensajeError && !solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-solicitud-content">
          <div className="detalle-solicitud-wrapper">
            <main className="detalle-solicitud-empty">
              <IonIcon icon={alertCircleOutline} />
              <h2>No se pudo cargar la solicitud</h2>
              <p>{mensajeError}</p>
              <button onClick={() => history.push("/usuario/mis-tramites")}>
                Volver a mis trámites
              </button>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-solicitud-content">
          <div className="detalle-solicitud-wrapper">
            <main className="detalle-solicitud-empty">
              <IonIcon icon={folderOpenOutline} />
              <h2>No se encontró la solicitud</h2>
              <p>
                La solicitud seleccionada no existe o no está asociada al
                usuario actual.
              </p>
              <button onClick={() => history.push("/usuario/mis-tramites")}>
                Volver a mis trámites
              </button>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const etapaActual = obtenerEtapaActual(obtenerEstado(solicitud));
  const documentosFaltantesActuales = obtenerDocumentosFaltantes(solicitud);
  const hayDocumentosPendientes = documentosFaltantesActuales.length > 0;

  const pasosTimeline = [
    {
      numero: 1,
      titulo: "Ingresada",
      fecha: obtenerFechaIngreso(solicitud),
      icono: checkmarkCircleOutline,
    },
    {
      numero: 2,
      titulo: "En revisión",
      fecha:
        etapaActual >= 2 ? obtenerUltimaActualizacion(solicitud) : "Pendiente",
      icono: refreshOutline,
    },
    {
      numero: 3,
      titulo: "Documentos pendientes",
      fecha:
        etapaActual >= 3 || hayDocumentosPendientes
          ? obtenerUltimaActualizacion(solicitud)
          : "Pendiente",
      icono: documentAttachOutline,
    },
    {
      numero: 4,
      titulo: "Aprobación final",
      fecha:
        etapaActual >= 4 ? obtenerUltimaActualizacion(solicitud) : "Pendiente",
      icono: checkmarkCircleOutline,
    },
    {
      numero: 5,
      titulo: "Finalizada",
      fecha:
        etapaActual >= 5 ? obtenerUltimaActualizacion(solicitud) : "Pendiente",
      icono: checkmarkCircleOutline,
    },
  ];

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="detalle-solicitud-content">
        <div className="detalle-solicitud-wrapper">
          <header className="detalle-header">
            <div className="detalle-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />
              <h1>Municipalidad de Santo Domingo</h1>
            </div>

            <div className="detalle-user-area">
              <button
                className="detalle-notification-button"
                onClick={() => history.push("/usuario/notificaciones")}
                title="Notificaciones"
              >
                <IonIcon icon={notificationsOutline} />
              </button>

              <div className="detalle-user-chip">
                <IonIcon icon={personCircleOutline} />
                <div>
                  <strong>{usuarioActual.nombre || "Usuario"}</strong>
                  <small>Usuario ciudadano</small>
                </div>
              </div>

              <button className="detalle-logout" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="detalle-main">
            <section className="breadcrumb-row">
              <button onClick={() => history.push("/usuario/mis-tramites")}>
                Mis trámites
              </button>
              <span>/</span>
              <p>Detalle de solicitud</p>
            </section>

            <section className="detalle-title-row">
              <div>
                <h2>Seguimiento de solicitud</h2>
                <p>
                  ID de solicitud: <strong>{obtenerId(solicitud)}</strong>
                </p>
              </div>

              <div className="detalle-title-actions">
                <span className={claseEstado(obtenerEstado(solicitud))}>
                  {textoEstado(obtenerEstado(solicitud))}
                </span>

                <div className="real-time-status">
                  <span></span>
                  <div>
                    <strong>Actualización en tiempo real</strong>
                    <small>Sincronizado {ultimaSincronizacion}</small>
                  </div>
                  <IonIcon icon={refreshOutline} />
                </div>
              </div>
            </section>

            <section className="summary-grid">
              <article className="summary-card">
                <div className="summary-icon">
                  <IonIcon icon={documentTextOutline} />
                </div>
                <div>
                  <span>Tipo de trámite</span>
                  <strong>{obtenerTramite(solicitud)}</strong>
                  <p>Solicitud municipal</p>
                </div>
              </article>

              <article className="summary-card">
                <div className="summary-icon">
                  <IonIcon icon={calendarOutline} />
                </div>
                <div>
                  <span>Fecha de ingreso</span>
                  <strong>{obtenerFechaIngreso(solicitud)}</strong>
                  <p>Registro inicial</p>
                </div>
              </article>

              <article className="summary-card">
                <div className="summary-icon">
                  <IonIcon icon={businessOutline} />
                </div>
                <div>
                  <span>Área responsable</span>
                  <strong>{obtenerArea(solicitud)}</strong>
                  <p>Unidad municipal</p>
                </div>
              </article>

              <article className="summary-card">
                <div className="summary-icon">
                  <IonIcon icon={personCircleOutline} />
                </div>
                <div>
                  <span>Funcionario asignado</span>
                  <strong>{obtenerEncargado(solicitud)}</strong>
                  <p>Gestión del trámite</p>
                </div>
              </article>

              <article className="summary-card">
                <div className="summary-icon">
                  <IonIcon icon={timeOutline} />
                </div>
                <div>
                  <span>Última actualización</span>
                  <strong>{obtenerUltimaActualizacion(solicitud)}</strong>
                  <p>{ultimaSincronizacion}</p>
                </div>
              </article>
            </section>

            <section className="timeline-card">
              <div className="section-title">
                <h3>Línea de vida del trámite</h3>
                <p>Conoce el estado actual y los pasos del proceso.</p>
              </div>

              <div className="timeline-horizontal-detalle">
                {pasosTimeline.map((paso, index) => (
                  <div
                    key={paso.numero}
                    className={`detalle-timeline-step ${
                      etapaActual >= paso.numero ||
                      (paso.numero === 3 && hayDocumentosPendientes)
                        ? "active"
                        : ""
                    } ${etapaActual === paso.numero ? "current" : ""}`}
                  >
                    <div className="timeline-step-circle">
                      {etapaActual > paso.numero ? (
                        <IonIcon icon={checkmarkCircleOutline} />
                      ) : (
                        <IonIcon icon={paso.icono} />
                      )}
                    </div>

                    {index < pasosTimeline.length - 1 && (
                      <div
                        className={`timeline-step-line ${
                          etapaActual > paso.numero ? "active-line" : ""
                        }`}
                      />
                    )}

                    <strong>{paso.titulo}</strong>
                    <span>{paso.fecha}</span>
                  </div>
                ))}
              </div>

              <div className="real-time-message">
                <IonIcon icon={refreshOutline} />
                <div>
                  <strong>{mensajeTiempoReal}</strong>
                  <p>
                    Si el funcionario modifica el estado, esta línea de vida,
                    la última actualización y las notificaciones se actualizan
                    automáticamente.
                  </p>
                </div>
                <span>Actualizado en tiempo real</span>
              </div>
            </section>

            <section className="comentario-funcionario-card">
              <div className="comentario-funcionario-header">
                <div className="comentario-funcionario-icon">
                  <IonIcon icon={businessOutline} />
                </div>

                <div>
                  <h3>Datos ingresados por el solicitante</h3>
                  <p>Información declarada al momento de crear la solicitud.</p>
                </div>

                <span>{obtenerFechaIngreso(solicitud)}</span>
              </div>

              <div className="comentario-funcionario-body">
                <strong>Información del local</strong>

                <p>
                  <b>Razón social:</b>{" "}
                  {obtenerValor(solicitud, "razonSocial") || "No informado"}
                </p>

                <p>
                  <b>RUT:</b>{" "}
                  {obtenerValor(solicitud, "rut") || "No informado"}
                </p>

                <p>
                  <b>Dirección:</b>{" "}
                  {obtenerValor(solicitud, "direccion") || "No informado"}
                </p>

                <p>
                  <b>Tipo de patente:</b>{" "}
                  {obtenerValor(solicitud, "tipoPatente") || "No informado"}
                </p>

                <p>
                  <b>Rol de avalúo:</b>{" "}
                  {obtenerValor(solicitud, "rolAvaluo") || "No informado"}
                </p>

                <p>
                  <b>PyME:</b>{" "}
                  {String(obtenerValor(solicitud, "pyme")) === "true" ||
                  obtenerValor(solicitud, "pyme") === true
                    ? "Sí"
                    : "No"}
                </p>

                <p>
                  <b>Correo de contacto:</b>{" "}
                  {obtenerValor(solicitud, "correoContacto") ||
                    obtenerValor(solicitud, "correo") ||
                    "No informado"}
                </p>

                <p>
                  <b>Teléfono de contacto:</b>{" "}
                  {obtenerValor(solicitud, "telefonoContacto") ||
                    obtenerValor(solicitud, "telefono") ||
                    "No informado"}
                </p>

                <p>
                  <b>Giro comercial:</b>{" "}
                  {obtenerValor(solicitud, "giro") || "No informado"}
                </p>

                <p>
                  <b>Superficie:</b>{" "}
                  {obtenerValor(solicitud, "superficie") || "No informado"}
                </p>

                <p>
                  <b>Observaciones del solicitante:</b>{" "}
                  {obtenerObservacionSolicitante(solicitud) ||
                    "Sin observaciones del solicitante."}
                </p>
              </div>
            </section>

            <section className="comentario-funcionario-card">
              <div className="comentario-funcionario-header">
                <div className="comentario-funcionario-icon">
                  <IonIcon icon={chatboxEllipsesOutline} />
                </div>

                <div>
                  <h3>Observaciones del funcionario</h3>
                  <p>
                    Comentarios, aclaraciones o solicitudes realizadas por el
                    equipo municipal.
                  </p>
                </div>

                <span>{obtenerFechaComentario(solicitud)}</span>
              </div>

              {obtenerObservacionFuncionario(solicitud).trim() !== "" ? (
                <div className="comentario-funcionario-body">
                  <strong>{obtenerEncargado(solicitud)}</strong>
                  <p>{obtenerObservacionFuncionario(solicitud)}</p>
                </div>
              ) : (
                <div className="comentario-funcionario-empty">
                  <p>
                    Aún no existen comentarios del funcionario para esta
                    solicitud.
                  </p>
                </div>
              )}
            </section>

            {(normalizarEstado(obtenerEstado(solicitud)) ===
              "pendiente_documentos" ||
              hayDocumentosPendientes) && (
              <section className="action-required-card">
                <div className="action-required-icon">
                  <IonIcon icon={alertCircleOutline} />
                </div>

                <div>
                  <h3>Acción requerida</h3>
                  <p>
                    Tu solicitud requiere la presentación de documentos
                    adicionales para continuar con el proceso.
                  </p>
                </div>

                <button onClick={irADocumentos}>
                  Ir a documentos <IonIcon icon={arrowForwardOutline} />
                </button>
              </section>
            )}

            <section id="documentos-solicitados" className="documents-card">
              <div className="section-title">
                <h3>Documentos adjuntos</h3>
                <p>
                  {hayDocumentosPendientes
                    ? "Documentos asociados a esta solicitud y requerimientos pendientes."
                    : "Documentos reales adjuntados por el solicitante."}
                </p>
              </div>

              <div className="documents-content">
                <div className="documents-list">
                  {documentosAdjuntos.length > 0 ? (
                    documentosAdjuntos.map((documento, index) => {
                      const urlDocumento = obtenerUrlDocumento(documento);
                      const tipoDocumento = obtenerTipoDocumento(documento);
                      const nombreDocumento = obtenerNombreDocumento(documento);
                      const tamanoArchivo = formatearTamanoArchivo(
                        documento.size
                      );

                      return (
                        <div
                          className="document-row"
                          key={`${documento.id || nombreDocumento}-${index}`}
                        >
                          <div className={`document-icon ${tipoDocumento}`}>
                            <IonIcon icon={documentTextOutline} />
                          </div>

                          <div>
                            <strong>{nombreDocumento}</strong>
                            <span>{obtenerDescripcionDocumento(documento)}</span>
                            {tamanoArchivo && <span>{tamanoArchivo}</span>}
                          </div>

                          <div>
                            <p className="document-status received">
                              {documento.estado || "Recibido"}
                            </p>

                            {urlDocumento && (
                              <a
                                href={urlDocumento}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-link-button"
                              >
                                Abrir documento
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="uploaded-files-box">
                      <strong>No hay documentos adjuntos</strong>
                      <span>
                        Esta solicitud no tiene archivos reales asociados en la
                        base de datos.
                      </span>
                    </div>
                  )}

                  {hayDocumentosPendientes &&
                    documentosSolicitados.length > 0 && (
                      <>
                        <div className="uploaded-files-box">
                          <strong>Documentos pendientes solicitados</strong>
                          {documentosSolicitados.map((documento) => (
                            <span key={documento.nombre}>
                              {documento.nombre}
                            </span>
                          ))}
                        </div>

                        {archivosSubidos.length > 0 && (
                          <div className="uploaded-files-box">
                            <strong>Archivos seleccionados</strong>
                            {archivosSubidos.map((archivo) => (
                              <span key={archivo.name}>{archivo.name}</span>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                  {mensajeAccion && (
                    <div className="uploaded-files-box">
                      <strong>
                        {tipoMensajeAccion === "exito"
                          ? "Operación exitosa"
                          : "Atención"}
                      </strong>
                      <span>{mensajeAccion}</span>
                    </div>
                  )}
                </div>

                {hayDocumentosPendientes && (
                  <div>
                    <label className="upload-box">
                      <input
                        type="file"
                        multiple
                        onChange={manejarCargaArchivos}
                      />
                      <IonIcon icon={cloudUploadOutline} />
                      <strong>Arrastra y suelta tus archivos aquí</strong>
                      <span>o haz clic para seleccionar</span>
                      <p>Formatos permitidos: PDF, JPG, PNG. Máx. 10 MB.</p>
                    </label>

                    <button
                      type="button"
                      className="primary-button"
                      onClick={enviarDocumentosPendientes}
                      disabled={
                        subiendoDocumentos || archivosSubidos.length === 0
                      }
                    >
                      <IonIcon icon={cloudUploadOutline} />
                      {subiendoDocumentos
                        ? "Subiendo documentos..."
                        : "Subir documentos pendientes"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <section className="lower-grid">
              <article className="history-card">
                <div className="section-title">
                  <h3>Historial</h3>
                  <p>Eventos y actualizaciones de tu solicitud.</p>
                </div>

                <div className="history-list">
                  {historial.map((evento, index) => (
                    <div
                      className={`history-item ${evento.tipo}`}
                      key={`${evento.fecha}-${evento.titulo}-${index}`}
                    >
                      <span></span>
                      <div>
                        <small>{evento.fecha}</small>
                        <strong>{evento.titulo}</strong>
                        <p>{evento.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="help-card">
                <div className="section-title">
                  <h3>¿Necesitas ayuda?</h3>
                  <p>Si tienes dudas sobre tu trámite, contáctanos.</p>
                </div>

                <div className="help-row">
                  <IonIcon icon={callOutline} />
                  <div>
                    <span>Teléfono</span>
                    <strong>2 2345 6789</strong>
                  </div>
                </div>

                <div className="help-row">
                  <IonIcon icon={mailOutline} />
                  <div>
                    <span>Correo electrónico</span>
                    <strong>atencionciudadana@santodomingo.cl</strong>
                  </div>
                </div>

                <div className="help-row">
                  <IonIcon icon={timeOutline} />
                  <div>
                    <span>Horario de atención</span>
                    <strong>Lunes a viernes 08:30 a 16:30 hrs.</strong>
                  </div>
                </div>

                <button className="primary-wide-button">Enviar consulta</button>
              </article>

              <article className="notifications-card">
                <div className="section-title">
                  <h3>Notificaciones</h3>
                  <p>Recibe alertas sobre tu solicitud en tiempo real.</p>
                </div>

                <div className="notification-live-box">
                  <IonIcon icon={notificationsOutline} />
                  <div>
                    <strong>Estado actualizado</strong>
                    <p>
                      El estado actual es “
                      {textoEstado(obtenerEstado(solicitud))}”.
                    </p>
                    <span>{obtenerUltimaActualizacion(solicitud)}</span>
                  </div>
                  <small>Ahora</small>
                </div>

                <button
                  className="text-link-button"
                  onClick={() => history.push("/usuario/notificaciones")}
                >
                  Ver todas las notificaciones{" "}
                  <IonIcon icon={arrowForwardOutline} />
                </button>

                <div className="important-box">
                  <IonIcon icon={informationCircleOutline} />
                  <p>
                    Responde los requerimientos a la brevedad para evitar
                    retrasos en el avance de tu trámite.
                  </p>
                </div>
              </article>
            </section>

            <section className="detalle-bottom-actions">
              <button
                className="secondary-button"
                onClick={() => history.push("/usuario/mis-tramites")}
              >
                <IonIcon icon={arrowBackOutline} />
                Volver a mis trámites
              </button>

              <button className="secondary-button" onClick={irAAgendarFuncionario}>
                <IonIcon icon={calendarOutline} />
                Agendar con funcionario
              </button>

              <button className="primary-button" onClick={descargarComprobante}>
                <IonIcon icon={downloadOutline} />
                Descargar comprobante
              </button>
            </section>
          </main>

          <footer className="detalle-footer">
            <span>© 2026 I. Municipalidad de Santo Domingo</span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudUsuario;