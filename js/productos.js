async function cargarProductos() {
    const res = await fetch("../data/lista-productosv3.json"); // o .json si preferís
    const productos = await res.json();
    // Filtrar los que estén activos
    const productosActivos = productos.filter(p => p.activo === true);

    // Asegurarte de que están ordenados por fecha (Mas reciente a Mas antiguo)
    productosActivos.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));

    return productosActivos;
}

function mostrarProductos(productos) {
    let contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    // Si no hay productos para mostrar
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
            <img class="img-card" src="${prod.versiones[0].imagenes[0]}" alt="${prod.nombre}">
            <h3 class="title-card">${prod.nombre}</h3>
            <a href="detalles.html?id=${prod.id}" class="btn-card">Ver más</a>
        `;

        // Agregar badge si hay varias versiones
        if (prod.versiones.length > 1) {
            const badge = document.createElement("div");
            badge.classList.add('producto-versiones');
            badge.textContent = "Varias versiones";

            // div.style.position = "relative"; // para que el badge quede dentro del div
            div.appendChild(badge);
        }

        // Hacer clickeable todo el div
        div.addEventListener("click", () => {
            window.location.href = `detalles.html?id=${prod.id}`;
        });

        contenedor.appendChild(div);
    });
}

function filtrarProductos(productos, { categoria, busqueda }) {
    return productos.filter(p => {
        const coincideCategoria = !categoria || p.categoria === categoria;

        const coincideBusqueda = !busqueda || (
            p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
            (p.versiones && p.versiones.some(v =>
                (v.nombre_version && v.nombre_version.toLowerCase().includes(busqueda.toLowerCase())) ||
                (v.descripcion && v.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
            ))
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

function actualizarBotonBuscar() {
    const btn = document.getElementById("btnBuscar");

    if (window.innerWidth > 767) {
        // Solo el ícono
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
        btn.style.borderRadius = '50%';
        btn.style.padding = '17px';
    } else {
        // Ícono + texto
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Buscar';
    }
}

// ⬇️ CARGADO DE PRODUCTOS con FILTRADO por URL
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


// ⬇️ PROCESO PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {

    // Si el usuario busco con filtros recientemente, que los valores se mantengan para visualizar
    mantenerValoresFormulario();

    // Llamar cuando se carga la página
    actualizarBotonBuscar();

    // Llamar cuando se cambia el tamaño de la ventana
    window.addEventListener("resize", actualizarBotonBuscar);

});