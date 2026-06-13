import React, { useEffect, useMemo, useState } from "react";
import { IonContent, IonIcon, IonPage } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import {
  arrowBackOutline,
  carOutline,
  constructOutline,
  documentAttachOutline,
  informationCircleOutline,
  logOutOutline,
  sendOutline,
  trashOutline,
} from "ionicons/icons";

import { authService } from "../../../auth/composition/authService";
import { solicitudesApiService } from "../../composition/solicitudesService";
import "./SolicitudPatente.css";

interface CampoFormulario {
  key: string;
  label: string;
  placeholder?: string;
  type?: string;
  options?: string[];
}

interface ConfiguracionTramite {
  titulo: string;
  tipoTramite: string;
  area: string;
  descripcion: string;
  icono: string;
  campos: CampoFormulario[];
}

const configuraciones: Record<string, ConfiguracionTramite> = {
  circulacion: {
    titulo: "Solicitud de permiso de circulacion",
    tipoTramite: "Permiso de circulacion",
    area: "Finanzas",
    descripcion:
      "Ingresa los antecedentes del propietario y del vehiculo para iniciar la revision municipal.",
    icono: carOutline,
    campos: [
      { key: "rut", label: "RUT del propietario", placeholder: "12.345.678-9" },
      {
        key: "patenteVehiculo",
        label: "Patente del vehiculo",
        placeholder: "ABCD12",
      },
      { key: "marca", label: "Marca", placeholder: "Ej: Toyota" },
      { key: "modelo", label: "Modelo", placeholder: "Ej: Corolla" },
      {
        key: "anio",
        label: "Año del vehiculo",
        placeholder: "Ej: 2022",
        type: "number",
      },
      {
        key: "tipoVehiculo",
        label: "Tipo de vehiculo",
        options: ["Automovil", "Camioneta", "Motocicleta", "Otro"],
      },
      {
        key: "domicilio",
        label: "Domicilio del propietario",
        placeholder: "Direccion en Santo Domingo",
      },
    ],
  },
  obras: {
    titulo: "Solicitud de obras municipales",
    tipoTramite: "Obras municipales",
    area: "Obras Municipales",
    descripcion:
      "Registra una solicitud de construccion, ampliacion o regularizacion para revision de la Direccion de Obras.",
    icono: constructOutline,
    campos: [
      { key: "rut", label: "RUT del solicitante", placeholder: "12.345.678-9" },
      {
        key: "direccion",
        label: "Direccion de la propiedad",
        placeholder: "Calle y numero",
      },
      {
        key: "tipoObra",
        label: "Tipo de obra",
        options: ["Obra nueva", "Ampliacion", "Regularizacion", "Demolicion"],
      },
      {
        key: "rolPropiedad",
        label: "Rol de la propiedad",
        placeholder: "Ej: 123-45",
      },
      {
        key: "superficie",
        label: "Superficie estimada",
        placeholder: "Ej: 120 m2",
      },
      {
        key: "nombreProyecto",
        label: "Nombre del proyecto",
        placeholder: "Ej: Ampliacion vivienda",
      },
    ],
  },
};

const SolicitudTramiteGeneral: React.FC = () => {
  const history = useHistory();
  const { tipo } = useParams<{ tipo: string }>();
  const config = configuraciones[tipo] || configuraciones.circulacion;
  const [usuario, setUsuario] = useState<any>(null);
  const [datos, setDatos] = useState<Record<string, string>>({});
  const [correoContacto, setCorreoContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  const camposObligatorios = useMemo(
    () =>
      tipo === "obras"
        ? ["rut", "direccion", "tipoObra", "rolPropiedad"]
        : ["rut", "patenteVehiculo", "marca", "modelo", "anio"],
    [tipo]
  );

  useEffect(() => {
    const usuarioActual = authService.getUsuarioActual();

    if (!usuarioActual) {
      history.push("/login-usuario");
      return;
    }

    setUsuario(usuarioActual);
    setCorreoContacto(usuarioActual.correo || "");
    setDatos((actuales) => ({
      ...actuales,
      rut: usuarioActual.rut || actuales.rut || "",
    }));
  }, [history]);

  const actualizarDato = (key: string, value: string) => {
    setDatos((actuales) => ({ ...actuales, [key]: value }));
    setErrores((actuales) => {
      const copia = { ...actuales };
      delete copia[key];
      return copia;
    });
  };

  const validar = () => {
    const nuevosErrores: Record<string, string> = {};

    camposObligatorios.forEach((key) => {
      if (!String(datos[key] || "").trim()) {
        nuevosErrores[key] = "Este campo es obligatorio.";
      }
    });

    if (!correoContacto.trim()) {
      nuevosErrores.correoContacto = "Ingresa un correo de contacto.";
    }

    if (!telefonoContacto.trim()) {
      nuevosErrores.telefonoContacto = "Ingresa un telefono de contacto.";
    }

    if (archivos.length === 0) {
      nuevosErrores.documentos =
        "Debes adjuntar al menos un documento de respaldo.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const enviarSolicitud = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validar()) {
      return;
    }

    try {
      setEnviando(true);
      setMensaje("");

      const solicitud = await solicitudesApiService.crearSolicitudConArchivos({
        tipoTramite: config.tipoTramite,
        razonSocial:
          datos.nombreProyecto ||
          datos.patenteVehiculo ||
          config.tipoTramite,
        rut: datos.rut,
        direccion: datos.direccion || datos.domicilio,
        tipoPatente: datos.tipoObra || datos.tipoVehiculo,
        rolAvaluo: datos.rolPropiedad || datos.patenteVehiculo,
        correoContacto,
        telefonoContacto,
        superficie: datos.superficie || datos.anio,
        observacionesSolicitante: observaciones,
        datosTramite: datos,
        archivos,
      });

      [
        "ultima_solicitud_creada",
        "ultimaSolicitudCreada",
        "solicitud_confirmada",
        "solicitudConfirmada",
      ].forEach((key) => localStorage.setItem(key, JSON.stringify(solicitud)));
      localStorage.setItem(
        "ultimaSolicitudId",
        solicitud.codigo || solicitud.id || ""
      );
      window.dispatchEvent(new Event("solicitudesActualizadas"));
      history.push("/usuario/confirmacion");
    } catch (error: any) {
      setMensaje(
        error.response?.data?.mensaje ||
          "No fue posible registrar la solicitud. Revisa los datos e intenta nuevamente."
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        scrollY
        className="solicitud-patente-content solicitud-tramite-general-content"
      >
        <div className="solicitud-patente-wrapper">
          <header className="solicitud-patente-header">
            <div className="solicitud-patente-brand">
              <img src="/assets/Estandar-Muni.png" alt="Municipalidad" />
              <div>
                <span>Municipalidad de</span>
                <h1>Santo Domingo</h1>
              </div>
            </div>
            <div className="solicitud-patente-user">
              <div>
                <strong>{usuario?.nombre || "Usuario ciudadano"}</strong>
                <small>Usuario ciudadano</small>
              </div>
              <button
                type="button"
                onClick={() => {
                  authService.logout();
                  history.push("/");
                }}
              >
                <IonIcon icon={logOutOutline} />
                Cerrar sesion
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
                Volver a tramites
              </button>
              <div>
                <span>Formulario municipal</span>
                <h2>{config.titulo}</h2>
                <p>{config.descripcion}</p>
              </div>
            </section>

            {mensaje && (
              <section className="solicitud-patente-message">
                <IonIcon icon={informationCircleOutline} />
                <span>{mensaje}</span>
              </section>
            )}

            <form className="solicitud-patente-form" onSubmit={enviarSolicitud}>
              <section className="solicitud-patente-card">
                <div className="solicitud-patente-card-title">
                  <IonIcon icon={config.icono} />
                  <div>
                    <h3>Antecedentes del tramite</h3>
                    <p>Completa la informacion que revisara el area municipal.</p>
                  </div>
                </div>
                <div className="solicitud-patente-grid">
                  {config.campos.map((campo) => (
                    <label key={campo.key}>
                      {campo.label}
                      {campo.options ? (
                        <select
                          value={datos[campo.key] || ""}
                          onChange={(event) =>
                            actualizarDato(campo.key, event.target.value)
                          }
                        >
                          <option value="">Selecciona una opcion</option>
                          {campo.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={campo.type || "text"}
                          value={datos[campo.key] || ""}
                          placeholder={campo.placeholder}
                          onChange={(event) =>
                            actualizarDato(campo.key, event.target.value)
                          }
                        />
                      )}
                      {errores[campo.key] && <small>{errores[campo.key]}</small>}
                    </label>
                  ))}

                  <label>
                    Correo de contacto
                    <input
                      type="email"
                      value={correoContacto}
                      onChange={(event) => setCorreoContacto(event.target.value)}
                    />
                    {errores.correoContacto && (
                      <small>{errores.correoContacto}</small>
                    )}
                  </label>
                  <label>
                    Telefono de contacto
                    <input
                      value={telefonoContacto}
                      placeholder="+56 9 1234 5678"
                      onChange={(event) =>
                        setTelefonoContacto(event.target.value)
                      }
                    />
                    {errores.telefonoContacto && (
                      <small>{errores.telefonoContacto}</small>
                    )}
                  </label>
                </div>
                <label className="solicitud-patente-textarea-label">
                  Observaciones
                  <textarea
                    value={observaciones}
                    onChange={(event) => setObservaciones(event.target.value)}
                    rows={4}
                    placeholder="Agrega antecedentes que ayuden a revisar la solicitud."
                  />
                </label>
              </section>

              <section className="solicitud-patente-card">
                <div className="solicitud-patente-card-title">
                  <IonIcon icon={documentAttachOutline} />
                  <div>
                    <h3>Documentos adjuntos</h3>
                    <p>Adjunta los respaldos disponibles para este tramite.</p>
                  </div>
                </div>
                <div className="solicitud-patente-upload">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => {
                      setArchivos((actuales) => [
                        ...actuales,
                        ...Array.from(event.target.files || []),
                      ]);
                      event.target.value = "";
                    }}
                  />
                  <IonIcon icon={documentAttachOutline} />
                  <strong>Selecciona o arrastra tus archivos</strong>
                  <span>Formatos permitidos: PDF, JPG y PNG.</span>
                </div>
                {errores.documentos && (
                  <div className="solicitud-patente-error">
                    {errores.documentos}
                  </div>
                )}
                {archivos.length > 0 && (
                  <div className="solicitud-patente-files">
                    {archivos.map((archivo, index) => (
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
                          onClick={() =>
                            setArchivos((actuales) =>
                              actuales.filter((_, item) => item !== index)
                            )
                          }
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
                  La solicitud se asignara automaticamente al area de{" "}
                  {config.area} y al funcionario con menor carga activa.
                </p>
              </section>

              <section className="solicitud-patente-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={enviando}
                  onClick={() => history.push("/usuario/seleccionar-tramite")}
                >
                  Cancelar
                </button>
                <button className="primary" type="submit" disabled={enviando}>
                  <IonIcon icon={sendOutline} />
                  {enviando ? "Enviando..." : "Enviar solicitud"}
                </button>
              </section>
            </form>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SolicitudTramiteGeneral;
