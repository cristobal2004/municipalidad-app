import React, { useRef, useState } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
} from "@ionic/react";
import {
  arrowBackOutline,
  calendarOutline,
  cloudDownloadOutline,
  cloudUploadOutline,
  documentTextOutline,
} from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import {
  Solicitud,
  solicitudesService,
} from "../../services/solicitudesService";
import { usuariosService } from "../../services/usuariosService";
import "./DetalleSolicitudUsuario.css";

interface RouteParams {
  id: string;
}

const DetalleSolicitudUsuario: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();

  const usuarioActual = usuariosService.obtenerUsuarioActual();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [extraFiles, setExtraFiles] = useState<string[]>([]);

  const [solicitud, setSolicitud] = useState<Solicitud | undefined>(() =>
    solicitudesService.obtenerSolicitudPorId(id)
  );

  const cerrarSesion = () => {
    usuariosService.cerrarSesionUsuario();
    history.push("/");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || !solicitud) return;

    const fileNames = Array.from(files).map((file) => file.name);

    solicitudesService.agregarDocumentoExtra(solicitud.id, fileNames);
    setExtraFiles(fileNames);

    const solicitudActualizada = solicitudesService.obtenerSolicitudPorId(
      solicitud.id
    );

    setSolicitud(solicitudActualizada);
  };

  if (!solicitud) {
    return (
      <IonPage>
        <IonContent fullscreen className="detalle-content">
          <div className="detalle-wrapper">
            <header className="detalle-header">
              <h1>Municipalidad de Santo Domingo</h1>
            </header>

            <main className="detalle-main">
              <section className="detalle-center">
                <div className="detalle-card">
                  <h3>Solicitud no encontrada</h3>
                  <p>
                    No fue posible encontrar la solicitud seleccionada. Puede
                    volver al resumen de trámites e intentarlo nuevamente.
                  </p>

                  <IonButton
                    className="detalle-action-button"
                    onClick={() => history.push("/usuario/mis-tramites")}
                  >
                    Volver a mis trámites
                  </IonButton>
                </div>
              </section>
            </main>

            <footer className="detalle-footer">
              <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
              <span>I. Municipalidad de Santo Domingo</span>
            </footer>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonContent fullscreen className="detalle-content">
        <div className="detalle-wrapper">
          <header className="detalle-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="detalle-user-actions">
              <span>
                Bienvenido, {usuarioActual?.nombre || solicitud.usuarioNombre || "Usuario"}
              </span>
              <button onClick={cerrarSesion}>Cerrar Sesión</button>
            </div>
          </header>

          <main className="detalle-main">
            <section className="detalle-center">
              <div className="detalle-summary-card">
                <div>
                  <p className="detalle-small-label">ID Solicitud</p>
                  <h2>{solicitud.id}</h2>

                  <div className="detalle-grid-info">
                    <div>
                      <span>Trámite:</span>
                      <strong>{solicitud.tipoPatente || "Patente Comercial"}</strong>
                    </div>

                    <div>
                      <span>Fecha Ingreso:</span>
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

                <span className="detalle-status">{solicitud.estado}</span>
              </div>

              <div className="detalle-card">
                <h3>Datos del Solicitante</h3>

                <p>
                  <strong>Nombre:</strong>{" "}
                  {solicitud.usuarioNombre || usuarioActual?.nombre || "No informado"}
                </p>

                <p>
                  <strong>RUT:</strong>{" "}
                  {solicitud.usuarioRut || usuarioActual?.rut || "No informado"}
                </p>

                <p>
                  <strong>Correo:</strong>{" "}
                  {solicitud.usuarioCorreo || usuarioActual?.correo || "No informado"}
                </p>
              </div>

              <div className="detalle-card">
                <h3>Datos del Formulario</h3>

                <p>
                  <strong>Razón Social:</strong>{" "}
                  {solicitud.razonSocial || "No informado"}
                </p>

                <p>
                  <strong>RUT Solicitante / Empresa:</strong>{" "}
                  {solicitud.rut || "No informado"}
                </p>

                <p>
                  <strong>Dirección:</strong>{" "}
                  {solicitud.direccion || "No informado"}
                </p>

                <p>
                  <strong>Tipo Patente:</strong>{" "}
                  {solicitud.tipoPatente || "No informado"}
                </p>

                <p>
                  <strong>Rol de Avalúo:</strong>{" "}
                  {solicitud.rolAvaluo || "No informado"}
                </p>

                <p>
                  <strong>Pyme:</strong>{" "}
                  {solicitud.pyme || "No informado"}
                </p>

                <div className="detalle-documents">
                  <strong>Documentos Adjuntos:</strong>

                  {solicitud.documentos.length > 0 ? (
                    solicitud.documentos.map((documento, index) => (
                      <button
                        className="document-link"
                        key={`${documento}-${index}`}
                        type="button"
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

              <div className="detalle-card">
                <h3>Observaciones</h3>
                <p>{solicitud.observacion}</p>
              </div>

              <div className="detalle-card">
                <h3>Subir Documento Extra</h3>

                <p className="detalle-help-text">
                  Puedes subir documentos adicionales solicitados por el
                  funcionario, como copia de cédula, certificados o antecedentes
                  pendientes.
                </p>

                <button
                  className="detalle-upload-box"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IonIcon icon={cloudUploadOutline} />
                  <strong>Haz clic aquí para subir un documento</strong>
                  <span>Formatos permitidos: PDF, JPG, PNG</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="detalle-hidden-input"
                  onChange={handleFileChange}
                />

                {extraFiles.length > 0 && (
                  <div className="detalle-selected-files">
                    <p>Últimos documentos subidos:</p>
                    <ul>
                      {extraFiles.map((fileName) => (
                        <li key={fileName}>{fileName}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="detalle-card">
                <h3>Historial de Solicitud</h3>

                <div className="detalle-timeline">
                  <p>
                    <span className="timeline-dot active"></span>
                    <strong>{solicitud.fechaRecibo}:</strong> Solicitud
                    ingresada correctamente.
                  </p>

                  <p>
                    <span className="timeline-dot"></span>
                    <strong>{solicitud.fechaRecibo}:</strong>{" "}
                    {solicitud.observacion}
                  </p>
                </div>
              </div>
            </section>

            <aside className="detalle-actions-card">
              <h4>Acciones Ciudadano</h4>

              <IonButton
                expand="block"
                className="detalle-action-button"
                onClick={() => history.push(`/usuario/agendar/${solicitud.id}`)}
              >
                <IonIcon icon={calendarOutline} slot="start" />
                Agendar con funcionario
              </IonButton>

              <IonButton
                expand="block"
                fill="outline"
                className="detalle-outline-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <IonIcon icon={cloudUploadOutline} slot="start" />
                Subir documento extra
              </IonButton>

              <button className="detalle-download-link" type="button">
                <IonIcon icon={cloudDownloadOutline} />
                Descargar comprobante
              </button>
            </aside>

            <IonButton
              className="detalle-back-button"
              onClick={() => history.push("/usuario/mis-tramites")}
            >
              <IonIcon icon={arrowBackOutline} slot="start" />
              Volver a mis trámites
            </IonButton>
          </main>

          <footer className="detalle-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DetalleSolicitudUsuario;