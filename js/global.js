
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
