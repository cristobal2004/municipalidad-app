import React, { useEffect, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory } from "react-router-dom";
import {
  arrowBackOutline,
  businessOutline,
  documentAttachOutline,
  informationCircleOutline,
  logOutOutline,
  sendOutline,
  trashOutline,
} from "ionicons/icons";

import { authService } from "../../../auth/composition/authService";
import { solicitudesApiService } from "../../composition/solicitudesService";
import "./SolicitudPatente.css";

interface UsuarioActual {
  nombre?: string;
  rut?: string;
  correo?: string;
  email?: string;
  rol?: string;
}

const SolicitudPatente: React.FC = () => {
  const history = useHistory();

  const [usuarioActual, setUsuarioActual] = useState<UsuarioActual | null>(
    null
  );

  const [razonSocial, setRazonSocial] = useState("");
  const [rut, setRut] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipoPatente, setTipoPatente] = useState("Comercial Definitiva");
  const [rolAvaluo, setRolAvaluo] = useState("");
  const [pyme, setPyme] = useState("Sí");

  const [correoContacto, setCorreoContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [giro, setGiro] = useState("");
  const [superficie, setSuperficie] = useState("");
  const [observacionesSolicitante, setObservacionesSolicitante] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [mensajeSistema, setMensajeSistema] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const usuario = authService.getUsuarioActual();

    if (!usuario) {
      history.push("/login-usuario");
      return;
    }

    setUsuarioActual(usuario);
    setCorreoContacto(usuario.correo || "");
    setRut(usuario.rut || "");
  }, [history]);

  const limpiarError = (campo: string) => {
    setErrores((prev) => {
      const copia = { ...prev };
      delete copia[campo];
      return copia;
    });
  };

  const validarFormulario = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!razonSocial.trim()) {
      nuevosErrores.razonSocial = "Ingresa la razón social o nombre del local.";
    }

    if (!rut.trim()) {
      nuevosErrores.rut = "Ingresa el RUT asociado a la solicitud.";
    }

    if (!direccion.trim()) {
      nuevosErrores.direccion = "Ingresa la dirección del local.";
    }

    if (!tipoPatente.trim()) {
      nuevosErrores.tipoPatente = "Selecciona el tipo de patente.";
    }

    if (!rolAvaluo.trim()) {
      nuevosErrores.rolAvaluo = "Ingresa el rol de avalúo.";
    }

    if (!correoContacto.trim()) {
      nuevosErrores.correoContacto = "Ingresa un correo de contacto.";
    }

    if (!telefonoContacto.trim()) {
      nuevosErrores.telefonoContacto = "Ingresa un teléfono de contacto.";
    }

    if (!giro.trim()) {
      nuevosErrores.giro = "Ingresa el giro comercial.";
    }

    if (!superficie.trim()) {
      nuevosErrores.superficie = "Ingresa la superficie del local.";
    }

    if (selectedFiles.length === 0) {
      nuevosErrores.documentos =
        "Debes adjuntar al menos un documento de respaldo.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarArchivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(event.target.files || []);

    if (archivos.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...archivos]);
    limpiarError("documentos");

    event.target.value = "";
  };

  const eliminarArchivo = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const enviarSolicitud = async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) {
      event.preventDefault();
    }

    const formularioValido = validarFormulario();

    if (!formularioValido || !usuarioActual) {
      return;
    }

    try {
      setEnviando(true);
      setMensajeSistema("");

      console.log("Archivos a enviar:", selectedFiles);

      const solicitudCreada =
        await solicitudesApiService.crearSolicitudConArchivos({
          tipoTramite: "Patente comercial",
          razonSocial,
          rut,
          direccion,
          tipoPatente,
          rolAvaluo,
          pyme,
          correoContacto,
          telefonoContacto,
          giro,
          superficie,
          observacionesSolicitante,
          archivos: selectedFiles,
        });

      localStorage.setItem(
        "ultima_solicitud_creada",
        JSON.stringify(solicitudCreada)
      );

      localStorage.setItem(
        "ultimaSolicitudCreada",
        JSON.stringify(solicitudCreada)
      );

      localStorage.setItem(
        "solicitud_confirmada",
        JSON.stringify(solicitudCreada)
      );

      localStorage.setItem(
        "solicitudConfirmada",
        JSON.stringify(solicitudCreada)
      );

      localStorage.setItem(
        "ultimaSolicitudId",
        solicitudCreada.codigo || solicitudCreada.id || ""
      );

      window.dispatchEvent(new Event("solicitudesActualizadas"));
      window.dispatchEvent(new Event("notificacionesFuncionarioActualizadas"));
      window.dispatchEvent(new Event("notificacionesUsuarioActualizadas"));

      history.push("/usuario/confirmacion");
    } catch (error: any) {
      console.error("Error al enviar solicitud:", error);

      const mensajeBackend =
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        "No se pudo enviar la solicitud. Intenta nuevamente.";

      setMensajeSistema(mensajeBackend);
    } finally {
      setEnviando(false);
    }
  };

  const cerrarSesion = () => {
    authService.logout();
    history.push("/");
  };

  return (
    <IonPage>
      <IonContent fullscreen scrollY className="solicitud-patente-content">
        <div className="solicitud-patente-wrapper">
          <header className="solicitud-patente-header">
            <div className="solicitud-patente-brand">
              <img
                src="/assets/Estandar-Muni.png"
                alt="Municipalidad de Santo Domingo"
              />

              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>

            <div className="solicitud-patente-user">
              <div>
                <strong>{usuarioActual?.nombre || "Usuario ciudadano"}</strong>
                <small>Usuario ciudadano</small>
              </div>

              <button type="button" onClick={cerrarSesion}>
                <IonIcon icon={logOutOutline} />
                Cerrar sesión
              </button>
            </div>
          </header>

          <main className="solicitud-patente-main">
            <section className="solicitud-patente-top">
              <button
                type="button"
                className="solicitud-patente-back"
                onClick={() => history.push("/usuario/seleccionar-tramite")}
              >
                <IonIcon icon={arrowBackOutline} />
                Volver a trámites
              </button>

              <div>
                <span>Formulario municipal</span>
                <h2>Solicitud de patente comercial</h2>
                <p>
                  Completa los antecedentes solicitados para registrar tu trámite
                  en la oficina virtual municipal.
                </p>
              </div>
            </section>

            {mensajeSistema && (
              <section className="solicitud-patente-message">
                <IonIcon icon={informationCircleOutline} />
                <span>{mensajeSistema}</span>
              </section>
            )}

            <form
              className="solicitud-patente-form"
              onSubmit={enviarSolicitud}
              encType="multipart/form-data"
            >
              <section className="solicitud-patente-card">
                <div className="solicitud-patente-card-title">
                  <IonIcon icon={businessOutline} />
                  <div>
                    <h3>Datos del solicitante y local</h3>
                    <p>Ingresa la información principal del trámite.</p>
                  </div>
                </div>

                <div className="solicitud-patente-grid">
                  <label>
                    Razón social / nombre del local
                    <input
                      value={razonSocial}
                      onChange={(event) => {
                        setRazonSocial(event.target.value);
                        limpiarError("razonSocial");
                      }}
                      placeholder="Ej: Almacén El Parque"
                    />
                    {errores.razonSocial && (
                      <small>{errores.razonSocial}</small>
                    )}
                  </label>

                  <label>
                    RUT
                    <input
                      value={rut}
                      onChange={(event) => {
                        setRut(event.target.value);
                        limpiarError("rut");
                      }}
                      placeholder="Ej: 76.123.456-7"
                    />
                    {errores.rut && <small>{errores.rut}</small>}
                  </label>

                  <label>
                    Dirección del local
                    <input
                      value={direccion}
                      onChange={(event) => {
                        setDireccion(event.target.value);
                        limpiarError("direccion");
                      }}
                      placeholder="Ej: Av. Litoral 450, Santo Domingo"
                    />
                    {errores.direccion && <small>{errores.direccion}</small>}
                  </label>

                  <label>
                    Tipo de patente
                    <select
                      value={tipoPatente}
                      onChange={(event) => {
                        setTipoPatente(event.target.value);
                        limpiarError("tipoPatente");
                      }}
                    >
                      <option value="Comercial Definitiva">
                        Comercial Definitiva
                      </option>
                      <option value="Comercial Provisoria">
                        Comercial Provisoria
                      </option>
                      <option value="Patente Profesional">
                        Patente Profesional
                      </option>
                    </select>
                    {errores.tipoPatente && (
                      <small>{errores.tipoPatente}</small>
                    )}
                  </label>

                  <label>
                    Rol de avalúo
                    <input
                      value={rolAvaluo}
                      onChange={(event) => {
                        setRolAvaluo(event.target.value);
                        limpiarError("rolAvaluo");
                      }}
                      placeholder="Ej: 123-45"
                    />
                    {errores.rolAvaluo && <small>{errores.rolAvaluo}</small>}
                  </label>

                  <label>
                    ¿Es PyME?
                    <select
                      value={pyme}
                      onChange={(event) => setPyme(event.target.value)}
                    >
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  </label>

                  <label>
                    Correo de contacto
                    <input
                      value={correoContacto}
                      onChange={(event) => {
                        setCorreoContacto(event.target.value);
                        limpiarError("correoContacto");
                      }}
                      placeholder="contacto@ejemplo.cl"
                    />
                    {errores.correoContacto && (
                      <small>{errores.correoContacto}</small>
                    )}
                  </label>

                  <label>
                    Teléfono de contacto
                    <input
                      value={telefonoContacto}
                      onChange={(event) => {
                        setTelefonoContacto(event.target.value);
                        limpiarError("telefonoContacto");
                      }}
                      placeholder="+56 9 1234 5678"
                    />
                    {errores.telefonoContacto && (
                      <small>{errores.telefonoContacto}</small>
                    )}
                  </label>

                  <label>
                    Giro comercial
                    <input
                      value={giro}
                      onChange={(event) => {
                        setGiro(event.target.value);
                        limpiarError("giro");
                      }}
                      placeholder="Ej: Venta de abarrotes"
                    />
                    {errores.giro && <small>{errores.giro}</small>}
                  </label>

                  <label>
                    Superficie del local
                    <input
                      value={superficie}
                      onChange={(event) => {
                        setSuperficie(event.target.value);
                        limpiarError("superficie");
                      }}
                      placeholder="Ej: 120 m²"
                    />
                    {errores.superficie && <small>{errores.superficie}</small>}
                  </label>
                </div>

                <label className="solicitud-patente-textarea-label">
                  Observaciones del solicitante
                  <textarea
                    value={observacionesSolicitante}
                    onChange={(event) =>
                      setObservacionesSolicitante(event.target.value)
                    }
                    placeholder="Agrega información adicional que pueda ayudar a revisar tu solicitud."
                    rows={4}
                  />
                </label>
              </section>

              <section className="solicitud-patente-card">
                <div className="solicitud-patente-card-title">
                  <IonIcon icon={documentAttachOutline} />
                  <div>
                    <h3>Documentos adjuntos</h3>
                    <p>
                      Adjunta los documentos requeridos para revisar tu
                      solicitud.
                    </p>
                  </div>
                </div>

                <div className="solicitud-patente-upload">
                  <input
                    name="documentos"
                    type="file"
                    multiple
                    onChange={manejarArchivos}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />

                  <IonIcon icon={documentAttachOutline} />
                  <strong>Selecciona o arrastra tus archivos</strong>
                  <span>Formatos permitidos: PDF, JPG, PNG.</span>
                </div>

                {errores.documentos && (
                  <div className="solicitud-patente-error">
                    {errores.documentos}
                  </div>
                )}

                {selectedFiles.length > 0 && (
                  <div className="solicitud-patente-files">
                    {selectedFiles.map((archivo, index) => (
                      <article key={`${archivo.name}-${index}`}>
                        <div>
                          <IonIcon icon={documentAttachOutline} />
                          <div>
                            <strong>{archivo.name}</strong>
                            <span>
                              {(archivo.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => eliminarArchivo(index)}
                        >
                          <IonIcon icon={trashOutline} />
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="solicitud-patente-info">
                <IonIcon icon={informationCircleOutline} />
                <p>
                  Al enviar la solicitud, el sistema asignará automáticamente el
                  trámite al área de Patentes Comerciales y al funcionario
                  correspondiente.
                </p>
              </section>

              <section className="solicitud-patente-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => history.push("/usuario/seleccionar-tramite")}
                  disabled={enviando}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary" disabled={enviando}>
                  <IonIcon icon={sendOutline} />
                  {enviando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </section>
            </form>
          </main>

          <footer className="solicitud-patente-footer">
            <span>© 2026 Municipalidad de Santo Domingo</span>
            <span>I. Municipalidad de Santo Domingo</span>
          </footer>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudPatente;