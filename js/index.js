const jsonProductos = "../data/productos_2026-06-15_20-23-03.json";
const nombresNovedad = ["Samsung Galaxy A57", "Samsung Galaxy S26", "Samsung Galaxy S26 Plus", "Samsung Galaxy S26 Ultra"];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(jsonProductos);
    const productos = await response.json();

    // Filtrar los que estén activos
    const productosActivos = productos.filter(p => p.activo === true);

    // Ordenar por fecha_publicacion (más reciente primero)
    const productosOrdenados = productosActivos.sort((a, b) =>
      new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
    );

    // Priorizar NOVEDADES al frente, respetando el orden por fecha dentro de cada grupo
    productosOrdenados.sort((a, b) => {
      const aEsNovedad = nombresNovedad.includes(a.nombre);
      const bEsNovedad = nombresNovedad.includes(b.nombre);
      if (aEsNovedad !== bEsNovedad) return aEsNovedad ? -1 : 1;
      return 0; // empate: mantiene el orden por fecha
    });

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
          <img class="img-card" src="${prod.versiones[prod.versiones.length - 1].imagenes[0] || 'placeholder.jpg'}" alt="${prod.nombre}">
        </div>
        <div class="producto-info">
          <h3 class="title-card">${prod.nombre}</h3>
          <p class="subtitle-card">${prod.marca} · ${prod.categoria}</p>
          <a src="" class="btn-card">Ver más</a>
        </div>
      `;

      // Agregar badge si hay varias versiones
      if (prod.versiones.length > 1) {
        const badge = document.createElement("div");
        badge.classList.add('producto-versiones');
        badge.textContent = "Varias versiones";

        // div.style.position = "relative"; // para que el badge quede dentro del div
        card.appendChild(badge);
      }

      // Si el nombre del producto coincide con las NOVEDADES entonces lo remarca
      if (nombresNovedad.includes(prod.nombre)) {
        const badge = document.createElement("div");
        badge.classList.add("producto-nuevo");
        badge.textContent = "Nuevo ingreso";
        card.appendChild(badge);
      }

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
