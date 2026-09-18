/* ==========================================================================
   GNOMON — plantilla de demostración (negocio ficticio)
   Concepto «Sombra». GSAP, ScrollTrigger y Lenis por CDN; sin ellos la página
   se lee entera y el tejado se ve al mediodía, que es su estado legible.
   ========================================================================== */

(function () {
  "use strict";

  var raiz = document.documentElement;
  var mqReducido = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reducido = mqReducido.matches;
  var gsapListo = !!(window.gsap && window.ScrollTrigger);
  var movimiento = gsapListo && !reducido;

  if (gsapListo) { window.gsap.registerPlugin(window.ScrollTrigger); }
  if (movimiento) { raiz.classList.add("has-motion"); }

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ======================================================================
     1. CONTENIDO
     ====================================================================== */

  (function menu() {
    var boton = $("#hamburguesa"), nav = $("#nav");
    if (!boton || !nav) { return; }
    function cerrar() {
      boton.setAttribute("aria-expanded", "false");
      boton.setAttribute("aria-label", "Abrir menú");
      nav.classList.remove("esta-abierto");
    }
    boton.addEventListener("click", function () {
      var abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      boton.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
      nav.classList.toggle("esta-abierto", !abierto);
    });
    $$("a", nav).forEach(function (a) { a.addEventListener("click", cerrar); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("esta-abierto")) { cerrar(); boton.focus(); }
    });
  })();

  (function cookies() {
    var banner = $("#cookie-banner"), ok = $("#cookie-ok");
    if (!banner || !ok) { return; }
    var CLAVE = "gnomon-cookies";
    var aceptado = false;
    try { aceptado = localStorage.getItem(CLAVE) === "1"; } catch (e) {}
    if (!aceptado) { banner.hidden = false; }
    ok.addEventListener("click", function () {
      banner.hidden = true;
      try { localStorage.setItem(CLAVE, "1"); } catch (e) {}
    });
  })();

  (function mapa() {
    var boton = $("#mapa-boton"), caja = $("#mapa");
    if (!boton || !caja) { return; }
    boton.addEventListener("click", function () {
      var marco = document.createElement("iframe");
      /* la localidad, nunca una calle: la dirección es inventada */
      marco.src = "https://www.google.com/maps?q=Lalin+Pontevedra&output=embed";
      marco.title = "Mapa de Lalín, Pontevedra (la dirección de la nave es ficticia)";
      marco.loading = "lazy";
      marco.referrerPolicy = "no-referrer-when-downgrade";
      marco.setAttribute("width", "600");
      marco.setAttribute("height", "320");
      caja.insertBefore(marco, boton.nextSibling);
      boton.remove();
    });
  })();

  (function formulario() {
    var form = $("#formulario"), salida = $("#formulario-respuesta");
    if (!form || !salida) { return; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = $("#f-nombre").value.trim();
      var tel = $("#f-tel").value.trim();
      if (!nombre || !tel || !$("#f-ok").checked) {
        salida.textContent = "Faltan el nombre, el teléfono o el aviso legal.";
        return;
      }
      salida.textContent = "Demostración: no se envía nada. Te llamaríamos, " + nombre + ".";
      form.reset();
    });
  })();

  /* --- Contenedores con scroll accesibles por teclado ---------------------- */
  (function scrollAccesible() {
    var cajas = $$("[data-scroll-teclado]");
    if (!cajas.length) { return; }
    function revisar() {
      cajas.forEach(function (c) {
        var desborda = (c.scrollWidth > c.clientWidth + 4) || (c.scrollHeight > c.clientHeight + 4);
        if (desborda) { c.setAttribute("tabindex", "0"); }
        else { c.removeAttribute("tabindex"); }
      });
    }
    revisar();
    window.addEventListener("resize", revisar);
    window.addEventListener("load", revisar);
  })();

  /* ======================================================================
     2. EL ESTUDIO DE SOMBRAS
     Es el recurso protagonista y también contenido: la hora, los paneles
     tapados y el recuento se calculan igual con o sin GSAP. Sin movimiento se
     pinta el mediodía, que es el estado legible.
     ====================================================================== */

  var pintarHora = (function () {
    var svg = $("#tejado");
    if (!svg) { return function () {}; }

    var paneles = $$(".panel", svg).map(function (g) {
      var r = $("rect", g);
      return {
        g: g,
        cx: parseFloat(r.getAttribute("x")) + parseFloat(r.getAttribute("width")) / 2,
        cy: parseFloat(r.getAttribute("y")) + parseFloat(r.getAttribute("height")) / 2
      };
    });
    var sChimenea = $("#sombra-chimenea");
    var sArbol = $("#sombra-arbol");
    var salidaHora = $("#sombra-hora");
    var salidaEstado = $("#sombra-estado");

    /* Los dos obstáculos del tejado de ejemplo, en coordenadas del viewBox.
       Vista cenital con el norte arriba: por la mañana el sol está al este (a la
       derecha) y las sombras caen hacia el oeste; por la tarde, al revés. De ahí
       que el castaño, que está al este, tape la esquina derecha sólo de mañana. */
    var CHIMENEA = { x: 430, y: 150, ancho: 76 };
    var ARBOL = { x: 812, y: 300, rx: 86, ry: 52 };

    function geometria(hora) {
      var t = Math.max(0, Math.min((hora - 8) / 12, 1));   /* 0 a las 8, 1 a las 20 */
      var ang = 78 - 156 * t;                               /* de levante a poniente */
      var altura = Math.sin(Math.PI * t);                   /* el sol sube y baja */
      var largo = 44 + 320 * (1 - altura);                  /* sombras largas al principio y al final */
      /* rotate(ang) lleva el eje +y local a (-sen ang, cos ang): ésa, y no otra,
         es la dirección en la que se dibuja la sombra. */
      var rad = (ang + 90) * Math.PI / 180;
      return { ang: ang, largo: largo, dx: Math.cos(rad), dy: Math.sin(rad) };
    }

    /* la chimenea proyecta una franja: ¿cae el panel dentro? */
    function bajoLaFranja(p, g) {
      var ex = p.cx - CHIMENEA.x, ey = p.cy - CHIMENEA.y;
      var a = ex * g.dx + ey * g.dy;                        /* a lo largo de la sombra */
      var b = -ex * g.dy + ey * g.dx;                       /* a lo ancho */
      return a > -10 && a < g.largo && Math.abs(b) < CHIMENEA.ancho / 2;
    }

    /* la copa del castaño proyecta una mancha: la misma elipse que se dibuja */
    function centroDelArbol(g) {
      var d = g.largo * 0.55;
      return { x: ARBOL.x + g.dx * d, y: ARBOL.y + g.dy * d };
    }
    function bajoLaCopa(p, c) {
      var ex = (p.cx - c.x) / ARBOL.rx, ey = (p.cy - c.y) / ARBOL.ry;
      return ex * ex + ey * ey <= 1;
    }

    return function pintar(hora) {
      var g = geometria(hora);
      var copa = centroDelArbol(g);

      /* se escribe el ATRIBUTO transform, nunca una regla CSS: una regla de
         transform en la hoja de estilos pisaría esto y dejaría la sombra fija. */
      if (sChimenea) {
        sChimenea.setAttribute("transform",
          "translate(" + CHIMENEA.x + "," + CHIMENEA.y + ") rotate(" + g.ang.toFixed(1) + ") scale(1," + g.largo.toFixed(1) + ")");
      }
      if (sArbol) {
        sArbol.setAttribute("transform", "translate(" + copa.x.toFixed(1) + "," + copa.y.toFixed(1) + ")");
      }

      var enSombra = 0;
      paneles.forEach(function (p) {
        var sombra = bajoLaFranja(p, g) || bajoLaCopa(p, copa);
        p.g.classList.toggle("esta-en-sombra", sombra);
        p.g.classList.toggle("esta-al-sol", !sombra);
        if (sombra) { enSombra++; }
      });

      var h = Math.floor(hora);
      var m = Math.round((hora - h) * 60 / 15) * 15;
      if (m === 60) { h += 1; m = 0; }
      if (salidaHora) {
        salidaHora.textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
      }
      if (salidaEstado) {
        salidaEstado.textContent = enSombra === 0
          ? "los 20 paneles al sol · es la mejor franja del día"
          : enSombra + " de 20 paneles en sombra";
      }
    };
  })();

  /* estado de partida: el mediodía, que es el que se entiende sin mover nada */
  pintarHora(14);

  /* ======================================================================
     3. MOVIMIENTO
     ====================================================================== */
  if (!movimiento) { return; }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.17, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var destino = document.querySelector(a.getAttribute("href"));
        if (!destino) { return; }
        e.preventDefault();
        lenis.scrollTo(destino, { offset: -80 });
      });
    });
  }

  function alEntrar(el, hacer) {
    if (!("IntersectionObserver" in window)) { hacer(); return; }
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); hacer(); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.04 });
    io.observe(el);
  }

  function titulares() {
    $$("[data-revelar]").forEach(function (el) {
      var texto = (el.textContent || "").replace(/\s+/g, " ").trim();
      el.setAttribute("aria-label", texto);
      el.textContent = "";
      var frag = document.createDocumentFragment();
      var partes = [];
      texto.split(" ").forEach(function (palabra) {
        var caja = document.createElement("span");
        caja.className = "palabra";
        caja.setAttribute("aria-hidden", "true");
        var dentro = document.createElement("i");
        dentro.textContent = palabra;
        caja.appendChild(dentro);
        frag.appendChild(caja);
        frag.appendChild(document.createTextNode(" "));
        partes.push(dentro);
      });
      el.appendChild(frag);
      /* y:0 explícito: GSAP lee el translate3d del CSS como `y` en píxeles */
      gsap.set(partes, { y: 0, yPercent: 112 });
      alEntrar(el, function () {
        gsap.to(partes, { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.045 });
      });
    });
  }

  function apariciones() {
    $$("[data-aparecer]").forEach(function (el, i) {
      alEntrar(el, function () {
        gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: (i % 4) * 0.07 });
      });
    });
  }

  function franja() {
    var pista = $("#franja-pista");
    if (!pista) { return; }
    var bucle = gsap.to(pista, { xPercent: -50, duration: 24, ease: "none", repeat: -1 });
    var vuelta;
    ScrollTrigger.create({
      onUpdate: function (self) {
        bucle.timeScale(1 + Math.min(Math.abs(self.getVelocity()) / 700, 5));
        clearTimeout(vuelta);
        vuelta = setTimeout(function () { gsap.to(bucle, { timeScale: 1, duration: 0.8 }); }, 140);
      }
    });
  }

  /* --- El día pasa sobre el tejado con el scroll ----------------------------
     El sol va de las 8 a las 20 mientras la escena está anclada. La posición
     de las sombras se escribe en el atributo transform del SVG, así que el CSS
     no toca ese transform. */
  function diaSobreElTejado() {
    var escena = $("#sombra-escena");
    if (!escena || window.innerWidth < 980) { return; }
    escena.classList.add("esta-anclada");
    var estado = { hora: 8 };
    gsap.to(estado, {
      hora: 20, ease: "none",
      scrollTrigger: {
        trigger: escena,
        start: "top top",
        end: "+=" + Math.round(window.innerHeight * 2.6),
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true
      },
      onUpdate: function () { pintarHora(estado.hora); }
    });
  }

  /* --- El sol del reloj del hero da su vuelta ------------------------------- */
  function relojDelHero() {
    var sol = $(".reloj-sol");
    if (!sol) { return; }
    var estado = { t: 0.5 };
    gsap.to(estado, {
      t: 1, duration: 9, ease: "sine.inOut", repeat: -1, yoyo: true,
      onUpdate: function () {
        var ang = Math.PI * (1 - estado.t);
        sol.setAttribute("cx", (160 + Math.cos(ang) * 118).toFixed(1));
        sol.setAttribute("cy", (160 - Math.sin(ang) * 118).toFixed(1));
      }
    });
  }

  function contadores() {
    $$(".contador").forEach(function (el) {
      var hasta = parseFloat(el.dataset.hasta || el.textContent) || 0;
      var estado = { v: 0 };
      el.textContent = "0";
      alEntrar(el, function () {
        gsap.to(estado, {
          v: hasta, duration: 1.3, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(estado.v); }
        });
      });
    });
  }

  function imanes() {
    if (!window.matchMedia("(hover:hover)").matches) { return; }
    $$("[data-iman]").forEach(function (el) {
      var aX = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
      var aY = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
      el.addEventListener("mousemove", function (e) {
        var c = el.getBoundingClientRect();
        aX((e.clientX - (c.left + c.width / 2)) * 0.3);
        aY((e.clientY - (c.top + c.height / 2)) * 0.42);
      });
      el.addEventListener("mouseleave", function () { aX(0); aY(0); });
    });
  }

  function cursor() {
    var caja = $("#cursor"), texto = $("#cursor-texto");
    if (!caja || !window.matchMedia("(hover:hover)").matches) { return; }
    var aX = gsap.quickTo(caja, "x", { duration: 0.2, ease: "power3.out" });
    var aY = gsap.quickTo(caja, "y", { duration: 0.2, ease: "power3.out" });
    window.addEventListener("mousemove", function (e) { aX(e.clientX); aY(e.clientY); }, { passive: true });

    [
      { sel: "#tejado", txt: "el tejado" },
      { sel: ".equipo", txt: "equipo" },
      { sel: ".tabla tbody tr", txt: "dato" },
      { sel: ".equipo-fichas img", txt: "ilustración" }
    ].forEach(function (g) {
      $$(g.sel).forEach(function (el) {
        el.addEventListener("mouseenter", function () { caja.classList.add("es-grande"); texto.textContent = g.txt; });
        el.addEventListener("mouseleave", function () { caja.classList.remove("es-grande"); texto.textContent = ""; });
      });
    });
    $$("a, button").forEach(function (el) {
      el.addEventListener("mouseenter", function () { caja.classList.add("es-grande"); });
      el.addEventListener("mouseleave", function () { caja.classList.remove("es-grande"); });
    });
  }

  function arrancar() {
    titulares();
    apariciones();
    franja();
    diaSobreElTejado();
    relojDelHero();
    contadores();
    imanes();
    cursor();
    ScrollTrigger.refresh();
  }


  /* --- Cortina de entrada ---------------------------------------------------
     El gesto sale del concepto; la mecánica es la misma en toda la biblioteca.
     Se retira SIEMPRE: sin GSAP y con movimiento reducido la hoja de estilos ni
     la pinta, y aquí abajo hay una red de seguridad por tiempo. */
  var elCortina = $("#cortina");
  var cortinaFuera = false;

  function quitarCortina() {
    if (cortinaFuera) { return; }
    cortinaFuera = true;
    if (elCortina) { elCortina.classList.add("esta-fuera"); }
    if (lenis) { lenis.start(); }
  }

  function cortina(alHero) {
    if (!elCortina) { alHero(); return; }
    if (lenis) { lenis.stop(); }
    try { window.scrollTo(0, 0); } catch (e) {}
    var tl = gsap.timeline({ onComplete: quitarCortina });
    tl.to(".cortina-suelo", { strokeDashoffset: 0, duration: .55, ease: "expo.inOut" })
      .to(".cortina-varilla", { strokeDashoffset: 0, duration: .7, ease: "expo.inOut" }, "-=.2")
      .to(".cortina-sol", { opacity: 1, duration: .4, ease: "power2.out" }, "-=.24")
      .to(".cortina-marca", { opacity: 1, duration: .45, ease: "power2.out" }, "-=.28")
      .add(alHero, "+=.12")
      .to(".cortina-centro", { opacity: 0, duration: .3, ease: "power2.in" })
      .to(".cortina-sombra", { scaleX: 0, borderRadius: 0, duration: 1.15, ease: "expo.inOut" }, "-=.14");
  }

  var yaArranco = false;
  function arrancarUnaVez() { if (yaArranco) { return; } yaArranco = true; arrancar(); }
  function abrirLaPagina() { cortina(arrancarUnaVez); }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(abrirLaPagina);
  } else {
    window.addEventListener("load", abrirLaPagina);
  }

  /* Red de seguridad: si las tipografías no resuelven, si una animación se
     atasca o si algo revienta a mitad, ni la cortina se queda puesta ni el
     arranque se pierde. */
  setTimeout(function () { quitarCortina(); arrancarUnaVez(); }, 4600);

  if (mqReducido.addEventListener) {
    mqReducido.addEventListener("change", function () { window.location.reload(); });
  }
})();
