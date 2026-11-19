/* ================================================================
   Mía Cuesta — Animaciones (ver assets/Animaciones para la web.png)
   GSAP + ScrollTrigger + Lenis. Con "reducir movimiento" no se anima nada.
   ================================================================ */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 10b. Copiar email (funciona siempre, con o sin animaciones) ----------
  document.querySelectorAll(".copy-email").forEach((btn) => {
    const label = btn.querySelector(".copied");
    let timer;
    btn.addEventListener("click", async () => {
      const email = btn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        label.textContent = "Copiado";
      } catch {
        window.location.href = "mailto:" + email;
        return;
      }
      label.classList.add("is-on");
      clearTimeout(timer);
      timer = setTimeout(() => label.classList.remove("is-on"), 1400);
    });
  });

  // ---------- Scroll suave (Lenis) — solo si se permite movimiento ----------
  let lenis = null;
  const navOffset = () => -document.querySelector(".nav").offsetHeight + 1;
  const scrollToEl = (target, extra = 0) => {
    if (lenis) lenis.scrollTo(target, { offset: navOffset() + extra });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + navOffset() + extra });
  };

  // Enlaces internos (incluye el sello giratorio → Proyectos)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      scrollToEl(target);
    });
  });

  // ---------- Proyectos: el título lleva a las carpetas ----------
  const intro = document.querySelector(".projects__intro");
  const folders = document.querySelector("#carpetas");
  document.querySelector("[data-go-folders]")?.addEventListener("click", () => {
    intro.classList.add("is-open");
    scrollToEl(folders, -24);
    if (!reduceMotion) {
      gsap.fromTo(
        ".folder",
        { y: 0 },
        { y: -14, duration: 0.25, ease: "power2.out", stagger: 0.08, yoyo: true, repeat: 1, delay: 0.7 }
      );
    }
  });

  // ---------- Carpetas: cada una abre una ventana con el detalle ----------
  document.querySelectorAll("[data-open-modal]").forEach((btn) => {
    const dialog = document.getElementById(btn.dataset.openModal);
    btn.addEventListener("click", () => {
      dialog.showModal();
      root.classList.add("modal-open");
      lenis?.stop();
      dialog.querySelector(".modal__inner").scrollTop = 0;
    });
  });
  document.querySelectorAll(".project-modal").forEach((dialog) => {
    dialog.querySelector("[data-close-modal]").addEventListener("click", () => dialog.close());
    // Clic afuera de la ventana (en el fondo) la cierra
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      root.classList.remove("modal-open");
      lenis?.start();
    });
  });

  // Con "reducir movimiento": mostrar todo tal cual.
  if (reduceMotion) {
    root.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // ---------- 01. Entrada del nombre ----------
  gsap.to(".hero__name .line__inner", {
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.1,
  });
  gsap.from(".barizom", { rotate: 6, duration: 0.9, ease: "power3.out", delay: 0.26 });
  // El resto del inicio aparece al cargar (ya está en pantalla, no espera al scroll)
  gsap.to(".hero .reveal", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.08, delay: 0.45 });

  // Al scrollear, el inicio se despide suave mientras sube la cinta
  const heroScroll = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero__text", { yPercent: -12, opacity: 0.25, ease: "none", scrollTrigger: heroScroll });
  gsap.to(".hero__media img", { scale: 1.08, ease: "none", scrollTrigger: { ...heroScroll } });

  // ---------- 02. Cinta de palabras ----------
  const track = document.querySelector(".marquee__track");
  const group = track.querySelector(".marquee__group");
  let marquee = null;
  const buildMarquee = () => {
    // Medir con las fuentes ya cargadas; clonar hasta cubrir la pantalla + una vuelta extra
    track.querySelectorAll(".marquee__group + .marquee__group").forEach((c) => c.remove());
    const groupW = group.offsetWidth;
    const copies = Math.max(2, Math.ceil(window.innerWidth / groupW) + 1);
    for (let i = 1; i < copies; i++) {
      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    }
    if (marquee) marquee.kill();
    // De izquierda a derecha: arranca corrido un grupo a la izquierda y avanza a 0
    marquee = gsap.fromTo(track, { x: -groupW }, { x: 0, duration: 18, ease: "none", repeat: -1 });
  };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(buildMarquee);
  let resizeTimer;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(buildMarquee, 200); });

  let hoverSlow = 1;
  let scrollBoost = 1;
  const applySpeed = () => marquee && gsap.to(marquee, { timeScale: hoverSlow * scrollBoost, duration: 0.6, overwrite: true });
  const marqueeEl = document.querySelector(".marquee");
  marqueeEl.addEventListener("mouseenter", () => { hoverSlow = 0.25; applySpeed(); });
  marqueeEl.addEventListener("mouseleave", () => { hoverSlow = 1; applySpeed(); });
  let boostTimer;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = Math.abs(self.getVelocity());
      scrollBoost = 1 + Math.min(v / 2500, 1.2);
      applySpeed();
      clearTimeout(boostTimer);
      boostTimer = setTimeout(() => { scrollBoost = 1; applySpeed(); }, 160);
    },
  });

  // ---------- 03. Sello giratorio: gira por CSS (12 s/vuelta), clic → #proyectos ----------

  // ---------- 04. Botones: hover por CSS (250 ms ease-out) ----------

  // ---------- 05. Cursor propio "Ver" ----------
  const cursor = document.querySelector(".cursor");
  if (window.matchMedia("(hover: hover)").matches) {
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });
    window.addEventListener("mousemove", (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("mouseenter", () => gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.25, ease: "power2.out" }));
      const hide = () => gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.25, ease: "power2.out" });
      el.addEventListener("mouseleave", hide);
      el.addEventListener("click", hide);
    });
  }

  // ---------- 06. Carpetas: entran en cascada con .reveal; al pasar el mouse se abren (CSS) ----------

  // ---------- 07. Aparición al hacer scroll (cascada) ----------
  ScrollTrigger.batch(".reveal:not(.hero .reveal)", {
    start: "top 90%",
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.06, overwrite: true }),
  });

  // ---------- 08. Sobre mí: parallax suave en las cuatro fotos ----------
  document.querySelectorAll(".about__photos .ph").forEach((ph) => {
    const speed = parseFloat(ph.dataset.speed || "0.08") * 100; // 6–12 %
    gsap.fromTo(
      ph.querySelector("img"),
      { yPercent: -speed / 2, scale: 1 + speed / 100 },
      {
        yPercent: speed / 2,
        ease: "none",
        scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true },
      }
    );
  });

  // ---------- 09. Contadores (años y "4° de 127") ----------
  document.querySelectorAll(".count").forEach((el) => {
    const to = parseInt(el.dataset.to, 10);
    const from = to > 1000 ? to - 24 : 0;
    const obj = { v: from };
    el.textContent = from;
    gsap.to(obj, {
      v: to,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => (el.textContent = Math.round(obj.v)),
      scrollTrigger: { trigger: el, start: "top 92%", once: true },
    });
  });

  // ---------- 10. "Hablemos." ondula con el mouse ----------
  const title = document.querySelector(".contact__title");
  const text = title.textContent;
  title.textContent = "";
  const chars = [...text].map((c) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.setAttribute("aria-hidden", "true");
    s.textContent = c;
    title.appendChild(s);
    return s;
  });
  const footer = document.querySelector(".contact");
  footer.addEventListener("mousemove", (e) => {
    chars.forEach((ch) => {
      const r = ch.getBoundingClientRect();
      const d = (e.clientX - (r.left + r.width / 2)) / 120;
      const lift = Math.exp(-d * d) * -22;
      gsap.to(ch, { y: lift, duration: 0.4, ease: "power2.out", overwrite: true });
    });
  });
  footer.addEventListener("mouseleave", () =>
    gsap.to(chars, { y: 0, duration: 0.4, ease: "power2.out", stagger: 0.02, overwrite: true })
  );

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
