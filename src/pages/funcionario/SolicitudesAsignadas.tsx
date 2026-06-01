import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  arrowBackOutline,
  barChartOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  documentTextOutline,
  downloadOutline,
  filterOutline,
  helpCircleOutline,
  informationCircleOutline,
  logOutOutline,
  personOutline,
  searchOutline,
  swapVerticalOutline,
  timeOutline,
} from "ionicons/icons";

import api from "../../services/api";
import { authService } from "../../services/authService";
import "./SolicitudesAsignadas.css";

interface UsuarioActual {
  id?: number | string;
  nombre?: string;
  correo?: string;
  rol?: string;
  cargo?: string;
  area?: string;
}

const SolicitudesAsignadas: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Funcionario",
    correo: "",
    rol: "funcionario",
    cargo: "",
    area: "",
  });

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const registrosPorPagina = 5;

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

  const obtenerUsuarioFuncionarioActual = (): UsuarioActual | null => {
    const usuario = authService.getUsuarioActual() as any;

    if (!usuario) {
      return null;
    }

    return {
      id: usuario.id,
      nombre: usuario.nombre || "Funcionario",
      correo: usuario.correo || usuario.email || "",
      rol: usuario.rol || usuario.role || "funcionario",
      cargo:
        usuario.cargo ||
        usuario.puesto ||
        usuario.descripcionCargo ||
        "Funcionario municipal",
      area:
        usuario.area ||
        usuario.departamento ||
        usuario.unidad ||
        "Área municipal",
    };
  };

  const obtenerIniciales = (nombre: string) => {
    const partes = nombre.trim().split(" ").filter(Boolean);

    if (partes.length === 0) return "FN";

    if (partes.length === 1) {
      return partes[0].slice(0, 2).toUpperCase();
    }

    return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
  };

  const obtenerId = (item: any) => {
    return (
      obtenerValor(item, "codigo") ||
      obtenerValor(item, "solicitudId") ||
      obtenerValor(item, "id") ||
      "SIN-ID"
    );
  };

  const obtenerCodigo = (item: any) => {
    return (
      obtenerValor(item, "codigo") ||
      obtenerValor(item, "solicitudId") ||
      obtenerValor(item, "id") ||
      "SIN-CODIGO"
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
      obtenerValor(item, "usuarioRut") ||
      obtenerValor(item, "identificacion") ||
      "Sin RUT"
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

  const obtenerDetalleTramite = (item: any) => {
    return (
      obtenerValor(item, "detalle") ||
      obtenerValor(item, "subtipo") ||
      obtenerValor(item, "descripcionCorta") ||
      obtenerValor(item, "tipoPatente") ||
      "Gestión municipal"
    );
  };

  const obtenerEstado = (item: any) => {
    return obtenerValor(item, "estado", "En revisión");
  };

  const obtenerPrioridad = (item: any) => {
    return obtenerValor(item, "prioridad", "Media");
  };

  const obtenerFecha = (item: any) => {
    return formatearFecha(
      obtenerValor(item, "fechaReporte") ||
        obtenerValor(item, "fechaRecibo") ||
        obtenerValor(item, "fechaIngreso") ||
        obtenerValor(item, "fecha") ||
        "Sin fecha"
    );
  };

  const obtenerObservacion = (item: any) => {
    return (
      obtenerValor(item, "comentarioFuncionario") ||
      obtenerValor(item, "observacionFuncionario") ||
      obtenerValor(item, "observacionesSolicitante") ||
      obtenerValor(item, "observacion") ||
      obtenerValor(item, "observaciones") ||
      obtenerValor(item, "descripcion") ||
      "Sin observaciones"
    );
  };

  const normalizarEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (texto.includes("aprob") || texto.includes("resuelt")) return "aprobada";
    if (texto.includes("rechaz")) return "rechazada";

    if (
      texto.includes("pendiente") ||
      texto.includes("document") ||
      texto.includes("falta")
    ) {
      return "pendiente";
    }

    return "revision";
  };

  const normalizarPrioridad = (prioridad: string) => {
    const texto = normalizarTexto(prioridad);

    if (texto.includes("alta")) return "alta";
    if (texto.includes("baja")) return "baja";

    return "media";
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setMensajeError("");

      const usuario = obtenerUsuarioFuncionarioActual();

      if (!usuario || usuario.rol !== "funcionario") {
        history.push("/login-funcionario");
        return;
      }

      setUsuarioActual(usuario);

      const respuesta = await api.get("/solicitudes");
      const solicitudesBackend = respuesta.data?.solicitudes || [];

      setSolicitudes(Array.isArray(solicitudesBackend) ? solicitudesBackend : []);
    } catch (error: any) {
      console.error("Error al cargar solicitudes asignadas:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudieron cargar las solicitudes asignadas.";

      setMensajeError(mensajeBackend);
      setSolicitudes([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();

    const escucharCambios = () => {
      cargarDatos();
    };

    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);

    return () => {
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
    };
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    let resultado = [...solicitudes];

    if (busqueda.trim() !== "") {
      const textoBusqueda = normalizarTexto(busqueda);

      resultado = resultado.filter((solicitud) => {
        const textoSolicitud = [
          obtenerId(solicitud),
          obtenerCodigo(solicitud),
          obtenerSolicitante(solicitud),
          obtenerRut(solicitud),
          obtenerTramite(solicitud),
          obtenerEstado(solicitud),
          obtenerPrioridad(solicitud),
          obtenerObservacion(solicitud),
          obtenerValor(solicitud, "encargado"),
          obtenerValor(solicitud, "funcionarioAsignado"),
        ]
          .join(" ")
          .toLowerCase();

        return normalizarTexto(textoSolicitud).includes(textoBusqueda);
      });
    }

    return resultado;
  }, [solicitudes, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(solicitudesFiltradas.length / registrosPorPagina)
  );

  const solicitudesPagina = solicitudesFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const totalAsignadas = solicitudesFiltradas.length;

  const totalRevision = solicitudesFiltradas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "revision"
  ).length;

  const totalPendientes = solicitudesFiltradas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "pendiente"
  ).length;

  const totalResueltas = solicitudesFiltradas.filter((solicitud) => {
    const estado = normalizarEstado(obtenerEstado(solicitud));
    return estado === "aprobada" || estado === "rechazada";
  }).length;

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const verSolicitud = (solicitud: any) => {
    history.push(`/funcionario/solicitud/${obtenerCodigo(solicitud)}`);
  };

  const irPanel = () => {
    history.push("/funcionario/inicio");
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="solicitudes-asignadas-content">
        <div className="solicitudes-asignadas-wrapper">
          <header className="solicitudes-asignadas-header">
            <div className="solicitudes-asignadas-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />

              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>

            <div className="solicitudes-asignadas-user-area">
              <button className="panel-button" onClick={irPanel}>
                <IonIcon icon={personOutline} />
                Panel funcionario
              </button>

              <div className="funcionario-profile">
                <div className="funcionario-avatar-lista">
                  {obtenerIniciales(usuarioActual.nombre || "Funcionario")}
                </div>

                <div>
                  <strong>{usuarioActual.nombre || "Funcionario"}</strong>
                  <small>
                    {usuarioActual.cargo ||
                      usuarioActual.area ||
                      "Funcionario municipal"}
                  </small>
                </div>
              </div>

              <button className="logout-lista-button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
              </button>
            </div>
          </header>

          <main className="solicitudes-asignadas-main">
            <section className="solicitudes-asignadas-hero">
              <div className="solicitudes-asignadas-title">
                <h2>Solicitudes asignadas</h2>
                <p>
                  Revisa, gestiona y da seguimiento únicamente a las solicitudes
                  que han sido asignadas a tu usuario.
                </p>
              </div>

              <div className="solicitudes-asignadas-kpis">
                <article>
                  <IonIcon icon={personOutline} />
                  <div>
                    <span>Asignadas a mí</span>
                    <strong>{cargando ? "..." : totalAsignadas}</strong>
                    <p>Total asignadas</p>
                  </div>
                </article>

                <article>
                  <IonIcon icon={documentTextOutline} />
                  <div>
                    <span>En revisión</span>
                    <strong className="orange">
                      {cargando ? "..." : totalRevision}
                    </strong>
                    <p>En proceso</p>
                  </div>
                </article>

                <article>
                  <IonIcon icon={timeOutline} />
                  <div>
                    <span>Pendientes</span>
                    <strong className="purple">
                      {cargando ? "..." : totalPendientes}
                    </strong>
                    <p>Por revisar</p>
                  </div>
                </article>

                <article>
                  <IonIcon icon={checkmarkCircleOutline} />
                  <div>
                    <span>Resueltas</span>
                    <strong className="green">
                      {cargando ? "..." : totalResueltas}
                    </strong>
                    <p>Completadas</p>
                  </div>
                </article>
              </div>
            </section>

            {mensajeError && (
              <section className="assigned-info-box">
                <IonIcon icon={informationCircleOutline} />
                <span>{mensajeError}</span>
              </section>
            )}

            <section className="assigned-info-box">
              <IonIcon icon={informationCircleOutline} />
              <span>
                Solo visualizarás las solicitudes asignadas a{" "}
                {usuarioActual.nombre || "tu usuario"}. La información proviene
                del backend.
              </span>
            </section>

            <section className="solicitudes-table-card">
              <div className="solicitudes-toolbar">
                <div className="toolbar-actions">
                  <button>
                    <IonIcon icon={filterOutline} />
                    Filtrar
                  </button>

                  <button>
                    <IonIcon icon={swapVerticalOutline} />
                    Ordenar
                  </button>

                  <button>
                    <IonIcon icon={downloadOutline} />
                    Exportar
                  </button>
                </div>

                <div className="search-box-funcionario">
                  <IonIcon icon={searchOutline} />
                  <input
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar por ID, solicitante, trámite u observaciones..."
                  />
                </div>
              </div>

              <div className="solicitudes-table-scroll">
                <table className="solicitudes-asignadas-table">
                  <thead>
                    <tr>
                      <th>
                        <input type="checkbox" />
                      </th>
                      <th>ID</th>
                      <th>Solicitante</th>
                      <th>Trámite</th>
                      <th>Estado</th>
                      <th>Prioridad</th>
                      <th>
                        Fecha reporte
                        <IonIcon icon={calendarOutline} />
                      </th>
                      <th>Observaciones</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudesPagina.map((solicitud) => (
                      <tr key={obtenerCodigo(solicitud)}>
                        <td>
                          <input type="checkbox" />
                        </td>

                        <td>
                          <strong>
                            {obtenerCodigo(solicitud).replace("SOL-2026-", "")}
                          </strong>
                        </td>

                        <td>
                          <strong>{obtenerSolicitante(solicitud)}</strong>
                          <span>{obtenerRut(solicitud)}</span>
                        </td>

                        <td>
                          <strong>{obtenerTramite(solicitud)}</strong>
                          <span>{obtenerDetalleTramite(solicitud)}</span>
                        </td>

                        <td>
                          <span
                            className={`estado-chip ${normalizarEstado(
                              obtenerEstado(solicitud)
                            )}`}
                          >
                            {obtenerEstado(solicitud)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`prioridad-chip ${normalizarPrioridad(
                              obtenerPrioridad(solicitud)
                            )}`}
                          >
                            {obtenerPrioridad(solicitud)}
                          </span>
                        </td>

                        <td>
                          <span>{obtenerFecha(solicitud)}</span>
                        </td>

                        <td>
                          <p>{obtenerObservacion(solicitud)}</p>
                        </td>

                        <td>
                          <button
                            className="ver-solicitud-link"
                            onClick={() => verSolicitud(solicitud)}
                          >
                            Ver solicitud
                            <IonIcon icon={chevronForwardOutline} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {solicitudesPagina.length === 0 && (
                  <div className="sin-solicitudes-box">
                    <IonIcon icon={documentTextOutline} />
                    <h3>No hay solicitudes para mostrar</h3>
                    <p>
                      No existen solicitudes asignadas al funcionario actual o
                      no hay resultados para la búsqueda.
                    </p>
                  </div>
                )}
              </div>

              <div className="table-footer-row">
                <span>
                  Mostrando {solicitudesPagina.length} de{" "}
                  {solicitudesFiltradas.length} solicitudes asignadas
                </span>

                <div className="pagination-buttons">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual((prev) => prev - 1)}
                  >
                    <IonIcon icon={chevronBackOutline} />
                  </button>

                  {Array.from({ length: totalPaginas }).map((_, index) => (
                    <button
                      key={index + 1}
                      className={paginaActual === index + 1 ? "active" : ""}
                      onClick={() => setPaginaActual(index + 1)}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual((prev) => prev + 1)}
                  >
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                </div>
              </div>
            </section>

            <section className="solicitudes-resumen-row">
              <article className="resumen-operativo-card">
                <div className="resumen-title">
                  <IonIcon icon={barChartOutline} />
                  <div>
                    <h3>Resumen operativo</h3>
                    <p>
                      Este panel monitorea únicamente la carga de trabajo del
                      funcionario autenticado.
                    </p>
                  </div>
                </div>

                <div className="resumen-kpis">
                  <div>
                    <IonIcon icon={personOutline} />
                    <span>Asignadas a mí</span>
                    <strong>{totalAsignadas}</strong>
                  </div>

                  <div>
                    <IonIcon icon={documentTextOutline} />
                    <span>En revisión</span>
                    <strong>{totalRevision}</strong>
                  </div>

                  <div>
                    <IonIcon icon={timeOutline} />
                    <span>Pendientes</span>
                    <strong>{totalPendientes}</strong>
                  </div>

                  <div>
                    <IonIcon icon={checkmarkCircleOutline} />
                    <span>Resueltas</span>
                    <strong>{totalResueltas}</strong>
                  </div>
                </div>
              </article>

              <article className="ayuda-funcionario-card">
                <IonIcon icon={helpCircleOutline} />
                <h3>¿Necesitas ayuda?</h3>
                <p>
                  Consulta el manual de usuario o contacta al soporte técnico.
                </p>
                <button>Ir a ayuda</button>
              </article>
            </section>

            <section className="solicitudes-bottom-actions">
              <button className="volver-panel-button" onClick={irPanel}>
                <IonIcon icon={arrowBackOutline} />
                Volver al panel
              </button>

              <button className="exportar-pdf-button">
                <IonIcon icon={downloadOutline} />
                Exportar reporte PDF
              </button>
            </section>
          </main>

          <footer className="solicitudes-asignadas-footer">
            <span>
              © 2026 Municipalidad de Santo Domingo. Todos los derechos
              reservados.
            </span>
            <span>Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudesAsignadas;