# Prueba de Notificación WhatsApp - AGENDACIENTIFICA

**Fecha:** 2026-08-09  
**Entorno:** Stack Docker `docker-compose.e2e.yml`  
**Usuario de prueba:** coordinador.sistemas@unitepc.edu.bo (rol: coordinator / director de carrera)  
**Número destino:** +59178311416  

## Configuración realizada

1. Se levantó el stack E2E completo (Postgres, Redis, backend, worker, celery-beat, frontend).
2. Se asignó el número de WhatsApp `+59178311416` al usuario `coordinador.sistemas@unitepc.edu.bo`:
   ```sql
   UPDATE users SET phone_number = '+59178311416' WHERE email = 'coordinador.sistemas@unitepc.edu.bo';
   ```
3. Se verificó que el usuario tiene asignada la carrera "Ingeniería de Sistemas".
4. Se verificó que existen actividades científicas para esa carrera en los próximos 7 días:
   - Actividad Estado E2E (10/08/2026)
   - Actividad UAT_Admin_1786300180 (15/08/2026)

## Ejecución de la tarea

Se disparó manualmente la tarea de Celery:

```bash
docker compose -f docker-compose.e2e.yml exec worker celery -A app.core.celery_app.celery_app call app.workers.notification_worker.dispatch_weekly_notifications
```

## Resultado

La tarea se ejecutó correctamente: recibió la orden, filtró actividades para el coordinador de sistemas y generó el mensaje. Sin embargo, **el envío real no se completó porque faltan las credenciales de WhatsApp Business API** en el entorno.

Log del worker:

```
[WARNING] WhatsApp API token or Phone ID not configured.
[WARNING] SMTP configuration is missing.
```

## Mensaje que se habría enviado

```
Hola Coordinator, aquí están tus actividades para la próxima semana:

*Actividades Científicas:*
- Actividad Estado E2E (10/08/2026)
- Actividad UAT_Admin_1786300180 (15/08/2026)
```

## Conclusión

- El flujo de notificaciones semanales funciona correctamente: detecta al usuario, filtra sus actividades por carrera y arma el mensaje.
- Para que el mensaje llegue realmente a WhatsApp se deben configurar las variables de entorno:
  - `WHATSAPP_API_TOKEN`
  - `WHATSAPP_PHONE_ID`
- También se puede configurar SMTP como fallback (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`).
