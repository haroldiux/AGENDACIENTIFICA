# Contexto y Estado Actual — Agenda Científica UNITEPC
**Fecha:** 3 de agosto de 2026
**Workspace:** `C:\PROYECTOS\AGENDA CIENTIFICA`

---

## 1. Qué es el proyecto

Sistema de Agenda y Calendario de Actividades Científicas para UNITEPC. Resuelve el problema de que el calendario académico oficial es un PDF estático que no incluye las actividades del Departamento de Investigación Científica.

**Funcionalidades núcleo:**
- Calendario visual mensual/semanal que **fusiona** actividades académicas (importadas) y científicas (del departamento) por carrera.
- Importación del calendario académico desde Excel.
- Seguimiento de actividades científicas (estados, evidencias).
- Reportes PDF/Excel generados en background con Celery.

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + react-big-calendar + axios + react-hot-toast |
| Backend | FastAPI + SQLAlchemy + Pydantic + Alembic |
| DB / Cola | PostgreSQL + Redis + Celery (workers PDF/Excel) |
| Infra | Docker Compose (frontend, backend, db, redis, worker, nginx) |

## 3. Estado actual (qué ya funciona)

### Completado en las últimas sesiones
- ✅ **Calendario visual tipo grid** (`react-big-calendar`) con vistas mes/semana/día/agenda, modal de detalle y colores por tipo — `frontend/components/calendar/`
- ✅ **Fusión conectada**: `/calendario` consume `GET /api/v1/fusion/` (académicas + científicas)
- ✅ **Filtros carrera/gestión funcionales** en calendario, actividades y reportes (el filtro del header global era FALSO/hardcodeado y fue eliminado del `layout.tsx`)
- ✅ **Importación Excel real** en `/importar` → `POST /api/v1/importacion/upload-excel` (prefijo del router corregido en `backend/app/api/v1/api.py`)
- ✅ **`/actividades` reescrito**: lista real desde API, filtros carrera/gestión/estado, editar (modal con modo edición), eliminar con confirmación
- ✅ **Dashboard con datos reales** → `GET /api/v1/dashboard/stats` (nuevo endpoint `backend/app/api/v1/dashboard.py`)
- ✅ **Reportes**: Agenda Científica PDF y Agenda Consolidada Excel funcionales con polling de Celery; "Reporte de Conflictos" marcado como Próximamente (no existe en backend)
- ✅ **Reestructuración visual completa**: Sidebar con navegación activa (`components/layout/Sidebar.tsx`), `PageHeader` compartido, tokens de diseño en `globals.css`, dashboard rediseñado
- ✅ **Build del frontend compila sin errores** (`npx next build` exitoso, 6 rutas)

### Estado de git
- Rama con cambios **SIN COMMITEAR** (todo el trabajo nuevo está en working tree)
- Último commit: `c98883a chore(seed): add demo seeder...`
- Archivos nuevos sin trackear: `ANALISIS_BRECHAS_y_PLAN_CORRECCION.md`, `backend/app/api/v1/dashboard.py`, `frontend/components/calendar/`, `frontend/components/layout/`

## 4. Pendientes conocidos / backlog

1. **Commitear** el trabajo actual (sugerido: un commit por fase o uno global tipo `feat: visual calendar, fusion, import, real dashboard and activities CRUD`).
2. **Seed de datos**: si la DB solo muestra Gestión 2025, correr `python backend/seed.py` (crea 22 carreras, 3 gestiones 2024-2026, ~80 actividades).
3. **Reporte de Conflictos** (backend no implementado — Fase C del plan).
4. **Vista de seguimiento mejorada**: cambiar estado desde el calendario, link clicable de evidencias (Fase C).
5. **Notificaciones/recordatorios** por email con Celery (worker existe solo para reportes).
6. **Autenticación**: el backend tiene JWT/OAuth2 pero el frontend no tiene login conectado (`api.auth.login` existe en `lib/api.ts` sin UI).
7. **Reporte fusionado en PDF** (el PDF actual solo incluye científicas).

## 5. Archivos clave

| Archivo | Rol |
|---|---|
| `ANALISIS_BRECHAS_y_PLAN_CORRECCION.md` | Análisis de brechas + plan de corrección (Fases A/B/C) |
| `Plan_Implementacion_Sistema_Agenda_Cientifica_UNITEPC.md` | Plan original del sistema |
| `frontend/lib/api.ts` | Cliente API completo (fusion, scientific, careers, gestiones, dashboard, auth, reports) |
| `frontend/components/calendar/CalendarView.tsx` | Calendario react-big-calendar + modal detalle |
| `frontend/components/calendar/CalendarLegend.tsx` | Leyenda + paleta de colores (`getEventColor`) |
| `frontend/components/layout/Sidebar.tsx` | Navegación con estado activo |
| `frontend/components/layout/PageHeader.tsx` | Encabezado estándar de páginas |
| `frontend/components/agenda/AgendaFilterBar.tsx` | Filtros carrera/gestión reutilizables |
| `backend/app/api/v1/fusion.py` | Endpoint de fusión (filtra por career_id/gestion_id/fechas) |
| `backend/app/api/v1/dashboard.py` | Stats del dashboard |
| `backend/seed.py` | Datos demo: 22 carreras, 3 gestiones, actividades |

## 6. Cómo levantar el entorno

```bash
# Todo el stack (recomendado)
docker compose up --build

# Solo frontend en dev (requiere backend en :8000)
cd frontend && npm run dev   # http://localhost:3000

# Seed de datos demo
cd backend && python seed.py

# Tests backend
cd backend && python -m pytest
```

Node.js está en `C:\Program Files\nodejs` (v22.20.0). En Git Bash: `export PATH="/c/Program Files/nodejs:$PATH"`.

---

# 7. PROMPT PARA CONTINUAR (copiar en VS Code con plugin Kimi)

```
Estamos continuando el desarrollo del sistema "Agenda Científica UNITEPC" en
C:\PROYECTOS\AGENDA CIENTIFICA. Lee primero el archivo
ANALISIS_BRECHAS_y_PLAN_CORRECCION.md y este resumen de estado:

CONTEXTO: Monorepo con frontend Next.js 14 + Tailwind + react-big-calendar y
backend FastAPI + PostgreSQL + Redis + Celery. El sistema fusiona el calendario
académico importado (Excel) con las actividades científicas del departamento,
por carrera y gestión. Ya funcionan: calendario visual con fusión, filtros
carrera/gestión reales, importación Excel, CRUD de actividades con edición y
borrado, dashboard con datos reales (endpoint /dashboard/stats), reportes
PDF/Excel vía Celery, y una reestructuración visual completa (Sidebar con nav
activa, PageHeader, tokens de diseño). El build del frontend compila limpio.
Hay cambios SIN COMMITEAR en git — revísalos antes de tocar nada.

MODO DE TRABAJO (perfil "haroldiux" de Gentle IA):
- Activa el perfil haroldiux de Gentle IA con todas sus Skills disponibles.
- Trabaja con SDD (Spec-Driven Development): antes de implementar cualquier
  feature nueva, genera/actualiza la especificación en openspec/ (propuesta,
  specs, diseño y tasks) y pídeme aprobación antes de codear.
- Trabaja con TDD: escribe primero los tests (pytest en backend, y tests del
  frontend donde aplique), luego la implementación, y no des por terminada
  ninguna tarea sin la suite en verde.
- Usa los MCPs configurados cuando necesites datos o herramientas externas.
- Usa el modo multiagente: delega exploración, implementación y verificación
  en subagentes especializados, y consolida los resultados antes de responder.

BACKLOG PRIORITARIO (en este orden, uno a la vez):
1. Commitear el trabajo actual con mensajes convencionales bien separados.
2. Verificar con docker compose que el flujo completo funciona de punta a
   punta: seed → importar Excel → ver fusión en calendario → editar actividad
   → exportar PDF.
3. Implementar el Reporte de Conflictos (cruces de fecha entre actividades
   académicas y científicas de la misma carrera) con spec SDD + tests TDD.
4. Cambio de estado de actividades científicas directamente desde el
   calendario (con spec y tests).

Antes de empezar, dime en qué punto del backlog quieres que trabaje y
confírmame el plan. Responde siempre en español y al terminar cada tarea dame
un resumen tipo checklist en palabras sencillas.
```

---

*Documento generado para handoff de sesión — Agenda Científica UNITEPC.*
