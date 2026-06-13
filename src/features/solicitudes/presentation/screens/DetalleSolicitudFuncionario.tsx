import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import {
  alertCircleOutline,
  arrowBackOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  cloudDownloadOutline,
  documentAttachOutline,
  documentTextOutline,
  homeOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  refreshOutline,
  saveOutline,
  swapHorizontalOutline,
  timeOutline,
} from "ionicons/icons";

import api from "../../../../core/data/http/apiClient";
import { environment } from "../../../../core/config/environment";
import { useLatestCallback } from "../../../../core/presentation/hooks/useLatestCallback";
import { authService } from "../../../auth/composition/authService";
import DatosTramite from "../components/DatosTramite";
import "./DetalleSolicitudFuncionario.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rol?: string;
  cargo?: string;
  area?: string;
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
  createdAt?: string;
}

interface LocationState {
  volverA?: string;
  textoVolver?: string;
  textoOrigen?: string;
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
  const location = useLocation<LocationState>();
  const params = useParams<{ id?: string; solicitudId?: string }>();

  const idParametro = params.id || params.solicitudId || "";

  const rutaVolver = location.state?.volverA || "/funcionario/solicitudes";
  const textoVolver = location.state?.textoVolver || "Volver a solicitudes";
  const textoOrigen = location.state?.textoOrigen || "Solicitudes";

  const volverPaginaAnterior = () => {
    history.push(rutaVolver);
  };

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Funcionario",
    correo: "",
    rol: "funcionario",
    cargo: "Funcionario municipal",
    area: "Área municipal",
  });

  const [solicitud, setSolicitud] = useState<any | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("En revisión");
  const [observacion, setObservacion] = useState("");
  const [mostrarDocumentos, setMostrarDocumentos] = useState(false);
  const [documentosSeleccionados, setDocumentosSeleccionados] = useState<
    string[]
  >([]);
  const [fechaLimite, setFechaLimite] = useState("2026-04-27");
  const [mensajeSistema, setMensajeSistema] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const obtenerValor = (objeto: any, campo: string, respaldo: any = ""): any => {
    const valor = objeto?.[campo];

    if (valor === undefined || valor === null || valor === "") {
      return respaldo;
    }

    return valor;
  };

  const normalizarTexto = (texto: string) => {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha || fecha === "Sin fecha") return "Sin fecha";

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

  const obtenerUsuarioFuncionarioActual = (): UsuarioActual => {
    const usuario = authService.getUsuarioActual();

    if (usuario) {
      return {
        nombre: usuario.nombre || "Funcionario",
        correo: usuario.correo || "",
        rol: usuario.rol || "funcionario",
        cargo: usuario.cargo || "Funcionario municipal",
        area: usuario.area || "Área municipal",
      };
    }

    return {
      nombre: "Funcionario",
      correo: "",
      rol: "funcionario",
      cargo: "Funcionario municipal",
      area: "Área municipal",
    };
  };

  const obtenerIniciales = (nombre: string) => {
    const partes = nombre.trim().split(" ").filter(Boolean);

    if (partes.length === 0) return "FN";
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  };

  const obtenerId = (item: any) => {
    return (
      obtenerValor(item, "codigo") ||
      obtenerValor(item, "id") ||
      obtenerValor(item, "solicitudId") ||
      idParametro ||
      "SIN-ID"
    );
  };

  const obtenerTramite = (item: any) => {
    return (
      obtenerValor(item, "tramite") ||
      obtenerValor(item, "tipoTramite") ||
      obtenerValor(item, "tipoPatente") ||
      "Trámite municipal"
    );
  };

  const obtenerSolicitante = (item: any) => {
    return (
      obtenerValor(item, "razonSocial") ||
      obtenerValor(item, "solicitante") ||
      obtenerValor(item, "nombreSolicitante") ||
      obtenerValor(item, "usuarioNombre") ||
      obtenerValor(item, "nombre") ||
      "Solicitante no informado"
    );
  };

  const obtenerRut = (item: any) => {
    return (
      obtenerValor(item, "rut") ||
      obtenerValor(item, "rutEmpresa") ||
      obtenerValor(item, "rutSolicitante") ||
      obtenerValor(item, "identificacion") ||
      "Sin RUT"
    );
  };

  const obtenerEstado = (item: any) => {
    return obtenerValor(item, "estado", "En revisión");
  };

  const obtenerEstadoGestion = (item: any) => {
    const estado = normalizarTexto(obtenerEstado(item));

    if (estado.includes("aprob")) return "Aprobada";
    if (estado.includes("rechaz")) return "Rechazada";

    if (
      estado.includes("falta") ||
      estado.includes("document") ||
      estado.includes("observada")
    ) {
      return "Pendiente de documentos";
    }

    if (
      estado.includes("ingresada") ||
      estado.includes("proceso") ||
      estado.includes("revision")
    ) {
      return "En revisión";
    }

    return "En revisión";
  };

  const convertirEstadoParaBackend = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (texto.includes("aprob")) return "aprobada";
    if (texto.includes("rechaz")) return "rechazada";

    if (
      texto.includes("pendiente") ||
      texto.includes("document") ||
      texto.includes("falta")
    ) {
      return "observada";
    }

    return "en_revision";
  };

  const obtenerArea = (item: any) => {
    return (
      obtenerValor(item, "area") ||
      obtenerValor(item, "departamento") ||
      obtenerValor(item, "areaResponsable") ||
      "Atención General"
    );
  };

  const obtenerPrioridad = (item: any) => {
    return obtenerValor(item, "prioridad", "Media");
  };

  const obtenerFecha = (item: any) => {
    return formatearFecha(
      obtenerValor(item, "fechaIngreso") ||
        obtenerValor(item, "fechaRecibo") ||
        obtenerValor(item, "fecha") ||
        "Sin fecha"
    );
  };

  const obtenerContacto = (item: any) => {
    return (
      obtenerValor(item, "telefonoContacto") ||
      obtenerValor(item, "telefono") ||
      obtenerValor(item, "contacto") ||
      "No informado"
    );
  };

  const obtenerCorreo = (item: any) => {
    return (
      obtenerValor(item, "correoContacto") ||
      obtenerValor(item, "correo") ||
      obtenerValor(item, "email") ||
      obtenerValor(item, "usuarioCorreo") ||
      "No informado"
    );
  };

  const obtenerEncargado = (item: any) => {
    return (
      obtenerValor(item, "encargado") ||
      obtenerValor(item, "funcionario") ||
      obtenerValor(item, "asignadoA") ||
      obtenerValor(item, "funcionarioAsignado") ||
      usuarioActual.nombre ||
      "Funcionario"
    );
  };

  const claseEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (texto.includes("aprob")) return "estado-detalle aprobado";
    if (texto.includes("rechaz")) return "estado-detalle rechazado";
    if (texto.includes("pendiente") || texto.includes("document")) {
      return "estado-detalle pendiente";
    }

    return "estado-detalle revision";
  };

  const obtenerDocumentosFaltantes = (item: any): string[] => {
    const docs = obtenerValor(item, "documentosFaltantes");

    if (Array.isArray(docs)) {
      return docs
        .map((documento) => String(documento).trim())
        .filter(Boolean);
    }

    if (typeof docs === "string" && docs.trim() !== "") {
      return docs
        .split(",")
        .map((documento) => documento.trim())
        .filter(Boolean);
    }

    return [];
  };

  const documentosAdjuntos: DocumentoAdjunto[] = useMemo(() => {
    const documentosRaw = solicitud?.documentos;

    if (Array.isArray(documentosRaw)) {
      return documentosRaw;
    }

    return [];
  }, [solicitud]);

  const obtenerUrlDocumento = (documento: DocumentoAdjunto) => {
    const url =
      documento.url || documento.rutaArchivo || documento.ruta_archivo || "";

    if (!url) return "";

    if (url.startsWith("http")) {
      return url;
    }

    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    return `${environment.backendUrl}${normalizedUrl}`;
  };

  const obtenerNombreDocumento = (documento: DocumentoAdjunto) => {
    return documento.nombre || documento.nombre_archivo || "Documento adjunto";
  };

  const obtenerTipoDocumento = (documento: DocumentoAdjunto) => {
    const tipo = String(documento.type || documento.tipo || "").toLowerCase();
    const nombre = obtenerNombreDocumento(documento).toLowerCase();

    if (tipo.includes("pdf") || nombre.endsWith(".pdf")) return "PDF";

    if (
      tipo.includes("image") ||
      nombre.endsWith(".jpg") ||
      nombre.endsWith(".jpeg") ||
      nombre.endsWith(".png")
    ) {
      return "Imagen";
    }

    return "Archivo";
  };

  const formatearTamanoArchivo = (size?: number) => {
    if (!size || Number.isNaN(size)) return "";

    if (size < 1024) return `${size} bytes`;

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const abrirDocumento = (documento: DocumentoAdjunto) => {
    const urlDocumento = obtenerUrlDocumento(documento);

    if (!urlDocumento) {
      setMensajeSistema("Este documento no tiene una ruta válida.");
      return;
    }

    window.open(urlDocumento, "_blank", "noopener,noreferrer");
  };

  const cargarSolicitud = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = obtenerUsuarioFuncionarioActual();

      if (usuario.rol !== "funcionario") {
        history.push("/login-funcionario");
        return;
      }

      setUsuarioActual(usuario);

      const respuesta = await api.get(`/solicitudes/${idParametro}`);
      const solicitudApi = respuesta.data?.solicitud || respuesta.data;

      if (!solicitudApi) {
        setSolicitud(null);
        return;
      }

      setSolicitud(solicitudApi);
      setEstadoSeleccionado(obtenerEstadoGestion(solicitudApi));
      setObservacion(
        obtenerValor(solicitudApi, "comentarioFuncionario") ||
          obtenerValor(solicitudApi, "observacionFuncionario") ||
          ""
      );

      setDocumentosSeleccionados(obtenerDocumentosFaltantes(solicitudApi));
    } catch (error: any) {
      console.error("Error al cargar solicitud del funcionario:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo cargar la solicitud desde el backend.";

      setMensajeError(mensajeBackend);
      setSolicitud(null);
    } finally {
      setCargando(false);
    }
  };

  const cargarSolicitudEstable = useLatestCallback(cargarSolicitud);

  useEffect(() => {
    void cargarSolicitudEstable();

    const escucharCambios = () => {
      void cargarSolicitudEstable();
    };

    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);

    return () => {
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
    };
  }, [cargarSolicitudEstable, idParametro]);

  const toggleDocumento = (documento: string) => {
    setDocumentosSeleccionados((prev) =>
      prev.includes(documento)
        ? prev.filter((item) => item !== documento)
        : [...prev, documento]
    );
  };

  const guardarCambios = async () => {
    if (!solicitud) return;

    try {
      setMensajeSistema("");

      const estadoBackend = convertirEstadoParaBackend(estadoSeleccionado);

      let respuesta;

      try {
        respuesta = await api.put(`/solicitudes/${obtenerId(solicitud)}`, {
          estado: estadoBackend,
          observacion,
          documentosFaltantes: documentosSeleccionados,
          fechaLimiteDocumentos: fechaLimite,
        });
      } catch (errorPut: any) {
        if (
          errorPut.response?.status === 404 ||
          errorPut.response?.status === 405
        ) {
          respuesta = await api.patch(`/solicitudes/${obtenerId(solicitud)}`, {
            estado: estadoBackend,
            observacion,
            documentosFaltantes: documentosSeleccionados,
            fechaLimiteDocumentos: fechaLimite,
          });
        } else {
          throw errorPut;
        }
      }

      const solicitudActualizada =
        respuesta?.data?.solicitud || respuesta?.data || solicitud;

      setSolicitud(solicitudActualizada);
      setEstadoSeleccionado(obtenerEstadoGestion(solicitudActualizada));
      setObservacion(
        obtenerValor(solicitudActualizada, "comentarioFuncionario") ||
          obtenerValor(solicitudActualizada, "observacionFuncionario") ||
          observacion ||
          ""
      );

      window.dispatchEvent(new Event("solicitudesActualizadas"));

      setMensajeSistema("Cambios guardados correctamente en el backend.");

      setTimeout(() => {
        setMensajeSistema("");
      }, 3000);
    } catch (error: any) {
      console.error("Error al guardar cambios:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron guardar los cambios.";

      setMensajeSistema(mensajeBackend);
    }
  };

  const aprobarSolicitud = () => {
    setEstadoSeleccionado("Aprobada");
    setMostrarDocumentos(false);
  };

  const rechazarSolicitud = () => {
    setEstadoSeleccionado("Rechazada");
    setMostrarDocumentos(false);
  };

  const solicitarDocumentos = () => {
    setEstadoSeleccionado("Pendiente de documentos");
    setMostrarDocumentos((prev) => !prev);
  };

  const derivarSolicitud = () => {
    setEstadoSeleccionado("En revisión");
    setMostrarDocumentos(false);
  };

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  if (cargando && !solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-funcionario-content">
          <div className="detalle-funcionario-wrapper">
            <main className="detalle-funcionario-main">
              <section className="detalle-funcionario-empty">
                <IonIcon icon={refreshOutline} />
                <h2>Cargando solicitud...</h2>
                <p>Estamos obteniendo el detalle desde el backend municipal.</p>
              </section>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-funcionario-content">
          <div className="detalle-funcionario-wrapper">
            <main className="detalle-funcionario-main">
              <section className="detalle-funcionario-empty">
                <IonIcon icon={documentTextOutline} />
                <h2>No se encontró la solicitud</h2>
                <p>
                  {mensajeError ||
                    "La solicitud seleccionada no está disponible."}
                </p>
                <button onClick={volverPaginaAnterior}>{textoVolver}</button>
              </section>
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
              <div className="detalle-funcionario-avatar">
                {obtenerIniciales(usuarioActual.nombre || "Funcionario")}
              </div>

              <div>
                <strong>{usuarioActual.nombre || "Funcionario"}</strong>
                <small>{usuarioActual.cargo || "Funcionario municipal"}</small>
              </div>

              <button onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="detalle-funcionario-main">
            <section className="detalle-funcionario-breadcrumb">
              <button onClick={volverPaginaAnterior}>
                <IonIcon icon={homeOutline} />
                {textoOrigen}
              </button>
              <span>/</span>
              <p>Detalle de solicitud</p>
            </section>

            {mensajeSistema && (
              <section className="detalle-funcionario-message">
                <IonIcon icon={checkmarkCircleOutline} />
                <span>{mensajeSistema}</span>
              </section>
            )}

            <section className="detalle-funcionario-layout">
              <div className="detalle-funcionario-left">
                <section className="detalle-solicitud-card">
                  <div className="detalle-solicitud-title">
                    <div className="detalle-solicitud-icon">
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

                  <div className="detalle-solicitud-grid">
                    <div>
                      <IonIcon icon={documentTextOutline} />
                      <span>Tipo de trámite</span>
                      <strong>{obtenerTramite(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={personCircleOutline} />
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
                      <IonIcon icon={alertCircleOutline} />
                      <span>Prioridad</span>
                      <strong>{obtenerPrioridad(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={timeOutline} />
                      <span>Contacto</span>
                      <strong>{obtenerContacto(solicitud)}</strong>
                    </div>

                    <div>
                      <IonIcon icon={refreshOutline} />
                      <span>Sincronización</span>
                      <strong>Backend conectado</strong>
                    </div>
                  </div>
                </section>

                <section className="detalle-info-card">
                  <h3>Datos del formulario</h3>

                  <div className="detalle-info-grid">
                    <DatosTramite solicitud={solicitud} variante="grid" />

                    <div>
                      <span>Razón social</span>
                      <strong>{obtenerSolicitante(solicitud)}</strong>
                    </div>

                    <div>
                      <span>RUT</span>
                      <strong>{obtenerRut(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Correo electrónico</span>
                      <strong>{obtenerCorreo(solicitud)}</strong>
                    </div>

                    <div>
                      <span>Teléfono</span>
                      <strong>{obtenerContacto(solicitud)}</strong>
                    </div>
                  </div>

                  <hr />

                  <h3>Detalles de la solicitud</h3>

                  <div className="detalle-info-grid">
                    <div>
                      <span>Dirección del local</span>
                      <strong>
                        {obtenerValor(
                          solicitud,
                          "direccion",
                          "No informado"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Tipo de patente</span>
                      <strong>
                        {obtenerValor(
                          solicitud,
                          "tipoPatente",
                          "No informado"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Rol de avalúo</span>
                      <strong>
                        {obtenerValor(
                          solicitud,
                          "rolAvaluo",
                          "No informado"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>PyME</span>
                      <strong>
                        {String(obtenerValor(solicitud, "pyme")) === "true" ||
                        obtenerValor(solicitud, "pyme") === true
                          ? "Sí"
                          : "No"}
                      </strong>
                    </div>

                    <div>
                      <span>Giro comercial</span>
                      <strong>
                        {obtenerValor(solicitud, "giro", "No informado")}
                      </strong>
                    </div>

                    <div>
                      <span>Superficie del local</span>
                      <strong>
                        {obtenerValor(
                          solicitud,
                          "superficie",
                          "No informado"
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Observaciones del solicitante</span>
                      <strong>
                        {obtenerValor(
                          solicitud,
                          "observacionesSolicitante",
                          obtenerValor(
                            solicitud,
                            "observacion",
                            "Sin observaciones del solicitante."
                          )
                        )}
                      </strong>
                    </div>
                  </div>
                </section>

                <section className="detalle-documentos-card">
                  <h3>Documentos adjuntos</h3>

                  {documentosAdjuntos.length > 0 ? (
                    documentosAdjuntos.map((documento, index) => {
                      const nombreDocumento = obtenerNombreDocumento(documento);
                      const tipoDocumento = obtenerTipoDocumento(documento);
                      const tamanoDocumento = formatearTamanoArchivo(
                        documento.size
                      );
                      const fechaDocumento = formatearFecha(
                        documento.createdAt || ""
                      );

                      return (
                        <div
                          className="detalle-documento-row"
                          key={`${documento.id || nombreDocumento}-${index}`}
                        >
                          <div>
                            <IonIcon icon={documentAttachOutline} />
                            <div>
                              <strong>{nombreDocumento}</strong>
                              <span>
                                {tipoDocumento}
                                {tamanoDocumento
                                  ? ` · ${tamanoDocumento}`
                                  : ""}
                              </span>
                            </div>
                          </div>

                          <div>
                            <span>
                              {fechaDocumento !== "Sin fecha"
                                ? fechaDocumento
                                : "Documento recibido"}
                            </span>

                            <button
                              type="button"
                              onClick={() => abrirDocumento(documento)}
                              title="Abrir documento"
                            >
                              <IonIcon icon={cloudDownloadOutline} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="detalle-documento-row">
                      <div>
                        <IonIcon icon={documentAttachOutline} />
                        <div>
                          <strong>No hay documentos adjuntos</strong>
                          <span>
                            Esta solicitud no tiene archivos reales asociados.
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="detalle-funcionario-panel">
                <section className="panel-gestion-card">
                  <h3>Panel de gestión funcionario</h3>

                  <label>
                    Estado de la solicitud
                    <select
                      value={estadoSeleccionado}
                      onChange={(event) =>
                        setEstadoSeleccionado(event.target.value)
                      }
                    >
                      <option>En revisión</option>
                      <option>Pendiente de documentos</option>
                      <option>Aprobada</option>
                      <option>Rechazada</option>
                    </select>
                  </label>

                  <label>
                    Observaciones internas / comentario al ciudadano
                    <textarea
                      value={observacion}
                      onChange={(event) => setObservacion(event.target.value)}
                      placeholder="Agrega observaciones sobre la revisión de esta solicitud..."
                    />
                  </label>

                  <small>{observacion.length}/1000 caracteres</small>

                  <button className="aprobar-button" onClick={aprobarSolicitud}>
                    <IonIcon icon={checkmarkCircleOutline} />
                    Aprobar solicitud
                  </button>

                  <button
                    className="solicitar-button"
                    onClick={solicitarDocumentos}
                  >
                    <IonIcon icon={documentAttachOutline} />
                    Solicitar documentos
                  </button>

                  {mostrarDocumentos && (
                    <div className="documentos-faltantes-box">
                      <h4>Documentos faltantes / requeridos</h4>
                      <p>
                        Marca los documentos que se solicitarán al ciudadano.
                        Luego presiona Guardar cambios.
                      </p>

                      {documentosDisponibles.map((documento) => (
                        <label key={documento} className="documento-check-row">
                          <input
                            type="checkbox"
                            checked={documentosSeleccionados.includes(
                              documento
                            )}
                            onChange={() => toggleDocumento(documento)}
                          />
                          <span>{documento}</span>
                        </label>
                      ))}

                      <label>
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

                  <button className="rechazar-button" onClick={rechazarSolicitud}>
                    <IonIcon icon={alertCircleOutline} />
                    Rechazar solicitud
                  </button>

                  <button className="derivar-button" onClick={derivarSolicitud}>
                    <IonIcon icon={swapHorizontalOutline} />
                    Mantener en revisión
                  </button>

                  <button className="guardar-button" onClick={guardarCambios}>
                    <IonIcon icon={saveOutline} />
                    Subir cambios
                  </button>
                </section>

                <section className="panel-sync-card">
                  <IonIcon icon={notificationsOutline} />
                  <h3>Notificación automática al ciudadano</h3>
                  <p>
                    Los cambios se enviarán al ciudadano solo cuando presiones
                    Guardar cambios.
                  </p>

                  <div>
                    <span></span>
                    Sincronización con backend
                  </div>
                </section>
              </aside>
            </section>

            <section className="detalle-funcionario-bottom">
              <button onClick={volverPaginaAnterior}>
                <IonIcon icon={arrowBackOutline} />
                {textoVolver}
              </button>
            </section>
          </main>

          <footer className="detalle-funcionario-footer">
            <span>© 2026 Municipalidad de Santo Domingo</span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudFuncionario;
