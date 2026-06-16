/* =====================================================================
   contacto.js — Envía el formulario de contacto por WhatsApp
   Requiere config.js cargado antes (usa el objeto IT).

   La función se expone en window porque el HTML la invoca con
   onsubmit="enviarWhatsApp(event)".
   ===================================================================== */

(() => {
    "use strict";

    function enviarWhatsApp(e) {
        e.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        if (!nombre || !mensaje) {
            alert("Por favor, completá tu nombre y mensaje.");
            return;
        }

        let texto = `Hola, soy ${nombre}.\n\n${mensaje}`;
        if (email) texto += `\n📧 Email: ${email}`;
        if (telefono) texto += `\n📱 Teléfono: ${telefono}`;

        window.open(IT.urlWhatsApp(texto), "_blank");
    }

    // Exponer para el onsubmit inline del formulario
    window.enviarWhatsApp = enviarWhatsApp;
})();
