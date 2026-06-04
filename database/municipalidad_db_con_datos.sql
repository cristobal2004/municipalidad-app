--
-- PostgreSQL database dump
--

\restrict 63dWB52JNqAZBpwaKLOQjrojbb9ji0u57eJbGju0RQHbJQnR1dNapuddk9ibv18

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_funcionario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.observaciones DROP CONSTRAINT IF EXISTS observaciones_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.observaciones DROP CONSTRAINT IF EXISTS observaciones_funcionario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documentos DROP CONSTRAINT IF EXISTS documentos_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agendamientos DROP CONSTRAINT IF EXISTS agendamientos_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agendamientos DROP CONSTRAINT IF EXISTS agendamientos_solicitud_id_fkey;
ALTER TABLE IF EXISTS ONLY public.agendamientos DROP CONSTRAINT IF EXISTS agendamientos_funcionario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_rut_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_numero_empleado_key;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_correo_key;
ALTER TABLE IF EXISTS ONLY public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_pkey;
ALTER TABLE IF EXISTS ONLY public.solicitudes DROP CONSTRAINT IF EXISTS solicitudes_codigo_key;
ALTER TABLE IF EXISTS ONLY public.observaciones DROP CONSTRAINT IF EXISTS observaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.documentos DROP CONSTRAINT IF EXISTS documentos_pkey;
ALTER TABLE IF EXISTS ONLY public.agendamientos DROP CONSTRAINT IF EXISTS agendamientos_pkey;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.solicitudes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.observaciones ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.documentos ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.agendamientos ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.solicitudes_id_seq;
DROP TABLE IF EXISTS public.solicitudes;
DROP SEQUENCE IF EXISTS public.observaciones_id_seq;
DROP TABLE IF EXISTS public.observaciones;
DROP SEQUENCE IF EXISTS public.documentos_id_seq;
DROP TABLE IF EXISTS public.documentos;
DROP SEQUENCE IF EXISTS public.agendamientos_id_seq;
DROP TABLE IF EXISTS public.agendamientos;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: agendamientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agendamientos (
    id integer NOT NULL,
    solicitud_id integer NOT NULL,
    usuario_id integer NOT NULL,
    funcionario_id integer,
    fecha_hora timestamp without time zone NOT NULL,
    estado character varying(30) DEFAULT 'agendado'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT agendamientos_estado_check CHECK (((estado)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('agendada'::character varying)::text, ('confirmada'::character varying)::text, ('reagendada'::character varying)::text, ('cancelada'::character varying)::text, ('completada'::character varying)::text])))
);


--
-- Name: agendamientos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.agendamientos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: agendamientos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.agendamientos_id_seq OWNED BY public.agendamientos.id;


--
-- Name: documentos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documentos (
    id integer NOT NULL,
    solicitud_id integer NOT NULL,
    nombre_archivo character varying(200) NOT NULL,
    tipo_documento character varying(100),
    ruta_archivo text,
    estado_validacion character varying(30) DEFAULT 'pendiente'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_archivo character varying(100),
    size_bytes integer,
    estado character varying(30) DEFAULT 'recibido'::character varying,
    descripcion text,
    CONSTRAINT documentos_estado_validacion_check CHECK (((estado_validacion)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('aprobado'::character varying)::text, ('rechazado'::character varying)::text])))
);


--
-- Name: documentos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documentos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documentos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documentos_id_seq OWNED BY public.documentos.id;


--
-- Name: observaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.observaciones (
    id integer NOT NULL,
    solicitud_id integer NOT NULL,
    funcionario_id integer,
    mensaje text NOT NULL,
    estado_resultante character varying(30),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT observaciones_estado_resultante_check CHECK (((estado_resultante)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('en_revision'::character varying)::text, ('observada'::character varying)::text, ('aprobada'::character varying)::text, ('rechazada'::character varying)::text])))
);


--
-- Name: observaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.observaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: observaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.observaciones_id_seq OWNED BY public.observaciones.id;


--
-- Name: solicitudes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solicitudes (
    id integer NOT NULL,
    codigo character varying(30) NOT NULL,
    usuario_id integer NOT NULL,
    funcionario_id integer,
    tipo_tramite character varying(100) NOT NULL,
    razon_social character varying(150),
    rut_empresa character varying(20),
    direccion character varying(200),
    tipo_patente character varying(100),
    rol_avaluo character varying(80),
    pyme boolean DEFAULT false,
    estado character varying(30) DEFAULT 'pendiente'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    correo_contacto character varying(120),
    telefono_contacto character varying(30),
    giro character varying(150),
    superficie character varying(50),
    observaciones_solicitante text,
    prioridad character varying(30) DEFAULT 'media'::character varying,
    documentos_faltantes jsonb DEFAULT '[]'::jsonb,
    fecha_limite_documentos date,
    CONSTRAINT solicitudes_estado_check CHECK (((estado)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('en_revision'::character varying)::text, ('observada'::character varying)::text, ('aprobada'::character varying)::text, ('rechazada'::character varying)::text])))
);


--
-- Name: solicitudes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.solicitudes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: solicitudes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.solicitudes_id_seq OWNED BY public.solicitudes.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(120) NOT NULL,
    rut character varying(20) NOT NULL,
    correo character varying(120) NOT NULL,
    password_hash text NOT NULL,
    rol character varying(20) NOT NULL,
    region character varying(80),
    comuna character varying(80),
    tipo_usuario character varying(50),
    area character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    numero_empleado character varying(30),
    cargo character varying(100),
    CONSTRAINT usuarios_rol_check CHECK (((rol)::text = ANY (ARRAY[('usuario'::character varying)::text, ('funcionario'::character varying)::text])))
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: agendamientos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamientos ALTER COLUMN id SET DEFAULT nextval('public.agendamientos_id_seq'::regclass);


--
-- Name: documentos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos ALTER COLUMN id SET DEFAULT nextval('public.documentos_id_seq'::regclass);


--
-- Name: observaciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observaciones ALTER COLUMN id SET DEFAULT nextval('public.observaciones_id_seq'::regclass);


--
-- Name: solicitudes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes ALTER COLUMN id SET DEFAULT nextval('public.solicitudes_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: agendamientos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.agendamientos (id, solicitud_id, usuario_id, funcionario_id, fecha_hora, estado, created_at) FROM stdin;
5	5	1	6	2026-06-02 17:59:00	agendada	2026-06-01 18:01:19.727052
6	3	1	6	2026-06-16 18:03:00	agendada	2026-06-01 18:03:59.51761
\.


--
-- Data for Name: documentos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.documentos (id, solicitud_id, nombre_archivo, tipo_documento, ruta_archivo, estado_validacion, created_at, tipo_archivo, size_bytes, estado, descripcion) FROM stdin;
1	6	municipalidad Santo Domingo.jpeg	image/jpeg	/uploads/documentos/1780340760412-municipalidad-Santo-Domingo.jpeg	pendiente	2026-06-01 15:06:00.460499	image/jpeg	333050	recibido	Documento adjuntado por el solicitante.
2	7	municipalidad Santo Domingo.jpeg	image/jpeg	/uploads/documentos/1780342177959-municipalidad-Santo-Domingo.jpeg	pendiente	2026-06-01 15:29:37.968034	image/jpeg	333050	recibido	Documento adjuntado por el solicitante.
3	8	municipalidad Santo Domingo.jpeg	image/jpeg	/uploads/documentos/1780342186962-municipalidad-Santo-Domingo.jpeg	pendiente	2026-06-01 15:29:46.967742	image/jpeg	333050	recibido	Documento adjuntado por el solicitante.
4	9	municipalidad Santo Domingo.jpeg	image/jpeg	/uploads/documentos/1780342193592-municipalidad-Santo-Domingo.jpeg	pendiente	2026-06-01 15:29:53.597209	image/jpeg	333050	recibido	Documento adjuntado por el solicitante.
5	9	Flujo numero 1.png	image/png	/uploads/documentos/1780348973556-Flujo-numero-1.png	pendiente	2026-06-01 17:22:53.833972	image/png	81307	recibido	Documento adjuntado por el solicitante.
6	9	Flujo numero 2.png	image/png	/uploads/documentos/1780348973686-Flujo-numero-2.png	pendiente	2026-06-01 17:22:53.838744	image/png	70540	recibido	Documento adjuntado por el solicitante.
7	9	flujo numero 3.png	image/png	/uploads/documentos/1780348973760-flujo-numero-3.png	pendiente	2026-06-01 17:22:53.839082	image/png	62703	recibido	Documento adjuntado por el solicitante.
8	9	flujo numero 4.png	image/png	/uploads/documentos/1780348973798-flujo-numero-4.png	pendiente	2026-06-01 17:22:53.839417	image/png	76081	recibido	Documento adjuntado por el solicitante.
9	10	dondeOscarFachada.jpeg	image/jpeg	/uploads/documentos/1780350914197-dondeOscarFachada.jpeg	pendiente	2026-06-01 17:55:14.209929	image/jpeg	40694	recibido	Documento adjuntado por el solicitante.
\.


--
-- Data for Name: observaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.observaciones (id, solicitud_id, funcionario_id, mensaje, estado_resultante, created_at) FROM stdin;
1	9	5	Porfavor adjuntar los documentos solicitados	observada	2026-06-01 16:20:44.423343
2	9	5	Porfavor adjuntar los documentos solicitados	observada	2026-06-01 16:20:46.711999
3	9	5	Por favor adjuntar los documentos solicitados	observada	2026-06-01 16:20:56.469556
4	9	5	Por favor adjuntar los documentos solicitados	observada	2026-06-01 16:30:57.723989
5	9	5	Por favor adjuntar los documentos solicitados	observada	2026-06-01 16:31:06.394913
6	9	5	Por favor adjuntar los documentos solicitados	observada	2026-06-01 16:43:16.502002
7	3	6	test rechazo 1	rechazada	2026-06-01 17:23:39.786104
8	4	6	test aprobado 1	en_revision	2026-06-01 17:24:10.317847
9	4	6	test aprobado 1	aprobada	2026-06-01 17:24:22.769112
10	5	6	suba las weas de documento vieja	observada	2026-06-01 17:32:40.511531
11	9	5	ta weno	aprobada	2026-06-01 17:37:33.200995
12	9	5	ta weno	aprobada	2026-06-01 17:37:35.620482
13	9	5	ta weno	observada	2026-06-01 17:46:52.83753
14	9	5	ta weno	observada	2026-06-01 17:47:00.137543
15	9	5	ta weno	aprobada	2026-06-01 17:47:17.372983
16	10	4	aprobao mi sangre dele corte nms	aprobada	2026-06-01 17:57:11.323233
17	5	6	Estamos pendientes de los documentos solicitados 	observada	2026-06-03 22:35:22.592533
\.


--
-- Data for Name: solicitudes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.solicitudes (id, codigo, usuario_id, funcionario_id, tipo_tramite, razon_social, rut_empresa, direccion, tipo_patente, rol_avaluo, pyme, estado, created_at, updated_at, correo_contacto, telefono_contacto, giro, superficie, observaciones_solicitante, prioridad, documentos_faltantes, fecha_limite_documentos) FROM stdin;
1	SOL-2026-0001	1	6	Patente comercial	Local de prueba EP2	76.123.456-7	Av. Litoral 450, Santo Domingo	Comercial Definitiva	123-45	f	pendiente	2026-06-01 12:04:16.351123	2026-06-01 12:04:16.351123	contacto@ejemplo.cl	+56 9 1234 5678	Venta de abarrotes y art�culos de primera necesidad	120 m�	Solicito patente comercial para iniciar actividades en el local indicado.	media	[]	\N
2	SOL-2026-0002	1	6	Patente comercial	Almacen Donde Pepito	11.111.111-1	Olmue, La Ramayana	Comercial Definitiva	123-45	t	pendiente	2026-06-01 12:15:16.159651	2026-06-01 12:15:16.159651	usuario@test.cl	+569111111	venta de abarrote	10m2	Es un local familiar en el centro de la ciudad	media	[]	\N
7	SOL-2026-0007	1	6	Patente comercial	111	11.111.111-1	1	Comercial Definitiva	1	t	pendiente	2026-06-01 15:29:37.966742	2026-06-01 15:29:37.966742	usuario@test.cl	1	11	1	\N	media	[]	\N
8	SOL-2026-0008	1	4	Patente comercial	1112	11.111.111-1	1	Comercial Definitiva	1	t	pendiente	2026-06-01 15:29:46.966446	2026-06-01 15:29:46.966446	usuario@test.cl	1	11	1	\N	media	[]	\N
4	SOL-2026-0004	1	6	Patente comercial	tt	11.111.111-1	t	Comercial Definitiva	t	t	aprobada	2026-06-01 14:41:39.250285	2026-06-01 17:24:22.768696	usuario@test.cl	t	t	t	\N	media	[]	\N
9	SOL-2026-0009	1	5	Patente comercial	11123	11.111.111-1	1	Comercial Definitiva	1	t	aprobada	2026-06-01 15:29:53.596551	2026-06-01 17:47:17.37196	usuario@test.cl	1	11	1	\N	media	[]	\N
3	SOL-2026-0003	1	6	Patente comercial	test	11.111.111-1	test1	Comercial Definitiva	44444	t	rechazada	2026-06-01 14:39:32.484011	2026-06-01 18:03:59.51846	usuario@test.cl	1231321231	test	10	test	media	[]	\N
5	SOL-2026-0005	1	6	Patente comercial	das	11.111.111-1	asda	Comercial Definitiva	asd	f	observada	2026-06-01 14:46:38.395362	2026-06-03 22:35:22.59029	usuario@test.cl	asd	asd	asd	\N	media	["Fotografía del local", "Croquis del local", "Patente anterior", "Certificado de residencia"]	2026-07-04
6	SOL-2026-0006	1	6	Patente comercial	111	11.111.111-1	1	Comercial Definitiva	1	t	aprobada	2026-06-01 15:06:00.458837	2026-06-03 22:38:01.758188	usuario@test.cl	1	11	1	\N	media	[]	\N
10	SOL-2026-0010	13	4	Patente comercial	Comercial Los Aromos SpA	76.543.210-9	Av. Litoral 1250	Comercial Definitiva	123-45	t	en_revision	2026-06-01 17:55:14.208796	2026-06-03 23:21:24.993788	contacto@losaromos.cl	+56 9 8765 4321	Venta de abarrotes y minimarket	120	Solicitud ingresada para revision de patente comercial definitiva.	media	[]	\N
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, nombre, rut, correo, password_hash, rol, region, comuna, tipo_usuario, area, created_at, numero_empleado, cargo) FROM stdin;
1	Usuario Prueba	11.111.111-1	usuario@test.cl	$2b$10$i6ylASIzbkXwOTlyS2H17eP8z4ND8h8B9UhkUFMFk5jlEqbkW/ZTK	usuario	Valpara�so	Santo Domingo	ciudadano	\N	2026-06-01 01:52:16.475154	\N	\N
2	Cristian Mejías	12.345.678-0	cristian.mejias@santodomingo.cl	$2b$10$7.o0/IqYJ/8zHhtTI9omDe3sfsy.75f8408N8XCgBoUg3xIpModr6	funcionario	Valparaíso	Santo Domingo	funcionario	Atención General	2026-06-01 01:57:23.226085	12345678	Funcionario Municipal
3	Benjamin Gomez	87.654.321-0	benjamin.gomez@santodomingo.cl	$2b$10$kxcPLBt1Z.cQTyxvhDZKF.3WlAnm8UCuRMdi.gObC9tVFRB5LYg2K	funcionario	Valparaíso	Santo Domingo	funcionario	Servicio Ciudadano	2026-06-01 01:57:23.276333	87654321	Ejecutivo de Atención
4	Oscar Ruiz	11.223.344-0	oscar.ruiz@santodomingo.cl	$2b$10$7wj30e5eOkU6xJDCz.S6p.RYXKwaZcw9JHBUyhHXb1ZIiNawLy77a	funcionario	Valparaíso	Santo Domingo	funcionario	Finanzas	2026-06-01 01:57:23.321425	11223344	Analista Municipal
5	Pablo Aguilera	44.556.677-0	pablo.aguilera@santodomingo.cl	$2b$10$RY3yFBJcpPUZwqdob05EGO9U4eVzVpb0AjJXT5EBB56j/7qDIS3Fa	funcionario	Valparaíso	Santo Domingo	funcionario	Obras Municipales	2026-06-01 01:57:23.368278	44556677	Revisor Técnico
6	Martina Ponce	99.887.766-0	martina.ponce@santodomingo.cl	$2b$10$1d1X.rT/J1YblPULe2UHnu8hBC4V8.astQ4GRSy7m0jSCF3yhJczG	funcionario	Valparaíso	Santo Domingo	funcionario	Patentes Comerciales	2026-06-01 01:57:23.414288	99887766	Encargada de Patentes
12	Cristobal Rubilar	21.711.065-3	cristobalrubilar2004@gmail.com	$2b$10$jMDJFvPW6SOEJGMq8vmOdOsmeOxqlX1WyIXG6gO/1z36FW4WRqwma	usuario	Metropolitana	San Antonio	ciudadano	\N	2026-06-01 17:33:24.227207	\N	\N
13	Representante Comercial Los Aromos	76.543.210-9	contacto@losaromos.cl	$2b$10$8hFshIY7cI/t3RHqdaasje3aj76tFDQFDf7FTxf.C5S5FPfcSipGS	usuario	Valparaíso	Santo Domingo	ciudadano	\N	2026-06-01 17:52:13.331369	\N	\N
\.


--
-- Name: agendamientos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.agendamientos_id_seq', 6, true);


--
-- Name: documentos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.documentos_id_seq', 9, true);


--
-- Name: observaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.observaciones_id_seq', 17, true);


--
-- Name: solicitudes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.solicitudes_id_seq', 10, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 13, true);


--
-- Name: agendamientos agendamientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamientos
    ADD CONSTRAINT agendamientos_pkey PRIMARY KEY (id);


--
-- Name: documentos documentos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_pkey PRIMARY KEY (id);


--
-- Name: observaciones observaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_pkey PRIMARY KEY (id);


--
-- Name: solicitudes solicitudes_codigo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_codigo_key UNIQUE (codigo);


--
-- Name: solicitudes solicitudes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_numero_empleado_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_numero_empleado_key UNIQUE (numero_empleado);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_rut_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rut_key UNIQUE (rut);


--
-- Name: agendamientos agendamientos_funcionario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamientos
    ADD CONSTRAINT agendamientos_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: agendamientos agendamientos_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamientos
    ADD CONSTRAINT agendamientos_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id) ON DELETE CASCADE;


--
-- Name: agendamientos agendamientos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agendamientos
    ADD CONSTRAINT agendamientos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: documentos documentos_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documentos
    ADD CONSTRAINT documentos_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id) ON DELETE CASCADE;


--
-- Name: observaciones observaciones_funcionario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: observaciones observaciones_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.observaciones
    ADD CONSTRAINT observaciones_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitudes(id) ON DELETE CASCADE;


--
-- Name: solicitudes solicitudes_funcionario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_funcionario_id_fkey FOREIGN KEY (funcionario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: solicitudes solicitudes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solicitudes
    ADD CONSTRAINT solicitudes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 63dWB52JNqAZBpwaKLOQjrojbb9ji0u57eJbGju0RQHbJQnR1dNapuddk9ibv18

