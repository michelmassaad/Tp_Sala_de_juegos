<div align="center">

# 🎮 Sala de Juegos

**Plataforma multi-juego full-stack con autenticación, chat global en tiempo real y rankings persistidos por juego.**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com)

[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://tp-sala-de-juegos-eight.vercel.app/)

</div>

---

## ✨ Qué hace

Sala de Juegos es una plataforma de minijuegos con cuenta de usuario, chat global en tiempo real y un sistema de rankings persistido — cuatro juegos distintos comparten la misma base de autenticación y de resultados.

- 🔤 **Ahorcado** — interacción exclusiva por botones en pantalla (sin teclado físico), con persistencia de letras y errores
- 🃏 **Mayor o Menor** — predicción sobre un mazo de cartas francesas barajado aleatoriamente, con racha máxima registrada
- ❓ **Preguntados** — trivia consumiendo la API pública de **OpenTDB** en tiempo real
- 🚴 **Bici Rush** — juego propio desarrollado íntegramente desde cero: saltar obstáculos, recolectar monedas y completar un recorrido de 2000 metros, con lógica de revivir
- 💬 **Chat global en tiempo real** vía **Supabase Realtime** (`postgres_changes`), sincronizado entre todos los clientes conectados
- 📊 **Página de Resultados** con 4 tablas de ranking independientes (una por juego), alimentadas con Signals computadas
- 🔐 Autenticación completa contra Supabase, con registro validado y accesos rápidos de prueba para testing

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Angular 21 (Standalone Components, Signals) |
| Backend / Auth / Realtime | Supabase (Postgres + Auth + Realtime) |
| Estilos | Bootstrap 5 + Bootstrap Icons |
| Formularios | Reactive Forms |
| Deploy | Vercel |
| Automatización | GitHub Actions |

---

## 🛡️ Infraestructura y confiabilidad

El proyecto usa el plan gratuito de Supabase, que **pausa el proyecto automáticamente a los 7 días sin actividad**. La primera vez que esto pasó, tuvo un efecto en cascada: el chequeo de sesión al iniciar la app (`checkSession()`) intentaba refrescar un token contra un backend inexistente y quedaba esperando indefinidamente — como los guards de rutas dependen de esa misma promesa, **toda la aplicación quedaba congelada**, no solo el login.

Se resolvió en dos capas:

1. **Prevención** — un [GitHub Action programado](.github/workflows/keep-supabase-awake.yml) le hace ping a la base de datos cada 3 días, evitando que el proyecto vuelva a pausarse por inactividad.
2. **Resiliencia** — `checkSession()` ahora tiene un timeout de 5 segundos: si Supabase no responde a tiempo, la app sigue funcionando igual (tratando al usuario como no autenticado) en vez de quedar colgada esperando para siempre.

---

## 🚀 Correrlo en local

```bash
npm install

# Creá src/environments/environments.ts con:
export const environment = {
  production: false,
  UrlSupabase: '<tu url de proyecto Supabase>',
  KeySupabase: '<tu anon key de Supabase>',
};

npm start
```

---

## 📁 Estructura del proyecto

```
sala-de-juegos/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── registro/
│   │   │   ├── home/
│   │   │   ├── quien-soy/          ← consume la API de GitHub
│   │   │   ├── ahorcado/
│   │   │   ├── mayor-menor/
│   │   │   ├── preguntados/        ← consume la API de OpenTDB
│   │   │   ├── bici-rush/          ← juego propio
│   │   │   ├── sala-chat/          ← chat global (Supabase Realtime)
│   │   │   └── resultados/         ← rankings por juego
│   │   ├── services/
│   │   │   ├── auth.ts
│   │   │   ├── supabase.ts
│   │   │   ├── resultado.ts
│   │   │   └── sala-chat.ts
│   │   └── guards/
│   │       ├── auth.ts
│   │       └── guest.ts
│   └── environments/
└── .github/workflows/
    └── keep-supabase-awake.yml     ← ping automático anti-pausa
```

---

<details>
<summary><strong>📖 Historial de desarrollo, sprint por sprint (click para expandir)</strong></summary>

| Sprint | Contenido | Estado | Deploy |
|---|---|---|---|
| Sprint #1 | Estructura, Deploy y Presentación | ✅ Completado | [ver](https://tp-sala-de-juegos-git-sprint-1-michelmassaads-projects.vercel.app/) |
| Sprint #2 | Autenticación y Home Dinámico | ✅ Completado | [ver](https://tp-sala-de-juegos-git-sprint-2-michelmassaads-projects.vercel.app/) |
| Sprint #3 | Ahorcado, Mayor o Menor, Chat | ✅ Completado | [ver](https://tp-sala-de-juegos-git-sprint-3-michelmassaads-projects.vercel.app/) |
| Sprint #4 | Preguntados, Juego propio, Resultados | ✅ Completado | [ver](https://tp-sala-de-juegos-git-sprint-4-michelmassaads-projects.vercel.app/) |

### 📦 Sprint #1 — Estructura, Deploy y Presentación
> Tag: `v1.0.0`

Esqueleto de la aplicación funcional, con navegación libre entre secciones y deploy activo en Vercel.

**Componentes creados:** `Login` · `Registro` · `Home` · `QuienSoy`

- Deploy inicial conectado y funcionando en Vercel.
- Ruteo completo configurado en `app.routes.ts`, sin restricciones de accesibilidad.
- `QuienSoy` consume la [API de GitHub](https://api.github.com/users/michelmassaad) vía `HttpClient` para mostrar foto de perfil y datos biográficos dinámicamente.
- Presentación del juego propio incluida en `QuienSoy`: temática, mecánicas y reglas de juego.
- Favicon personalizado implementado.

### 🚀 Sprint #2 — Autenticación, Usuarios y Home Dinámico
> Tag: `v2.0.0`

Sistema de autenticación completo contra Supabase con interfaz condicional según el estado de sesión del usuario.

**Home dinámico**
- Muestra `Login / Registro` si el usuario no está autenticado.
- Muestra nombre de usuario y botón `Cerrar sesión` si la sesión está activa.

**Login**
- Validación de credenciales contra Supabase con email y contraseña.
- Redirección automática al Home tras un inicio de sesión exitoso.
- Mensajes de error ante credenciales inválidas.
- 3 botones de inicio de sesión rápido con usuarios precargados para facilitar la corrección.

**Registro**
- Formulario reactivo con los campos: email, nombre, apellido, edad y contraseña.
- Validaciones: formato de email, longitud mínima de contraseña, solo letras en nombre y apellido.
- Datos persistidos en base de datos (la contraseña no se guarda).
- Autenticación e inicio de sesión automáticos al registrarse correctamente.
- Control de usuarios duplicados con mensaje informativo.

**UX / UI**
- Migración completa a `ReactiveFormsModule`.
- Toggle de visibilidad de contraseña ("ojito").
- Estilos de error en tiempo real sobre cada input.

### 🎲 Sprint #3 — Ahorcado, Mayor o Menor y Chat Realtime
> Tag: `v3.0.0`

Implementación de juegos interactivos con persistencia en base de datos y sistema de chat global en tiempo real utilizando Supabase Realtime.

**🔤 Ahorcado (`AhorcadoComponent`)**
- Interacción exclusiva mediante botones en pantalla (abecedario). Entrada por teclado físico deshabilitada.
- Al finalizar, guarda usuario, tiempo de finalización, letras seleccionadas y errores cometidos.

**🃏 Mayor o Menor (`MayorMenor`)**
- Sistema de predicción (`mayor / menor`) utilizando un mazo de cartas francesas barajadas aleatoriamente.
- Registro instantáneo de usuario, cantidad de cartas acertadas, racha máxima y tiempo jugado.

**💬 Sala de Chat Global (`SalaChatComponent` / `ChatService`)**
- Suscripción activa a cambios de Supabase mediante `postgres_changes`.
- Sincronización usando `NgZone` para actualizar mensajes automáticamente en todos los clientes.
- Visualización de remitente y hora exacta de cada mensaje; los mensajes propios se alinean a la derecha con estilos diferenciados.

### 🏁 Sprint #4 — Preguntados, Juego Propio y Rankings
> Tag: `v4.0.0`

Integración de API externa de trivia, desarrollo de juego propio y sistema completo de rankings persistidos.

**❓ Preguntados (`Preguntados`)**
- Conexión directa con la API de trivia OpenTDB mediante `HttpClient`.
- Renderizado dinámico de respuestas en botones, con opciones mezcladas aleatoriamente.
- Persistencia de usuario y cantidad de respuestas acertadas.

**🚴 Juego Propio — Bici Rush (`BiciRush`)**
- Manual de juego y descripción técnica incorporados en `Quién Soy`.
- Mecánicas: saltar obstáculos con `Espacio` o `Click`, recolectar monedas, completar un recorrido de 2000 metros.
- Al ganar o perder, registra usuario, distancia máxima alcanzada, monedas obtenidas y tiempo total de partida.
- Incluye lógica transaccional de revivir.

**📊 Listado de Resultados (`Resultados`)**
- Página dedicada alimentada mediante Signals computadas independientes.
- 4 tablas independientes (una por juego) mostrando rankings de jugadores, ordenadas de mayor a menor puntaje.

</details>

---

<div align="center">

**Michel Massaad** — [Portfolio](https://michelmassaad.github.io/Portafolio_Michel_Massaad/) · [LinkedIn](https://linkedin.com/in/michel-massaad) · [GitHub](https://github.com/michelmassaad)

</div>