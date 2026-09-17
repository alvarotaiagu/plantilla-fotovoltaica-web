# GNOMON · plantilla para instaladores fotovoltaicos

> **Sitio de demostración.** GNOMON es una empresa **ficticia**. El nombre, el
> CIF, la dirección de la nave, el teléfono, el correo, los horarios, los precios,
> los tres casos de ejemplo, las opiniones y las tres personas del equipo están
> **inventados** para enseñar la plantilla. No corresponden a ninguna empresa ni a
> ninguna instalación real, y **ninguna cifra de esta página es una promesa de
> ahorro**.

Plantilla estática —HTML, CSS y un `main.js`— sin framework, sin build, sin
backend y sin npm. Se sirve tal cual desde GitHub Pages.

---

## El concepto: «Sombra»

Todas las webs del sector venden lo mismo y con la misma imagen: paneles azules,
cielo despejado, un porcentaje de ahorro en grande. Esta plantilla se construye
sobre **lo contrario**, que además es lo que de verdad decide una instalación:

> Lo que decide una instalación no es el sol. Es la sombra.

El sol, en Galicia o en Almería, se puede mirar en una tabla. Lo que no se puede
mirar en ninguna tabla es **tu** chimenea, **tu** castaño y la casa del vecino a
las cinco de la tarde de noviembre. Por eso la sección protagonista no es un
catálogo de paneles: es **un día entero pasando sobre un tejado**.

Ese giro resuelve de paso el problema honesto de una empresa inventada: no hay
clientes, luego no hay ahorros medidos, luego **no se publica ni un porcentaje**.
La plantilla convierte esa limitación en su argumento.

### Por qué así, y no de otra manera

- **Un instalador no vende paneles, vende un diagnóstico.** La página lo pone
  primero: antes del catálogo, antes del precio, está el estudio de sombras.
- **Es el único recurso de movimiento que no es decorativo.** El scroll mueve el
  sol de las 08:00 a las 20:00 y las sombras barren el tejado. El recuento de
  «N de 20 paneles en sombra» se recalcula de verdad, con geometría, no con una
  animación grabada.
- **El sector abusa del miedo a la factura y de la promesa de ahorro.** Aquí la
  pregunta «¿cuánto voy a ahorrar?» se contesta con «no lo sabemos hasta ver tu
  consumo por horas y la sombra de tu tejado», y con un aviso de desconfiar de
  quien dé un porcentaje por teléfono.

---

## Mapa de secciones

| # | Sección | `id` | Qué hace |
|---|---|---|---|
| — | Hero | `inicio` | Titular del concepto y **reloj solar** en SVG: un arco de día con el sol recorriéndolo. |
| — | Franja | — | Marquesina de servicios enganchada a la velocidad del scroll. |
| 01 | **La sombra** | `sombra` | **La protagonista.** Escena anclada: el scroll es el día. Sol de 08:00 a 20:00, dos sombras (chimenea y castaño del vecino) que giran y se alargan, 20 módulos que cambian de estado y un contador de paneles tapados. |
| 02 | Qué se monta | `equipos` | Los cuatro componentes reales de una instalación, sin adjetivos. |
| 03 | Casos | `casos` | Tres casas de ejemplo con su tejado, su potencia y su reparto, **y un aviso de que son supuestos inventados**, que es por lo que no llevan porcentajes. |
| 04 | Papeles | `papeles` | Los trámites que van detrás: memoria, boletín, legalización, compensación de excedentes. |
| 05 | Quién sube al tejado | `gente` | Tres personas presentadas por **el aparato que llevan**, ilustrado, en vez de por un retrato de archivo. Cifras con contador. |
| 06 | Precios | `precios` | Tabla de precios **de muestra**, marcados como tales. |
| 07 | Preguntas | `preguntas` | Las que se hacen en el tejado, contestadas sin vender. |
| 08 | Visita | `visita` | Formulario de demostración (no envía nada) y mapa que **solo se carga al pulsar**. |

---

## Los recursos de movimiento

Todos salen del concepto; ninguno está puesto por rellenar.

1. **El día sobre el tejado** (`#sombra-escena`): escena anclada con `scrub`. El
   progreso del scroll es la hora. El ángulo y el largo de cada sombra se escriben
   en el **atributo** `transform` del SVG, nunca por CSS —una regla CSS de
   `transform` pisaría lo que escribe GSAP y dejaría la sombra clavada—. El mismo
   cálculo marca cada módulo como `esta-al-sol` o `esta-en-sombra`.
2. **Reloj solar del hero**: el sol recorre su arco en bucle, escribiendo `cx`/`cy`.
3. **Revelado por palabras** en los titulares, con `aria-label` en el `h2` y las
   piezas en `aria-hidden`.
4. **Franja ligada al scroll**: la marquesina acelera con la velocidad de la rueda
   (`timeScale`) y vuelve sola a su ritmo.
5. **Apariciones por `IntersectionObserver`** (no `ScrollTrigger {once:true}`, que
   no dispara para lo que ya está en pantalla al cargar).
6. **Contadores** de las cifras del equipo.
7. **Botones magnéticos** y **cursor contextual**, solo donde hay `hover` real.
8. **Lenis** como único motor de scroll, con `lerp: 0.17` por llevar una escena
   con `scrub`.

### Coste de todo eso

Medido con un `PerformanceObserver` de `longtask` inyectado antes de cargar:

| Momento | Tareas largas | Peor |
|---|---|---|
| Arranque (primeros 3 s) | 1 | 92 ms |
| Recorriendo el día (≈25 s con la escena anclada) | **0** | — |

La única tarea larga es el arranque de GSAP y las tipografías, no el estudio de
sombras: el recálculo por fotograma son veinte comprobaciones geométricas y dos
`setAttribute`, sin filtros ni sombras de canvas.

### Sin JavaScript, con GSAP bloqueado o con movimiento reducido

La página **se lee entera**. Los estados vacíos (texto oculto para revelarlo, etc.)
solo se aplican bajo `html.has-motion`, que se añade cuando GSAP existe **y** el
usuario no ha pedido movimiento reducido.

Con movimiento reducido se apaga **el movimiento, no el contenido**: el tejado se
pinta a las 14:00 —su estado legible, con los 20 módulos al sol—, la hora y el
recuento se escriben igual, y los contadores muestran su cifra final.

---

## Accesibilidad

- Contraste AA comprobado sobre el fondo grafito, incluido el verde de marca.
- Foco visible en todo lo enfocable, y `.salto` para ir al contenido.
- Menú móvil con `aria-expanded`, `aria-controls`, cierre con `Escape` y foco
  devuelto al botón.
- El lienzo del tejado, que en móvil tiene scroll horizontal, recibe `tabindex="0"`
  y `role="group"` **solo cuando de verdad desborda**, para que se pueda recorrer
  con el teclado sin añadir paradas inútiles.
- El texto secundario se apaga **con color, nunca con `opacity`**: la opacidad
  cambia el contraste real sin cambiar el color declarado y no hay forma de
  auditarla leyendo el CSS.

---

## Cómo adaptarla a un instalador real

1. **Los datos ficticios, todos fuera.** Están concentrados en `index.html`
   (cabecera, secciones 03, 05, 06 y 08, pie y `ld+json`), en `aviso-legal.html` y
   en `manifest.json`. Busca `GNOMON`, `986 00 00 00`, `gnomon.example`,
   `Corredoira` y `B00000000`.
2. **Quita los sellos de demostración**: el comentario del principio de cada HTML,
   el `<meta name="robots" content="noindex, nofollow">`, el `<p class="sello">`
   del pie y el aviso de la sección «Casos».
3. **El color de acento** vive en un único token: `--verde` en `css/style.css`.
   Cámbialo y cambia la plantilla entera. Si el nuevo acento es más claro,
   recomprueba el contraste del texto en verde sobre el grafito.
4. **El tejado de la sección 01** es SVG en línea dentro de `index.html`: la rejilla
   de 20 módulos (`#paneles`), la chimenea y el castaño. Para un tejado distinto,
   mueve las constantes `CHIMENEA` y `ARBOL` de `js/main.js` —ahí están sus
   coordenadas y su anchura— y redibuja los módulos.
5. **Los casos (03) son supuestos.** Si los sustituyes por instalaciones reales,
   quita el aviso, pon consumos medidos y di de dónde salen los datos. Si no los
   tienes medidos, **deja los supuestos y deja el aviso**.
6. **El mapa** apunta a la localidad, no a un portal. Para una empresa real,
   cambia la consulta en `js/main.js`, pero mantén la carga **solo al pulsar**: si
   no, el aviso de cookies estaría mintiendo.
7. Sustituye `assets/og.png` regenerándolo de `og-fuente.html`.

---

## Estructura

```
index.html          portada
aviso-legal.html    aviso legal y privacidad
404.html            página de error
css/style.css       toda la hoja de estilos
js/main.js          contenido, el estudio de sombras y el movimiento
assets/             logo, favicon, tres ilustraciones de aparatos y la imagen para compartir
og-fuente.html      composición de la que se captura assets/og.png
manifest.json       manifiesto de aplicación web
CREDITOS.md         procedencia de cada recurso
.nojekyll           para que GitHub Pages sirva los archivos tal cual
```

## Licencia y uso

Plantilla de muestra. Reutilizable, pero **no se publica tal cual**: antes hay que
sustituir todos los datos ficticios por los reales y retirar los avisos de
demostración. Tipografías y librerías, en `CREDITOS.md`.
