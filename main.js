/* ================================================================
   Mía Cuesta — Animaciones (ver assets/Animaciones para la web.png)
   GSAP + ScrollTrigger + Lenis. Con "reducir movimiento" no se anima nada.
   ================================================================ */
(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  // Sin GSAP o con "reducir movimiento": mostrar todo tal cual.
  if (!hasGsap || reduceMotion) {
    root.classList.remove("js");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Scroll suave (Lenis) ----------
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Enlaces internos (incluye el sello giratorio → Proyectos)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id.length > 1 ? document.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      const offset = -document.querySelector(".nav").offsetHeight + 1;
      if (lenis) lenis.scrollTo(target, { offset });
      else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + offset, behavior: "smooth" });
    });
  });

  // ---------- 01. Entrada del nombre ----------
  gsap.to(".hero__name .line__inner", {
    y: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.08,
    delay: 0.1,
  });
  gsap.from(".barizom", { rotate: 6, duration: 0.9, ease: "power3.out", delay: 0.26 });

  // ---------- 07. Aparición al hacer scroll (cascada) ----------
  ScrollTrigger.batch(".reveal", {
    start: "top 90%",
    once: true,
    onEnter: (els) =>
      gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.06, overwrite: true }),
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
