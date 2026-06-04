import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  arrowBackOutline,
  barChartOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  downloadOutline,
  filterOutline,
  informationCircleOutline,
  logOutOutline,
  peopleOutline,
  personOutline,
  refreshOutline,
  timeOutline,
} from "ionicons/icons";

import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { authService } from "../../services/authService";
import "./ReportesMunicipales.css";

interface UsuarioActual {
  nombre?: string;
  correo?: string;
  rol?: string;
  cargo?: string;
  area?: string;
}

interface AreaReporte {
  area: string;
  total: number;
  revision: number;
  pendientes: number;
  resueltas: number;
  tiempoPromedio: string;
}

interface MesReporte {
  mes: string;
  total: number;
}

const solicitudesDemo = [
  {
    id: "SOL-2026-0001",
    tramite: "Comercial Definitiva",
    estado: "Pendiente de documentos",
    area: "Atención General",
    fechaIngreso: "18/04/2026",
    ultimaActualizacion: "18/04/2026",
  },
  {
    id: "SOL-2026-0002",
    tramite: "Permiso de circulación",
    estado: "En revisión",
    area: "Serv. Ciudadano",
    fechaIngreso: "16/04/2026",
    ultimaActualizacion: "18/04/2026",
  },
  {
    id: "SOL-2026-0003",
    tramite: "Patente Profesional",
    estado: "Aprobada",
    area: "Finanzas",
    fechaIngreso: "10/04/2026",
    ultimaActualizacion: "18/04/2026",
  },
];

const ReportesMunicipales: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual>({
    nombre: "Funcionario",
    correo: "",
    rol: "funcionario",
  });

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");
  const [areaFiltro, setAreaFiltro] = useState("Todas");
  const [tipoFiltro, setTipoFiltro] = useState("Todos");
  const [ultimaActualizacion, setUltimaActualizacion] =
    useState("hace unos segundos");
  const [mensajeSistema, setMensajeSistema] = useState("");

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

  const obtenerUsuarioDesdeLocalStorage = (): UsuarioActual => {
    const posiblesKeys = [
      "funcionario_actual",
      "funcionarioActual",
      "funcionario_logueado",
      "funcionarioLogueado",
      "current_funcionario",
      "usuario_funcionario",
      "usuarioFuncionario",
      "usuario_actual",
      "usuarioActual",
      "current_user",
      "usuarioLogueado",
      "sesion_usuario",
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
            rol: usuario.rol || usuario.role || "funcionario",
            cargo: usuario.cargo || usuario.puesto || "",
            area: usuario.area || usuario.departamento || usuario.unidad || "",
          };
        }
      } catch {
        if (raw.trim() !== "") {
          return {
            nombre: raw,
            correo: "",
            rol: "funcionario",
          };
        }
      }
    }

    return {
      nombre: "Funcionario",
      correo: "",
      rol: "funcionario",
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

  const obtenerId = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "codigo") ||
      obtenerValor(solicitud, "id") ||
      obtenerValor(solicitud, "solicitudId") ||
      "SIN-ID"
    );
  };

  const obtenerEstado = (solicitud: any) => {
    return obtenerValor(solicitud, "estado", "En revisión");
  };

  const obtenerArea = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "area") ||
      obtenerValor(solicitud, "departamento") ||
      "Atención General"
    );
  };

  const obtenerTramite = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "tramite") ||
      obtenerValor(solicitud, "tipoTramite") ||
      obtenerValor(solicitud, "tipoPatente") ||
      "Trámite municipal"
    );
  };

  const obtenerFecha = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "fechaIngreso") ||
      obtenerValor(solicitud, "fechaRecibo") ||
      obtenerValor(solicitud, "fecha") ||
      obtenerValor(solicitud, "createdAt") ||
      ""
    );
  };

  const obtenerFechaActualizacion = (solicitud: any) => {
    return (
      obtenerValor(solicitud, "ultimaActualizacion") ||
      obtenerValor(solicitud, "fechaActualizacion") ||
      obtenerValor(solicitud, "updatedAt") ||
      obtenerFecha(solicitud)
    );
  };

  const normalizarEstado = (estado: string) => {
    const texto = normalizarTexto(estado);

    if (texto.includes("aprob") || texto.includes("resuelt")) return "resuelta";
    if (texto.includes("rechaz")) return "resuelta";

    if (texto.includes("pendiente") || texto.includes("document")) {
      return "pendiente";
    }

    return "revision";
  };

  const parsearFecha = (fechaTexto: string): Date | null => {
    if (!fechaTexto) return null;

    const limpio = String(fechaTexto).trim();

    const fechaIso = new Date(limpio);
    if (!Number.isNaN(fechaIso.getTime())) return fechaIso;

    const match = limpio.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);

    if (!match) return null;

    const dia = Number(match[1]);
    const mes = Number(match[2]) - 1;
    let anio = Number(match[3]);

    if (anio < 100) anio += 2000;

    const fecha = new Date(anio, mes, dia);

    if (Number.isNaN(fecha.getTime())) return null;

    return fecha;
  };

  const nombreMes = (fecha: Date) => {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  };

  const calcularDiasRespuesta = (solicitud: any) => {
    const fechaInicio = parsearFecha(obtenerFecha(solicitud));
    const fechaFin = parsearFecha(obtenerFechaActualizacion(solicitud));

    if (!fechaInicio || !fechaFin) return null;

    const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();
    const dias = Math.max(0, Math.round(diferenciaMs / (1000 * 60 * 60 * 24)));

    return dias;
  };

  const cargarDatos = () => {
    const usuario = obtenerUsuarioDesdeLocalStorage();
    setUsuarioActual(usuario);

    let solicitudesServicio: Solicitud[] = [];

    try {
      solicitudesServicio = solicitudesService.obtenerSolicitudes();
    } catch {
      solicitudesServicio = [];
    }

    const solicitudesBase =
      Array.isArray(solicitudesServicio) && solicitudesServicio.length > 0
        ? solicitudesServicio
        : solicitudesDemo;

    setSolicitudes(solicitudesBase);
    setUltimaActualizacion("hace unos segundos");
  };

  useEffect(() => {
    cargarDatos();

    const intervalo = window.setInterval(() => {
      cargarDatos();
    }, 3000);

    const escucharCambios = () => {
      cargarDatos();
    };

    window.addEventListener("storage", escucharCambios);
    window.addEventListener("focus", escucharCambios);
    window.addEventListener("solicitudesActualizadas", escucharCambios);

    return () => {
      window.clearInterval(intervalo);
      window.removeEventListener("storage", escucharCambios);
      window.removeEventListener("focus", escucharCambios);
      window.removeEventListener("solicitudesActualizadas", escucharCambios);
    };
  }, []);

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      const estado = obtenerEstado(solicitud);
      const area = obtenerArea(solicitud);
      const tramite = obtenerTramite(solicitud);

      const cumpleEstado =
        estadoFiltro === "Todos" ||
        normalizarEstado(estado) === normalizarEstado(estadoFiltro);

      const cumpleArea = areaFiltro === "Todas" || area === areaFiltro;

      const cumpleTipo = tipoFiltro === "Todos" || tramite === tipoFiltro;

      return cumpleEstado && cumpleArea && cumpleTipo;
    });
  }, [solicitudes, estadoFiltro, areaFiltro, tipoFiltro]);

  const totalSolicitudes = solicitudesFiltradas.length;

  const totalRevision = solicitudesFiltradas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "revision"
  ).length;

  const totalPendientes = solicitudesFiltradas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "pendiente"
  ).length;

  const totalResueltas = solicitudesFiltradas.filter(
    (solicitud) => normalizarEstado(obtenerEstado(solicitud)) === "resuelta"
  ).length;

  const porcentajeRevision =
    totalSolicitudes > 0
      ? Math.round((totalRevision / totalSolicitudes) * 100)
      : 0;

  const porcentajePendientes =
    totalSolicitudes > 0
      ? Math.round((totalPendientes / totalSolicitudes) * 100)
      : 0;

  const porcentajeResueltas =
    totalSolicitudes > 0
      ? Math.round((totalResueltas / totalSolicitudes) * 100)
      : 0;

  const areasDisponibles = useMemo(() => {
    const areas = solicitudes.map((solicitud) => obtenerArea(solicitud));
    return ["Todas", ...Array.from(new Set(areas))];
  }, [solicitudes]);

  const tiposDisponibles = useMemo(() => {
    const tipos = solicitudes.map((solicitud) => obtenerTramite(solicitud));
    return ["Todos", ...Array.from(new Set(tipos))];
  }, [solicitudes]);

  const desgloseAreas: AreaReporte[] = useMemo(() => {
    const mapa = new Map<string, any[]>();

    solicitudesFiltradas.forEach((solicitud) => {
      const area = obtenerArea(solicitud);

      if (!mapa.has(area)) {
        mapa.set(area, []);
      }

      mapa.get(area)?.push(solicitud);
    });

    return Array.from(mapa.entries()).map(([area, items]) => {
      const revision = items.filter(
        (item) => normalizarEstado(obtenerEstado(item)) === "revision"
      ).length;

      const pendientes = items.filter(
        (item) => normalizarEstado(obtenerEstado(item)) === "pendiente"
      ).length;

      const resueltas = items.filter(
        (item) => normalizarEstado(obtenerEstado(item)) === "resuelta"
      ).length;

      const diasValidos = items
        .map((item) => calcularDiasRespuesta(item))
        .filter((dias): dias is number => dias !== null);

      const promedio =
        diasValidos.length > 0
          ? (
              diasValidos.reduce((sum, item) => sum + item, 0) /
              diasValidos.length
            ).toFixed(1)
          : "N/D";

      return {
        area,
        total: items.length,
        revision,
        pendientes,
        resueltas,
        tiempoPromedio: promedio === "N/D" ? "N/D" : `${promedio} días`,
      };
    });
  }, [solicitudesFiltradas]);

  const datosMensuales: MesReporte[] = useMemo(() => {
    const mapa = new Map<string, number>();

    solicitudesFiltradas.forEach((solicitud) => {
      const fecha = parsearFecha(obtenerFecha(solicitud));

      if (!fecha) return;

      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(
        2,
        "0"
      )}`;

      mapa.set(key, (mapa.get(key) || 0) + 1);
    });

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => {
        const [anio, mes] = key.split("-").map(Number);
        const fecha = new Date(anio, mes - 1, 1);

        return {
          mes: nombreMes(fecha),
          total,
        };
      });
  }, [solicitudesFiltradas]);

  const maxMensual = Math.max(...datosMensuales.map((item) => item.total), 1);
  const hayDatosMensuales = datosMensuales.length > 0;

  const diasRespuesta = solicitudesFiltradas
    .map((solicitud) => calcularDiasRespuesta(solicitud))
    .filter((dias): dias is number => dias !== null);

  const tiempoPromedio =
    diasRespuesta.length > 0
      ? (
          diasRespuesta.reduce((sum, item) => sum + item, 0) /
          diasRespuesta.length
        ).toFixed(1)
      : "N/D";

  const tiempoMaximo =
    diasRespuesta.length > 0 ? Math.max(...diasRespuesta).toString() : "N/D";

  const solicitudesPorDia = totalSolicitudes > 0 ? totalSolicitudes : 0;

  const cumplimientoSla =
    totalSolicitudes > 0
      ? Math.round((totalResueltas / totalSolicitudes) * 100)
      : 0;

  const limpiarFiltros = () => {
    setEstadoFiltro("Todos");
    setAreaFiltro("Todas");
    setTipoFiltro("Todos");
  };

  const exportarCSV = () => {
    const encabezados = [
      "ID",
      "Trámite",
      "Estado",
      "Área",
      "Fecha ingreso",
      "Última actualización",
    ];

    const filas = solicitudesFiltradas.map((solicitud) => [
      obtenerId(solicitud),
      obtenerTramite(solicitud),
      obtenerEstado(solicitud),
      obtenerArea(solicitud),
      obtenerFecha(solicitud),
      obtenerFechaActualizacion(solicitud),
    ]);

    const escapar = (valor: string) => {
      const texto = String(valor || "");
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const contenido = [encabezados, ...filas]
      .map((fila) => fila.map(escapar).join(";"))
      .join("\n");

    const blob = new Blob(["\ufeff" + contenido], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `reporte-solicitudes-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);

    setMensajeSistema("Reporte CSV exportado correctamente.");

    setTimeout(() => {
      setMensajeSistema("");
    }, 3000);
  };

  const exportarPDFPendiente = () => {
    setMensajeSistema("La exportación PDF quedará disponible en la EP2 con backend.");
    setTimeout(() => {
      setMensajeSistema("");
    }, 3500);
  };

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  const irPanel = () => {
    history.push("/funcionario/inicio");
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="reportes-content">
        <div className="reportes-wrapper">
          <header className="reportes-header">
            <div className="reportes-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />

              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>

            <div className="reportes-user-area">
              <button className="panel-button-reportes" onClick={irPanel}>
                <IonIcon icon={personOutline} />
                Panel funcionario
              </button>

              <div className="reportes-profile">
                <div className="reportes-avatar">
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

              <button className="reportes-logout" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
              </button>
            </div>
          </header>

          <main className="reportes-main">
            <section className="reportes-hero">
              <div>
                <h2>Reporte de solicitudes</h2>
                <p>
                  Resumen estadístico y análisis de solicitudes ingresadas en el
                  sistema municipal.
                </p>

                <div className="reportes-sync">
                  <span></span>
                  <strong>Actualización en tiempo real</strong>
                  <p>Sincronizado {ultimaActualizacion}</p>
                  <IonIcon icon={refreshOutline} />
                </div>
              </div>

              <button className="reportes-export-main" onClick={exportarCSV}>
                <IonIcon icon={downloadOutline} />
                Exportar CSV
              </button>
            </section>

            {mensajeSistema && (
              <section className="reportes-system-message">
                <IonIcon icon={informationCircleOutline} />
                <span>{mensajeSistema}</span>
              </section>
            )}

            <section className="reportes-filtros-card">
              <div className="reportes-section-title">
                <h3>Filtros de búsqueda</h3>
                <p>Refina los datos del reporte según estado, área o trámite.</p>
              </div>

              <div className="reportes-filtros-grid">
                <label>
                  Rango de fechas
                  <input type="text" value="01/04/2026 - 18/04/2026" readOnly />
                </label>

                <label>
                  Estado
                  <select
                    value={estadoFiltro}
                    onChange={(event) => setEstadoFiltro(event.target.value)}
                  >
                    <option>Todos</option>
                    <option>En revisión</option>
                    <option>Pendiente de documentos</option>
                    <option>Aprobada</option>
                    <option>Rechazada</option>
                  </select>
                </label>

                <label>
                  Área / Departamento
                  <select
                    value={areaFiltro}
                    onChange={(event) => setAreaFiltro(event.target.value)}
                  >
                    {areasDisponibles.map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Tipo de trámite
                  <select
                    value={tipoFiltro}
                    onChange={(event) => setTipoFiltro(event.target.value)}
                  >
                    {tiposDisponibles.map((tipo) => (
                      <option key={tipo}>{tipo}</option>
                    ))}
                  </select>
                </label>

                <div className="reportes-filter-actions">
                  <button type="button">
                    <IonIcon icon={filterOutline} />
                    Aplicar
                  </button>

                  <button type="button" onClick={limpiarFiltros}>
                    <IonIcon icon={refreshOutline} />
                    Limpiar
                  </button>
                </div>
              </div>
            </section>

            <section className="reportes-kpis-grid">
              <article className="reporte-kpi-card">
                <div className="kpi-icon blue">
                  <IonIcon icon={documentTextOutline} />
                </div>
                <div>
                  <span>Total solicitudes</span>
                  <strong>{totalSolicitudes}</strong>
                  <p>Registros filtrados</p>
                </div>
              </article>

              <article className="reporte-kpi-card">
                <div className="kpi-icon orange">
                  <IonIcon icon={timeOutline} />
                </div>
                <div>
                  <span>En revisión</span>
                  <strong>{totalRevision}</strong>
                  <p>{porcentajeRevision}% del total</p>
                </div>
              </article>

              <article className="reporte-kpi-card">
                <div className="kpi-icon purple">
                  <IonIcon icon={calendarOutline} />
                </div>
                <div>
                  <span>Pendientes</span>
                  <strong>{totalPendientes}</strong>
                  <p>{porcentajePendientes}% del total</p>
                </div>
              </article>

              <article className="reporte-kpi-card">
                <div className="kpi-icon green">
                  <IonIcon icon={checkmarkCircleOutline} />
                </div>
                <div>
                  <span>Resueltas</span>
                  <strong>{totalResueltas}</strong>
                  <p>{porcentajeResueltas}% del total</p>
                </div>
              </article>
            </section>

            <section className="reportes-charts-grid">
              <article className="reportes-chart-card">
                <div className="reportes-card-header">
                  <h3>Solicitudes por estado</h3>
                  <IonIcon icon={informationCircleOutline} />
                </div>

                <div className="donut-layout">
                  <div
                    className="donut-chart"
                    style={{
                      background:
                        totalSolicitudes > 0
                          ? `conic-gradient(
                              #159447 0 ${porcentajeResueltas}%,
                              #0874bb ${porcentajeResueltas}% ${
                              porcentajeResueltas + porcentajeRevision
                            }%,
                              #7c3aed ${
                                porcentajeResueltas + porcentajeRevision
                              }% 100%
                            )`
                          : "#e5e7eb",
                    }}
                  >
                    <div>
                      <strong>{totalSolicitudes}</strong>
                      <span>Total</span>
                    </div>
                  </div>

                  <div className="chart-legend">
                    <div>
                      <span className="green"></span>
                      Resueltas
                      <strong>{totalResueltas}</strong>
                    </div>

                    <div>
                      <span className="blue"></span>
                      En revisión
                      <strong>{totalRevision}</strong>
                    </div>

                    <div>
                      <span className="purple"></span>
                      Pendientes
                      <strong>{totalPendientes}</strong>
                    </div>
                  </div>
                </div>
              </article>

              <article className="reportes-chart-card">
                <div className="reportes-card-header">
                  <h3>Solicitudes por mes</h3>
                  <IonIcon icon={informationCircleOutline} />
                </div>

                {hayDatosMensuales ? (
                  <div className="monthly-chart-area">
                    {datosMensuales.map((item) => (
                      <div className="monthly-bar-item" key={item.mes}>
                        <span>{item.total}</span>
                        <div
                          style={{
                            height: `${Math.max(
                              28,
                              (item.total / maxMensual) * 150
                            )}px`,
                          }}
                        ></div>
                        <p>{item.mes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="chart-empty-state">
                    <IonIcon icon={barChartOutline} />
                    <strong>Datos mensuales insuficientes</strong>
                    <p>
                      El gráfico se completará automáticamente cuando existan
                      solicitudes con fechas registradas.
                    </p>
                  </div>
                )}
              </article>
            </section>

            <section className="gestion-indicators-card">
              <div className="reportes-section-title">
                <h3>Indicadores de gestión</h3>
                <p>Métricas calculadas desde las solicitudes actualmente filtradas.</p>
              </div>

              <div className="gestion-indicators-grid">
                <article>
                  <IonIcon icon={timeOutline} />
                  <div>
                    <span>Tiempo promedio de respuesta</span>
                    <strong>
                      {tiempoPromedio === "N/D" ? "N/D" : `${tiempoPromedio} días`}
                    </strong>
                    <p>Según fechas disponibles</p>
                  </div>
                </article>

                <article>
                  <IonIcon icon={calendarOutline} />
                  <div>
                    <span>Solicitudes filtradas</span>
                    <strong>{solicitudesPorDia}</strong>
                    <p>Total actual del reporte</p>
                  </div>
                </article>

                <article>
                  <IonIcon icon={barChartOutline} />
                  <div>
                    <span>Tiempo máximo de respuesta</span>
                    <strong>
                      {tiempoMaximo === "N/D" ? "N/D" : `${tiempoMaximo} días`}
                    </strong>
                    <p>Según fechas disponibles</p>
                  </div>
                </article>

                <article>
                  <IonIcon icon={checkmarkCircleOutline} />
                  <div>
                    <span>Cumplimiento estimado</span>
                    <strong>{cumplimientoSla}%</strong>
                    <p>Solicitudes resueltas</p>
                  </div>
                </article>
              </div>
            </section>

            <section className="reportes-table-card">
              <div className="reportes-card-header">
                <h3>Desglose por área / departamento</h3>
                <IonIcon icon={businessOutline} />
              </div>

              <div className="reportes-table-scroll">
                <table className="reportes-table">
                  <thead>
                    <tr>
                      <th>Área / Departamento</th>
                      <th>Total</th>
                      <th>En revisión</th>
                      <th>Pendientes</th>
                      <th>Resueltas</th>
                      <th>% Resueltas</th>
                      <th>Tiempo prom.</th>
                    </tr>
                  </thead>

                  <tbody>
                    {desgloseAreas.map((area) => {
                      const porcentaje =
                        area.total > 0
                          ? Math.round((area.resueltas / area.total) * 100)
                          : 0;

                      return (
                        <tr key={area.area}>
                          <td>
                            <IonIcon icon={businessOutline} />
                            <strong>{area.area}</strong>
                          </td>
                          <td>{area.total}</td>
                          <td className="orange-text">{area.revision}</td>
                          <td className="purple-text">{area.pendientes}</td>
                          <td className="green-text">{area.resueltas}</td>
                          <td>
                            <div className="progress-cell">
                              <span>{porcentaje}%</span>
                              <div>
                                <b style={{ width: `${porcentaje}%` }}></b>
                              </div>
                            </div>
                          </td>
                          <td>{area.tiempoPromedio}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="reportes-export-section">
              <article className="export-card">
                <div className="export-icon">
                  <IonIcon icon={downloadOutline} />
                </div>

                <div>
                  <h3>Exportar reporte</h3>
                  <p>
                    Descarga los datos filtrados actualmente. CSV queda funcional
                    en esta fase; PDF queda para EP2.
                  </p>

                  <div className="export-actions">
                    <button type="button" onClick={exportarCSV}>
                      <IonIcon icon={documentTextOutline} />
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </article>

              <article className="report-info-card">
                <h3>Información del reporte</h3>

                <p>
                  <IonIcon icon={informationCircleOutline} />
                  Los gráficos se calculan con las solicitudes disponibles en la
                  app.
                </p>

                <p>
                  <IonIcon icon={refreshOutline} />
                  La vista se sincroniza automáticamente cuando cambian las
                  solicitudes.
                </p>

                <p>
                  <IonIcon icon={peopleOutline} />
                  En EP2 se conectará con backend, base de datos y reportes reales.
                </p>
              </article>
            </section>

            <section className="reportes-bottom-actions">
              <button onClick={irPanel}>
                <IonIcon icon={arrowBackOutline} />
                Volver al panel
              </button>
            </section>
          </main>

          <footer className="reportes-footer">
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

export default ReportesMunicipales;