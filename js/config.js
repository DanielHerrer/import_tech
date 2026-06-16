/* =====================================================================
   config.js — Configuración y utilidades compartidas de Import Tech BA

   ⚠️ IMPORTANTE: este archivo debe cargarse ANTES que el resto de los
   scripts de cada página (global.js, index.js, productos.js, etc.).

   Centraliza acá todo lo que antes estaba repetido en varios archivos:
   la ruta del JSON, los nombres de novedades, el número de WhatsApp y
   las funciones que se usan en más de una página.
   ===================================================================== */

const IT = (() => {
    "use strict";

    /* ----------------------------- Constantes ----------------------------- */
    const RUTA_JSON = "../data/productos_2026-06-15_20-23-03.json";

    const NOMBRES_NOVEDAD = [
        "Samsung Galaxy A57",
        "Samsung Galaxy S26",
        "Samsung Galaxy S26 Plus",
        "Samsung Galaxy S26 Ultra"
    ];

    const WHATSAPP = "5491165835895";

    /* ----------------------------- Utilidades ----------------------------- */

    const esNovedad = (producto) => NOMBRES_NOVEDAD.includes(producto.nombre);

    // Texto normalizado: minúsculas + sin acentos (búsqueda tolerante).
    const normalizar = (txt) =>
        (txt ?? "")
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    // Debounce genérico reutilizable.
    const debounce = (fn, ms) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), ms);
        };
    };

    // Orden único usado en todo el sitio:
    // novedades primero y, dentro de cada grupo, más recientes primero.
    const comparadorNovedadFecha = (a, b) => {
        const an = esNovedad(a);
        const bn = esNovedad(b);
        if (an !== bn) return an ? -1 : 1;
        return new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion);
    };

    // Filtra activos y los devuelve ya ordenados (sin mutar el original).
    const ordenarCatalogo = (productos) =>
        productos.filter((p) => p.activo === true).sort(comparadorNovedadFecha);

    // Cantidad de productos destacados según el ancho de pantalla.
    const cantidadDestacados = () => {
        const ancho = window.innerWidth;
        if (ancho >= 992) return 8; // PC
        if (ancho >= 576) return 6; // Tablet
        return 4;                   // Celular
    };

    // Descarga el catálogo (una sola vez por página).
    const cargarCatalogo = async () => {
        const resp = await fetch(RUTA_JSON);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        return resp.json();
    };

    // Arma una URL de WhatsApp con el mensaje ya codificado.
    const urlWhatsApp = (texto) =>
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;

    return {
        RUTA_JSON,
        NOMBRES_NOVEDAD,
        WHATSAPP,
        esNovedad,
        normalizar,
        debounce,
        comparadorNovedadFecha,
        ordenarCatalogo,
        cantidadDestacados,
        cargarCatalogo,
        urlWhatsApp
    };
})();
