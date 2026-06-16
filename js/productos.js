/* =====================================================================
   productos.js — Catálogo Import Tech BA
   Buscador en memoria, instantáneo, con paginación. Sin recargas.

   Requiere config.js cargado antes (usa el objeto IT).
   ===================================================================== */

(() => {
    "use strict";

    /* ------------------------- Configuración ------------------------- */
    const DEBOUNCE_MS = 180;
    const OPCIONES_POR_PAGINA = [10, 20, 30, 40];
    const POR_PAGINA_DEFAULT = 10;

    /* ----------------------------- Estado ---------------------------- */
    const estado = {
        productos: [],            // catálogo completo (cargado una sola vez)
        busqueda: "",
        categoria: "",
        porPagina: POR_PAGINA_DEFAULT,
        paginaActual: 1
    };

    /* ----------- Referencias al DOM (se llenan en init) -------------- */
    const dom = {};

    /* ----------- Lógica de filtrado (pura: no muta, no toca DOM) ------ */

    function coincideBusqueda(producto, termino) {
        if (!termino) return true;

        const campos = [producto.nombre, producto.marca];
        if (Array.isArray(producto.versiones)) {
            for (const v of producto.versiones) {
                campos.push(v.nombre_version, v.descripcion);
            }
        }
        return campos.some((campo) => IT.normalizar(campo).includes(termino));
    }

    function filtrar({ productos, busqueda, categoria }) {
        const termino = IT.normalizar(busqueda);

        // copia para no mutar el catálogo original al ordenar
        const resultado = productos.filter(
            (p) =>
                (!categoria || p.categoria === categoria) &&
                coincideBusqueda(p, termino)
        );

        // Orden único del sitio: novedades primero, luego más recientes
        return resultado.sort(IT.comparadorNovedadFecha);
    }

    /* -------------------------- Paginación --------------------------- */

    // Ventana de páginas a mostrar, con elipsis (…) en los huecos.
    // Ej: total 18, actual 9 -> [1, "…", 8, 9, 10, "…", 18]
    function rangoPaginas(actual, total) {
        const delta = 1;
        const paginas = [];
        const izq = Math.max(2, actual - delta);
        const der = Math.min(total - 1, actual + delta);

        paginas.push(1);
        if (izq > 2) paginas.push("…");
        for (let i = izq; i <= der; i++) paginas.push(i);
        if (der < total - 1) paginas.push("…");
        if (total > 1) paginas.push(total);

        return paginas;
    }

    /* ------------------------------ Render --------------------------- */

    function crearBadge(clase, texto) {
        const badge = document.createElement("div");
        badge.classList.add(clase);
        badge.textContent = texto;
        return badge;
    }

    function crearCard(prod) {
        const ultimaVersion = prod.versiones[prod.versiones.length - 1];

        const card = document.createElement("div");
        card.className = "producto-card";
        card.setAttribute("role", "listitem");
        card.setAttribute("itemscope", "");
        card.setAttribute("itemtype", "https://schema.org/Product");

        card.innerHTML = `
            <img class="img-card" src="${ultimaVersion.imagenes[0]}" alt="${prod.nombre}" itemprop="image">
            <h3 class="title-card" itemprop="name">${prod.nombre}</h3>
            <a href="detalles.html?id=${prod.id}" class="btn-card" itemprop="url">Ver más</a>
        `;

        if (prod.versiones.length > 1) {
            card.appendChild(crearBadge("producto-versiones", "Varias versiones"));
        }
        if (IT.esNovedad(prod)) {
            card.appendChild(crearBadge("producto-nuevo", "Nuevo ingreso"));
        }

        card.addEventListener("click", () => {
            window.location.href = `detalles.html?id=${prod.id}`;
        });

        return card;
    }

    function renderCards(productos) {
        dom.contenedor.innerHTML = "";

        if (productos.length === 0) {
            dom.mensaje.textContent = "No hay productos para mostrar...";
            dom.mensaje.style.display = "block";
            return;
        }
        dom.mensaje.textContent = "";
        dom.mensaje.style.display = "none";

        const fragment = document.createDocumentFragment();
        productos.forEach((prod) => fragment.appendChild(crearCard(prod)));
        dom.contenedor.appendChild(fragment);
    }

    // Indicador de rango: "1–12 de 216 productos"
    function renderRangoInfo(total, inicio, fin) {
        dom.rangoInfo.textContent =
            total === 0 ? "0 productos" : `${inicio}–${fin} de ${total} productos`;
    }

    function renderPaginacion(totalPaginas) {
        dom.paginacion.innerHTML = "";
        if (totalPaginas <= 1) return;

        const irA = (pagina) => {
            estado.paginaActual = pagina;
            aplicarFiltros();
            scrollAlCatalogo();
        };

        dom.paginacion.appendChild(
            crearBotonPagina("‹", estado.paginaActual - 1, {
                deshabilitado: estado.paginaActual === 1,
                aria: "Página anterior",
                onClick: irA
            })
        );

        for (const item of rangoPaginas(estado.paginaActual, totalPaginas)) {
            if (item === "…") {
                const span = document.createElement("span");
                span.className = "pagina-elipsis";
                span.textContent = "…";
                dom.paginacion.appendChild(span);
            } else {
                dom.paginacion.appendChild(
                    crearBotonPagina(item, item, {
                        activa: item === estado.paginaActual,
                        aria: `Página ${item}`,
                        onClick: irA
                    })
                );
            }
        }

        dom.paginacion.appendChild(
            crearBotonPagina("›", estado.paginaActual + 1, {
                deshabilitado: estado.paginaActual === totalPaginas,
                aria: "Página siguiente",
                onClick: irA
            })
        );
    }

    function crearBotonPagina(texto, pagina, { activa, deshabilitado, aria, onClick }) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pagina-btn";
        btn.textContent = texto;
        if (aria) btn.setAttribute("aria-label", aria);

        if (activa) {
            btn.classList.add("activa");
            btn.setAttribute("aria-current", "page");
        }
        if (deshabilitado) {
            btn.disabled = true;
        } else {
            btn.addEventListener("click", () => onClick(pagina));
        }
        return btn;
    }

    /* --------------------------- Orquestación ------------------------ */

    function aplicarFiltros() {
        const filtrados = filtrar(estado);
        const total = filtrados.length;
        const totalPaginas = Math.max(1, Math.ceil(total / estado.porPagina));

        estado.paginaActual = Math.min(Math.max(1, estado.paginaActual), totalPaginas);

        const desde = (estado.paginaActual - 1) * estado.porPagina;
        const hasta = desde + estado.porPagina;
        const pagina = filtrados.slice(desde, hasta);

        renderCards(pagina);
        renderRangoInfo(total, desde + 1, Math.min(hasta, total));
        renderPaginacion(totalPaginas);
        sincronizarURL();
    }

    function scrollAlCatalogo() {
        const top = dom.contenedor.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: "smooth" });
    }

    function sincronizarURL() {
        const params = new URLSearchParams();
        if (estado.busqueda) params.set("busqueda", estado.busqueda);
        if (estado.categoria) params.set("categoria", estado.categoria);
        if (estado.porPagina !== POR_PAGINA_DEFAULT) params.set("porPagina", estado.porPagina);
        if (estado.paginaActual > 1) params.set("pagina", estado.paginaActual);

        const query = params.toString();
        history.replaceState(null, "", query ? `?${query}` : location.pathname);
    }

    function marcarChipActiva() {
        dom.chips.forEach((chip) =>
            chip.classList.toggle("activa", chip.value === estado.categoria)
        );
    }

    function mostrarClearBtn() {
        dom.clearBtn.style.display = dom.input.value.length > 0 ? "block" : "none";
    }

    /* --------- Estado inicial desde la URL (deep-links / SEO) -------- */
    function leerEstadoInicial() {
        const params = new URLSearchParams(location.search);
        estado.busqueda = params.get("busqueda") || "";
        estado.categoria = params.get("categoria") || "";

        const pp = parseInt(params.get("porPagina"), 10);
        estado.porPagina = OPCIONES_POR_PAGINA.includes(pp) ? pp : POR_PAGINA_DEFAULT;

        const pag = parseInt(params.get("pagina"), 10);
        estado.paginaActual = Number.isInteger(pag) && pag > 0 ? pag : 1;

        dom.input.value = estado.busqueda;
        dom.porPagina.value = String(estado.porPagina);
    }

    /* ----------------------------- Eventos --------------------------- */
    function conectarEventos() {
        dom.form.addEventListener("submit", (e) => e.preventDefault());

        const buscarDebounced = IT.debounce(() => {
            estado.busqueda = dom.input.value.trim();
            estado.paginaActual = 1;
            aplicarFiltros();
        }, DEBOUNCE_MS);

        dom.input.addEventListener("input", () => {
            mostrarClearBtn();
            buscarDebounced();
        });

        dom.clearBtn.addEventListener("click", () => {
            dom.input.value = "";
            estado.busqueda = "";
            estado.paginaActual = 1;
            mostrarClearBtn();
            dom.input.focus();
            aplicarFiltros();
        });

        dom.chips.forEach((chip) => {
            chip.addEventListener("click", () => {
                estado.categoria = chip.value;
                estado.paginaActual = 1;
                marcarChipActiva();
                aplicarFiltros();
            });
        });

        dom.porPagina.addEventListener("change", () => {
            estado.porPagina = parseInt(dom.porPagina.value, 10) || POR_PAGINA_DEFAULT;
            estado.paginaActual = 1;
            aplicarFiltros();
        });
    }

    /* ------------------------------- Init ---------------------------- */
    async function init() {
        dom.input = document.getElementById("texto");
        dom.clearBtn = document.getElementById("clearInput");
        dom.porPagina = document.getElementById("porPagina");
        dom.chips = Array.from(document.querySelectorAll(".chip"));
        dom.contenedor = document.getElementById("contenedor-productos");
        dom.rangoInfo = document.getElementById("rango-info");
        dom.paginacion = document.getElementById("paginacion");
        dom.mensaje = document.getElementById("mensaje-productos");
        dom.form = document.querySelector("form.busqueda");

        leerEstadoInicial();
        mostrarClearBtn();
        marcarChipActiva();
        conectarEventos();

        try {
            const data = await IT.cargarCatalogo();
            estado.productos = data.filter((p) => p.activo === true);
            aplicarFiltros();
        } catch (err) {
            console.error("Error al cargar productos:", err);
            dom.mensaje.textContent =
                "No se pudieron cargar los productos. Intentá de nuevo más tarde.";
            dom.mensaje.style.display = "block";
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
