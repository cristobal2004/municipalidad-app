import React, { useRef, useState } from "react";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRadio,
  IonRadioGroup,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import {
  arrowBackOutline,
  cloudUploadOutline,
  paperPlaneOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { solicitudesService } from "../../services/solicitudesService";
import { usuariosService } from "../../services/usuariosService";
import "./SolicitudPatente.css";

const SolicitudPatente: React.FC = () => {
  const history = useHistory();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const usuarioActual = usuariosService.obtenerUsuarioActual();

  const [razonSocial, setRazonSocial] = useState("");
  const [rut, setRut] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipoPatente, setTipoPatente] = useState("");
  const [rolAvaluo, setRolAvaluo] = useState("");
  const [pyme, setPyme] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const [errorFormulario, setErrorFormulario] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) return;

    const fileNames = Array.from(files).map((file) => file.name);
    setSelectedFiles(fileNames);
  };

  const validarFormulario = () => {
    if (!usuarioActual) {
      setErrorFormulario(
        "Debe iniciar sesión antes de ingresar una solicitud."
      );
      return false;
    }

    if (
      !razonSocial.trim() ||
      !rut.trim() ||
      !direccion.trim() ||
      !tipoPatente.trim() ||
      !rolAvaluo.trim() ||
      !pyme.trim() ||
      selectedFiles.length === 0
    ) {
      setErrorFormulario(
        "Debe completar todos los campos obligatorios y adjuntar al menos un documento antes de enviar la solicitud."
      );
      return false;
    }

    setErrorFormulario("");
    return true;
  };

  const handleEnviarSolicitud = () => {
    const formularioValido = validarFormulario();

    if (!formularioValido || !usuarioActual) {
      return;
    }

    solicitudesService.crearSolicitud({
      razonSocial,
      rut,
      direccion,
      tipoPatente,
      rolAvaluo,
      pyme,
      documentos: selectedFiles,

      usuarioNombre: usuarioActual.nombre,
      usuarioRut: usuarioActual.rut,
      usuarioCorreo: usuarioActual.correo,
    });

    history.push("/usuario/confirmacion");
  };

  const cerrarSesion = () => {
    usuariosService.cerrarSesionUsuario();
    history.push("/");
  };

  return (
    <IonPage>
      <IonContent fullscreen className="solicitud-content">
        <div className="solicitud-wrapper">
          <header className="solicitud-header">
            <h1>Municipalidad de Santo Domingo</h1>

            <div className="solicitud-user-actions">
              <span>
                Bienvenido, {usuarioActual?.nombre || "Usuario"}
              </span>
              <button onClick={cerrarSesion}>Cerrar Sesión</button>
            </div>
          </header>

          <main className="solicitud-main">
            <aside className="solicitud-logo-area">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Logo Municipalidad de Santo Domingo"
                className="solicitud-logo"
              />
            </aside>

            <section className="solicitud-card">
              <h2>Ingreso de Nueva Solicitud</h2>

              <p className="solicitud-description">
                Complete los campos a continuación para procesar su trámite.
                <span> Los campos con * son obligatorios.</span>
              </p>

              {errorFormulario && (
                <div className="solicitud-error-box">
                  {errorFormulario}
                </div>
              )}

              <div className="solicitud-form-grid">
                <div className="solicitud-column">
                  <h3>Solicitud</h3>

                  <IonItem className="solicitud-input">
                    <IonLabel position="stacked">
                      Nombre del Proyecto / Razón Social <b>*</b>
                    </IonLabel>
                    <IonInput
                      value={razonSocial}
                      placeholder="Ej: Minimarket Los Andes"
                      onIonInput={(e) =>
                        setRazonSocial(e.detail.value ?? "")
                      }
                    />
                  </IonItem>

                  <IonItem className="solicitud-input">
                    <IonLabel position="stacked">
                      RUT Solicitante / Empresa <b>*</b>
                    </IonLabel>
                    <IonInput
                      value={rut}
                      placeholder="12.345.678-9"
                      onIonInput={(e) => setRut(e.detail.value ?? "")}
                    />
                  </IonItem>

                  <IonItem className="solicitud-input">
                    <IonLabel position="stacked">
                      Dirección Comercial <b>*</b>
                    </IonLabel>
                    <IonInput
                      value={direccion}
                      placeholder="Calle, Número, Villa/Población"
                      onIonInput={(e) => setDireccion(e.detail.value ?? "")}
                    />
                  </IonItem>

                  <div className="pyme-section">
                    <p>
                      Pyme <b>*</b>
                    </p>

                    <IonRadioGroup
                      value={pyme}
                      onIonChange={(e) => setPyme(e.detail.value)}
                    >
                      <label className="radio-row">
                        <IonRadio value="Sí" />
                        <span>Sí</span>
                      </label>

                      <label className="radio-row">
                        <IonRadio value="No" />
                        <span>No</span>
                      </label>
                    </IonRadioGroup>
                  </div>
                </div>

                <div className="solicitud-column">
                  <h3>Patente</h3>

                  <IonItem className="solicitud-input">
                    <IonLabel position="stacked">
                      Tipo de Patente Solicitada <b>*</b>
                    </IonLabel>
                    <IonSelect
                      value={tipoPatente}
                      placeholder="Seleccione una opción..."
                      onIonChange={(e) => setTipoPatente(e.detail.value)}
                    >
                      <IonSelectOption value="Comercial definitiva">
                        Comercial definitiva
                      </IonSelectOption>

                      <IonSelectOption value="Comercial provisoria">
                        Comercial provisoria
                      </IonSelectOption>

                      <IonSelectOption value="Patente profesional">
                        Patente profesional
                      </IonSelectOption>

                      <IonSelectOption value="Patente de alcoholes">
                        Patente de alcoholes
                      </IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  <IonItem className="solicitud-input">
                    <IonLabel position="stacked">
                      Rol de Avalúo de la Propiedad <b>*</b>
                    </IonLabel>
                    <IonInput
                      value={rolAvaluo}
                      placeholder="Ej: 1234-56"
                      onIonInput={(e) => setRolAvaluo(e.detail.value ?? "")}
                    />
                  </IonItem>

                  <div className="upload-section">
                    <label>
                      Subir documentos adjuntos <b>*</b>
                    </label>

                    <button
                      className="upload-box"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <IonIcon icon={cloudUploadOutline} />
                      <strong>Haz clic aquí para subir tus archivos</strong>
                      <span>o arrastra y suelta los archivos PDF, JPG, PNG</span>
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden-file-input"
                      onChange={handleFileChange}
                    />

                    {selectedFiles.length > 0 && (
                      <div className="selected-files">
                        <p>Archivos seleccionados:</p>
                        <ul>
                          {selectedFiles.map((fileName) => (
                            <li key={fileName}>{fileName}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="solicitud-actions">
                <IonButton
                  className="solicitud-back-button"
                  onClick={() => history.push("/usuario/seleccionar-tramite")}
                >
                  <IonIcon icon={arrowBackOutline} slot="start" />
                  Volver atrás
                </IonButton>

                <div className="solicitud-right-actions">
                  <IonButton
                    fill="outline"
                    className="solicitud-cancel-button"
                    onClick={() => history.push("/usuario/inicio")}
                  >
                    Cancelar
                  </IonButton>

                  <IonButton
                    className="solicitud-send-button"
                    onClick={handleEnviarSolicitud}
                  >
                    <IonIcon icon={paperPlaneOutline} slot="start" />
                    Enviar Solicitud
                  </IonButton>
                </div>
              </div>
            </section>
          </main>

          <footer className="solicitud-footer">
            <span>Copyright © 2026 I. Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudPatente;