# ANÁLISIS CRÍTICO Y PLAN DE CORRECCIÓN
## Sistema de Agenda y Calendario de Actividades Científicas — UNITEPC

**Fecha de revisión:** 31 de Julio de 2026  
**Versión del sistema revisada:** Estado actual del repositorio  
**Premisa original:** Calendario de actividades científicas por carrera + importación de calendario académico + fusión amigable + seguimiento/reportes

---

## 1. ANÁLISIS: PREMISA vs. LO IMPLEMENTADO

### 1.1 Resumen de la Premisa Original

El usuario necesita resolver un problema concreto: **el calendario académico actual de UNITEPC es un PDF/imagen estática, difícil de entender, que no incluye sistemáticamente las actividades del Departamento de Investigación Científica.**

La solución requerida debe:

| Requerimiento | Descripción | Estado Actual |
|---|---|---|
| **R1** | Generar calendario de actividades científicas por carrera | ✅ Backend OK — CRUD completo de `ScientificActivity` con `career_id` |
| **R2** | Importar calendario académico oficial | ⚠️ Endpoint existe (`/importacion/upload-excel`) pero **el frontend es un placeholder sin funcionalidad real** |
| **R3** | Fusionar ambos calendarios por carrera | ⚠️ Endpoint `/fusion/` existe en backend, pero **el frontend NO lo consume** |
| **R4** | **Vista "más amigable y que se vea mucho mejor"** | ❌ **CRÍTICO — La vista actual es una lista de tarjetas, NO un calendario visual tipo grid/mensual** |
| **R5** | Seguimiento y reportes de actividades de investigación | ✅ Backend OK — estados, evidencias, workers Celery para PDF/Excel |

### 1.2 Hallazgo Central

> **El sistema implementa un "listado de actividades", no un "calendario".**

La premisa muestra explícitamente el calendario académico actual como referencia: una grilla mensual con días, colores y actividades posicionadas en fechas específicas. La implementación actual reemplaza esto por tarjetas agrupadas por mes, lo cual **no resuelve el problema original de visualización** y en muchos aspectos es igual o más difícil de interpretar que el PDF impreso.

---

## 2. BRECHAS IDENTIFICADAS (Priorizadas)

### 🔴 CRÍTICA — Brecha #1: No hay calendario visual tipo grid

**Problema:** La ruta `/calendario` muestra `AgendaActivityCard` en un grid de 2 columnas agrupadas por mes. **Esto no es un calendario.** Es un listado con tarjetas.

**Evidencia en código:**
- `frontend/app/calendario/page.tsx` → llama a `api.scientific.list()`, NO a `api.fusion.getMerged()`
- `frontend/components/agenda/AgendaMonthGroup.tsx` → renderiza tarjetas, no días de calendario
- No hay componente de calendario mensual con celdas de día (como FullCalendar, React Big Calendar, o implementación propia)

**Impacto:** El usuario final sigue sin poder ver, de un vistazo, qué actividades caen en qué día específico del mes. La visualización no es "más amigable" que el PDF original.

---

### 🔴 CRÍTICA — Brecha #2: La página de calendario no muestra la fusión

**Problema:** Aunque el endpoint `/api/v1/fusion/` existe y devuelve actividades académicas + científicas mezcladas, el frontend **solo consulta actividades científicas** (`/scientific/`).

**Evidencia en código:**
```tsx
// frontend/app/calendario/page.tsx (línea ~71)
const data = await api.scientific.list({
  career_id: careerId,
  gestion_id: gestionId ?? undefined,
});
```

**Impacto:** El usuario nunca ve el calendario académico importado superpuesto con las actividades científicas. No se cumple el requerimiento de "fusión de ambos por carrera".

---

### 🟠 ALTA — Brecha #3: La página de importación es un placeholder

**Problema:** `/importar` muestra una zona de drag & drop visualmente atractiva pero **sin funcionalidad real**. No hay `onDrop`, no llama a la API, no procesa archivos.

**Evidencia en código:**
```tsx
// frontend/app/importar/page.tsx (líneas ~14-19)
<div className="border-2 border-dashed ... cursor-pointer">
  <p>Arrastra y suelta tu archivo aquí</p>
  <button>Seleccionar Archivo</button>  {/* Sin onClick, sin input type=file */}
</div>
```

**Impacto:** No se puede importar el calendario académico. El flujo completo del sistema está roto en este punto.

---

### 🟠 ALTA — Brecha #4: Dashboard con datos hardcodeados

**Problema:** La página principal (`/`) muestra números fijos: 12 eventos, 8 actividades, 2 conflictos. No consulta la API.

**Evidencia en código:**
```tsx
// frontend/app/page.tsx (líneas ~7-17)
<p className="text-3xl font-bold">12</p>          {/* hardcodeado */}
<p className="text-3xl font-bold">8</p>           {/* hardcodeado */}
<p className="text-3xl font-bold text-amber-500">2</p>  {/* hardcodeado */}
```

**Impacto:** El dashboard es inútil para toma de decisiones. Muestra información ficticia.

---

### 🟡 MEDIA — Brecha #5: Tabla de actividades con datos hardcodeados

**Problema:** `/actividades` tiene una fila fija "Feria Científica Medicina" en la tabla, sin conexión a la API.

**Evidencia:**
```tsx
// frontend/app/actividades/page.tsx (líneas ~44-55)
<tbody>
  <tr>
    <td>Feria Científica Medicina</td>  {/* hardcodeado */}
    <td>15 Oct 2025</td>                {/* hardcodeado */}
    ...
  </tr>
</tbody>
```

---

### 🟡 MEDIA — Brecha #6: No hay leyenda de colores ni distinción visual académica vs. científica

**Problema:** La premisa solicita específicamente que se distingan visualmente las actividades académicas de las científicas. El diseño actual usa el mismo estilo para todo.

**Requerimiento de la premisa:** *"Distinción visual clara entre actividad académica y científica, aunque compartan el mismo día"*

---

### 🟢 BAJA — Brecha #7: El endpoint de importación usa un prefijo vacío

**Evidencia:**
```python
# backend/app/api/v1/api.py (línea ~15)
api_router.include_router(importacion.router, prefix="", tags=["importacion"])
```

Esto hace que el endpoint quede en `/api/v1/upload-excel` en lugar de `/api/v1/importacion/upload-excel`, lo cual es inconsistente con el resto de la API.

---

## 3. DIAGNÓSTICO DE ARQUITECTURA (Lo que SÍ está bien)

No todo es negativo. La base del sistema es sólida:

| Componente | Estado | Comentario |
|---|---|---|
| Modelo de datos (SQLAlchemy) | ✅ Sólido | `Career`, `Gestion`, `AcademicActivity`, `ScientificActivity`, `Sede`, `User` con roles |
| Separación académico/científico | ✅ Correcta | Entidades separadas permiten fusión sin duplicación |
| API REST (FastAPI) | ✅ Completa | CRUDs, filtros, validación Pydantic, OpenAPI/Swagger auto-generado |
| Endpoint de fusión | ✅ Funcional | `/fusion/` mezcla y ordena actividades de ambas fuentes |
| Autenticación base | ✅ Implementada | JWT/OAuth2 con roles |
| Workers async (Celery) | ✅ Funcional | Generación de reportes PDF/Excel en background |
| Generación de PDFs | ✅ Implementada | ReportLab con escape seguro de HTML, agrupación por mes |
| Docker + Docker Compose | ✅ Configurado | Entorno reproducible con PostgreSQL, Redis, Nginx |
| Seed de datos | ✅ Útil | Script `seed.py` con 22 carreras, 3 sedes, 3 gestiones, ~80 actividades |

---

## 4. PLAN DE CORRECCIÓN PRIORIZADO

### Fase A — Correcciones CRÍTICAS (Semana 1-2)

#### A.1 Implementar calendario visual mensual/semanal

**Descripción:** Reemplazar la vista de tarjetas por un calendario tipo grid que muestre días del mes con actividades posicionadas.

**Opciones de implementación:**
- **Opción A (recomendada):** Integrar `react-big-calendar` o `@fullcalendar/react` — rápido, probado, customizable
- **Opción B:** Implementar grid propio con CSS Grid — más control, más trabajo

**Requisitos del calendario:**
- Vista mensual por defecto, con opción de semanal
- Cada celda de día muestra las actividades que caen en esa fecha
- **Color/estilo diferente para académicas vs. científicas**
- Leyenda visible siempre (no como el PDF original)
- Click en actividad abre modal con detalles completos
- Navegación entre meses/gestiones

**Archivos a modificar/crear:**
- `frontend/app/calendario/page.tsx` → reescribir para usar vista de calendario
- `frontend/components/calendar/CalendarGrid.tsx` → nuevo componente principal
- `frontend/components/calendar/CalendarDayCell.tsx` → celda de día
- `frontend/components/calendar/CalendarEvent.tsx` → evento dentro de celda
- `frontend/components/calendar/CalendarLegend.tsx` → leyenda de colores

#### A.2 Conectar calendario al endpoint de fusión

**Descripción:** El calendario visual debe consumir `/api/v1/fusion/` en lugar de `/api/v1/scientific/`.

**Cambio mínimo en `api.ts`:**
```typescript
export const api = {
  fusion: {
    getMerged: (params?: { career_id?: number; gestion_id?: number; start_date?: string; end_date?: string }) =>
      apiClient.get('/fusion/', { params }).then((res) => res.data),
  },
  // ... resto
}
```

**Cambio en `calendario/page.tsx`:**
```typescript
const data = await api.fusion.getMerged({
  career_id: careerId,
  gestion_id: gestionId ?? undefined,
});
```

**Nota:** El endpoint `/fusion/` ya devuelve ambos tipos con `source_type: "academic" | "scientific"`. El frontend solo necesita usarlo.

#### A.3 Hacer funcional la página de importación

**Descripción:** Implementar el upload real de archivos Excel.

**Implementación en `frontend/app/importar/page.tsx`:**
- Agregar `input type="file"` oculto con referencia
- Implementar `onDrop` con `preventDefault`
- Usar `FormData` para enviar a `api.academic.upload()` (o el endpoint correcto)
- Mostrar progreso, validación de formato (.xlsx), errores de la API
- Preview de datos antes de confirmar importación

**Corrección en backend:**
```python
# backend/app/api/v1/api.py
# Cambiar:
api_router.include_router(importacion.router, prefix="/importacion", tags=["importacion"])
# En lugar de prefix=""
```

**Archivos a modificar:**
- `frontend/app/importar/page.tsx` → reescribir con funcionalidad real
- `frontend/app/importar/components/ImportPreview.tsx` → nuevo: preview de datos
- `backend/app/api/v1/api.py` → corregir prefijo del router

---

### Fase B — Correcciones ALTAS (Semana 2-3)

#### B.1 Dashboard con datos reales

**Descripción:** Conectar el dashboard a la API para mostrar métricas dinámicas.

**Métricas a mostrar:**
- Total de actividades científicas próximas (filtro por fecha >= hoy)
- Total de actividades científicas en la gestión activa
- Actividades con conflicto de fecha (si aplica) o actividades próximas a vencer
- Lista de próximos eventos (consultar API, no hardcodear)

**Archivos a modificar:**
- `frontend/app/page.tsx` → reescribir con `useEffect` + llamadas a API
- Posiblemente agregar endpoint `/api/v1/dashboard/stats` si no existe

#### B.2 Tabla de actividades con datos reales

**Descripción:** La página `/actividades` debe listar actividades científicas desde la API con paginación, filtros y acciones reales (editar/eliminar).

**Archivos a modificar:**
- `frontend/app/actividades/page.tsx` → conectar a `api.scientific.list()`
- Agregar paginación, filtros por estado/tipo
- Conectar botón "Editar" al modal existente `ActivityModal`
- Implementar eliminación con confirmación

#### B.3 Leyenda de colores y distinción visual

**Descripción:** Implementar sistema de colores consistente.

**Propuesta de colores:**
```typescript
const CALENDAR_COLORS = {
  academic: {
    examen: '#ef4444',        // rojo
    receso: '#6b7280',        // gris
    reunion: '#3b82f6',       // azul
    curso: '#10b981',         // verde
    default: '#6366f1',       // índigo
  },
  scientific: {
    congreso: '#f59e0b',      // ámbar
    webinar: '#06b6d4',       // cian
    defensa: '#ec4899',       // rosa
    feria: '#8b5cf6',         // violeta
    olimpiada: '#14b8a6',     // teal
    master_class: '#f97316',  // naranja
  }
}
```

**Reglas de visualización:**
- Actividades académicas: fondo sólido del color
- Actividades científicas: borde del color + fondo transparente/bajo opacidad
- Cuando ambas coinciden en mismo día: mostrar ambas con sus estilos

---

### Fase C — Mejoras y Pulido (Semana 3-4)

#### C.1 Vista de seguimiento mejorada

- En el calendario, permitir cambiar estado de actividad científica directamente (drag o click)
- Indicador visual de estado: puntos de color o badges
- Mostrar evidencia URL como link clicable

#### C.2 Mejoras en reportes

- El PDF de "research-agenda" actual solo incluye actividades científicas. Agregar opción de reporte fusionado.
- Agregar reporte comparativo entre gestiones.

#### C.3 Notificaciones y recordatorios

- Implementar el worker de notificaciones Celery (actualmente solo existe el de reportes)
- Recordatorios por email antes de actividades científicas

---

## 5. CRONOGRAMA DE CORRECCIÓN SUGERIDO

| Semana | Entregable | Criterio de aceptación |
|---|---|---|
| **1** | Calendario visual mensual funcional | Se ve una grilla de mes con días, actividades posicionadas, navegación entre meses |
| **1** | Endpoint de fusión conectado | El calendario muestra tanto académicas como científicas |
| **2** | Importación de Excel funcional | Se puede subir un archivo .xlsx, previsualizar, y confirmar importación |
| **2** | Dashboard con datos reales | Los números y la tabla de eventos vienen de la API |
| **3** | Tabla de actividades funcional | CRUD completo conectado a API, sin datos hardcodeados |
| **3** | Sistema de colores y leyenda | Colores consistentes, leyenda visible, distinción académica/científica |
| **4** | Testing y pulido | Flujo completo validado: importar → ver en calendario → editar → exportar reporte |

---

## 6. CONCLUSIÓN

El sistema tiene **una base técnica sólida** (backend, modelo de datos, infraestructura Docker, generación de reportes) pero **el frontend no cumple con el requerimiento central de la premisa: un calendario visual amigable que fusione actividades académicas y científicas.**

La prioridad absoluta es:

1. **Implementar un calendario visual tipo grid** (mensual/semanal) que reemplace la lista de tarjetas actual
2. **Conectar ese calendario al endpoint de fusión** para que muestre ambos tipos de actividad
3. **Hacer funcional la importación** para cerrar el ciclo completo del sistema

Sin estas tres correcciones, el sistema no resuelve el problema original del calendario académico confuso.

---

*Documento generado como resultado del análisis de brechas entre la premisa original y la implementación actual del sistema de Agenda Científica UNITEPC.*
