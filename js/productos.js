async function cargarProductos() {
    const res = await fetch("../data/lista-productos.txt"); // o .json si preferís
    const productos = await res.json();

    // Asegurarte de que están ordenados por fecha (Mas reciente a Mas antiguo)
    productos.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

    return productos;
}

function mostrarProductos(productos) {
    let contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    if (productos.length === 0) {
        contenedor = document.querySelector(".productos");

        const mensaje = document.createElement('h1');
        mensaje.classList.add('mensaje-productos');
        mensaje.textContent = 'No hay productos para mostrar...';
        contenedor.appendChild(mensaje);
        return;
    }

    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto-card";
        div.innerHTML = `
      <img class="img-card" src="${prod.imagen}" alt="${prod.nombre}">
      <h3 class="title-card">${prod.nombre}</h3>
      <a href="productos.html?id=${prod.id}" class="btn-card">Ver más</a>
    `;
        contenedor.appendChild(div);
    });
}

function filtrarProductos(productos, { categoria, busqueda }) {
    return productos.filter(p => {
        const coincideCategoria = !categoria || p.categoria === categoria;
        const coincideBusqueda = !busqueda || (
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.marca.toLowerCase().includes(busqueda.toLowerCase())
        );
        return coincideCategoria && coincideBusqueda;
    });
}

function ordenarProductos(productos, orden) {
    switch (orden) {
        case "fecha_asc":
            return productos.sort((a, b) => new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion));
        case "fecha_desc":
            return productos.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        // Si en el futuro agregás precios:
        // case "precio_asc":
        //   return productos.sort((a, b) => a.precio - b.precio);
        // case "precio_desc":
        //   return productos.sort((a, b) => b.precio - a.precio);
        default:
            return productos;
    }
}

function mantenerValoresFormulario() {
    const params = new URLSearchParams(window.location.search);

    const categoria = params.get("categoria");
    const orden = params.get("orden");
    const busqueda = params.get("busqueda");

    if (categoria) {
        document.getElementById("categoria").value = categoria;
    }

    if (orden) {
        document.getElementById("orden").value = orden;
    }

    if (busqueda) {
        document.getElementById("texto").value = busqueda;
    }
}


// ⬇️ PROCESO PRINCIPAL

const params = new URLSearchParams(window.location.search);
const filtros = {
    categoria: params.get("categoria"),
    orden: params.get("orden"),
    busqueda: params.get("busqueda")
};

cargarProductos().then(productos => {
    let resultado = filtrarProductos(productos, filtros);
    resultado = ordenarProductos(resultado, filtros.orden);
    mostrarProductos(resultado);
});

document.addEventListener("DOMContentLoaded", () => {
    mantenerValoresFormulario();
});