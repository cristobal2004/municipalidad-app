import React, { useEffect, useState } from "react";
import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import {
  arrowBackOutline,
  downloadOutline,
  filterOutline,
  logOutOutline,
  searchOutline,
  swapVerticalOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { funcionariosService } from "../../services/funcionariosService";
import { authService } from "../../services/authService";
import "./SolicitudesAsignadas.css";

type TipoOrden =
  | "ID Ascendente"
  | "ID Descendente"
  | "Más recientes"
  | "Más antiguas"
  | "Por estado";

const SolicitudesAsignadas: React.FC = () => {
  const history = useHistory();
  const funcionarioActual = funcionariosService.obtenerFuncionarioActual();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [tipoOrden, setTipoOrden] = useState<TipoOrden>("ID Ascendente");

  useEffect(() => {
    setSolicitudes(solicitudesService.obtenerSolicitudes());
  }, []);

  const cerrarSesion = () => {
    funcionariosService.cerrarSesionFuncionario();
    authService.logout();
    history.push("/");
  };

  const obtenerClaseEstado = (estado: string) => {
    if (estado === "Aprobado") return "estado estado-aprobado";
    if (estado === "Falta Documentación") return "estado estado-pendiente";
    return "estado estado-pendiente";
  };

  const obtenerTextoEstado = (estado: string) => {
    if (estado === "Aprobado") return "Aprobado";
    return "Pendiente";
  };

  const obtenerPrioridad = (solicitud: Solicitud) => {
    if (solicitud.estado === "Falta Documentación") return "Alta";
    if (solicitud.estado === "En Proceso") return "Media";
    return "Baja";
  };

  const obtenerClasePrioridad = (prioridad: string) => {
    if (prioridad === "Alta") return "prioridad prioridad-alta";
    if (prioridad === "Media") return "prioridad prioridad-media";
    return "prioridad prioridad-baja";
  };

  const cambiarFiltro = () => {
    if (filtroEstado === "Todos") {
      setFiltroEstado("Pendiente");
      return;
    }

    if (filtroEstado === "Pendiente") {
      setFiltroEstado("Aprobado");
      return;
    }

    setFiltroEstado("Todos");
  };

  const cambiarOrden = () => {
    if (tipoOrden === "ID Ascendente") {
      setTipoOrden("ID Descendente");
      return;
    }

    if (tipoOrden === "ID Descendente") {
      setTipoOrden("Más recientes");
      return;
    }

    if (tipoOrden === "Más recientes") {
      setTipoOrden("Más antiguas");
      return;
    }

    if (tipoOrden === "Más antiguas") {
      setTipoOrden("Por estado");
      return;
    }

    setTipoOrden("ID Ascendente");
  };

  const obtenerNumeroSolicitud = (id: string) => {
    const partes = id.split("-");
    const ultimoNumero = partes[partes.length - 1];

    return Number(ultimoNumero);
  };

  const convertirFechaANumero = (fecha: string) => {
    const partes = fecha.split("/");

    if (partes.length !== 3) return 0;

    const dia = partes[0];
    const mes = partes[1];
    const anio = partes[2].length === 2 ? `20${partes[2]}` : partes[2];

    return Number(`${anio}${mes}${dia}`);
  };

  const obtenerPesoEstado = (estado: string) => {
    if (estado === "Falta Documentación") return 1;
    if (estado === "En Proceso") return 2;
    if (estado === "Aprobado") return 3;
    return 4;
  };

  const solicitudesFiltradas = solicitudes
    .filter((solicitud) => {
      const texto = busqueda.toLowerCase();

      const coincideBusqueda =
        solicitud.id.toLowerCase().includes(texto) ||
        solicitud.usuarioNombre.toLowerCase().includes(texto) ||
        solicitud.estado.toLowerCase().includes(texto) ||
        solicitud.observacion.toLowerCase().includes(texto) ||
        solicitud.tipoPatente.toLowerCase().includes(texto);

      const estadoVisual = obtenerTextoEstado(solicitud.estado);

      const coincideFiltro =
        filtroEstado === "Todos" || estadoVisual === filtroEstado;

      return coincideBusqueda && coincideFiltro;
    })
    .sort((a, b) => {
      if (tipoOrden === "ID Ascendente") {
        return obtenerNumeroSolicitud(a.id) - obtenerNumeroSolicitud(b.id);
      }

      if (tipoOrden === "ID Descendente") {
        return obtenerNumeroSolicitud(b.id) - obtenerNumeroSolicitud(a.id);
      }

      if (tipoOrden === "Más recientes") {
        return convertirFechaANumero(b.fechaRecibo) - convertirFechaANumero(a.fechaRecibo);
      }

      if (tipoOrden === "Más antiguas") {
        return convertirFechaANumero(a.fechaRecibo) - convertirFechaANumero(b.fechaRecibo);
      }

      if (tipoOrden === "Por estado") {
        return obtenerPesoEstado(a.estado) - obtenerPesoEstado(b.estado);
      }

      return 0;
    });

  const exportarCSV = () => {
    const encabezados = [
      "ID",
      "Estado",
      "Fecha Reporte",
      "Solicitante",
      "RUT",
      "Tipo Patente",
      "Observaciones",
      "Prioridad",
    ];

    const filas = solicitudesFiltradas.map((solicitud) => [
      solicitud.id,
      obtenerTextoEstado(solicitud.estado),
      solicitud.fechaRecibo,
      solicitud.usuarioNombre,
      solicitud.usuarioRut,
      solicitud.tipoPatente,
      solicitud.observacion,
      obtenerPrioridad(solicitud),
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
    link.download = "solicitudes_asignadas.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <IonPage>
      <IonContent fullscreen className="lista-funcionario-content">
        <div className="lista-funcionario-wrapper">
          <header className="lista-funcionario-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="lista-funcionario-actions">
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

          <main className="lista-funcionario-main">
            <section className="lista-card">
              <div className="lista-title-block">
                <h2>Solicitudes Asignadas</h2>
                <p>
                  Revisa las solicitudes ingresadas por ciudadanos, consulta sus
                  antecedentes y actualiza el estado de cada trámite municipal.
                </p>
              </div>

              <div className="resumen-funcionario-grid">
                <div className="resumen-card">
                  <span>Total solicitudes</span>
                  <strong>{solicitudes.length}</strong>
                </div>

                <div className="resumen-card">
                  <span>Pendientes</span>
                  <strong>
                    {
                      solicitudes.filter(
                        (solicitud) => solicitud.estado === "En Proceso"
                      ).length
                    }
                  </strong>
                </div>

                <div className="resumen-card">
                  <span>Falta documentación</span>
                  <strong>
                    {
                      solicitudes.filter(
                        (solicitud) =>
                          solicitud.estado === "Falta Documentación"
                      ).length
                    }
                  </strong>
                </div>

                <div className="resumen-card">
                  <span>Aprobadas</span>
                  <strong>
                    {
                      solicitudes.filter(
                        (solicitud) => solicitud.estado === "Aprobado"
                      ).length
                    }
                  </strong>
                </div>
              </div>

              <div className="lista-table-panel">
                <div className="lista-toolbar">
                  <div className="lista-toolbar-left">
                    <button type="button" onClick={cambiarFiltro}>
                      <IonIcon icon={filterOutline} />
                      Filtrar: {filtroEstado}
                    </button>

                    <button type="button" onClick={cambiarOrden}>
                      <IonIcon icon={swapVerticalOutline} />
                      Ordenar: {tipoOrden}
                    </button>

                    <button type="button" onClick={exportarCSV}>
                      <IonIcon icon={downloadOutline} />
                      Exportar
                    </button>
                  </div>

                  <div className="lista-search-box">
                    <IonIcon icon={searchOutline} />
                    <input
                      value={busqueda}
                      placeholder="Buscar solicitud..."
                      onChange={(e) => setBusqueda(e.target.value)}
                    />
                  </div>
                </div>

                <table className="lista-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>ID</th>
                      <th>Estado</th>
                      <th>Fecha Reporte</th>
                      <th>Solicitante</th>
                      <th>Observaciones</th>
                      <th>Prioridad</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudesFiltradas.map((solicitud) => {
                      const prioridad = obtenerPrioridad(solicitud);

                      return (
                        <tr key={solicitud.id}>
                          <td>
                            <input type="checkbox" />
                          </td>

                          <td>{solicitud.id.replace("SOL-2026-", "")}</td>

                          <td>
                            <span
                              className={obtenerClaseEstado(solicitud.estado)}
                            >
                              {obtenerTextoEstado(solicitud.estado)}
                            </span>
                          </td>

                          <td>{solicitud.fechaRecibo}</td>

                          <td>{solicitud.usuarioNombre}</td>

                          <td className="observacion-cell">
                            {solicitud.observacion}
                          </td>

                          <td>
                            <span className={obtenerClasePrioridad(prioridad)}>
                              {prioridad}
                            </span>
                          </td>

                          <td>
                            <button
                              className="ver-link"
                              onClick={() =>
                                history.push(
                                  `/funcionario/solicitud/${solicitud.id}`
                                )
                              }
                            >
                              Ver solicitud
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <p className="lista-count">
                  Mostrando {solicitudesFiltradas.length} de{" "}
                  {solicitudes.length} solicitudes
                </p>
              </div>

              <IonButton
                className="volver-lista-button"
                onClick={() => history.push("/funcionario/inicio")}
              >
                <IonIcon icon={arrowBackOutline} slot="start" />
                Volver atrás
              </IonButton>
            </section>
          </main>

          <footer className="lista-funcionario-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudesAsignadas;