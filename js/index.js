/* =====================================================================
   index.js — Productos destacados en la home
   Requiere config.js cargado antes (usa el objeto IT).
   ===================================================================== */

(() => {
    "use strict";

    function crearBadge(clase, texto) {
        const badge = document.createElement("div");
        badge.classList.add(clase);
        badge.textContent = texto;
        return badge;
    }

    function crearCardDestacada(prod) {
        const imagen =
            prod.versiones[prod.versiones.length - 1].imagenes[0] || "placeholder.jpg";

        const card = document.createElement("div");
        card.classList.add("producto-card");
        card.innerHTML = `
            <div class="producto-img">
                <img class="img-card" src="${imagen}" alt="${prod.nombre}">
            </div>
            <div class="producto-info">
                <h3 class="title-card">${prod.nombre}</h3>
                <p class="subtitle-card">${prod.marca} · ${prod.categoria}</p>
                <a class="btn-card">Ver más</a>
            </div>
        `;

        if (prod.versiones.length > 1) {
            card.appendChild(crearBadge("producto-versiones", "Varias versiones"));
        }
        if (IT.esNovedad(prod)) {
            card.appendChild(crearBadge("producto-nuevo", "Nuevo ingreso"));
        }

        card.addEventListener("click", () => {
            window.location.href = `./html/detalles.html?id=${prod.id}`;
        });

        return card;
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const contenedor = document.querySelector(".productos-grid");
        if (!contenedor) return;

        try {
            const productos = await IT.cargarCatalogo();
            const destacados = IT.ordenarCatalogo(productos).slice(0, IT.cantidadDestacados());

            contenedor.innerHTML = "";
            const fragment = document.createDocumentFragment();
            destacados.forEach((prod) => fragment.appendChild(crearCardDestacada(prod)));
            contenedor.appendChild(fragment);
        } catch (error) {
            console.error("Error cargando productos destacados:", error);
        }
    });
})();
