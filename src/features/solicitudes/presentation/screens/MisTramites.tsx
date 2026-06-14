import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  arrowBackOutline,
  arrowForwardOutline,
  briefcaseOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  downloadOutline,
  folderOpenOutline,
  funnelOutline,
  logOutOutline,
  notificationsOutline,
  personCircleOutline,
  searchOutline,
  swapVerticalOutline,
  timeOutline,
  bulbOutline,
  addCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import type { Solicitud } from "../../domain/entities/Solicitud";
import { authService } from "../../../auth/composition/authService";
import { solicitudesApiService } from "../../composition/solicitudesService";
import "./MisTramites.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rut?: string;
}

type EstadoFiltro =
  | "todos"
  | "ingresada"
  | "en_revision"
  | "derivada"
  | "pendiente_documentos"
  | "aprobada"
  | "rechazada"
  | "cerrada";

type OrdenFiltro =
  | "recientes"
  | "antiguas"
  | "id_asc"
  | "id_desc"
  | "estado";

const MisTramites: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Usuario",
    correo: "",
  });

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
  const [ordenFiltro, setOrdenFiltro] = useState<OrdenFiltro>("recientes");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarOrden, setMostrarOrden] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const [cargando, setCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const registrosPorPagina = 5;

  useEffect(() => {
    const cargarDatos = async () => {
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

        const solicitudesBackend =
          await solicitudesApiService.obtenerMisSolicitudes();

        setSolicitudes(solicitudesBackend as Solicitud[]);
      } catch (error: any) {
        console.error("Error al cargar mis trámites:", error);

        const mensajeBackend =
          error.response?.data?.mensaje ||
          error.response?.data?.error ||
          "No se pudieron cargar tus trámites. Intenta nuevamente.";

        setMensajeError(mensajeBackend);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [history]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro, ordenFiltro]);

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const obtenerValor = (solicitud: Solicitud, campo: string) => {
    const s = solicitud as any;
    return s[campo] || "";
  };

  const obtenerId = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "id") ||
      obtenerValor(solicitud, "codigo") ||
      "SIN-ID"
    );
  };

  const obtenerTramite = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tipoPatente") ||
      obtenerValor(solicitud, "tramite") ||
      "Trámite municipal"
    );
  };

  const obtenerEstado = (solicitud: Solicitud) => {
    return obtenerValor(solicitud, "estado") || "Ingresada";
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

  const obtenerFechaIngreso = (solicitud: Solicitud) => {
    const fecha =
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fecha") ||
      "Sin fecha";

    return formatearFecha(fecha);
  };

  const obtenerUltimaActualizacion = (solicitud: Solicitud) => {
    const fecha =
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "updatedAt") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      "Sin fecha";

    return formatearFecha(fecha);
  };

  const obtenerFechaOrden = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "updatedAt") ||
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      ""
    );
  };

  const obtenerEncargado = (solicitud: Solicitud) => {
    return (
      obtenerValor(solicitud, "encargado") ||
      obtenerValor(solicitud, "funcionarioAsignado") ||
      obtenerValor(solicitud, "funcionario") ||
      obtenerValor(solicitud, "area") ||
      "Área municipal"
    );
  };

  const normalizarEstado = (estado: string) => {
    const estadoLower = estado.toLowerCase();

    if (estadoLower.includes("cerrad")) return "cerrada";
    if (estadoLower.includes("derivad")) return "derivada";
    if (estadoLower.includes("aprob")) return "aprobada";
    if (estadoLower.includes("rechaz")) return "rechazada";
    if (
      estadoLower.includes("falta") ||
      estadoLower.includes("pendiente") ||
      estadoLower.includes("document")
    ) {
      return "pendiente_documentos";
    }
    if (
      estadoLower.includes("revisión") ||
      estadoLower.includes("revision") ||
      estadoLower.includes("proceso")
    ) {
      return "en_revision";
    }

    return "ingresada";
  };

  const textoEstado = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "cerrada") return "Cerrada";
    if (estadoNormalizado === "derivada") return "Derivada";
    if (estadoNormalizado === "aprobada") return "Aprobada";
    if (estadoNormalizado === "rechazada") return "Rechazada";
    if (estadoNormalizado === "pendiente_documentos")
      return "Pendiente documentos";
    if (estadoNormalizado === "en_revision") return "En revisión";
    return "Ingresada";
  };

  const claseEstado = (estado: string) => {
    const estadoNormalizado = normalizarEstado(estado);

    if (estadoNormalizado === "cerrada")
      return "badge-estado estado-aprobada";
    if (estadoNormalizado === "derivada")
      return "badge-estado estado-revision";
    if (estadoNormalizado === "aprobada")
      return "badge-estado estado-aprobada";
    if (estadoNormalizado === "rechazada")
      return "badge-estado estado-rechazada";
    if (estadoNormalizado === "pendiente_documentos")
      return "badge-estado estado-pendiente";
    if (estadoNormalizado === "en_revision")
      return "badge-estado estado-revision";

    return "badge-estado estado-ingresada";
  };

  const convertirFechaOrden = (fecha: string) => {
    if (!fecha || fecha === "Sin fecha") return 0;

    const fechaDate = new Date(fecha);

    if (!Number.isNaN(fechaDate.getTime())) {
      return fechaDate.getTime();
    }

    const fechaLimpia = fecha.split(" ")[0];
    const partes = fechaLimpia.split("/");

    if (partes.length === 3) {
      const dia = Number(partes[0]);
      const mes = Number(partes[1]) - 1;
      const anioTexto = partes[2];
      const anio =
        anioTexto.length === 2 ? Number(`20${anioTexto}`) : Number(anioTexto);
      return new Date(anio, mes, dia).getTime();
    }

    return 0;
  };

  const solicitudesFiltradas = (() => {
    const texto = busqueda.trim().toLowerCase();

    let resultado = solicitudes.filter((solicitud) => {
      const id = obtenerId(solicitud).toLowerCase();
      const tramite = obtenerTramite(solicitud).toLowerCase();
      const estadoNormalizado = normalizarEstado(obtenerEstado(solicitud));

      const coincideBusqueda =
        texto === "" || id.includes(texto) || tramite.includes(texto);

      const coincideEstado =
        estadoFiltro === "todos" || estadoNormalizado === estadoFiltro;

      return coincideBusqueda && coincideEstado;
    });

    resultado = [...resultado].sort((a, b) => {
      const idA = obtenerId(a);
      const idB = obtenerId(b);
      const fechaA = convertirFechaOrden(obtenerFechaOrden(a));
      const fechaB = convertirFechaOrden(obtenerFechaOrden(b));
      const estadoA = textoEstado(obtenerEstado(a));
      const estadoB = textoEstado(obtenerEstado(b));

      if (ordenFiltro === "antiguas") return fechaA - fechaB;
      if (ordenFiltro === "id_asc") return idA.localeCompare(idB);
      if (ordenFiltro === "id_desc") return idB.localeCompare(idA);
      if (ordenFiltro === "estado") return estadoA.localeCompare(estadoB);

      return fechaB - fechaA;
    });

    return resultado;
  })();

  const totalPaginas = Math.max(
    1,
    Math.ceil(solicitudesFiltradas.length / registrosPorPagina)
  );

  const solicitudesPaginadas = solicitudesFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const totalTramites = solicitudes.length;

  const totalEnRevision = solicitudes.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "en_revision"
  ).length;

  const totalPendientes = solicitudes.filter(
    (solicitud) =>
      normalizarEstado(obtenerEstado(solicitud)) === "pendiente_documentos"
  ).length;

  const totalAprobadas = solicitudes.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "aprobada"
  ).length;

  const avisosNuevos = totalEnRevision + totalPendientes;

  const irDetalle = (id: string) => {
    history.push(`/usuario/solicitud/${id}`);
  };

  const exportarCSV = () => {
    const encabezados = [
      "ID",
      "Trámite",
      "Estado",
      "Fecha ingreso",
      "Última actualización",
      "Encargado / Área",
    ];

    const filas = solicitudesFiltradas.map((solicitud) => [
      obtenerId(solicitud),
      obtenerTramite(solicitud),
      textoEstado(obtenerEstado(solicitud)),
      obtenerFechaIngreso(solicitud),
      obtenerUltimaActualizacion(solicitud),
      obtenerEncargado(solicitud),
    ]);

    const csv = [encabezados, ...filas]
      .map((fila) =>
        fila
          .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = "mis-tramites.csv";
    enlace.click();

    URL.revokeObjectURL(url);
  };

  const inicioRango =
    solicitudesFiltradas.length === 0
      ? 0
      : (paginaActual - 1) * registrosPorPagina + 1;

  const finRango = Math.min(
    paginaActual * registrosPorPagina,
    solicitudesFiltradas.length
  );

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="mis-tramites-content">
        <div className="mis-tramites-wrapper">
          <header className="mis-tramites-header">
            <div className="mis-tramites-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />
              <h1>Municipalidad de Santo Domingo</h1>
            </div>

            <div className="mis-tramites-user-area">
              <button
                className="mis-tramites-notification-button"
                onClick={() => history.push("/usuario/notificaciones")}
                title="Notificaciones pendientes"
              >
                <IonIcon icon={notificationsOutline} />
                {avisosNuevos > 0 && <span>{avisosNuevos}</span>}
              </button>

              <div className="mis-tramites-user-chip">
                <IonIcon icon={personCircleOutline} />
                <div>
                  <strong>{usuarioActual.nombre || "Usuario"}</strong>
                  <small>Usuario ciudadano</small>
                </div>
              </div>

              <button className="mis-tramites-logout" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="mis-tramites-main">
            {cargando && (
              <section className="mis-tramites-advice">
                <div>
                  <h3>Cargando trámites...</h3>
                  <p>
                    Estamos obteniendo tus solicitudes desde el sistema
                    municipal.
                  </p>
                </div>
              </section>
            )}

            {mensajeError && (
              <section className="mis-tramites-advice">
                <div>
                  <h3>No se pudieron cargar los trámites</h3>
                  <p>{mensajeError}</p>
                </div>
              </section>
            )}

            <section className="mis-tramites-title-card">
              <div className="mis-tramites-title-icon">
                <IonIcon icon={folderOpenOutline} />
              </div>

              <div>
                <h2>Mis trámites</h2>
                <p>
                  Revisa el estado, avance y seguimiento de tus solicitudes
                  municipales.
                </p>
              </div>

              <button
                className="new-tramite-button"
                onClick={() => history.push("/usuario/seleccionar-tramite")}
              >
                <IonIcon icon={addCircleOutline} />
                Realizar nuevo trámite
              </button>
            </section>

            <section className="mis-tramites-stats">
              <article className="mis-tramites-stat-card">
                <div className="stat-icon blue">
                  <IonIcon icon={documentTextOutline} />
                </div>
                <div>
                  <span>Total trámites</span>
                  <strong>{totalTramites}</strong>
                  <p>Todos los estados</p>
                </div>
                <button onClick={() => setEstadoFiltro("todos")}>
                  Ver todos <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article className="mis-tramites-stat-card">
                <div className="stat-icon yellow">
                  <IonIcon icon={timeOutline} />
                </div>
                <div>
                  <span>En revisión</span>
                  <strong>{totalEnRevision}</strong>
                  <p>Trámites en curso</p>
                </div>
                <button onClick={() => setEstadoFiltro("en_revision")}>
                  Ver detalles <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article className="mis-tramites-stat-card">
                <div className="stat-icon orange">
                  <IonIcon icon={folderOpenOutline} />
                </div>
                <div>
                  <span>Pendientes de documentos</span>
                  <strong>{totalPendientes}</strong>
                  <p>Requieren tu atención</p>
                </div>
                <button onClick={() => setEstadoFiltro("pendiente_documentos")}>
                  Ver detalles <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>

              <article className="mis-tramites-stat-card">
                <div className="stat-icon green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <div>
                  <span>Aprobados</span>
                  <strong>{totalAprobadas}</strong>
                  <p>Trámites finalizados</p>
                </div>
                <button onClick={() => setEstadoFiltro("aprobada")}>
                  Ver detalles <IonIcon icon={arrowForwardOutline} />
                </button>
              </article>
            </section>

            <section className="tramites-table-card">
              <div className="table-card-header">
                <h3>Listado de mis trámites</h3>

                <div className="table-actions">
                  <button
                    className={mostrarFiltros ? "active" : ""}
                    onClick={() => {
                      setMostrarFiltros(!mostrarFiltros);
                      setMostrarOrden(false);
                    }}
                  >
                    <IonIcon icon={funnelOutline} />
                    Filtrar
                  </button>

                  <button
                    className={mostrarOrden ? "active" : ""}
                    onClick={() => {
                      setMostrarOrden(!mostrarOrden);
                      setMostrarFiltros(false);
                    }}
                  >
                    <IonIcon icon={swapVerticalOutline} />
                    Ordenar
                  </button>

                  <button onClick={exportarCSV}>
                    <IonIcon icon={downloadOutline} />
                    Exportar
                  </button>
                </div>
              </div>

              <div className="table-tools-row">
                <div className="search-box">
                  <IonIcon icon={searchOutline} />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por ID o nombre del trámite..."
                  />
                </div>

                {mostrarFiltros && (
                  <div className="floating-control">
                    <label>Estado</label>
                    <select
                      value={estadoFiltro}
                      onChange={(e) =>
                        setEstadoFiltro(e.target.value as EstadoFiltro)
                      }
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="ingresada">Ingresada</option>
                      <option value="en_revision">En revisión</option>
                      <option value="derivada">Derivada</option>
                      <option value="pendiente_documentos">
                        Pendiente documentos
                      </option>
                      <option value="aprobada">Aprobada</option>
                      <option value="rechazada">Rechazada</option>
                      <option value="cerrada">Cerrada</option>
                    </select>
                  </div>
                )}

                {mostrarOrden && (
                  <div className="floating-control">
                    <label>Ordenar por</label>
                    <select
                      value={ordenFiltro}
                      onChange={(e) =>
                        setOrdenFiltro(e.target.value as OrdenFiltro)
                      }
                    >
                      <option value="recientes">Más recientes</option>
                      <option value="antiguas">Más antiguas</option>
                      <option value="id_asc">ID ascendente</option>
                      <option value="id_desc">ID descendente</option>
                      <option value="estado">Estado</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="table-scroll-area">
                <table className="tramites-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Trámite</th>
                      <th>Estado</th>
                      <th>Fecha de ingreso</th>
                      <th>Última actualización</th>
                      <th>Encargado / Área</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudesPaginadas.length > 0 ? (
                      solicitudesPaginadas.map((solicitud) => {
                        const id = obtenerId(solicitud);

                        return (
                          <tr key={id}>
                            <td>
                              <strong className="solicitud-id">{id}</strong>
                            </td>
                            <td>{obtenerTramite(solicitud)}</td>
                            <td>
                              <span
                                className={claseEstado(
                                  obtenerEstado(solicitud)
                                )}
                              >
                                {textoEstado(obtenerEstado(solicitud))}
                              </span>
                            </td>
                            <td>{obtenerFechaIngreso(solicitud)}</td>
                            <td>{obtenerUltimaActualizacion(solicitud)}</td>
                            <td>{obtenerEncargado(solicitud)}</td>
                            <td>
                              <button
                                className="ver-seguimiento-button"
                                onClick={() => irDetalle(id)}
                              >
                                Ver seguimiento{" "}
                                <IonIcon icon={arrowForwardOutline} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="empty-table-state">
                            <IonIcon icon={briefcaseOutline} />
                            <h4>No se encontraron trámites</h4>
                            <p>
                              Prueba ajustando los filtros o crea una nueva
                              solicitud municipal.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <p>
                  Mostrando {inicioRango} a {finRango} de{" "}
                  {solicitudesFiltradas.length} trámites
                </p>

                <div className="pagination">
                  <button
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(paginaActual - 1)}
                  >
                    ‹
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
                    onClick={() => setPaginaActual(paginaActual + 1)}
                  >
                    ›
                  </button>
                </div>

                <div className="page-size-box">
                  <span>Mostrar</span>
                  <strong>{registrosPorPagina}</strong>
                  <span>por página</span>
                </div>
              </div>
            </section>

            <section className="mis-tramites-advice">
              <div className="advice-icon">
                <IonIcon icon={bulbOutline} />
              </div>

              <div>
                <h3>Consejos</h3>
                <p>
                  Haz clic en “Ver seguimiento” en cualquier trámite para ver el
                  detalle del progreso paso a paso, las tareas pendientes y los
                  documentos asociados.
                </p>
              </div>
            </section>

            <section className="mis-tramites-bottom-actions">
              <button
                className="back-home-button"
                onClick={() => history.push("/usuario/inicio")}
              >
                <IonIcon icon={arrowBackOutline} />
                Volver al inicio
              </button>

              <button
                className="bottom-new-button"
                onClick={() => history.push("/usuario/seleccionar-tramite")}
              >
                <IonIcon icon={addCircleOutline} />
                Realizar nuevo trámite
              </button>
            </section>
          </main>

          <footer className="mis-tramites-footer">
            <span>© 2026 I. Municipalidad de Santo Domingo.</span>
            <span>Oficina Virtual Municipal</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MisTramites;
