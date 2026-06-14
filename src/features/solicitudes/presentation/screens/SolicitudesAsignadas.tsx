import React, { useEffect, useState } from "react";
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

import api from "../../../../core/data/http/apiClient";
import { useLatestCallback } from "../../../../core/presentation/hooks/useLatestCallback";
import { authService } from "../../../auth/composition/authService";
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

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarOrden, setMostrarOrden] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
  const [filtroArea, setFiltroArea] = useState("todas");
  const [filtroTramite, setFiltroTramite] = useState("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [ordenCampo, setOrdenCampo] = useState("fecha");
  const [ordenDireccion, setOrdenDireccion] = useState<"asc" | "desc">("desc");
  const [solicitudesSeleccionadas, setSolicitudesSeleccionadas] = useState<
    string[]
  >([]);

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

  const obtenerArea = (item: any) => {
    return (
      obtenerValor(item, "areaResponsable") ||
      obtenerValor(item, "area") ||
      obtenerValor(item, "departamento") ||
      "Área municipal"
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

  const obtenerFechaOrden = (item: any) => {
    const fecha =
      obtenerValor(item, "fechaReporte") ||
      obtenerValor(item, "fechaRecibo") ||
      obtenerValor(item, "fechaIngreso") ||
      obtenerValor(item, "fecha") ||
      "";

    const tiempo = new Date(fecha).getTime();

    return Number.isNaN(tiempo) ? 0 : tiempo;
  };

  const normalizarEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (
      texto.includes("aprob") ||
      texto.includes("resuelt") ||
      texto.includes("cerrad")
    ) {
      return "aprobada";
    }
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

  const cargarDatosEstable = useLatestCallback(cargarDatos);

  useEffect(() => {
    void cargarDatosEstable();

    const escucharCambios = () => {
      void cargarDatosEstable();
    };

    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);

    return () => {
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
    };
  }, [cargarDatosEstable]);

  const solicitudesFiltradas = (() => {
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

    if (filtroEstado !== "todos") {
      resultado = resultado.filter(
        (solicitud) =>
          normalizarEstado(obtenerEstado(solicitud)) === filtroEstado
      );
    }

    if (filtroPrioridad !== "todas") {
      resultado = resultado.filter(
        (solicitud) =>
          normalizarPrioridad(obtenerPrioridad(solicitud)) === filtroPrioridad
      );
    }

    if (filtroArea !== "todas") {
      resultado = resultado.filter(
        (solicitud) => obtenerArea(solicitud) === filtroArea,
      );
    }

    if (filtroTramite !== "todos") {
      resultado = resultado.filter(
        (solicitud) => obtenerTramite(solicitud) === filtroTramite,
      );
    }

    if (fechaDesde || fechaHasta) {
      const inicio = fechaDesde ? new Date(`${fechaDesde}T00:00:00`) : null;
      const fin = fechaHasta ? new Date(`${fechaHasta}T23:59:59.999`) : null;

      resultado = resultado.filter((solicitud) => {
        const fechaSolicitud = new Date(obtenerFechaOrden(solicitud));

        if (Number.isNaN(fechaSolicitud.getTime())) return false;

        return (
          (!inicio || fechaSolicitud >= inicio) &&
          (!fin || fechaSolicitud <= fin)
        );
      });
    }

    resultado.sort((a, b) => {
      let valorA: string | number = "";
      let valorB: string | number = "";

      if (ordenCampo === "fecha") {
        valorA = obtenerFechaOrden(a);
        valorB = obtenerFechaOrden(b);
      }

      if (ordenCampo === "id") {
        valorA = String(obtenerCodigo(a));
        valorB = String(obtenerCodigo(b));
      }

      if (ordenCampo === "solicitante") {
        valorA = normalizarTexto(obtenerSolicitante(a));
        valorB = normalizarTexto(obtenerSolicitante(b));
      }

      if (ordenCampo === "estado") {
        valorA = normalizarTexto(obtenerEstado(a));
        valorB = normalizarTexto(obtenerEstado(b));
      }

      if (ordenCampo === "prioridad") {
        valorA = normalizarTexto(obtenerPrioridad(a));
        valorB = normalizarTexto(obtenerPrioridad(b));
      }

      let comparacion = 0;

      if (typeof valorA === "number" && typeof valorB === "number") {
        comparacion = valorA - valorB;
      } else {
        comparacion = String(valorA).localeCompare(String(valorB));
      }

      return ordenDireccion === "asc" ? comparacion : -comparacion;
    });

    return resultado;
  })();

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
  }, [busqueda, filtroEstado, filtroPrioridad, ordenCampo, ordenDireccion]);

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

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroEstado("todos");
    setFiltroPrioridad("todas");
    setFiltroArea("todas");
    setFiltroTramite("todos");
    setFechaDesde("");
    setFechaHasta("");
    setPaginaActual(1);
  };

  const areasDisponibles = Array.from(
    new Set(solicitudes.map((solicitud) => obtenerArea(solicitud))),
  );
  const tramitesDisponibles = Array.from(
    new Set(solicitudes.map((solicitud) => obtenerTramite(solicitud))),
  );

  const cambiarSeleccionSolicitud = (solicitud: any) => {
    const codigo = String(obtenerCodigo(solicitud));

    setSolicitudesSeleccionadas((prev) =>
      prev.includes(codigo)
        ? prev.filter((item) => item !== codigo)
        : [...prev, codigo]
    );
  };

  const seleccionarPaginaActual = (seleccionado: boolean) => {
    const codigosPagina = solicitudesPagina.map((solicitud) =>
      String(obtenerCodigo(solicitud))
    );

    if (seleccionado) {
      setSolicitudesSeleccionadas((prev) =>
        Array.from(new Set([...prev, ...codigosPagina]))
      );
    } else {
      setSolicitudesSeleccionadas((prev) =>
        prev.filter((codigo) => !codigosPagina.includes(codigo))
      );
    }
  };

  const obtenerSolicitudesParaExportar = () => {
    if (solicitudesSeleccionadas.length === 0) {
      return solicitudesFiltradas;
    }

    return solicitudesFiltradas.filter((solicitud) =>
      solicitudesSeleccionadas.includes(String(obtenerCodigo(solicitud)))
    );
  };

  const escaparCsv = (valor: any) => {
    const texto = String(valor ?? "").replace(/"/g, '""');
    return `"${texto}"`;
  };

  const escaparHtml = (valor: any) => {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const exportarCsv = () => {
    const datos = obtenerSolicitudesParaExportar();

    if (datos.length === 0) {
      alert("No hay solicitudes para exportar.");
      return;
    }

    const encabezados = [
      "ID",
      "Solicitante",
      "RUT",
      "Trámite",
      "Estado",
      "Prioridad",
      "Fecha reporte",
      "Observaciones",
    ];

    const filas = datos.map((solicitud) => [
      obtenerCodigo(solicitud),
      obtenerSolicitante(solicitud),
      obtenerRut(solicitud),
      obtenerTramite(solicitud),
      obtenerEstado(solicitud),
      obtenerPrioridad(solicitud),
      obtenerFecha(solicitud),
      obtenerObservacion(solicitud),
    ]);

    const contenidoCsv = [
      encabezados.map(escaparCsv).join(";"),
      ...filas.map((fila) => fila.map(escaparCsv).join(";")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + contenidoCsv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `solicitudes_asignadas_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportarReportePdf = () => {
    const datos = obtenerSolicitudesParaExportar();

    if (datos.length === 0) {
      alert("No hay solicitudes para exportar.");
      return;
    }

    const filasHtml = datos
      .map(
        (solicitud) => `
          <tr>
            <td>${escaparHtml(obtenerCodigo(solicitud))}</td>
            <td>${escaparHtml(obtenerSolicitante(solicitud))}</td>
            <td>${escaparHtml(obtenerTramite(solicitud))}</td>
            <td>${escaparHtml(obtenerEstado(solicitud))}</td>
            <td>${escaparHtml(obtenerPrioridad(solicitud))}</td>
            <td>${escaparHtml(obtenerFecha(solicitud))}</td>
            <td>${escaparHtml(obtenerObservacion(solicitud))}</td>
          </tr>
        `
      )
      .join("");

    const ventana = window.open("", "_blank");

    if (!ventana) {
      alert("El navegador bloqueó la ventana emergente del reporte.");
      return;
    }

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte solicitudes asignadas</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 28px;
              color: #111827;
            }

            h1 {
              color: #0057b8;
              margin-bottom: 4px;
            }

            .subtitulo {
              color: #4b5563;
              margin-bottom: 22px;
            }

            .kpis {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 22px;
            }

            .kpi {
              border: 1px solid #d9e1ea;
              border-radius: 8px;
              padding: 12px;
            }

            .kpi span {
              display: block;
              color: #4b5563;
              font-size: 12px;
            }

            .kpi strong {
              display: block;
              color: #0057b8;
              font-size: 22px;
              margin-top: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
            }

            th {
              background: #edf4ff;
              color: #111827;
              text-align: left;
              padding: 8px;
              border: 1px solid #d9e1ea;
            }

            td {
              padding: 8px;
              border: 1px solid #d9e1ea;
              vertical-align: top;
            }

            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <h1>Reporte de solicitudes asignadas</h1>
          <p class="subtitulo">
            Funcionario: ${escaparHtml(usuarioActual.nombre || "Funcionario")} · 
            Fecha: ${new Date().toLocaleDateString("es-CL")}
          </p>

          <section class="kpis">
            <div class="kpi">
              <span>Asignadas a mí</span>
              <strong>${totalAsignadas}</strong>
            </div>

            <div class="kpi">
              <span>En revisión</span>
              <strong>${totalRevision}</strong>
            </div>

            <div class="kpi">
              <span>Pendientes</span>
              <strong>${totalPendientes}</strong>
            </div>

            <div class="kpi">
              <span>Resueltas</span>
              <strong>${totalResueltas}</strong>
            </div>
          </section>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Solicitante</th>
                <th>Trámite</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
                <th>Observaciones</th>
              </tr>
            </thead>

            <tbody>
              ${filasHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    ventana.document.close();
  };

  const irAyuda = () => {
    alert(
      "Para soporte técnico, revisa el manual de usuario o contacta al administrador del sistema."
    );
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
                  <button
                    type="button"
                    className={mostrarFiltros ? "active" : ""}
                    onClick={() => {
                      setMostrarFiltros((prev) => !prev);
                      setMostrarOrden(false);
                    }}
                  >
                    <IonIcon icon={filterOutline} />
                    Filtrar
                  </button>

                  <button
                    type="button"
                    className={mostrarOrden ? "active" : ""}
                    onClick={() => {
                      setMostrarOrden((prev) => !prev);
                      setMostrarFiltros(false);
                    }}
                  >
                    <IonIcon icon={swapVerticalOutline} />
                    Ordenar
                  </button>

                  <button type="button" onClick={exportarCsv}>
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

              {(mostrarFiltros || mostrarOrden) && (
                <div className="toolbar-panel">
                  {mostrarFiltros && (
                    <div className="toolbar-panel-grid">
                      <label>
                        Estado
                        <select
                          value={filtroEstado}
                          onChange={(event) =>
                            setFiltroEstado(event.target.value)
                          }
                        >
                          <option value="todos">Todos los estados</option>
                          <option value="revision">En revisión</option>
                          <option value="pendiente">Pendientes</option>
                          <option value="aprobada">Aprobadas</option>
                          <option value="rechazada">Rechazadas</option>
                        </select>
                      </label>

                      <label>
                        Prioridad
                        <select
                          value={filtroPrioridad}
                          onChange={(event) =>
                            setFiltroPrioridad(event.target.value)
                          }
                        >
                          <option value="todas">Todas las prioridades</option>
                          <option value="alta">Alta</option>
                          <option value="media">Media</option>
                          <option value="baja">Baja</option>
                        </select>
                      </label>

                      <label>
                        Área
                        <select
                          value={filtroArea}
                          onChange={(event) => setFiltroArea(event.target.value)}
                        >
                          <option value="todas">Todas las áreas</option>
                          {areasDisponibles.map((area) => (
                            <option value={area} key={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Tipo de trámite
                        <select
                          value={filtroTramite}
                          onChange={(event) =>
                            setFiltroTramite(event.target.value)
                          }
                        >
                          <option value="todos">Todos los trámites</option>
                          {tramitesDisponibles.map((tramite) => (
                            <option value={tramite} key={tramite}>
                              {tramite}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Desde
                        <input
                          type="date"
                          value={fechaDesde}
                          max={fechaHasta || undefined}
                          onChange={(event) => setFechaDesde(event.target.value)}
                        />
                      </label>

                      <label>
                        Hasta
                        <input
                          type="date"
                          value={fechaHasta}
                          min={fechaDesde || undefined}
                          onChange={(event) => setFechaHasta(event.target.value)}
                        />
                      </label>

                      <button type="button" onClick={limpiarFiltros}>
                        Limpiar filtros
                      </button>
                    </div>
                  )}

                  {mostrarOrden && (
                    <div className="toolbar-panel-grid">
                      <label>
                        Ordenar por
                        <select
                          value={ordenCampo}
                          onChange={(event) =>
                            setOrdenCampo(event.target.value)
                          }
                        >
                          <option value="fecha">Fecha reporte</option>
                          <option value="id">ID</option>
                          <option value="solicitante">Solicitante</option>
                          <option value="estado">Estado</option>
                          <option value="prioridad">Prioridad</option>
                        </select>
                      </label>

                      <label>
                        Dirección
                        <select
                          value={ordenDireccion}
                          onChange={(event) =>
                            setOrdenDireccion(
                              event.target.value as "asc" | "desc"
                            )
                          }
                        >
                          <option value="desc">Descendente</option>
                          <option value="asc">Ascendente</option>
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="solicitudes-table-scroll">
                <table className="solicitudes-asignadas-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={
                            solicitudesPagina.length > 0 &&
                            solicitudesPagina.every((solicitud) =>
                              solicitudesSeleccionadas.includes(
                                String(obtenerCodigo(solicitud))
                              )
                            )
                          }
                          onChange={(event) =>
                            seleccionarPaginaActual(event.target.checked)
                          }
                        />
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
                      <tr key={String(obtenerCodigo(solicitud))}>
                        <td>
                          <input
                            type="checkbox"
                            checked={solicitudesSeleccionadas.includes(
                              String(obtenerCodigo(solicitud))
                            )}
                            onChange={() => cambiarSeleccionSolicitud(solicitud)}
                          />
                        </td>

                        <td>
                          <strong>
                            {String(obtenerCodigo(solicitud)).replace(
                              "SOL-2026-",
                              ""
                            )}
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
                  <div className="resumen-icon-box">
                    <IonIcon icon={barChartOutline} />
                  </div>

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
                <button type="button" onClick={irAyuda}>
                  Ir a ayuda
                </button>
              </article>
            </section>

            <section className="solicitudes-bottom-actions">
              <button className="volver-panel-button" onClick={irPanel}>
                <IonIcon icon={arrowBackOutline} />
                Volver al panel
              </button>

              <button
                type="button"
                className="exportar-pdf-button"
                onClick={exportarReportePdf}
              >
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
