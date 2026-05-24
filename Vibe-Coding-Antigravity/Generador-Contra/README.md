# Generador de Contraseñas

Una aplicación web moderna y segura para generar contraseñas aleatorias basada en diferentes criterios de complejidad. Creado con HTML5, CSS3 Nativo, Vanilla JavaScript y Bootstrap 5.3.3.

## Características

- **Longitud Personalizable**: Permite seleccionar entre 6 y 32 caracteres.
- **Múltiples Opciones**: Toggle para mayúsculas, minúsculas, números y caracteres especiales.
- **Fortaleza Visual**: Un medidor de fortaleza muestra qué tan segura es la contraseña generada en tiempo real.
- **Copiar al Portapapeles**: Botón intuitivo con notificaciones visuales (sin usar molestas alertas del navegador).
- **Mostrar / Ocultar**: Permite ocultar temporalmente la contraseña por motivos de privacidad.

## Tecnologías

- **HTML5 Semántico**
- **CSS3** (Sin Tailwind, utilizando variables nativas, Flexbox y Grid)
- **Vanilla JavaScript** (Manipulación del DOM segura usando `createElement`)
- **Bootstrap 5.3.3** (Para utilidades base y grid)

## Cómo ejecutar el proyecto

1. Clona el repositorio o descarga los archivos.
2. Abre el archivo `index.html` en tu navegador web moderno preferido (Chrome, Firefox, Safari, Edge).
3. ¡Listo! Todo funciona sin dependencias en el lado del servidor, directamente en tu navegador.

## Requerimientos

El proyecto cumple con las estrictas directrices de `AGENTS.md`, enfocándose en:
- Código limpio y mantenible.
- Ausencia de APIs bloqueantes como `alert()`, `confirm()` o `prompt()`.
- Evita el uso de `innerHTML` por cuestiones de seguridad.
- Diseño en tonos fríos/azules, responsivo y minimalista.
