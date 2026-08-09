# Informe de Recorrido Manual UAT - AGENDACIENTIFICA

**Fecha:** 2026-08-09  
**Entorno:** Stack Docker `docker-compose.e2e.yml` (Postgres + Redis + Backend + Worker + Celery Beat + Frontend)  
**Herramienta:** Playwright con Chromium, resolución 1280x720  

## Resumen

Se ejecutó un recorrido completo por la UI simulando un usuario final para cada rol del sistema. El resultado fue exitoso para todos los roles probados.

| Rol | Email | Estado |
|-----|-------|--------|
| Admin | admin@unitepc.edu.bo | OK |
| Vicerrectorado | vicerrectorado@unitepc.edu.bo | OK |
| Dirección de Investigación | director.investigacion@unitepc.edu.bo | OK |
| Jefe de Investigación (Sistemas) | jefe.sistemas@unitepc.edu.bo | OK |
| Coordinador (Sistemas) | coordinador.sistemas@unitepc.edu.bo | OK |
| Solo Lectura | lectura@unitepc.edu.bo | OK |

## Flujos validados por rol

1. **Login** - Acceso con credenciales y redirección al Dashboard.
2. **Dashboard** - Visualización del resumen de actividades y próximos eventos.
3. **Calendario** - Filtrado por carrera y gestión; exportación de agenda de investigación a PDF.
4. **Actividades** - Listado, creación, edición (cambio de estado), carga de evidencias y eliminación (solo roles con permiso).
5. **Categorías** - Acceso a la pantalla de configuración de categorías.
6. **Importar** - Acceso a la pantalla de importación de calendario académico.
7. **Reportes** - Acceso a la pantalla de reportes.
8. **Logout** - Cierre de sesión y retorno al login.

## Observaciones

- El rol **Solo Lectura** no presenta el botón "Nueva Actividad" y no ejecuta flujos de creación/edición/eliminación, comportamiento esperado.
- La exportación de PDF en el calendario funciona correctamente con WeasyPrint en el worker de Celery.
- La carga de evidencias (archivo PDF) se realiza desde el modal de edición de actividades.

## Archivos de evidencia

Se generaron **68 screenshots** con la evidencia visual de cada paso. Se encuentran en esta misma carpeta (`e2e/screenshots/manual_uat/`).

## Conclusión

Todos los flujos principales de la interfaz funcionan correctamente desde la perspectiva de un usuario final para cada uno de los roles definidos en el sistema.
