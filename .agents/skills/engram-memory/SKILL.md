---
name: engram-memory
description: Interactuar con la capa de memoria persistente Engram para registrar y recuperar contexto del proyecto y decisiones de arquitectura entre sesiones.
---

# Gentle AI Engram Memory Skill

Esta habilidad gestiona el almacenamiento y recuperación de memoria persistente a través del servidor MCP `engram`.

## Cuándo usar

- Antes de iniciar una tarea compleja, querés consultar decisiones técnicas previas, bugs resueltos o reglas específicas del proyecto.
- Al finalizar una tarea, querés guardar decisiones clave de arquitectura, esquemas aprobados o descubrimientos importantes.
- Necesitas recuperar el estado de un cambio SDD previo.

## Herramientas disponibles (vía MCP `engram`)

- `mem_search` — busca observaciones por palabras clave.
- `mem_get_observation` — recupera el contenido completo de una observación.
- `mem_save` — guarda una nueva observación.
- `mem_update` — actualiza una observación existente.

## Protocolo de uso

1. **Recuperar contexto**: `mem_search(query: "<término>", project: "agendacientifica")` → `mem_get_observation(id)`.
2. **Guardar contexto**: `mem_save(title, topic_key, type: "architecture", project: "agendacientifica", content, capture_prompt: false)`.
3. Para artefactos SDD usá los `topic_key` determinísticos definidos en `_shared/engram-convention.md` (p. ej., `sdd/{change-name}/explore`).

## Restricciones

- No guardes información sensible, credenciales o datos personales.
- Usá `capture_prompt: false` para artefactos automáticos del pipeline SDD.
- Si el MCP no responde, continuá con el contexto disponible y reportá el problema al finalizar.
