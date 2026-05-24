# Leyenda del Proyecto

Este proyecto sigue una arquitectura sencilla usando tecnologías base de la web moderna.

- `index.html`: Punto de entrada de la aplicación. Contiene toda la estructura semántica de la página.
- `assets/css/style.css`: Estilos nativos (Vanilla CSS). Usa variables para tema oscuro y medidas `rem` relativas a `10px` base para consistencia.
- `assets/js/app.js`: Lógica del lado del cliente en Vanilla JS. Evita APIs síncronas bloqueantes y usa manipulación segura del DOM con `appendChild` / `createElement`.
- Bootstrap 5.3.3: Utilizado a través de CDN para sistema de grilla rápido y utilidades de espaciado/tipografía sin sobrecargar CSS personalizado.
