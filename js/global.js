
//   TEXTO PARPADEANTE, pestaña inactiva

let intervalId;
const originalTitle = document.title; // Guardamos el título real
const mensajes = ["¡Volvé!", "No te lo pierdas.."];
let index = 0;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // Usuario cambió de pestaña
        intervalId = setInterval(() => {
            document.title = mensajes[index];
            index = (index + 1) % mensajes.length;
        }, 500); // cambia cada 1 segundo
    } else {
        // Usuario volvió
        clearInterval(intervalId);
        document.title = originalTitle; // restauramos el título
    }
});

// SOCIAL BUTTONS

// Mostrar el botón "arriba" solo cuando el usuario está cerca del fondo
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 750) {
        scrollTopBtn.style.display = "flex";
    } else {
        scrollTopBtn.style.display = "none";
    }
});

// Al hacer clic, vuelve al header
scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// Atención al Cliente, mensaje WhatsApp

const numeroWpp = "5491165835895";
const mensaje = "Hola, quiero hacer un reclamo sobre mi compra.";

document.addEventListener("DOMContentLoaded", () => {
    const wppLink = document.querySelector(".link-atencion");
    if (wppLink) {
        wppLink.href = `https://wa.me/${numeroWpp}?text=${encodeURIComponent(mensaje)}`;
    }

    // Actualizar año automáticamente
    const yearElement = document.querySelector(".copyright");
    if (yearElement) {
        const year = new Date().getFullYear();
        yearElement.innerHTML = `Copyright Import Tech · ${year}. Todos los derechos reservados.`;
    }
});

// MODAL, NOTICIAS hoy _________________________________________________________________________________________
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

// ACTUALIZAR TITULO
const titleModal = document.querySelector(".title-modal");
titleModal.innerHTML = "<b>Novedades</b> · ¡Aprovechá ahora! 😉";
// ACTUALIZAR IMAGEN PRINCIPAL
const imgModal = document.querySelector(".modal img");
// Obtengo la ruta actual (sin dominio)
const rutaActual = window.location.pathname;
// Verifico si estoy en index o en otra página
if (rutaActual.endsWith("index.html")) {
    // Estamos en index
    imgModal.src = "./img/banner_3.png";
} else {
    // Estamos en otra página
    imgModal.src = "../img/banner_3.png";
}
overlay.style.display = "block";

// Función para saber si ya se mostró hoy
// function yaSeMostroHoy() {
//     const hoy = new Date().toDateString();
//     return localStorage.getItem("popupFecha") === hoy;
// }

// Mostrar si no se mostró hoy
// if (!yaSeMostroHoy()) {
//     overlay.style.display = "block";
//     localStorage.setItem("popupFecha", new Date().toDateString());
// }

// Cerrar modal
closeBtn.addEventListener("click", () => {
    overlay.style.display = "none";
});

// También cerrar si clickean fuera
overlay.addEventListener("click", e => {
    if (e.target === overlay) {
        overlay.style.display = "none";
    }
});