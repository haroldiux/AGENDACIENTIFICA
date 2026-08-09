---
name: codebase
description: Búsqueda semántica e indexación rápida de código en todo el repositorio.
---

# Codebase Search Skill

Esta habilidad realiza búsquedas semánticas y filtrado estructural en el repositorio utilizando el servidor MCP `codebase`.

## Cuándo usar

- Necesitas encontrar funciones, clases o lógica de negocio describiendo su comportamiento en lenguaje natural.
- Quieres ubicar rápidamente archivos relacionados con un concepto, dominio o tecnología.
- Necesitas comprender la estructura general del repositorio sin cargar todos los archivos.

## Herramientas disponibles (vía MCP `codebase`)

- `codebase_search` — búsqueda semántica sobre el código indexado.
- `codebase_query` — consultas estructuradas al índice del repositorio.
- `codebase_status` — estado de la indexación.

## Protocolo de uso

1. Formula una consulta concreta en español o inglés (p. ej., "dónde se valida el login de usuario").
2. Invoca `codebase_search` con la consulta.
3. Lee los archivos retornados para confirmar el contexto.
4. Si los resultados son insuficientes, refiná la consulta o combiná con `codegraph_query_symbol` para búsqueda por símbolo.

## Restricciones

- No modifiques archivos solo con información de búsqueda; siempre leé el código fuente completo antes de editar.
- El índice es local; si el repositorio cambió recientemente, esperá a que el watcher lo actualice o reiniciá el servidor MCP.
