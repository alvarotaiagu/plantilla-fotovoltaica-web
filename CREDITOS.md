# Créditos y procedencia de los recursos

**Sitio de demostración. GNOMON es un negocio ficticio.**

## Fotografías: ninguna

No hay ni una fotografía en esta plantilla. Un instalador inventado no tiene
tejados propios que enseñar, y una foto de archivo de «paneles al atardecer» es
justo el recurso que hace que todas las webs del sector se parezcan. Todo lo
visual está dibujado a mano en SVG para este repositorio.

Eso incluye a las tres personas del equipo: en vez de retratos de archivo, cada
una se presenta con **el aparato que lleva en la mano**, ilustrado.

## Obra gráfica

| Archivo | Qué es |
|---|---|
| `assets/logo.svg` | Marca: un módulo fotovoltaico con su retícula, partido por una sombra en diagonal. |
| `assets/favicon.svg` | La misma marca, simplificada, sobre el grafito del fondo. |
| `assets/util-solarimetro.svg` | Medidor de irradiancia con su célula, su cable y el inclinómetro. |
| `assets/util-pinza.svg` | Pinza amperimétrica abrazando un cable, con su rueda de rangos y sus puntas. |
| `assets/util-estructura.svg` | Sección del perfil de aluminio, un tramo en perspectiva, tornillo y grapa. |
| `assets/og.png` | Imagen para compartir (1200×630), capturada de una composición HTML propia (`og-fuente.html`). |
| Tejado de «La sombra» | SVG en línea dentro de `index.html`: cubierta, 20 módulos, chimenea, castaño del vecino y las dos sombras que se mueven. |
| Reloj solar del hero | SVG en línea: el arco del día y el sol que lo recorre. |
| Iconos de papeles y equipos | SVG en línea, un `path` cada uno. |

## Cómo se mueven las sombras

Las dos sombras del tejado (chimenea y castaño) se dibujan como una figura base a
la que se le escribe el **atributo** `transform` desde JavaScript: el ángulo sale
de la hora y el largo de la altura del sol. El mismo cálculo decide qué módulos se
marcan como `esta-en-sombra`, y de ahí sale el recuento que se lee debajo. Es
**geometría de demostración**, no un modelo de irradiancia: sirve para explicar el
problema, no para dimensionar nada.

## Tipografías

| Familia | Uso | Licencia |
|---|---|---|
| [Archivo](https://fonts.google.com/specimen/Archivo) | Titulares, cifras y texto corrido | SIL Open Font License 1.1 |
| [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Rótulos, horas, tablas y botones | SIL Open Font License 1.1 |

## Librerías

| Librería | Versión | Origen | Licencia |
|---|---|---|---|
| GSAP + ScrollTrigger | 3.12.5 | jsDelivr | Licencia estándar de GreenSock |
| Lenis | 1.1.13 | jsDelivr | MIT |

## Mapa

`iframe` de Google Maps sin clave de API que **solo se inserta al pulsar el
botón**, nunca antes —sería contradecir el propio aviso de cookies—. Apunta a la
localidad de **Lalín**, nunca a un portal concreto: la dirección de la nave es
inventada.
