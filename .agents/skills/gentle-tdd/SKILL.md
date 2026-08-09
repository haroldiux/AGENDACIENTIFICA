---
name: gentle-tdd
description: Aplicar el arnés TDD (Test-Driven Development) de Gentle AI con el ciclo estricto Red-Green-Refactor.
---

# Gentle AI Harness TDD Skill

Esta habilidad aplica el desarrollo guiado por pruebas (Test-Driven Development) al stack de este proyecto.

## Stack de pruebas del proyecto

- **Backend**: FastAPI + Python 3.12+. Tests en `backend/tests/` usando `pytest` y `FastAPI TestClient`.
  - Comando: `docker compose exec backend pytest` (requiere contenedor en ejecución).
- **Frontend**: Next.js 14+ (TypeScript). Actualmente **no hay runner de tests configurado**. Si se agrega, preferir Vitest o Jest.
- **Build/Type-check**: `npm run lint` y `npx tsc --noEmit` en `frontend/`.

## Cuándo usar

- Vas a implementar una nueva funcionalidad y el backend tiene tests existentes o se puede extender.
- Se requiere corregir un bug: primero escribí un test que lo reproduzca.
- Se solicita refactorización: asegurate de tener cobertura antes de cambiar el código.

## Protocolo de ejecución

1. **Fase Red**:
   - Creá o modificá un archivo de pruebas (`backend/tests/test_*.py` o `*.test.ts` en frontend).
   - Ejecutá el test y verificá que falle por la razón esperada.

2. **Fase Green**:
   - Escribí la implementación mínima necesaria en el código de producción.
   - Ejecutá el test y verificá que pase correctamente (100 % éxito).

3. **Fase Refactor**:
   - Mejorá legibilidad, performance y mantenibilidad.
   - Re-ejecutá las pruebas para asegurar cero regresiones.

## Restricciones

- No escribas código de producción antes de tener un test que falle.
- No alteres aserciones solo para forzar que un test pase.
- Si el frontend aún no tiene runner configurado, documentá la deuda técnica y no simules un test runner.
