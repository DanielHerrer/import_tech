/* =====================================================================
   detalles.js — Página de detalle de producto
   (galería con modal, zoom, swipe, versiones, JSON-LD, relacionados)

   Requiere config.js cargado antes (usa el objeto IT).
   ===================================================================== */

(() => {
    "use strict";

    document.addEventListener("DOMContentLoaded", async () => {

        /* ===========================================================
           MODAL GALERÍA DE FOTOS
           =========================================================== */
        let imagenesActuales = [];
        let imgIndex = 0;

        const divOverlay = document.getElementById("divOverlay");
        const imgOverlay = document.getElementById("imgOverlay");
        const modalImg = document.getElementById("modalImg");
        const closeImgModal = document.getElementById("closeImgModal");
        const btnPrev = divOverlay.querySelector(".prev");
        const btnNext = divOverlay.querySelector(".next");

        function abrirModalImagenes(imagenes, index = 0) {
            divOverlay.style.display = "block";
            imagenesActuales = imagenes.filter(Boolean).slice(0, 4);
            imgIndex = index;
            modalImg.src = imagenesActuales[imgIndex];

            const mostrarFlechas = imagenesActuales.length > 1 ? "block" : "none";
            btnPrev.style.display = mostrarFlechas;
            btnNext.style.display = mostrarFlechas;
        }

        function cambiarImagen(dir) {
            modalImg.classList.add("fade");
            setTimeout(() => {
                imgIndex += dir;
                if (imgIndex < 0) imgIndex = imagenesActuales.length - 1;
                if (imgIndex >= imagenesActuales.length) imgIndex = 0;
                modalImg.src = imagenesActuales[imgIndex];
                modalImg.classList.remove("fade");
            }, 150);
        }

        btnPrev.addEventListener("click", (e) => {
            e.stopPropagation();
            cambiarImagen(-1);
        });

        btnNext.addEventListener("click", (e) => {
            e.stopPropagation();
            cambiarImagen(1);
        });

        closeImgModal.addEventListener("click", () => {
            divOverlay.style.display = "none";
        });

        imgOverlay.addEventListener("click", (e) => {
            if (e.target === imgOverlay) divOverlay.style.display = "none";
        });

        // Swipe en mobile
        let startX = 0;
        modalImg.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        modalImg.addEventListener("touchend", (e) => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) cambiarImagen(diff > 0 ? 1 : -1);
        });

        // Teclado (← → ESC)
        document.addEventListener("keydown", (e) => {
            if (divOverlay.style.display !== "block") return;
            if (e.key === "ArrowRight") cambiarImagen(1);
            if (e.key === "ArrowLeft") cambiarImagen(-1);
            if (e.key === "Escape") divOverlay.style.display = "none";
        });

        /* ===========================================================
           ZOOM DE LA IMAGEN PRINCIPAL (sigue el puntero / pinch)
           =========================================================== */
        const img1 = document.querySelector(".img-1");
        const mainImg = img1.querySelector("img");

        // Estado del pinch (antes eran globales implícitas: bug con "use strict")
        let initialDistance = 0;
        let currentScale = 1;

        const getDistance = (touch1, touch2) =>
            Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

        // Desktop (mouse)
        img1.addEventListener("mousemove", (e) => {
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

        // Mobile (pinch con 2 dedos)
        img1.addEventListener("touchstart", (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                initialDistance = getDistance(e.touches[0], e.touches[1]);
            }
        }, { passive: false });

        img1.addEventListener("touchmove", (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const newDistance = getDistance(e.touches[0], e.touches[1]);
                const scaleChange = newDistance / initialDistance;
                currentScale = Math.min(Math.max(1, scaleChange), 3); // entre 1x y 3x

                const rect = img1.getBoundingClientRect();
                const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
                const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;

                mainImg.style.transformOrigin = `${midX}% ${midY}%`;
                mainImg.style.transform = `scale(${currentScale})`;
            }
        }, { passive: false });

        img1.addEventListener("touchend", (e) => {
            if (e.touches.length < 2) {
                mainImg.style.transformOrigin = "center";
                mainImg.style.transform = "scale(1)";
            }
        });

        /* ===========================================================
           CARGA DEL PRODUCTO SEGÚN EL ID DE LA URL
           =========================================================== */
        const params = new URLSearchParams(window.location.search);
        const productId = params.get("id");
        if (!productId) return; // sin id, no hay nada que mostrar

        let producto = null;

        try {
            const productos = await IT.cargarCatalogo();
            producto = productos.find((p) => p.id === productId);

            if (!producto) {
                console.error("Producto no encontrado");
                return;
            }

            /* ----------- Actualiza la vista según la versión elegida ----------- */
            function mostrarVersion(version) {
                // Datos generales
                document.querySelector(".breadcrumb-active").textContent = producto.nombre;
                document.querySelector(".title-producto").textContent =
                    `${producto.nombre} ${version.nombre_version}`;
                document.querySelector(".subtitle-producto").textContent =
                    `${producto.marca} · ${producto.categoria}`;
                document.title =
                    `${producto.nombre} ${version.nombre_version} · Import Tech BA | Celulares y Tecnología en Argentina`;
                window.tituloProducto = document.title;

                // Imagen principal
                const imgPrincipal = document.querySelector(".img-1 img");
                if (version.imagenes[0]) imgPrincipal.src = version.imagenes[0];
                imgPrincipal.onclick = () => abrirModalImagenes(version.imagenes, 0);

                // Sub-imágenes
                const imgsContainer = document.querySelector(".imgs");
                imgsContainer.querySelectorAll(".sub-img").forEach((el) => el.remove());
                version.imagenes.slice(0, 4).forEach((url, i) => {
                    if (!url) return;
                    const thumbDiv = document.createElement("div");
                    thumbDiv.className = `img-${i + 2} sub-img`;
                    const img = document.createElement("img");
                    img.src = url;
                    thumbDiv.appendChild(img);
                    thumbDiv.addEventListener("click", () => {
                        imgPrincipal.src = img.src;
                    });
                    imgsContainer.appendChild(thumbDiv);
                });

                // Descripción
                const descContainer = document.querySelector(".descripcion");
                const descP = document.querySelector(".description-producto");
                const toggleBtn = document.querySelector(".toggle-descripcion");

                descP.innerHTML = version.descripcion.replace(/\n/g, "<br>");
                descContainer.classList.remove("expandida");
                toggleBtn.innerHTML = `Ver descripción completa <i class="fa-regular fa-square-caret-down"></i>`;
                toggleBtn.onclick = () => {
                    const expandida = descContainer.classList.toggle("expandida");
                    toggleBtn.innerHTML = expandida
                        ? `Ver menos <i class="fa-regular fa-square-caret-up"></i>`
                        : `Ver descripción completa <i class="fa-regular fa-square-caret-down"></i>`;
                };

                // Tags (stock + colores)
                const tags = document.querySelector(".tags");
                tags.innerHTML = "";

                const tagStock = document.createElement("div");
                tagStock.classList.add("tag");
                if (version.stock) {
                    tagStock.innerText = "En stock";
                    tagStock.style.background = "#75b5ff";
                    tagStock.style.color = "#073972";
                } else {
                    tagStock.innerText = "Sin stock";
                    tagStock.style.background = "#ff7575";
                    tagStock.style.color = "#720707";
                }
                tags.appendChild(tagStock);

                if (version.colores.length > 1) {
                    const tagColores = document.createElement("div");
                    tagColores.classList.add("tag");
                    tagColores.innerText = "Varios colores";
                    tagColores.style.background = "#97ff94";
                    tagColores.style.color = "#0c3b06";
                    tags.appendChild(tagColores);
                }

                // JSON-LD del producto
                actualizarJsonLd(producto, version);
            }

            /* ----------- Actualiza el JSON-LD para SEO ----------- */
            function actualizarJsonLd(product, version) {
                try {
                    const node = document.getElementById("product-jsonld");
                    if (!node) return;
                    const base = JSON.parse(node.textContent);
                    if (product.nombre && version.nombre_version) {
                        base.name = `${product.nombre} ${version.nombre_version}`;
                    }
                    if (version.descripcion) base.description = version.descripcion;
                    if (version.imagenes && version.imagenes.length) base.image = version.imagenes;
                    node.textContent = JSON.stringify(base, null, 2);
                } catch (e) {
                    console.warn("No se pudo actualizar JSON-LD del producto", e);
                }
            }

            /* ----------- Render de versiones ----------- */
            const versionesDiv = document.querySelector(".div-versiones");
            versionesDiv.innerHTML = "";

            producto.versiones.reverse().forEach((version, index) => {
                const versionDiv = document.createElement("div");
                versionDiv.classList.add("version");
                if (index === 0) versionDiv.classList.add("v-on"); // primera por defecto
                versionDiv.textContent = version.nombre_version;
                versionDiv.title = `${producto.nombre} ${version.nombre_version}`;

                versionDiv.addEventListener("click", () => {
                    versionesDiv.querySelectorAll(".version").forEach((v) => v.classList.remove("v-on"));
                    versionDiv.classList.add("v-on");
                    mostrarVersion(version);
                });

                versionesDiv.appendChild(versionDiv);
            });

            if (producto.versiones.length > 0) {
                mostrarVersion(producto.versiones[0]);
            }

            /* ----------- Botón de Comprar ----------- */
            document.getElementById("btn-comprar").addEventListener("click", () => {
                const versionSeleccionada = document.querySelector(".div-versiones .v-on").textContent;
                const mensaje =
                    `¡Hola!\nQuisiera realizar una orden de compra.\n*${producto.nombre} ${versionSeleccionada}*.\nPor favor, necesito más detalles.`;
                window.open(IT.urlWhatsApp(mensaje), "_blank");
            });

            /* ----------- Productos relacionados ----------- */
            const relacionados = productos
                .filter((p) =>
                    (p.marca === producto.marca || p.categoria === producto.categoria) &&
                    p.id !== producto.id &&
                    p.activo === true
                )
                .sort(IT.comparadorNovedadFecha)
                .slice(0, IT.cantidadDestacados());

            const contenedor = document.querySelector(".productos-grid");
            contenedor.innerHTML = "";

            relacionados.forEach((prod) => {
                contenedor.appendChild(crearCardRelacionada(prod));
            });

        } catch (error) {
            console.error("Error cargando productos:", error);
        }

        // Mostrar el bloque del producto
        document.getElementById("producto").style.display = "block";
    });

    /* ----------- Helpers de tarjetas relacionadas ----------- */
    function crearBadge(clase, texto) {
        const badge = document.createElement("div");
        badge.classList.add(clase);
        badge.textContent = texto;
        return badge;
    }

    function crearCardRelacionada(prod) {
        const imagen =
            prod.versiones[prod.versiones.length - 1].imagenes[0] || "placeholder.jpg";

        const card = document.createElement("div");
        card.classList.add("producto-card");
        card.setAttribute("role", "listitem");
        card.innerHTML = `
            <img class="img-card" src="${imagen}" alt="${prod.nombre}">
            <div class="producto-info">
                <h3 class="title-card">${prod.nombre}</h3>
                <p class="subtitle-card">${prod.marca} · ${prod.categoria}</p>
                <button class="btn-card">Ver más</button>
            </div>
        `;

        if (prod.versiones.length > 1) {
            card.appendChild(crearBadge("producto-versiones", "Varias versiones"));
        }
        if (IT.esNovedad(prod)) {
            card.appendChild(crearBadge("producto-nuevo", "Nuevo ingreso"));
        }

        card.addEventListener("click", () => {
            window.location.href = `./detalles.html?id=${prod.id}`;
        });

        return card;
    }
})();
