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
| Sprint #2 | Autenticación y Home Dinámico         | 🚧 En desarrollo    | |
| Sprint #3 | Ahorcado, Mayor o Menor, Chat         | 🚧 En desarrollo | —                                                                                 |
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
