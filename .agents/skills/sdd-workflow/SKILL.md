---
name: sdd-workflow
description: Ejecutar el flujo de desarrollo guiado por especificaciones (Spec-Driven Development) de Gentle AI con las fases Explore, Propose, Spec, Design, Implement y Verify.
---

# Gentle AI SDD Workflow Skill

Esta habilidad guía la ejecución del ciclo completo de Spec-Driven Development (SDD) para el proyecto.

## Cuándo usar

- El usuario solicita una nueva funcionalidad, mejora o cambio arquitectónico.
- Se requiere un cambio grande o de alto riesgo que necesite especificación previa.
- Se está trabajando bajo el arnés Gentle AI y se debe seguir el flujo formal.

## Fases y comandos

| Fase | Comando / skill | Objetivo |
|------|-----------------|----------|
| 1. Explore | `/sdd-explore <topic>` | Analizar el repositorio, estructuras de archivos y requisitos. Identificar dependencias, módulos afectados y riesgos. |
| 2. Propose | `/sdd-propose <change>` | Presentar alternativas técnicas y arquitectura propuesta con pros/contras. |
| 3. Spec | `/sdd-spec <change>` | Generar documento de especificación funcional con criterios de aceptación claros (Given/When/Then, RFC 2119). |
| 4. Design | `/sdd-design <change>` | Definir esquemas de datos, contratos de API, interfaces y tipos. |
| 5. Implement | `/sdd-implement <change>` | Codificar la solución siguiendo la especificación y aplicando pruebas TDD. |
| 6. Verify | `/sdd-verify <change>` | Ejecutar pruebas, linter, type-check y build; comparar contra la especificación. |

## Almacén de artefactos

- Modo preferido: `engram` (memoria persistente).
- Alternativa de equipo: `openspec` (archivos bajo `openspec/changes/`).
- Híbrido: ambos.

## Protocolo de uso

1. Determiná el nombre del cambio (`change-name`) y el modo de artefactos.
2. Ejecutá las fases en orden; no saltees Propose/Spec/Design para cambios significativos.
3. Entre Design e Implement, pedí aprobación del usuario si hay cambios disruptivos.
4. Persistí cada artefacto con el `topic_key` correcto (`sdd/{change-name}/{fase}`) en Engram o archivo correspondiente.

## Restricciones

- No escribas código en fases Explore, Propose, Spec o Design.
- No inferir el estado del cambio desde el transcripto; usá `gentle-ai sdd-status` o `mem_search` según el modo de artefactos.
- Si `gentle-ai` no está disponible, usá el protocolo manual descrito en `GEMINI.md`.
