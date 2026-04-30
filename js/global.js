// RECARGAR PAGINA => TOP: 0

window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

// ANIMACION PARTICULAS CANVAS

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// crear particula
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    // metodo que dibuja la particula individualmente
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }

    //chequea la posicion de la particula
    update() {
        //chequea si  la particula esta dentro del canvas
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0 ) {
            this.directionY = -this.directionY;
        }

        //movimiento de particula
        this.x += (this.directionX * 0.25 );
        this.y += (this.directionY * 0.25 );

        //dibujado de particula
        this.draw();
    }
}

// array de particulas
function init() {
    particlesArray = [];
    //multiplicador de particulas, por defecto = 1
    particlesMultiplier = 1.5;

    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i=0; i< numberOfParticles * particlesMultiplier ; i++) {
        let size = (Math.random() * 5) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 5) - 2.5;
        let directionY = (Math.random() * 5) - 2.5;
        let color = '#00ff44';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// chequea si las particulas estan lo suficientemente cerca para dibujar una linea entre ellas
function connect() {
    let opacityValue = 1;

    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let distance = (( particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
            + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y)); // mirar
            if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                opacityValue = 1 - (distance/20000);

                ctx.strokeStyle = 'rgba(255,255,255,'+ opacityValue +')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// animacion loop
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,innerWidth,innerHeight);
    for (let i=0; i<particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// resize event
window.addEventListener('resize',
    function() {
        canvas.width = this.innerWidth;
        canvas.height = this.innerHeight;
        init();
    }
);

init();
animate();


// ANIMACIONES INTERSECTION OBSERVER

const elementosAnimados = document.querySelectorAll(
  '.animado-up, .animado-down, .animado-left, .animado-right'
);

let observer = new IntersectionObserver(
  observados => {
      for (let o of observados) {
          if (o.isIntersecting) {
            o.target.style["animation-play-state"]="running";
          }
      }
  },{ threshold:0.25} // Crea un IntersectionObserver que se activa cuando el 25% (0.25) del elemento es visible (threshold: 0.25).
);

elementosAnimados.forEach(elemento =>observer.observe(elemento));

// TEXTO PARPADEANTE, pestaña inactiva

let intervalId;
let originalTitle = window.tituloProducto; // Guardamos el título real
const mensajes = ["¡Volvé!", "No te lo pierdas.."];
let index = 0;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // Usuario cambió de pestaña
        originalTitle = document.title; // GUARDA el título actual ANTES de reemplazarlo
        intervalId = setInterval(() => {
            document.title = mensajes[index];
            index = (index + 1) % mensajes.length;
        }, 500); // cambia cada 1 segundo
    } else {
        // Usuario volvió
        clearInterval(intervalId);
        document.title = window.tituloProducto || originalTitle; // restauramos el título
    }
});

// SOCIAL BUTTONS

// Mostrar el botón "arriba" solo cuando el usuario está cerca del fondo
const scrollTopBtn = document.getElementById("scrollTopBtn");

window.addEventListener("scroll", () => {
    if (window.scrollY > 500) { // aparece después de bajar 300px
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
        yearElement.innerHTML = `Copyright Import Tech BA · ${year}. Todos los derechos reservados.`;
    }
});

// MODAL, NOTICIAS hoy _________________________________________________________________________________________
const overlay = document.getElementById("overlay");
const closeBtn = document.getElementById("closeBtn");

// ACTUALIZAR TITULO
const titleModal = document.querySelector(".title-modal");
titleModal.innerHTML = "<b>Novedades</b> · Estamos teniendo inconvenientes con Instagram. 😔"; // "<b>Novedades</b> · Promos y ofertas <b>todos</b> los días. 😄";
// ACTUALIZAR IMAGEN PRINCIPAL
const imgModal = document.querySelector(".modal img");
// Obtengo la ruta actual (sin dominio)
const rutaActual = window.location.pathname;
// Verifico si estoy en index o en otra página
if (rutaActual.endsWith("index.html") || rutaActual.endsWith("/")) {
    // Estamos en index
    imgModal.src = "./img/banner_error_ig.jpeg"; // "../img/banner_3.png"
} else {
    // Estamos en otra página
    imgModal.src = "../img/banner_error_ig.jpeg"; // "../img/banner_3.png"
}

// Función para saber si ya se mostró hoy
function yaSeMostroHoy() {
    const hoy = new Date().toDateString();
    return localStorage.getItem("popupFecha") === hoy;
}

// Mostrar si no se mostró hoy
if (!yaSeMostroHoy()) {
    overlay.style.display = "block";
    localStorage.setItem("popupFecha", new Date().toDateString());
}

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