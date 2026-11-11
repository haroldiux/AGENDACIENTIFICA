# Guía Paso a Paso — Sistema de Agenda Científica UNITEPC

## 1. ¿Tiene Seeder? (Datos Iniciales Ya Cargados)
**Sí**, el sistema cuenta con **2 seeders** en la carpeta `backend/` y **ya están ejecutados** en tu base de datos Docker (`unitepc_db`):
1. `backend/seed.py`: Carga **3 sedes**, **6 gestiones semestrales**, **24 carreras** de todas las facultades, **15 actividades académicas** y **50 actividades científicas** de ejemplo (con estados, responsables y evidencias).
2. `backend/seed_roles.py`: Crea **9 cuentas de usuario** (una para cada rol institucional) con la contraseña **`unitepc123`**.

> Si en algún momento querés volver a ejecutar los seeders desde cero en tu terminal:
> ```powershell
> docker exec unitepc_backend python seed.py
> docker exec unitepc_backend python seed_roles.py
> ```

---

## 2. Accesos y Usuarios del Seeder

- **Aplicación Web**: http://localhost:3005
- **Portal Público (sin login)**: http://localhost:3005/portal
- **Contraseña única para todos los usuarios**: **`unitepc123`**

| Rol a Probar | Correo Electrónico | Qué representa en la UNITEPC |
|---|---|---|
| **Dirección Nacional de Investigación** | `director_investigacion@unitepc.edu.bo` | Carga actividades **Globales** para toda la universidad, gestiona categorías y supervisa todas las carreras. |
| **Vicerrectorado** | `vicerrectorado@unitepc.edu.bo` | Supervisión ejecutiva nacional, reportes consolidados y actividades institucionales. |
| **Super Admin / Admin** | `super_admin@unitepc.edu.bo` | Control total del sistema, gestión de usuarios, roles y configuración. |
| **Jefe de Investigación (Carrera)** | `jefe_investigacion@unitepc.edu.bo` | Asignado a **Ingeniería de Sistemas**. Carga y ejecuta la agenda científica de su carrera. |
| **Coordinador de Carrera** | `coordinator@unitepc.edu.bo` | Asignado a **Medicina**. Planifica y da seguimiento a las actividades de Medicina. |
| **Docente Investigador** | `teacher@unitepc.edu.bo` | Asignado a **Derecho**. Gestiona actividades de la carrera de Derecho. |
| **Solo Lectura** | `read_only@unitepc.edu.bo` | Solo consulta el calendario y descarga reportes (no puede crear ni editar). |

---

## 3. Guía Paso a Paso para Usar y Demostrar el Sistema

Tenés una carpeta lista en tu proyecto llamada **`f:\AGENDA\material_demostracion\`** con 5 planillas Excel ya llenadas y 3 documentos PDF oficiales para hacer toda la demostración en vivo.

### PASO 1: Entrar y explorar los datos del Seeder + Modo Claro/Oscuro
1. Abrí http://localhost:3005/login en tu navegador.
2. Ingresá con:
   - **Correo**: `director_investigacion@unitepc.edu.bo`
   - **Contraseña**: `unitepc123`
3. **Probá el Modo Claro y Oscuro**: Abajo a la izquierda en el menú lateral hacé clic en **`Modo Claro` / `Modo Oscuro`** (ícono de Sol/Luna).
4. **Revisá el Dashboard (`/`)**: Vas a ver las tarjetas KPI con las actividades que cargó el seeder, el gráfico circular de porcentaje de cumplimiento, la línea de tiempo mensual y el historial de auditoría.

---

### PASO 2: Simular una Dirección de Carrera subiendo su Planilla Excel
Ahora vamos a ver cómo una carrera carga su planificación semestral:
1. En la barra lateral abajo a la izquierda, hacé clic en **Cerrar Sesión**.
2. Iniciá sesión como **Jefe de Investigación de Ingeniería de Sistemas**:
   - **Correo**: `jefe_investigacion@unitepc.edu.bo`
   - **Contraseña**: `unitepc123`
3. En el menú izquierdo, entrá a **Importar (`/importar`)**.
4. Arrastrá o seleccioná el archivo:
   - `f:\AGENDA\material_demostracion\02_Planilla_Carrera_Ingenieria_de_Sistemas_2-2026.xlsx`
5. Hacé clic en **Subir y Procesar**:
   - **Resultado 1**: Se registran las actividades académicas y científicas de **Ingeniería de Sistemas** para el semestre `2-2026`.
   - **Resultado 2 (Detección de Choque)**: El sistema te avisa en pantalla que el *Hackathon UNITEPC (22/09/2026)* choca con el *Examen Parcial de Ingeniería de Software (21/09 al 23/09/2026)*.
   - **Prueba de Seguridad por Rol**: Si intentás subir con este mismo usuario el archivo `03_Planilla_Carrera_Medicina_2-2026.xlsx`, el sistema te rechazará las filas porque el Jefe de Sistemas no tiene permiso para tocar la agenda de Medicina.

---

### PASO 3: Simular a la Dirección de Investigación consolidando toda la Universidad
1. Cerrá sesión y volvé a entrar como **Director Nacional de Investigación**:
   - **Correo**: `director_investigacion@unitepc.edu.bo`
   - **Contraseña**: `unitepc123`
2. Entrá a **Importar (`/importar`)** y subí estos 3 archivos de `f:\AGENDA\material_demostracion\`:
   - `01_Planilla_Direccion_Investigacion_Vicerrectorado_2-2026.xlsx` *(Actividades Globales del Vicerrectorado para todas las carreras)*
   - `03_Planilla_Carrera_Medicina_2-2026.xlsx` *(Actividades de Medicina)*
   - `04_Planilla_Carrera_Derecho_2-2026.xlsx` *(Actividades de Derecho)*

---

### PASO 4: Ver cómo se Consolida la Agenda en el Calendario (`/calendario`)
1. En el menú lateral, entrá a **Calendario (`/calendario`)**.
2. En el selector de arriba, elegí **Gestión: `Semestre 2 – 2026`** y navegá con los botones `Siguiente` / `Anterior` a los meses de **Agosto, Septiembre, Octubre y Noviembre 2026**.
3. **Vista Consolidada Global**:
   - Con el filtro en **Todas las carreras**, ves en un solo calendario maestro los eventos de Vicerrectorado + Ingeniería de Sistemas + Medicina + Derecho.
   - Los eventos **verdes/azules** son Académicos y los **violetas/ámbar** son Científicos.
4. **Vista Consolidada por Carrera**:
   - Cambiá el filtro de Carrera a **Ingeniería de Sistemas**: vas a ver cómo el calendario fusiona automáticamente **las actividades propias de Sistemas + las actividades Globales del Vicerrectorado**, ocultando las de Medicina y Derecho.
5. **Interacción desde el Calendario**:
   - Hacé clic sobre cualquier evento científico del calendario: se abre el modal de detalle donde podés ver su alcance, responsable, observaciones y cambiar su estado.

---

### PASO 5: Completar una Actividad, Adjuntar Evidencia PDF e Imprimir Ficha (`/actividades`)
1. Entrá a **Actividades (`/actividades`)** en el menú lateral.
2. Arriba elegí **Gestión: `Semestre 2 – 2026`** (o buscá `"Hackathon"` o `"Feria Nacional"` en el buscador).
3. En la columna **Estado**, hacé clic sobre el botón **`Programada ✎`** de la actividad:
   - Cambiá el estado a **`Completada (Requiere verificación)`**.
   - En el **Cuadro de Observaciones**, escribí: *"Actividad ejecutada al 100% con 18 equipos participantes según informe adjunto."*
   - En **Adjuntar Evidencia**, seleccioná cualquiera de los 3 PDFs oficiales que están en `f:\AGENDA\material_demostracion\evidencias_ejemplo\`:
     - `Acta_Conformidad_Feria_Cientifica_UNITEPC_2026.pdf`
     - `Informe_Ejecucion_Hackathon_Sistemas_2026.pdf`
     - `Resolucion_Vicerrectorado_Agenda_Cientifica_2-2026.pdf`
   - Hacé clic en **Guardar Cambios**.
4. **Ver Ficha Técnica Oficial e Historial de Auditoría**:
   - Pasá el mouse sobre esa fila y a la derecha hacé clic en el primer ícono azul 📄 (**Ver informe individual**).
   - Se abre la **Ficha Técnica Oficial UNITEPC** lista para **Imprimir en 1 Hoja A4**, mostrando tus observaciones, el botón de descarga del PDF de evidencia y el registro exacto en el **Historial de Trazabilidad y Auditoría** (quién hizo el cambio y a qué hora).

---

### PASO 6: Generar Reportes de Conflictos y % de Cumplimiento (`/reportes`)
1. Entrá a **Reportes (`/reportes`)** en el menú lateral y seleccioná **`Semestre 2 – 2026`**.
2. Tenés 4 tarjetas de reportes institucionales:
   - **Agenda Completa** y **Agenda Científica**: Descargan el documento oficial en **PDF** o **Excel**.
   - **Choques de Horario**: Hacé clic en **Ver Conflictos en Pantalla** para ver la tabla comparativa de los exámenes académicos que chocan con actividades científicas (como el del Hackathon en Sistemas y el ECOE en Medicina).
   - **Seguimiento y Cumplimiento %**: Hacé clic en **Ver % en Pantalla** para ver el cuadro estadístico carrera por carrera (Total programadas, En progreso, Completadas, Canceladas y barra de `% de Cumplimiento`), o exportalo en PDF/Excel para presentar a Vicerrectorado.
