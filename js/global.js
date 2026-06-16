/* =====================================================================
   global.js — Lógica compartida por todas las páginas
   (canvas de partículas, animaciones, botón "arriba", modal diario, etc.)

   Requiere config.js cargado antes (usa el objeto IT).
   Cada bloque verifica que sus elementos existan, así una página que no
   tenga (por ejemplo) el canvas o el botón flotante no rompe el resto.
   ===================================================================== */

(() => {
    "use strict";

    /* ------- Recargar página => volver arriba ------- */
    window.addEventListener("beforeunload", () => window.scrollTo(0, 0));

    /* ===================================================================
       ANIMACIÓN DE PARTÍCULAS (CANVAS)
       =================================================================== */
    const canvas = document.getElementById("canvas1");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particlesArray = [];

        const PARTICLES_MULTIPLIER = 1.5;
        const PARTICLE_COLOR = "#ffffff";

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Particle {
            constructor(x, y, directionX, directionY, size) {
                this.x = x;
                this.y = y;
                this.directionX = directionX;
                this.directionY = directionY;
                this.size = size;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
                ctx.fillStyle = PARTICLE_COLOR;
                ctx.fill();
            }

            update() {
                if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
                if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

                this.x += this.directionX * 0.25;
                this.y += this.directionY * 0.25;
                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            const numberOfParticles = (canvas.height * canvas.width) / 9000;

            for (let i = 0; i < numberOfParticles * PARTICLES_MULTIPLIER; i++) {
                const size = Math.random() * 5 + 1;
                const x = Math.random() * (innerWidth - size * 4) + size * 2;
                const y = Math.random() * (innerHeight - size * 4) + size * 2;
                const directionX = Math.random() * 5 - 2.5;
                const directionY = Math.random() * 5 - 2.5;
                particlesArray.push(new Particle(x, y, directionX, directionY, size));
            }
        }

        function connect() {
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    const dx = particlesArray[a].x - particlesArray[b].x;
                    const dy = particlesArray[a].y - particlesArray[b].y;
                    const distance = dx * dx + dy * dy;

                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        const opacityValue = 1 - distance / 20000;
                        ctx.strokeStyle = `rgba(255,255,255,${opacityValue})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            particlesArray.forEach((p) => p.update());
            connect();
        }

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        });

        init();
        animate();
    }

    /* ===================================================================
       ANIMACIONES (Intersection Observer)
       =================================================================== */
    const elementosAnimados = document.querySelectorAll(
        ".animado-up, .animado-down, .animado-left, .animado-right"
    );

    if (elementosAnimados.length > 0) {
        const observer = new IntersectionObserver(
            (observados) => {
                observados.forEach((o) => {
                    if (o.isIntersecting) {
                        o.target.style["animation-play-state"] = "running";
                    }
                });
            },
            { threshold: 0.25 }
        );
        elementosAnimados.forEach((el) => observer.observe(el));
    }

    /* ===================================================================
       TÍTULO PARPADEANTE cuando la pestaña está inactiva
       =================================================================== */
    const MENSAJES_TITULO = ["¡Volvé!", "No te lo pierdas.."];
    let intervalId;
    let originalTitle = document.title;
    let mensajeIndex = 0;

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            originalTitle = document.title; // guardar el título real antes de reemplazarlo
            intervalId = setInterval(() => {
                document.title = MENSAJES_TITULO[mensajeIndex];
                mensajeIndex = (mensajeIndex + 1) % MENSAJES_TITULO.length;
            }, 500);
        } else {
            clearInterval(intervalId);
            document.title = window.tituloProducto || originalTitle;
        }
    });

    /* ===================================================================
       BOTÓN "ARRIBA"
       =================================================================== */
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    if (scrollTopBtn) {
        window.addEventListener("scroll", () => {
            scrollTopBtn.style.display = window.scrollY > 500 ? "flex" : "none";
        });
        scrollTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ===================================================================
       FOOTER: link de atención al cliente + año automático
       =================================================================== */
    document.addEventListener("DOMContentLoaded", () => {
        const wppLink = document.querySelector(".link-atencion");
        if (wppLink) {
            wppLink.href = IT.urlWhatsApp("Hola, quiero hacer un reclamo sobre mi compra.");
        }

        const yearElement = document.querySelector(".copyright");
        if (yearElement) {
            yearElement.innerHTML = `Copyright Import Tech BA · ${new Date().getFullYear()}. Todos los derechos reservados.`;
        }
    });

    /* ===================================================================
       MODAL diario (Novedades / avisos)
       =================================================================== */
    const overlay = document.getElementById("overlay");
    const closeBtn = document.getElementById("closeBtn");

    if (overlay && closeBtn) {
        const titleModal = document.querySelector(".title-modal");
        if (titleModal) {
            titleModal.innerHTML =
                "<b>Estamos teniendo inconvenientes con Instagram</b> · Gracias por su comprensión";
        }

        const imgModal = document.querySelector(".modal img");
        if (imgModal) {
            const esCelular =
                /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                window.innerWidth <= 768;
            imgModal.src = esCelular
                ? "../img/banner_error_ig_vertical.png"
                : "../img/banner_error_ig.jpeg";
        }

        const yaSeMostroHoy = () =>
            localStorage.getItem("popupFecha") === new Date().toDateString();

        if (!yaSeMostroHoy()) {
            overlay.style.display = "block";
            localStorage.setItem("popupFecha", new Date().toDateString());
        }

        closeBtn.addEventListener("click", () => {
            overlay.style.display = "none";
        });

        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.style.display = "none";
        });
    }
})();
