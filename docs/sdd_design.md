# SDD: Resoluciones de Health Check, Frontend Config y UI Fixes

## 1. Contexto y Problemas (Propose)
1. **Health Check**: Falta el endpoint `/api/v1/public/health` para validar que el servicio backend y la base de datos están operativos, requerido por la orquestación y tests.
2. **Frontend Config**: La variable `NEXT_PUBLIC_API_URL` tiene fallbacks hardcodeados en múltiples archivos (`lib/api.ts`, `ActivityModal.tsx`, `importar/page.tsx`), lo que dificulta el mantenimiento.
3. **Frontend UI Tests**: Falla el test UAT de login. El `<title>` es incorrecto (debe ser "Agenda Científica UNITEPC") y el botón/texto de login dice "Ingresar" / "¡Bienvenido!" en lugar de "Iniciar Sesión".
4. **Calidad Visual**: Ajustes mínimos en componentes de UI para mejorar accesibilidad y alineación con Tailwind/Shadcn.

## 2. Especificación (Spec)

- **Backend (FastAPI)**:
  - Crear endpoint `GET /api/v1/public/health`.
  - Debe conectarse a la base de datos (hacer un query simple como `SELECT 1`) y devolver status `200 OK` si es exitoso o error `503` si falla.

- **Frontend Config (Next.js)**:
  - Centralizar las variables de entorno en un archivo `lib/config.ts`.
  - Reemplazar todas las apariciones de `process.env.NEXT_PUBLIC_API_URL` por la nueva configuración.

- **Frontend UI**:
  - Modificar `app/layout.tsx` para que el `title` base sea "Agenda Científica UNITEPC".
  - Modificar `app/login/page.tsx` para cambiar el texto del botón principal de "Ingresar" a "Iniciar Sesión" y el título del formulario (h2) de "¡Bienvenido!" a "Iniciar Sesión".

## 3. Diseño Técnico (Design)

### 3.1. Endpoint Health (`backend/app/api/v1/public.py`)
Importar `text` de `sqlalchemy` y agregar:
```python
from sqlalchemy import text
from fastapi import HTTPException

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"status": "ok", "message": "Service is healthy"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database connection failed")
```

### 3.2. Configuración Centralizada (`frontend/lib/config.ts`)
Crear el archivo `frontend/lib/config.ts`:
```typescript
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const config = {
  apiUrl: NEXT_PUBLIC_API_URL,
  apiHost: NEXT_PUBLIC_API_URL.replace('/api/v1', ''),
};
```

### 3.3. Refactorización de URIs en Frontend
- En `frontend/lib/api.ts`: 
  ```typescript
  import { config } from './config';
  const API_URL = config.apiUrl;
  ```
- En `frontend/app/actividades/components/ActivityModal.tsx`:
  ```typescript
  import { config } from '@/lib/config';
  // ...
  const apiHost = config.apiHost;
  ```
- En `frontend/app/importar/page.tsx`:
  ```typescript
  import { config } from '@/lib/config';
  // ...
  href={`${config.apiUrl}/importacion/template/download`}
  ```

### 3.4. Fix de UAT (Next.js layout y login)
- **`frontend/app/layout.tsx`**:
  ```typescript
  export const metadata: Metadata = {
    title: "Agenda Científica UNITEPC", // Fix UAT title
    description: "Sistema de gestión de actividades científicas",
  };
  ```
- **`frontend/app/login/page.tsx`**:
  Cambiar "Ingresar" por "Iniciar Sesión" y el título del formulario (h2) de "¡Bienvenido!" a "Iniciar Sesión".
