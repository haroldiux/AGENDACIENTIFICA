# Plan de Implementación
## Sistema de Agenda y Calendario de Actividades Científicas — UNITEPC

**Preparado para:** Departamento de Investigación Científica, Universidad Técnica Privada Cosmos (UNITEPC)
**Fecha:** Julio 2026
**Versión:** 1.0

---

## 1. Contexto y diagnóstico

El calendario académico actual (ver imagen de referencia, Gestión II-2025, Carrera de Medicina) tiene las siguientes limitaciones:

| Problema detectado | Impacto |
|---|---|
| Formato de tabla plana en PDF/imagen, sin jerarquía visual clara | Difícil de leer e interpretar rápidamente |
| Códigos de color sin leyenda explícita junto a cada evento | Ambigüedad sobre qué actividad corresponde a cada color |
| Fechas en rangos de texto libre ("19 de Septiembre al 4 de Octubre") sin estructura de datos | No se puede filtrar, ordenar ni cruzar con otras fuentes |
| No incluye actividades del Departamento de Investigación Científica (congresos, defensas de artículos, ferias, olimpiadas) de forma sistemática — solo algunas aparecen mezcladas | Falta de visibilidad y planificación para investigación |
| Un solo documento estático por carrera y gestión | No permite fusión, comparación entre carreras, ni actualización incremental |
| No hay seguimiento de cumplimiento ni reportes | No se puede medir avance de actividades científicas |

**Conclusión:** se requiere un sistema digital que separe la **fuente de datos** (eventos estructurados) de su **presentación** (calendario visual), permitiendo importar el calendario académico oficial, superponerlo con el calendario de actividades científicas por carrera, y generar reportes de seguimiento.

---

## 2. Objetivo del sistema

Construir una plataforma que permita:

1. **Crear y administrar** un calendario de actividades científicas por carrera (independiente del académico).
2. **Importar** el calendario académico oficial (actualmente en imagen/PDF) como datos estructurados.
3. **Fusionar** ambos calendarios en una vista única, amigable y visualmente clara, por carrera.
4. **Dar seguimiento** a cada actividad científica (estado, responsable, evidencias) y generar **reportes**.

---

## 3. Alcance

**Incluye:**
- Módulo de calendario académico (importación/carga manual).
- Módulo de calendario científico (creación y gestión por carrera).
- Vista fusionada e interactiva.
- Módulo de seguimiento y reportes de investigación.
- Gestión de usuarios y roles.

**No incluye (fuera de alcance inicial):**
- Integración con sistemas de notas/matrícula de la universidad.
- App móvil nativa (se prioriza web responsive).
- Facturación o gestión de presupuestos de investigación.

---

## 4. Arquitectura funcional propuesta

```
┌─────────────────────────┐     ┌──────────────────────────┐
│  Calendario Académico    │     │  Calendario Científico     │
│  (importado por carrera) │     │  (creado por Investigación)│
└───────────┬──────────────┘     └────────────┬──────────────┘
            │                                  │
            └───────────────┬──────────────────┘
                             ▼
                 ┌───────────────────────┐
                 │  Motor de Fusión        │
                 │  (por carrera/gestión)  │
                 └───────────┬────────────┘
                             ▼
                 ┌───────────────────────┐
                 │  Calendario Unificado   │
                 │  (vista web amigable)   │
                 └───────────┬────────────┘
                             ▼
                 ┌───────────────────────┐
                 │  Seguimiento y Reportes │
                 └───────────────────────┘
```

---

## 5. Modelo de datos (entidades principales)

- **Carrera**: id, nombre, facultad.
- **Gestión**: id, nombre (ej. "Gestión II-2025"), fecha_inicio, fecha_fin.
- **ActividadAcademica**: id, carrera_id, gestión_id, nombre, fecha_inicio, fecha_fin, categoría (examen, receso, reunión, curso, etc.), color_origen.
- **ActividadCientifica**: id, carrera_id, gestión_id, nombre, tipo (congreso, webinar, defensa de artículo, feria, olimpiada, master class, etc.), fecha_inicio, fecha_fin, responsable, estado (planificada / en curso / completada / cancelada), evidencia_url, observaciones.
- **Usuario**: id, nombre, rol (Administrador, Coordinador de Carrera, Investigación, Docente/Consulta).
- **Reporte**: id, gestión_id, carrera_id (opcional), tipo (cumplimiento, participación, comparativo), fecha_generación, archivo.

Esta separación permite que una actividad científica **no dependa** de que exista en el calendario académico, y que ambas se puedan cruzar sin duplicar información.

---

## 6. Funcionalidades por fase

### Fase 1 — MVP (calendario digital + fusión básica)
- Carga manual/estructurada del calendario académico actual (transcripción del PDF/imagen a tabla editable, por carrera y gestión).
- CRUD de actividades científicas por carrera (formulario simple: nombre, fecha, tipo, responsable).
- Vista de calendario mensual fusionado, con leyenda de colores por tipo de actividad (académica vs. cada tipo científico).
- Filtros por carrera, gestión y tipo de actividad.
- Exportación a PDF/imagen del calendario fusionado (para reemplazar el actual).

### Fase 2 — Importación y usabilidad
- Importador semi-automático: subir el PDF/imagen del calendario académico y usar reconocimiento de texto (OCR) asistido por revisión humana para poblar la tabla de actividades académicas, reduciendo la carga manual.
- Plantillas reutilizables de actividades científicas recurrentes (webinars mensuales, reuniones de consejo, etc.).
- Notificaciones/recordatorios automáticos antes de cada actividad.
- Vista por semana/día además de la mensual.

### Fase 3 — Seguimiento y reportes
- Registro de estado y evidencia por actividad científica (documentos, actas, fotos, listas de asistencia).
- Panel de indicadores: número de actividades planificadas vs. ejecutadas, por carrera y por tipo.
- Reportes exportables (PDF/Excel) por gestión, carrera o rango de fechas.
- Historial comparativo entre gestiones (ej. Gestión I-2026 vs. Gestión II-2025).

### Fase 4 — Escalamiento (opcional)
- Roles diferenciados por facultad, no solo por carrera.
- Integración con correo institucional para notificaciones.
- Panel público (solo lectura) para estudiantes/docentes.

---

## 7. Stack tecnológico

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | **Next.js 14+ (React, App Router, TypeScript)** | SSR/SSG para carga rápida del calendario, buen SEO interno para portal institucional, ecosistema maduro de librerías de calendario (FullCalendar, React Big Calendar) |
| Estilos/UI | Tailwind CSS + shadcn/ui | Consistencia visual, componentes accesibles, rapidez de desarrollo |
| Backend | **FastAPI (Python 3.12+)** | Tipado con Pydantic, generación automática de documentación OpenAPI/Swagger, alto rendimiento async, ideal para módulo de importación/OCR y generación de reportes |
| ORM | SQLAlchemy 2.0 + Alembic | Migraciones versionadas del modelo de datos (carreras, gestiones, actividades) |
| Base de datos | **PostgreSQL 16** | Soporta tipos de fecha/rango nativos (`daterange`), ideal para actividades con fecha_inicio/fecha_fin y consultas de solapamiento entre calendarios |
| Cola de tareas / procesos async | Celery + Redis (o RQ) | Procesamiento en segundo plano del OCR de calendarios académicos y generación de reportes PDF/Excel sin bloquear la API |
| Autenticación | OAuth2 / JWT vía FastAPI, con opción de SSO institucional | Roles por carrera y departamento |
| Contenedores | **Docker + Docker Compose v2** | Entorno reproducible local y en servidor (frontend, backend, base de datos, Redis, worker) |
| Reverse proxy | Nginx (o Traefik) | Enrutamiento entre Next.js, FastAPI y assets estáticos; terminación SSL |
| CI/CD | **Jenkins** (pipeline declarativo) | Build, test y despliegue automatizado en cada push/merge; integrable con el servidor institucional |
| Registro de imágenes | Docker Registry privado o GitHub Container Registry | Versionado de imágenes construidas por Jenkins |
| Almacenamiento de archivos | Volumen Docker / S3-compatible (MinIO) | Evidencias de actividades científicas, PDFs importados, reportes generados |
| Reportes | WeasyPrint / ReportLab (PDF) y openpyxl (Excel) desde FastAPI | Generación de reportes de seguimiento directamente desde el backend |
| Monitoreo (opcional, fase posterior) | Prometheus + Grafana, o Sentry para errores | Observabilidad del sistema en producción |

---

## 8. Arquitectura técnica

### 8.1 Diagrama de componentes

```
                         ┌──────────────────────────┐
                         │        Usuarios            │
                         │ (Investigación, Secretaría, │
                         │  Coordinadores, Docentes)   │
                         └─────────────┬──────────────┘
                                       │ HTTPS
                                       ▼
                         ┌──────────────────────────┐
                         │   Nginx (Reverse Proxy)   │
                         │   + SSL termination        │
                         └─────────────┬──────────────┘
                        ┌──────────────┴───────────────┐
                        ▼                               ▼
          ┌──────────────────────────┐   ┌──────────────────────────┐
          │   Frontend (Next.js)      │   │   Backend API (FastAPI)   │
          │   - Vista calendario       │──▶│   - Auth (JWT/OAuth2)      │
          │   - Panel de importación   │   │   - CRUD carreras/gestión  │
          │   - Panel de seguimiento   │   │   - CRUD activ. académicas │
          │   - Reportes (descarga)    │   │   - CRUD activ. científicas│
          └──────────────────────────┘   │   - Motor de fusión         │
                                          │   - Endpoints de reportes   │
                                          └─────────────┬──────────────┘
                                                        │
                              ┌─────────────────────────┼─────────────────────────┐
                              ▼                         ▼                         ▼
                 ┌────────────────────┐   ┌───────────────────────┐   ┌────────────────────┐
                 │   PostgreSQL 16      │   │  Redis + Celery worker │   │  Almacenamiento     │
                 │   (datos estructur.) │   │  - OCR calendario acad.│   │  archivos (MinIO/   │
                 │                       │   │  - Generación reportes │   │  volumen)            │
                 └────────────────────┘   │  - Notificaciones      │   └────────────────────┘
                                           └───────────────────────┘
```

### 8.2 Estructura de repositorio propuesta (monorepo)

```
unitepc-calendario/
├── frontend/                 # Next.js + TypeScript
│   ├── app/
│   │   ├── calendario/
│   │   ├── importar/
│   │   ├── actividades/
│   │   └── reportes/
│   ├── components/
│   └── package.json
├── backend/                  # FastAPI + Python
│   ├── app/
│   │   ├── api/v1/           # routers: carreras, gestiones, actividades, import, reportes
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── services/         # motor de fusión, OCR, generación de reportes
│   │   ├── workers/          # tareas Celery
│   │   └── core/             # config, seguridad, dependencias
│   ├── alembic/               # migraciones
│   └── pyproject.toml
├── nginx/
│   └── nginx.conf
├── docker-compose.yml         # orquestación local/desarrollo
├── docker-compose.prod.yml    # overrides de producción
├── Jenkinsfile                # pipeline CI/CD
└── docs/
```

### 8.3 docker-compose (esquema de referencia)

```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db, redis]

  worker:
    build: ./backend
    command: celery -A app.workers worker --loglevel=info
    depends_on: [db, redis]

  db:
    image: postgres:16
    volumes: ["pgdata:/var/lib/postgresql/data"]
    env_file: .env

  redis:
    image: redis:7

  nginx:
    build: ./nginx
    ports: ["80:80", "443:443"]
    depends_on: [frontend, backend]

volumes:
  pgdata:
```

Se usa **Docker Compose v2** (`docker compose`, sin guion) tanto para el entorno de desarrollo local como para réplicas en el servidor de despliegue, manteniendo paridad entre ambientes.

### 8.4 Pipeline CI/CD con Jenkins (flujo propuesto)

1. **Trigger:** push o merge a `main`/`develop` (vía webhook de Git).
2. **Etapa Build:** construcción de imágenes Docker de `frontend` y `backend`.
3. **Etapa Test:**
   - Backend: `pytest` (unitarios + integración contra Postgres de prueba).
   - Frontend: `eslint`, `type-check` (TypeScript), pruebas con Vitest/Playwright si aplica.
4. **Etapa Migraciones:** ejecución de `alembic upgrade head` contra la base de datos de staging.
5. **Etapa Push:** publicación de imágenes en el registro (GitHub Container Registry o registro privado institucional).
6. **Etapa Deploy:**
   - `develop` → despliegue automático a **staging** (`docker compose -f docker-compose.staging.yml up -d`).
   - `main` → despliegue a **producción**, con aprobación manual (Jenkins input step) antes de aplicar.
7. **Notificación:** resultado del pipeline enviado a correo/Slack/Teams del equipo técnico.

Ejemplo de estructura de `Jenkinsfile` (declarativo, por etapas):

```groovy
pipeline {
  agent any
  stages {
    stage('Build') {
      steps { sh 'docker compose build' }
    }
    stage('Test') {
      steps {
        sh 'docker compose run --rm backend pytest'
        sh 'docker compose run --rm frontend npm run lint'
      }
    }
    stage('Migrate') {
      steps { sh 'docker compose run --rm backend alembic upgrade head' }
    }
    stage('Push') {
      steps { sh 'docker compose push' }
    }
    stage('Deploy Staging') {
      when { branch 'develop' }
      steps { sh 'docker compose -f docker-compose.staging.yml up -d' }
    }
    stage('Deploy Producción') {
      when { branch 'main' }
      steps {
        input message: '¿Aprobar despliegue a producción?'
        sh 'docker compose -f docker-compose.prod.yml up -d'
      }
    }
  }
}
```

### 8.5 Entornos

| Entorno | Propósito | Rama Git |
|---|---|---|
| Local (desarrollo) | Desarrollo individual con `docker compose up` | feature branches |
| Staging | Pruebas del Departamento de Investigación antes de publicar | `develop` |
| Producción | Sistema en uso por la universidad | `main` |

---

## 9. Diseño de la vista fusionada (criterios de UX)

- Un **color fijo por tipo de actividad**, con leyenda siempre visible (no solo colores sin explicación, como en el calendario actual).
- Distinción visual clara entre actividad **académica** (fondo sólido) y **científica** (borde o ícono distintivo), aunque compartan el mismo día.
- Selector de carrera en la parte superior para no mezclar información de todas las carreras a la vez.
- Vista resumen tipo lista (además de la cuadrícula) para exportar como el documento actual, pero legible.
- Tooltips o clic en el evento para ver detalle completo (fechas exactas, responsable, estado).

---

## 10. Roles y permisos

| Rol | Permisos |
|---|---|
| Administrador del sistema | Gestión total, configuración de carreras y gestiones |
| Departamento de Investigación Científica | Crear/editar actividades científicas, generar reportes |
| Secretaría Académica / Coordinación de Carrera | Cargar y actualizar calendario académico |
| Docentes/Consulta | Solo lectura del calendario fusionado |

---

## 11. Cronograma sugerido (estimado)

| Semana | Actividad |
|---|---|
| 1–2 | Levantamiento de requerimientos con Investigación y Secretaría Académica; definición de tipos de actividad y colores; diseño del modelo de datos (PostgreSQL) |
| 3 | Setup de infraestructura base: monorepo, Docker Compose (frontend, backend, db, redis, nginx) y pipeline inicial en Jenkins (build + test) |
| 4–5 | Desarrollo backend FastAPI: modelos, migraciones (Alembic), endpoints CRUD de carreras/gestiones/actividades académicas y científicas |
| 6–7 | Desarrollo frontend Next.js: vista de calendario fusionado, formularios de carga de actividades científicas, panel de importación |
| 8 | Integración del motor de fusión + despliegue a **staging** vía Jenkins; carga piloto con el calendario de una carrera (ej. Medicina, Gestión II-2025) |
| 9 | Ajustes según retroalimentación del Departamento de Investigación |
| 10–11 | Desarrollo del módulo de seguimiento (Celery/Redis para tareas async) y generación de reportes PDF/Excel |
| 12 | Piloto extendido a 2–3 carreras adicionales en staging |
| 13 | Endurecimiento (seguridad, backups de Postgres), despliegue a **producción** con aprobación manual en Jenkins |
| 14 | Evaluación, documentación técnica y plan de escalamiento institucional |

---

## 12. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| El calendario académico llega en formatos no estandarizados (imagen, PDF distinto por carrera) | Definir una plantilla estándar de entrega para Secretaría Académica desde la Fase 2 |
| Resistencia al cambio de herramienta por parte de coordinadores | Piloto con una sola carrera antes de escalar; capacitación breve |
| Sobrecarga de información en la vista fusionada | Filtros obligatorios por carrera y opción de ocultar categorías |
| Falta de actualización constante de estados de actividades científicas | Recordatorios automáticos y responsable designado por actividad |

---

## 13. Próximos pasos inmediatos

1. Validar con el Departamento de Investigación Científica la lista completa de **tipos de actividad científica** y sus colores/categorías.
2. Definir con Secretaría Académica el **formato estándar** en que se entregará el calendario académico (plantilla Excel recomendada).
3. Aprobar el alcance del MVP (Fase 1) y la herramienta base (Google Sheets/Calendar vs. desarrollo propio).
4. Seleccionar la carrera piloto (se sugiere Medicina, por ser la que ya tiene el calendario de referencia).

---

*Documento generado como propuesta de plan de implementación. Puede ajustarse según prioridades presupuestarias y de personal técnico disponible en UNITEPC.*
