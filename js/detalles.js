// LOGICA DE global.js

// DOMContentLoaded __________________________________________________________________________________________________
document.addEventListener("DOMContentLoaded", async () => {

    const img1 = document.querySelector(".img-1");
    const mainImg = img1.querySelector("img");

    // ZOOM IMAGEN PRINCIPAL siga el puntero

    // --------- DESKTOP (mouse) ----------
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

    // --------- MOBILE (pinch con 2 dedos) ----------
    img1.addEventListener("touchstart", e => {
        if (e.touches.length === 2) {
            e.preventDefault();
            initialDistance = getDistance(e.touches[0], e.touches[1]);
        }
    }, { passive: false });

    img1.addEventListener("touchmove", e => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const newDistance = getDistance(e.touches[0], e.touches[1]);

            // calcular escala según la diferencia
            const scaleChange = newDistance / initialDistance;
            currentScale = Math.min(Math.max(1, scaleChange), 3); // entre 1x y 3x

            // punto medio de los dos dedos
            const rect = img1.getBoundingClientRect();
            const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width * 100;
            const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height * 100;

            mainImg.style.transformOrigin = `${midX}% ${midY}%`;
            mainImg.style.transform = `scale(${currentScale})`;
        }
    }, { passive: false });

    img1.addEventListener("touchend", e => {
        if (e.touches.length < 2) {
            mainImg.style.transformOrigin = "center";
            mainImg.style.transform = "scale(1)";
        }
    });

    // función para calcular distancia entre dos dedos
    function getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.hypot(dx, dy);
    }

    // ____________________________________________________________________________________________________________
    // 1. Obtener el id de la URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    let producto = null;

    if (!productId) return; // si no hay id, no hacemos nada

    // BUSCAR PRODUCTO por ID
    try {
        // 2. Cargar el archivo productos.txt (debe estar en el mismo servidor)
        const response = await fetch("../data/productos_v12.json");
        const productos = await response.json();

        // 3. Buscar el producto por id
        producto = productos.find(p => p.id === productId);

        if (!producto) {
            console.error("Producto no encontrado");
            return;
        }

        // Función que actualiza la vista según la versión seleccionada
        function mostrarVersion(version) {

            // 1. Datos generales del producto
            document.querySelector(".title-producto").textContent = producto.nombre + " " + version.nombre_version;
            document.querySelector(".subtitle-producto").textContent = `${producto.marca} · ${producto.categoria}`;
            document.title = `${producto.nombre + " " + version.nombre_version} · Import Tech BA | Celulares y Tecnología en Argentina`;
            window.tituloProducto = document.title;

            // --- Imagen principal
            const mainImg = document.querySelector(".img-1 img");
            if (version.imagenes[0]) {
                mainImg.src = version.imagenes[0];
            }

            // --- Sub-imágenes
            const imgsContainer = document.querySelector(".imgs");
            imgsContainer.querySelectorAll(".sub-img").forEach(el => el.remove());
            version.imagenes.slice(0, 4).forEach((url, i) => {
                if (!url) return;
                const thumbDiv = document.createElement("div");
                thumbDiv.className = `img-${i + 2} sub-img`;
                const img = document.createElement("img");
                img.src = url;
                thumbDiv.appendChild(img);

                // evento de click en cada miniatura
                thumbDiv.addEventListener("click", () => {
                    mainImg.src = img.src;
                });

                imgsContainer.appendChild(thumbDiv);
            });

            // --- Descripción
            let descripcion = version.descripcion.replace(/\n/g, "<br>");
            const descContainer = document.querySelector(".descripcion");
            const descP = document.querySelector(".description-producto");
            const toggleBtn = document.querySelector(".toggle-descripcion");

            descP.innerHTML = descripcion;

            // Reset estado
            descContainer.classList.remove("expandida");
            toggleBtn.innerHTML = `Ver descripción completa <i class="fa-regular fa-square-caret-down"></i>`;

            // Detectar click para expandir
            toggleBtn.onclick = () => {
                const expandida = descContainer.classList.toggle("expandida");
                toggleBtn.innerHTML = expandida
                    ? `Ver menos <i class="fa-regular fa-square-caret-up"></i>`
                    : `Ver descripción completa <i class="fa-regular fa-square-caret-down"></i>`;
            };

            // --- Colores
            /*
            const coloresDiv = document.querySelector(".div-colores");
            coloresDiv.innerHTML = "";
            version.colores.forEach(([hex, nombre]) => {
                const colorDiv = document.createElement("div");
                colorDiv.classList.add("color");
                colorDiv.setAttribute("role", "listitem");
                colorDiv.ariaLabel = "Color disponible";
                colorDiv.style.background = hex;
                colorDiv.title = nombre;
                coloresDiv.appendChild(colorDiv);
            });
            */

            // --- Tags
            const tags = document.querySelector(".tags");
            tags.innerHTML = ""; // limpiar antes de renderizar

            // Stock
            const tagStock = document.createElement("div");
            tagStock.classList.add("tag");
            if (producto.activo) {
                tagStock.innerText = "En stock";
                tagStock.style.background = "#75b5ff";
                tagStock.style.color = "#073972";
            } else {
                tagStock.innerText = "Sin stock";
                tagStock.style.background = "#ff7575";
                tagStock.style.color = "#720707";
            }
            tags.appendChild(tagStock);

            // Colores (solo si hay 2 o más)
            if (version.colores.length > 1) {
                const tagColores = document.createElement("div");
                tagColores.classList.add("tag");
                tagColores.innerText = "Varios colores";
                tagColores.style.background = "#97ff94";
                tagColores.style.color = "#0c3b06";
                tags.appendChild(tagColores);
            }

            // --------------------- completar JSON-LD
            // 1) completar JSON-LD
            function updateProductJsonLd(product) {
                try {
                    const node = document.getElementById('product-jsonld');
                    if (!node) return;
                    const base = JSON.parse(node.textContent);
                    if (product.nombre && version.nombre_version) base.name = product.nombre+" "+version.nombre_version;
                    if (version.descripcion) base.description = version.descripcion;
                    if (version.imagenes && version.imagenes.length) base.image = version.imagenes;

                    // Reemplazamos el script en el DOM para que los bots cojan la versión actualizada
                    node.textContent = JSON.stringify(base, null, 2);
                } catch (e) {
                    // no bloquear ejecución
                    console.warn('No se pudo actualizar JSON-LD del producto', e);
                }
            }

            // 2) Observador: 
            const observer = new MutationObserver((mutations) => {
                try {
                    if (producto) updateProductJsonLd(producto);
                } catch (e) { }
            });

            // arranca el observer sobre el contenedor para detectar inyecciones dinámicas
            const grid = document.getElementById('contenedor-productos');
            if (grid) observer.observe(grid, { childList: true, subtree: false });
            // Intento inicial de llenar JSON-LD si los datos ya están presentes tras detalles.js
            try {
                if (producto) updateProductJsonLd(producto);
            } catch (e) { 
                console.log("Error en JSON-LD: "+e);
            }

        }

        // 1. Datos generales del producto
        // document.querySelector(".title-producto").textContent = producto.nombre;
        // document.querySelector(".subtitle-producto").textContent = `${producto.marca} · ${producto.categoria}`;
        // document.title = `${producto.nombre} · Import Tech`;
        // window.tituloProducto = document.title;

        // 2. Renderizar versiones
        const versionesDiv = document.querySelector(".div-versiones");
        versionesDiv.innerHTML = ""; // limpiar previas

        producto.versiones.reverse().forEach((version, index) => {
            const versionDiv = document.createElement("div");
            versionDiv.classList.add("version");
            if (index === 0) versionDiv.classList.add("v-on"); // primera versión default
            versionDiv.textContent = version.nombre_version;
            versionDiv.title = version.nombre_version;

            versionDiv.addEventListener("click", () => {
                // Quitar v-on de todas
                versionesDiv.querySelectorAll(".version").forEach(v => v.classList.remove("v-on"));
                // Poner v-on a la seleccionada
                versionDiv.classList.add("v-on");
                // Mostrar la versión elegida
                mostrarVersion(version);
            });

            versionesDiv.appendChild(versionDiv);
        });

        // 3. Mostrar por defecto la primera versión
        if (producto.versiones.length > 0) {
            mostrarVersion(producto.versiones[0]);
        }

        // 4. Botón de Comprar
        document.getElementById("btn-comprar").addEventListener("click", () => {
            const phoneNumber = "5491165835895";
            const versionSeleccionada = document.querySelector(".div-versiones .v-on").textContent;
            const message = `¡Hola!\nQuisiera realizar una orden de compra.\n*${producto.nombre} ${versionSeleccionada}*.\nPor favor, necesito más detalles.`;
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(url, "_blank");
        });


        // PRODUCTOS RELACIONADOS ----------------------------------------------------------------------------
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
            card.setAttribute("role", "listitem");

            card.innerHTML = `
                <img class="img-card" src="${prod.versiones[prod.versiones.length - 1].imagenes[0] || 'placeholder.jpg'}" alt="${prod.nombre}"></img>
                
                <div class="producto-info">
                    <h3 class="title-card">${prod.nombre}</h3>
                    <p class="subtitle-card">${prod.marca} · ${prod.categoria}</p>
                    <button class="btn-card">Ver más</button>
                </div>
            `;

            // Agregar badge si hay varias versiones
            if (prod.versiones.length > 1) {
                const badge = document.createElement("div");
                badge.classList.add('producto-versiones');
                badge.textContent = "Varias versiones";

                // card.style.position = "relative"; // para que el badge quede dentro del div
                card.appendChild(badge);
            }


            // Al hacer clic → ir a la página de detalles
            card.addEventListener("click", () => {
                window.location.href = `./detalles.html?id=${prod.id}`;
            });

            contenedor.appendChild(card);
        });



    } catch (error) {
        console.error("Error cargando productos:", error);
    }

    // Esperar a que la página cargue por completo (incluye imágenes)
    document.getElementById("producto").style.display = "block";
});