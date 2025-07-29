document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("../data/lista-productosv2.txt");
    const productos = await response.json();

    // Filtrar los que estén activos
    const productosActivos = productos.filter(p => p.activo === true);

    // Ordenar por fecha_publicacion (más reciente primero)
    const productosOrdenados = productosActivos.sort((a, b) =>
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
        <div class="producto-img">
          <img class="img-card" src="${prod.imagenes[0] || 'placeholder.jpg'}" alt="${prod.nombre}">
        </div>
        <div class="producto-info">
          <h3 class="title-card">${prod.nombre}</h3>
          <p class="subtitle-card">${prod.marca} · ${prod.categoria}</p>
          <a src="" class="btn-card">Ver más</a>
        </div>
      `;

      // Al hacer clic → ir a la página de detalles
      card.addEventListener("click", () => {
        window.location.href = `./html/detalles.html?id=${prod.id}`;
      });

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error cargando productos destacados:", error);
  }
});
