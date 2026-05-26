# 🎮 Sala de Juegos — TP #1

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://tp-sala-de-juegos-eight.vercel.app/)
[![Angular](https://img.shields.io/badge/Angular-18-DD0031?style=flat-square&logo=angular)](https://angular.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

**Materia:** Programación IV — UTN Avellaneda<br>
**Alumno:** Michel Antonio Massaad Saba<br>
**Deploy principal:** https://tp-sala-de-juegos-eight.vercel.app/

---

## 🛠️ Tecnologías utilizadas

| Capa           | Tecnología                         |
| -------------- | ---------------------------------- |
| Framework      | Angular 18 (Standalone Components) |
| Backend / Auth | Supabase                           |
| Estilos        | Bootstrap 5 + Bootstrap Icons      |
| Formularios    | Reactive Forms & Signals           |
| Deploy         | Vercel                             |

---

## 🚦 Estado del proyecto 

| Sprint    | Contenido                             | Estado           | Deploy                                                                            |
| --------- | ------------------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| Sprint #1 | Estructura, Deploy y Presentación     | ✅ Completado    | [ver](https://tp-sala-de-juegos-git-sprint-1-michelmassaads-projects.vercel.app/) |
| Sprint #2 | Autenticación y Home Dinámico         | ✅ Completado    | [ver](https://tp-sala-de-juegos-git-sprint-2-michelmassaads-projects.vercel.app/) |
| Sprint #3 | Ahorcado, Mayor o Menor, Chat         | ✅ Completado    | [ver](https://tp-sala-de-juegos-git-sprint-3-michelmassaads-projects.vercel.app/) |
| Sprint #4 | Preguntados, Juego propio, Resultados | 🔜 Pendiente     | —                                                                                 |

---

## 📦 Sprint #1 — Estructura, Deploy y Presentación

> Deploy: https://tp-sala-de-juegos-git-sprint-1-michelmassaads-projects.vercel.app/<br>
> Tag: `v1.0.0`

Esqueleto de la aplicación funcional, con navegación libre entre secciones y deploy activo en Vercel.

**Componentes creados:** `Login` · `Registro` · `Home` · `QuienSoy`

- Deploy inicial conectado y funcionando en Vercel.
- Ruteo completo configurado en `app.routes.ts`, sin restricciones de accesibilidad.
- `QuienSoy` consume la [API de GitHub](https://api.github.com/users/michelmassaad) vía `HttpClient` para mostrar foto de perfil y datos biográficos dinámicamente.
- Presentación del juego propio incluida en `QuienSoy`: temática, mecánicas y reglas de juego.
- Favicon personalizado implementado.

---

## 🚀 Sprint #2 — Autenticación, Usuarios y Home Dinámico

> Deploy: https://tp-sala-de-juegos-git-sprint-2-michelmassaads-projects.vercel.app/<br>
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

---

## 🎲 Sprint #3 — Ahorcado, Mayor o Menor y Chat Realtime

> Deploy: https://tp-sala-de-juegos-git-sprint-3-michelmassaads-projects.vercel.app/<br>
> Tag: `v3.0.0`

Implementación de juegos interactivos con persistencia en base de datos y sistema de chat global en tiempo real utilizando Supabase Realtime.

### 🔤 Ahorcado (`AhorcadoComponent`)

**Entrada de datos**

- Interacción exclusiva mediante botones en pantalla (abecedario).
- Entrada por teclado físico deshabilitada.

**Persistencia**

- Al finalizar, guarda en la base de datos:
  - Usuario
  - Tiempo de finalización
  - Letras seleccionadas
  - Errores cometidos

---

### 🃏 Mayor o Menor (`MayorMenor`)

**Mecánica**

- Sistema de predicción (`mayor / menor`) utilizando un mazo de cartas francesas barajadas aleatoriamente.

**Persistencia**

- Registro instantáneo de:
  - Usuario
  - Cantidad de cartas acertadas
  - Racha máxima
  - Tiempo jugado

---

### 💬 Sala de Chat Global (`SalaChatComponent / ChatService`)

**Tiempo Real**

- Suscripción activa a cambios de Supabase mediante `postgres_changes`.
- Sincronización usando `NgZone` para actualizar mensajes automáticamente en todos los clientes.

**UX / UI**

- Visualización de remitente y hora exacta de cada mensaje.
- Los mensajes propios se alinean a la derecha y poseen estilos diferenciados.

---
