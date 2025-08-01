// LOGICA DE global.js


//   TEXTO PARPADEANTE, pestaña inactiva

let intervalId;
const mensajes = ["¡Volvé!", "No te lo pierdas.."];
let index = 0;
let tituloProducto = null;

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
        document.title = tituloProducto; // restauramos el título
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

// ZOOM IMAGEN PRINCIPAL siga el puntero
const img1 = document.querySelector(".img-1");
const mainImg = img1.querySelector("img");

// --------------------------
// DESKTOP: con el mouse
// --------------------------
img1.addEventListener("mousemove", e => {
    const rect = img1.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mainImg.style.transformOrigin = `${x}% ${y}%`;
    mainImg.style.transform = "scale(2)";
});

img1.addEventListener("mouseleave", () => {
    mainImg.style.transformOrigin = "center";
    mainImg.style.transform = "scale(1)";
});

// --------------------------
// MOBILE: con touch
// --------------------------
let zoomActivo = false;

img1.addEventListener("touchstart", e => {
    e.preventDefault(); // evita scroll accidental
    zoomActivo = !zoomActivo; // toggle zoom
    if (zoomActivo) {
        const touch = e.touches[0];
        const rect = img1.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
        mainImg.style.transform = "scale(2)";
    } else {
        mainImg.style.transformOrigin = "center";
        mainImg.style.transform = "scale(1)";
    }
});

// opcional: mover el zoom con el dedo si está activo
img1.addEventListener("touchmove", e => {
    if (!zoomActivo) return;
    const touch = e.touches[0];
    const rect = img1.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    mainImg.style.transformOrigin = `${x}% ${y}%`;
});

// DOMContentLoaded __________________________________________________________________________________________________

document.addEventListener("DOMContentLoaded", async () => {

    // 1. Obtener el id de la URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    let producto = null;

    if (!productId) return; // si no hay id, no hacemos nada

    // BUSCAR PRODUCTO por ID
    try {
        // 2. Cargar el archivo productos.txt (debe estar en el mismo servidor)
        const response = await fetch("../data/lista-productosv2.txt");
        const productos = await response.json();

        // 3. Buscar el producto por id
        producto = productos.find(p => p.id === productId);

        if (!producto) {
            console.error("Producto no encontrado");
            return;
        }

        // 4. Actualizar imagen principal
        const mainImg = document.querySelector(".img-1 img");
        if (producto.imagenes[0]) {
            mainImg.src = producto.imagenes[0];
        }

        // --- Generar dinámicamente las sub-imgs
        const imgsContainer = document.querySelector(".imgs");

        // --- Eliminar cualquier sub-img existente
        imgsContainer.querySelectorAll(".sub-img").forEach(el => el.remove());

        // --- Recorrer imágenes (máx. 4)
        producto.imagenes.slice(0, 4).forEach((url, i) => {
            if (!url) return; // ignorar vacías

            if (i === 0) {
                // la primera ya la usamos en img-1, pero también queremos un sub-img
                const thumbDiv = document.createElement("div");
                thumbDiv.className = `img-${i + 2} sub-img`;
                const img = document.createElement("img");
                img.src = url;
                thumbDiv.appendChild(img);
                imgsContainer.appendChild(thumbDiv);
            } else {
                // siguientes imágenes
                const thumbDiv = document.createElement("div");
                thumbDiv.className = `img-${i + 2} sub-img`;
                const img = document.createElement("img");
                img.src = url;
                thumbDiv.appendChild(img);
                imgsContainer.appendChild(thumbDiv);
            }
        });

        // --- Selecciona la imagen principal (la que está dentro del div .img-1).
        const mainImagen = document.querySelector(".img-1 img");
        // ---Selecciona todas las imágenes miniatura (img) que están dentro de los divs con clase .sub-img.
        const thumbs = document.querySelectorAll(".sub-img img");

        producto.imagenes.slice(0, 4).forEach((url, i) => {
            if (!url) return; // si la url está vacía, la salteamos

            if (i === 0) {
                // Primera imagen → se usa en grande y también en la primera miniatura
                mainImagen.src = url;
                if (thumbs[0]) thumbs[0].src = url;
            } else {
                // Las demás imágenes → van a thumbs[1], thumbs[2], thumbs[3]
                if (thumbs[i]) thumbs[i].src = url;
            }
        });

        // 5. Actualizar descripción y textos
        document.querySelector(".title-producto").textContent = producto.nombre;
        document.querySelector(".subtitle-producto").textContent = `${producto.marca} · ${producto.categoria}`;
        document.querySelector(".description-producto").textContent = producto.descripcion;

        // 6. Actualizar colores
        const coloresDiv = document.querySelector(".div-colores");
        coloresDiv.innerHTML = ""; // limpiar lo que había
        producto.colores.forEach(([hex, nombre]) => {
            const colorDiv = document.createElement("div");
            colorDiv.classList.add("color");
            colorDiv.style.background = hex;
            colorDiv.title = nombre;
            coloresDiv.appendChild(colorDiv);
        });

        // 7. Actualizar el título de la pestaña
        tituloProducto = `${producto.nombre} · Import Tech`;
        document.title = tituloProducto;

        // 8. Actualizar TAGS
        const tags = document.querySelector(".tags");
        tags.innerHTML = ""; // limpiar lo que había

        if (producto.activo) {
            const tag = document.createElement("div");
            tag.classList.add("tag");
            tag.innerText = "En stock";
            tag.style.background = "#75b5ff";
            tag.style.color = "#073972";
            tags.appendChild(tag);
        } else {
            const tag = document.createElement("div");
            tag.classList.add("tag");
            tag.innerText = "Sin stock";
            tag.style.background = "#ff7575";
            tag.style.color = "#720707";
            tags.appendChild(tag);
        }

        // Verificar si hay más de un color
        if (producto.colores && producto.colores.length > 1) { // si es array
            // if (producto.colores && producto.colores.size > 1) { // si es Set
            const tag = document.createElement("div");
            tag.classList.add("tag");
            tag.innerText = "Varios colores";
            tag.style.background = "#97ff94";
            tag.style.color = "#0c3b06";
            tags.appendChild(tag);
        }



    } catch (error) {
        console.error("Error cargando productos:", error);
    }

    // BUSCAR PRODUCTOS para PRODUCTOS RELACIONADOS
    try {
        const response = await fetch("../data/lista-productosv2.txt");
        const productos = await response.json();

        // Buscar relacionados y Ordenar por fecha_publicacion (más reciente primero)
        const productosRelacionados = productos.filter(p =>
            (p.marca === producto.marca || p.categoria === producto.categoria) && // misma marca o misma categoría
            p.id !== producto.id &&               // distinto id
            p.activo === true                     // debe estar activo
        );
        const productosOrdenados = productosRelacionados.sort((a, b) =>
            new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
        );

        // Detectar cuántos productos mostrar
        let cantidad;
        const ancho = window.innerWidth;
        if (ancho >= 992) {
            cantidad = 8; // PC
        } else if (ancho >= 576) {
            cantidad = 6; // Tablet
        } else {
            cantidad = 4; // Celular
        }

        // Tomar los más recientes
        const destacados = productosOrdenados.slice(0, cantidad);

        // Seleccionar contenedor donde van los productos destacados
        const contenedor = document.querySelector(".productos-grid");
        contenedor.innerHTML = ""; // limpiar por si acaso

        // Generar las tarjetas
        destacados.forEach(prod => {
            const card = document.createElement("div");
            card.classList.add("producto-card");

            card.innerHTML = `
                <img class="img-card" src="${prod.imagenes[0] || 'placeholder.jpg'}" alt="${prod.nombre}"></img>
                
                <div class="producto-info">
                    <h3 class="title-card">${prod.nombre}</h3>
                    <p class="subtitle-card">${prod.marca} · ${prod.categoria}</p>
                    <button class="btn-card">Ver más</button>
                </div>
            `;

            // Al hacer clic → ir a la página de detalles
            card.addEventListener("click", () => {
                window.location.href = `./detalles.html?id=${prod.id}`;
            });

            contenedor.appendChild(card);
        });

        // ACTUALIZAR IMAGEN PRINCIPAL, haciendo click en sub imagenes
        const mainImg = document.querySelector(".img-1 img");
        const thumbs = document.querySelectorAll(".sub-img");

        thumbs.forEach(thumb => {
            thumb.addEventListener("click", () => {
                const img = thumb.querySelector("img"); // obtiene la imagen dentro del div
                mainImg.src = img.src;
            });
        });

        // BOTON DE COMPRAR ---------------------------------------------------------------------
        document.getElementById("btn-comprar").addEventListener("click", () => {
            // Número de WhatsApp destino sin signos, espacios ni símbolos.
            const phoneNumber = "5491165835895";

            // Mensaje con la orden de compra armada
            const message = `¡Hola!\nQuisiera realizar una orden de compra.\n*Producto: ${producto.nombre}*.\nPor favor, necesito más detalles.`;

            // URL codificada para WhatsApp
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // Abrir WhatsApp en nueva pestaña o ventana
            window.open(url, "_blank");
        });

    } catch (error) {
        console.error("Error cargando productos destacados:", error);
    }
});