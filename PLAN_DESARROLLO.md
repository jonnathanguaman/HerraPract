# Plan De Desarrollo Por Fases

Este documento distribuye el desarrollo del proyecto entre 3 desarrolladores, usando ramas independientes, verificacion por fase, integracion controlada y pruebas antes de afectar la rama principal de produccion.

## Estado Del Proyecto

El proyecto contiene dos modulos principales:

- `frontend-app`: aplicacion React + Vite + TypeScript. Scripts disponibles: `npm run lint` y `npm run build`.
- `herramientas-node-api`: API Node.js + Express + Sequelize + PostgreSQL. Incluye modulos para auth, categorias, clientes, productos y ventas.

Nota: el backend actualmente tiene un script `npm test` placeholder. Una de las primeras tareas debe ser reemplazarlo por pruebas reales.

## Estrategia De Ramas

Ramas base:

- `main`: rama de produccion. Debe estar protegida. Nadie trabaja directamente sobre esta rama.
- `develop`: rama de integracion interna. Recibe Pull Requests aprobados desde ramas feature.
- `release/fase-N`: rama temporal para validar cada entrega antes de pasar a `main`.

Ramas independientes por desarrollador:

- Dev 1 Backend: `feature/dev1-backend-fase-N`
- Dev 2 Frontend: `feature/dev2-frontend-fase-N`
- Dev 3 QA/Integracion/DevOps: `feature/dev3-qa-integracion-fase-N`

Reglas:

- Todo cambio entra por Pull Request.
- Cada PR debe salir desde `develop`, no desde `main`.
- `main` solo recibe merges desde `release/fase-N`.
- Antes de mergear a `develop`, cada rama debe pasar verificacion local y revision.
- Antes de mergear a `main`, se prueba todo integrado desde `release/fase-N`.
- No se deben commitear archivos `.env`, credenciales, tokens o secretos.

## Distribucion Por Desarrollador

| Desarrollador | Responsabilidad Principal                                           | Rama                                 |
| ------------- | ------------------------------------------------------------------- | ------------------------------------ |
| Dev 1         | Backend/API, modelos, validaciones, auth, ventas, stock             | `feature/dev1-backend-fase-N`        |
| Dev 2         | Frontend React, pantallas, formularios, navegacion, consumo API     | `feature/dev2-frontend-fase-N`       |
| Dev 3         | Testing, integracion, CI/CD, documentacion, Swagger, validacion E2E | `feature/dev3-qa-integracion-fase-N` |

## Fase 0: Preparacion Tecnica

Objetivo: dejar el flujo seguro antes de desarrollar funcionalidades.

Responsabilidades Dev 1:

- Revisar configuracion de API.
- Confirmar `.env.example`.
- Separar configuracion por entorno: development, test, production.
- Evitar `DB_SYNC_ALTER=true` en produccion.

Responsabilidades Dev 2:

- Limpiar frontend inicial de Vite.
- Definir estructura base: `components`, `pages`, `services`, `types`, `hooks`.
- Preparar cliente HTTP para consumir la API.

Responsabilidades Dev 3:

- Crear rama `develop`.
- Configurar proteccion de `main`.
- Definir pipeline minimo.
- Agregar scripts de test reales al backend.
- Documentar flujo Git.

Verificacion:

```bash
cd frontend-app
npm install
npm run lint
npm run build
```

```bash
cd herramientas-node-api
npm install
npm start
```

Integracion:

- PR de cada dev hacia `develop`.
- Revision cruzada obligatoria.
- Validacion manual de arranque frontend/backend.

Test:

- Backend debe dejar de usar el `npm test` placeholder.
- Agregar base para pruebas con Jest o Vitest + Supertest.
- Validar conexion a base de datos de test.

## Fase 1: Backend Base E Inventario

Objetivo: estabilizar API de categorias, clientes y productos.

Responsabilidades Dev 1:

- Revisar CRUD de categorias.
- Revisar CRUD de clientes.
- Revisar CRUD de productos.
- Validar errores, duplicados, datos obligatorios y stock negativo.
- Confirmar relaciones Sequelize.

Responsabilidades Dev 2:

- Crear pantallas base.
- Crear login layout.
- Crear dashboard inicial.
- Crear listado de productos.
- Crear listado de categorias.
- Crear listado de clientes.
- Crear formularios de creacion/edicion.

Responsabilidades Dev 3:

- Crear pruebas de API para `GET /api/productos`.
- Crear pruebas de API para `POST /api/productos`.
- Crear pruebas de API para `PUT /api/productos/:id`.
- Crear pruebas de API para `DELETE /api/productos/:id`.
- Cubrir casos invalidos.
- Validar Swagger/OpenAPI.

Verificacion:

```bash
cd herramientas-node-api
npm test
npm start
```

```bash
cd frontend-app
npm run lint
npm run build
```

Integracion:

- Dev 1 mergea API a `develop`.
- Dev 2 actualiza servicios frontend contra contratos reales.
- Dev 3 ejecuta pruebas API y revision Swagger.

Test:

- Pruebas unitarias/controlador en backend.
- Pruebas manuales desde Swagger.
- Build frontend obligatorio antes de merge.

## Fase 2: Autenticacion Y Seguridad

Objetivo: implementar flujo seguro de usuario.

Responsabilidades Dev 1:

- Revisar `register`, `login`, `refresh`, `me`.
- Proteger rutas necesarias con middleware JWT.
- Validar roles si aplica: admin/user.
- Evitar exposicion de password en respuestas.

Responsabilidades Dev 2:

- Implementar login.
- Guardar sesion de forma controlada.
- Crear flujo logout.
- Proteger rutas privadas en frontend.
- Mostrar usuario actual.

Responsabilidades Dev 3:

- Probar registro correcto.
- Probar login correcto.
- Probar login invalido.
- Probar token invalido.
- Probar refresh token.
- Probar acceso a ruta protegida sin token.
- Revisar variables sensibles.

Verificacion:

```bash
cd herramientas-node-api
npm test
```

```bash
cd frontend-app
npm run lint
npm run build
```

Integracion:

- PRs hacia `develop`.
- Prueba manual completa: registro, login, consultar `/api/auth/me`.
- No mergear si hay tokens hardcodeados o secretos en codigo.

Test:

- Tests automatizados de auth.
- Prueba manual con Swagger/Postman.
- Validacion de expiracion o rechazo de token invalido.

## Fase 3: Ventas Y Control De Stock

Objetivo: cerrar el flujo principal del sistema.

Responsabilidades Dev 1:

- Validar creacion de ventas.
- Validar descuento de stock.
- Validar rollback si una venta falla.
- Revisar eliminacion de venta y devolucion de stock.
- Prevenir ventas con stock insuficiente.

Responsabilidades Dev 2:

- Crear pantalla de nueva venta.
- Crear selector de cliente.
- Crear selector de productos.
- Manejar cantidades.
- Calcular subtotal y total.
- Crear listado/detalle de ventas.

Responsabilidades Dev 3:

- Crear venta valida.
- Crear venta sin cliente.
- Crear venta sin detalles.
- Crear venta con stock insuficiente.
- Confirmar reduccion de stock.
- Confirmar rollback si falla un detalle.

Verificacion:

```bash
cd herramientas-node-api
npm test
```

```bash
cd frontend-app
npm run lint
npm run build
```

Integracion:

- Dev 1 publica contrato final de venta.
- Dev 2 consume endpoints reales.
- Dev 3 ejecuta pruebas de flujo completo.

Test:

- Test API de ventas.
- Test manual E2E: crear cliente, producto, venta y revisar stock.
- Prueba de error: intentar vender mas stock del disponible.

## Fase 4: UX, Reportes Y Operacion

Objetivo: mejorar uso diario y visibilidad del inventario.

Responsabilidades Dev 1:

- Crear endpoints de resumen.
- Exponer total de productos.
- Exponer productos con bajo stock.
- Exponer ventas recientes.
- Exponer total vendido.
- Agregar filtros basicos por fecha si aplica.

Responsabilidades Dev 2:

- Crear dashboard operativo.
- Crear indicadores visuales.
- Crear alertas de bajo stock.
- Mejorar responsive.
- Manejar estados de carga/error.

Responsabilidades Dev 3:

- Probar endpoints de resumen.
- Validar vista desktop/mobile.
- Aplicar checklist de accesibilidad basica.
- Actualizar documentacion de uso.

Verificacion:

```bash
cd frontend-app
npm run lint
npm run build
```

```bash
cd herramientas-node-api
npm test
```

Integracion:

- PRs separados a `develop`.
- Validacion del dashboard con datos reales de prueba.
- Revision cruzada frontend/backend.

Test:

- Pruebas API.
- Pruebas manuales responsive.
- Validacion de errores cuando backend no responde.

## Fase 5: Release Seguro A Produccion

Objetivo: entregar sin corromper `main`.

Proceso:

1. Crear `release/fase-N` desde `develop`.
2. Congelar features nuevas.
3. Ejecutar pruebas completas.
4. Corregir bugs solo en ramas `fix/release-fase-N-*`.
5. Mergear fixes a `release/fase-N`.
6. Si todo pasa, merge de `release/fase-N` a `main`.
7. Crear tag: `v0.N.0`.
8. Merge de regreso de `main` hacia `develop`.

Checklist obligatorio antes de produccion:

- `frontend-app`: `npm run lint` pasa.
- `frontend-app`: `npm run build` pasa.
- `herramientas-node-api`: `npm test` pasa.
- Backend arranca con variables de produccion.
- No hay `.env` commiteado.
- Swagger actualizado.
- Base de datos validada.
- Flujo principal probado: login, productos, clientes, ventas, stock.

## Flujo Diario Recomendado

Cada desarrollador debe iniciar desde `develop` actualizado:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/devX-area-fase-N
```

Antes de abrir PR:

```bash
git pull origin develop
```

Luego se deben resolver conflictos si existen y ejecutar las verificaciones correspondientes.

Merge permitido solo si:

- PR aprobado.
- Tests pasan.
- Build pasa.
- No toca `main` directamente.
- No incluye `.env`, credenciales o datos sensibles.

## Orden Recomendado De Trabajo

1. Fase 0: seguridad del flujo Git, tests base y limpieza inicial.
2. Fase 1: inventario basico.
3. Fase 2: autenticacion.
4. Fase 3: ventas y stock.
5. Fase 4: dashboard y mejoras UX.
6. Fase 5: release controlado.

## Principio Principal

`main` debe permanecer estable e intocable para desarrollo diario. Todo se valida primero en ramas feature, luego en `develop`, despues en `release/fase-N`, y finalmente en `main` solo cuando la fase este completamente probada.
