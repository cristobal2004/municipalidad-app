import React, { useEffect, useState } from "react";
import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  arrowBackOutline,
  calendarOutline,
  downloadOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { funcionariosService } from "../../services/funcionariosService";
import { authService } from "../../services/authService";
import "./ReportesMunicipales.css";

const ReportesMunicipales: React.FC = () => {
  const history = useHistory();

  const funcionarioActual = funcionariosService.obtenerFuncionarioActual();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    setSolicitudes(solicitudesService.obtenerSolicitudes());
  }, []);

  const cerrarSesion = () => {
    funcionariosService.cerrarSesionFuncionario();
    authService.logout();
    history.push("/");
  };

  const totalSolicitudes = solicitudes.length;

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) =>
      solicitud.estado === "En Proceso" ||
      solicitud.estado === "Falta Documentación"
  ).length;

  const solicitudesAprobadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Aprobado"
  ).length;

  const solicitudesRechazadas = solicitudes.filter(
    (solicitud) => solicitud.estado === "Falta Documentación"
  ).length;

  const tasaAprobacion =
    totalSolicitudes > 0
      ? Math.round((solicitudesAprobadas / totalSolicitudes) * 100)
      : 0;

  const obtenerResumenPorArea = () => {
    const areas = solicitudes.reduce<Record<string, Solicitud[]>>(
      (acumulador, solicitud) => {
        if (!acumulador[solicitud.area]) {
          acumulador[solicitud.area] = [];
        }

        acumulador[solicitud.area].push(solicitud);
        return acumulador;
      },
      {}
    );

    return Object.entries(areas).map(([area, solicitudesArea]) => {
      const pendientes = solicitudesArea.filter(
        (solicitud) =>
          solicitud.estado === "En Proceso" ||
          solicitud.estado === "Falta Documentación"
      ).length;

      const promedioRespuesta =
        pendientes > 0 ? Math.min(6, pendientes + 2) : 2;

      return {
        area,
        total: solicitudesArea.length,
        pendientes,
        promedioRespuesta,
      };
    });
  };

  const resumenPorArea = obtenerResumenPorArea();

  const areaMayorCarga =
    resumenPorArea.length > 0
      ? resumenPorArea.reduce((mayor, actual) =>
          actual.total > mayor.total ? actual : mayor
        )
      : null;

  const exportarReporte = () => {
    const encabezados = [
      "Area",
      "Solicitudes",
      "Pendientes",
      "Promedio respuesta",
    ];

    const filas = resumenPorArea.map((item) => [
      item.area,
      String(item.total),
      String(item.pendientes),
      `${item.promedioRespuesta} días`,
    ]);

    const contenidoCSV = [encabezados, ...filas]
      .map((fila) => fila.map((valor) => `"${valor}"`).join(";"))
      .join("\n");

    const blob = new Blob([contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "reporte_solicitudes.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="reporte-content">
        <div className="reporte-wrapper">
          <header className="reporte-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="reporte-header-actions">
              <span className="panel-funcionario-label">
                Panel Funcionario
              </span>

              <span className="funcionario-name">
                {funcionarioActual?.nombre || "Funcionario"}
              </span>

              <button className="logout-mini-button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
              </button>
            </div>
          </header>

          <main className="reporte-main">
            <section className="reporte-center">
              <div className="reporte-title-row">
                <div>
                  <h2>Reporte de Solicitudes</h2>
                  <p>Resumen estadístico de gestión y tiempos de respuesta</p>
                </div>

                <div className="reporte-actions">
                  <button type="button" className="filter-date-button">
                    <IonIcon icon={calendarOutline} />
                    Filtrar por fecha
                  </button>

                  <button
                    type="button"
                    className="export-report-button"
                    onClick={exportarReporte}
                  >
                    <IonIcon icon={downloadOutline} />
                    Exportar reporte
                  </button>
                </div>
              </div>

              <div className="reporte-cards-grid">
                <div className="reporte-stat-card">
                  <span>Solicitudes recibidas</span>
                  <strong className="blue-number">{totalSolicitudes}</strong>
                  <small className="green-text">↑ 12% vs mes anterior</small>
                </div>

                <div className="reporte-stat-card">
                  <span>Solicitudes pendientes</span>
                  <strong>{solicitudesPendientes}</strong>
                  <small className="orange-text">
                    Requieren atención inmediata
                  </small>
                </div>

                <div className="reporte-stat-card">
                  <span>Solicitudes aprobadas</span>
                  <strong className="green-number">
                    {solicitudesAprobadas}
                  </strong>
                  <small>Tasa de aprobación: {tasaAprobacion}%</small>
                </div>

                <div className="reporte-stat-card">
                  <span>Solicitudes rechazadas</span>
                  <strong className="red-number">
                    {solicitudesRechazadas}
                  </strong>
                  <small>Principal causa: Documentación incompleta</small>
                </div>

                <div className="reporte-stat-card">
                  <span>Tiempo prom. respuesta</span>
                  <strong>
                    4,2 <small>días</small>
                  </strong>
                  <small className="blue-text">Meta institucional: 5 días</small>
                </div>

                <div className="reporte-stat-card">
                  <span>Área con mayor carga</span>
                  <strong className="area-name">
                    {areaMayorCarga?.area || "Sin datos"}
                  </strong>
                  <small>
                    {areaMayorCarga?.total || 0} solicitudes activas
                  </small>
                </div>
              </div>

              <div className="reporte-table-card">
                <h3>Desglose por Departamento</h3>

                <table className="reporte-table">
                  <thead>
                    <tr>
                      <th>Área</th>
                      <th>Solicitudes</th>
                      <th>Pendientes</th>
                      <th>Promedio respuesta</th>
                    </tr>
                  </thead>

                  <tbody>
                    {resumenPorArea.map((item) => (
                      <tr key={item.area}>
                        <td>{item.area}</td>
                        <td>{item.total}</td>
                        <td>
                          <span
                            className={
                              item.pendientes >= 10
                                ? "pending-badge yellow"
                                : "pending-badge green"
                            }
                          >
                            {item.pendientes}
                          </span>
                        </td>
                        <td>{item.promedioRespuesta} días</td>
                      </tr>
                    ))}

                    {resumenPorArea.length === 0 && (
                      <tr>
                        <td colSpan={4}>No existen solicitudes registradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <IonButton
                className="volver-reporte-button"
                onClick={() => history.push("/funcionario/inicio")}
              >
                <IonIcon icon={arrowBackOutline} slot="start" />
                Volver al panel principal
              </IonButton>
            </section>
          </main>

          <footer className="reporte-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ReportesMunicipales;