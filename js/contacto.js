function enviarWhatsApp(e) {
  e.preventDefault();

  // Obtener valores
  const nombre = document.getElementById("nombre").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const mensaje = document.getElementById("mensaje").value.trim();

  // Validar campos obligatorios
  if (!nombre || !mensaje) {
    alert("Por favor, completá tu nombre y mensaje.");
    return;
  }

  const numero = "5491165835895";

  // Construir mensaje dinámico
  let texto = `Hola, soy ${nombre}.\n\n${mensaje}`;

  if (email) texto += `\n📧 Email: ${email}`;
  if (telefono) texto += `\n📱 Teléfono: ${telefono}`;

  // Generar URL de WhatsApp
  const url = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  // Abrir WhatsApp
  window.open(url, "_blank");
}