import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from "@ionic/react";
import {
  arrowBackOutline,
  checkmarkCircleOutline,
  documentTextOutline,
  logOutOutline,
} from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { funcionariosService } from "../../services/funcionariosService";
import { authService } from "../../services/authService";
import "./DetalleSolicitudFuncionario.css";

interface RouteParams {
  id: string;
}

const DetalleSolicitudFuncionario: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const funcionarioActual = funcionariosService.obtenerFuncionarioActual();

  const [solicitud, setSolicitud] = useState<Solicitud | undefined>(() =>
    solicitudesService.obtenerSolicitudPorId(id)
  );

  const [estado, setEstado] = useState(solicitud?.estado || "En Proceso");
  const [observacion, setObservacion] = useState(
    solicitud?.observacion || ""
  );
  const [mensajeExito, setMensajeExito] = useState("");

  const cerrarSesion = () => {
    funcionariosService.cerrarSesionFuncionario();
    authService.logout();
    history.push("/");
  };

  const obtenerClaseEstado = (estadoActual: string) => {
    if (estadoActual === "Aprobado") return "estado-pill estado-aprobado";
    if (estadoActual === "Falta Documentación") {
      return "estado-pill estado-falta";
    }
    return "estado-pill estado-proceso";
  };

  const guardarActualizacion = (
    nuevoEstado: string,
    nuevaObservacion: string,
    nuevaArea?: string
  ) => {
    if (!solicitud) return;

    solicitudesService.actualizarSolicitudFuncionario(solicitud.id, {
      estado: nuevoEstado,
      observacion: nuevaObservacion,
      encargado: funcionarioActual?.nombre || solicitud.encargado,
      area: nuevaArea || funcionarioActual?.area || solicitud.area,
    });

    const actualizada = solicitudesService.obtenerSolicitudPorId(solicitud.id);

    setSolicitud(actualizada);
    setEstado(actualizada?.estado || nuevoEstado);
    setObservacion(actualizada?.observacion || nuevaObservacion);
    setMensajeExito("Cambios guardados correctamente.");

    setTimeout(() => {
      setMensajeExito("");
    }, 1800);
  };

  const aprobarSolicitud = () => {
    guardarActualizacion(
      "Aprobado",
      observacion.trim() || "Solicitud aprobada por funcionario municipal."
    );
  };

  const rechazarSolicitud = () => {
    guardarActualizacion(
      "Falta Documentación",
      observacion.trim() ||
        "Se requiere corregir o adjuntar documentación adicional para continuar con el trámite."
    );
  };

  const derivarSolicitud = () => {
    guardarActualizacion(
      "En Proceso",
      observacion.trim() ||
        "La solicitud fue derivada a otra área municipal para revisión.",
      "Área Derivada"
    );
  };

  const guardarCambiosManuales = () => {
    guardarActualizacion(
      estado,
      observacion.trim() || "Solicitud actualizada por funcionario municipal."
    );
  };

  if (!solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="ver-funcionario-content">
          <div className="ver-funcionario-wrapper">
            <header className="ver-funcionario-header">
              <h1>Municipalidad de Santo Domingo</h1>
            </header>

            <main className="ver-funcionario-main-simple">
              <section className="ver-card">
                <h2>Solicitud no encontrada</h2>
                <p>No fue posible encontrar la solicitud seleccionada.</p>

                <IonButton
                  className="volver-button"
                  onClick={() => history.push("/funcionario/solicitudes")}
                >
                  Volver a solicitudes
                </IonButton>
              </section>
            </main>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="ver-funcionario-content">
        <div className="ver-funcionario-wrapper">
          <header className="ver-funcionario-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="ver-funcionario-actions">
              <span>Bienvenido: {funcionarioActual?.nombre || "Funcionario"}</span>
              <button onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
              </button>
            </div>
          </header>

          <main className="ver-funcionario-main">
            <section className="ver-main-column">
              <div className="ver-summary-card">
                <div>
                  <p className="small-label">ID Solicitud</p>
                  <h2>{solicitud.id}</h2>

                  <div className="ver-summary-grid">
                    <div>
                      <span>Trámite:</span>
                      <strong>{solicitud.tipoPatente}</strong>
                    </div>

                    <div>
                      <span>Fecha ingreso:</span>
                      <strong>{solicitud.fechaRecibo}</strong>
                    </div>

                    <div>
                      <span>Área:</span>
                      <strong>{solicitud.area}</strong>
                    </div>

                    <div>
                      <span>Encargado:</span>
                      <strong>{solicitud.encargado}</strong>
                    </div>
                  </div>
                </div>

                <span className={obtenerClaseEstado(solicitud.estado)}>
                  {solicitud.estado}
                </span>
              </div>

              {mensajeExito && (
                <div className="success-box">
                  <IonIcon icon={checkmarkCircleOutline} />
                  {mensajeExito}
                </div>
              )}

              <div className="ver-card">
                <h3>Datos del Formulario</h3>

                <p>
                  <strong>Razón Social:</strong> {solicitud.razonSocial}
                </p>

                <p>
                  <strong>RUT:</strong> {solicitud.rut}
                </p>

                <p>
                  <strong>Dirección:</strong> {solicitud.direccion}
                </p>

                <p>
                  <strong>Tipo Patente:</strong> {solicitud.tipoPatente}
                </p>

                <p>
                  <strong>Rol de Avalúo:</strong> {solicitud.rolAvaluo}
                </p>

                <p>
                  <strong>Pyme:</strong> {solicitud.pyme}
                </p>

                <div className="documentos-lista">
                  <strong>Documentos adjuntos:</strong>

                  {solicitud.documentos.length > 0 ? (
                    solicitud.documentos.map((documento, index) => (
                      <button
                        type="button"
                        className="documento-link"
                        key={`${documento}-${index}`}
                      >
                        <IonIcon icon={documentTextOutline} />
                        {documento}
                      </button>
                    ))
                  ) : (
                    <p>No se han adjuntado documentos.</p>
                  )}
                </div>
              </div>

              <div className="ver-card">
                <h3>Datos del Solicitante</h3>

                <p>
                  <strong>Nombre:</strong> {solicitud.usuarioNombre}
                </p>

                <p>
                  <strong>RUT:</strong> {solicitud.usuarioRut}
                </p>

                <p>
                  <strong>Correo:</strong> {solicitud.usuarioCorreo}
                </p>
              </div>

              <div className="ver-card">
                <h3>Historial de Solicitud</h3>

                <div className="historial-linea">
                  <span className="historial-dot active"></span>
                  <p>
                    <strong>{solicitud.fechaRecibo}:</strong> Solicitud
                    ingresada correctamente.
                  </p>
                </div>

                <div className="historial-linea">
                  <span className="historial-dot"></span>
                  <p>
                    <strong>{solicitud.fechaRecibo}:</strong>{" "}
                    {solicitud.observacion}
                  </p>
                </div>
              </div>
            </section>

            <aside className="panel-gestion">
              <h3>Panel de Gestión Funcionario</h3>

              <IonItem className="panel-input">
                <IonLabel position="stacked">Cambiar Estado:</IonLabel>
                <IonSelect
                  value={estado}
                  placeholder="Seleccione estado"
                  onIonChange={(e) => setEstado(e.detail.value)}
                >
                  <IonSelectOption value="En Proceso">
                    En Proceso
                  </IonSelectOption>
                  <IonSelectOption value="Falta Documentación">
                    Falta Documentación
                  </IonSelectOption>
                  <IonSelectOption value="Aprobado">
                    Aprobado
                  </IonSelectOption>
                </IonSelect>
              </IonItem>

              <IonItem className="panel-input panel-textarea">
                <IonLabel position="stacked">Observaciones internas:</IonLabel>
                <IonTextarea
                  value={observacion}
                  rows={5}
                  placeholder="Observaciones internas..."
                  onIonInput={(e) => setObservacion(e.detail.value ?? "")}
                />
              </IonItem>

              <button
                type="button"
                className="panel-button aprobar"
                onClick={aprobarSolicitud}
              >
                Aprobar Solicitud
              </button>

              <button
                type="button"
                className="panel-button rechazar"
                onClick={rechazarSolicitud}
              >
                Rechazar Solicitud
              </button>

              <button
                type="button"
                className="panel-button derivar"
                onClick={derivarSolicitud}
              >
                Derivar a otra Área
              </button>

              <button
                type="button"
                className="panel-button guardar"
                onClick={guardarCambiosManuales}
              >
                Guardar Cambios
              </button>
            </aside>

            <IonButton
              className="volver-solicitudes-button"
              onClick={() => history.push("/funcionario/solicitudes")}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Volver a solicitudes
            </IonButton>
          </main>

          <footer className="ver-funcionario-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudFuncionario;