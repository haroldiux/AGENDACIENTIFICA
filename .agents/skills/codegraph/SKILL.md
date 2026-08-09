---
name: codegraph
description: Navegar y analizar el mapa de código y dependencias usando el motor AST CodeGraph.
---

# CodeGraph Context Engine Skill

Esta habilidad interactúa con el servidor MCP `codegraph` para analizar el código mediante grafos de nodos y dependencias (tree-sitter).

## Cuándo usar

- Necesitas encontrar definiciones de símbolos (clases, métodos, funciones, modelos) en backend o frontend.
- Querés mapear relaciones de importación entre controladores, servicios, repositorios y componentes.
- Vas a refactorizar y necesitás conocer el impacto en dependencias.

## Herramientas disponibles (vía MCP `codegraph`)

- `codegraph_query_symbol` — busca definiciones y referencias de un símbolo.
- `codegraph_get_dependencies` — grafo de dependencias de un archivo o símbolo.
- `codegraph_get_callers` — callers/callees de una función o método.

## Protocolo de uso

1. Identificá el símbolo, archivo o dominio de interés.
2. Usá `codegraph_query_symbol` para obtener definiciones y referencias.
3. Si necesitás entender el impacto, usá `codegraph_get_dependencies` o `codegraph_get_callers`.
4. Cruzá los resultados con lectura directa de los archivos relevantes.

## Restricciones

- CodeGraph ya está indexado para este proyecto (94 archivos). No ejecutes reindexación salvo que lo solicite explícitamente el usuario.
- Los resultados son guías; validá siempre contra el código fuente antes de modificar.
