const jsonProductos = "../data/productos_2025-12-16_20-22-57.json?v=2";
const nombresNovedad = ["Macbook Pro 14\" M5", "iPad Pro 11\" M5", "iPad Pro 13\" M5"];

async function cargarProductos() {
    const response = await fetch(jsonProductos);
    const productos = await response.json();
    // Filtrar los que estén activos
    const productosActivos = productos.filter(p => p.activo === true);

    // Ordenar por mas recientes primero
    productosActivos.sort((a, b) =>
        new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion)
    );

    // CARGADO DE PRODUCTOS con FILTRADO por URL
    //const params = new URLSearchParams(window.location.search);

    const texto = document.getElementById("texto").value.trim();
    const categoria = new URLSearchParams(window.location.search).get("categoria") || "";
    const orden = document.getElementById("orden").value;

    const filtros = {
        categoria: categoria,
        //categoria: params.get("categoria"),
        orden: orden,
        //orden: params.get("orden"),
        busqueda: texto
        //busqueda: params.get("busqueda")
    };

    let resultado = filtrarProductos(productosActivos, filtros);
    mostrarProductos(resultado);
}

function actualizarCantidad(productos) {
    let contenedor = document.getElementById("resultado-cant");
    contenedor.innerHTML = "";
    contenedor.textContent = `Se han encontrado ${productos.length} resultados`;
}

function mostrarProductos(productos) {

    let contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    actualizarCantidad(productos);

    let msjProductos = document.getElementById("mensaje-productos");
    msjProductos.textContent = '';

    // Si no hay productos para mostrar
    if (productos.length === 0) {
        msjProductos.textContent = 'No hay productos para mostrar...';
        msjProductos.style.display = "block";
        return;
    }

    productos.forEach(prod => {
        const div = document.createElement("div");
        div.className = "producto-card";
        div.setAttribute("role", "listitem");
        div.setAttribute("itemscope", "");
        div.setAttribute("itemtype", "https://schema.org/Product");

        div.innerHTML = `
            <img class="img-card" src="${prod.versiones[prod.versiones.length - 1].imagenes[0]}" alt="${prod.nombre}" itemprop="image">
            <h3 class="title-card" itemprop="name">${prod.nombre}</h3>
            <a href="detalles.html?id=${prod.id}" class="btn-card" itemprop="url">Ver más</a>
        `;

        // Si el producto tiene precio:
        // if (prod.precio) {
        //     const price = document.createElement("span");
        //     price.setAttribute("itemprop", "offers");
        //     price.setAttribute("itemscope", "");
        //     price.setAttribute("itemtype", "https://schema.org/Offer");
        //     price.innerHTML = `
        //         <meta itemprop="priceCurrency" content="ARS">
        //         <span itemprop="price">${prod.precio}</span>
        //     `;
        //     div.appendChild(price);
        // }

        // Agregar badge si hay varias versiones
        if (prod.versiones.length > 1) {
            const badge = document.createElement("div");
            badge.classList.add('producto-versiones');
            badge.textContent = "Varias versiones";
            div.appendChild(badge);
        }

        // Si el nombre del producto coincide con las NOVEDADES entonces lo remarca
        if (nombresNovedad.includes(prod.nombre)) {
            const badge = document.createElement("div");
            badge.classList.add("producto-nuevo");
            badge.textContent = "Novedad";
            div.appendChild(badge);
        }

        div.addEventListener("click", () => {
            window.location.href = `detalles.html?id=${prod.id}`;
        });

        contenedor.appendChild(div);
    });

}

function mostrarCategoriaActiva() {
    const params = new URLSearchParams(window.location.search);
    const categoriaActiva = params.get("categoria");

    // Marcar el botón activo según la URL
    if (categoriaActiva !== null) {
        document.querySelectorAll(".chip").forEach(chip => {
            if (chip.value === categoriaActiva) {
                chip.classList.add("activa");
            }
        });
    }
}

function filtrarProductos(productos, { categoria, orden, busqueda }) {

    const productosFiltrados = productos.filter(p => {
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

    switch (orden) {
        case "fecha_asc":
            return productosFiltrados.sort((a, b) => new Date(a.fecha_publicacion) - new Date(b.fecha_publicacion));
        case "fecha_desc":
            return productosFiltrados.sort((a, b) => new Date(b.fecha_publicacion) - new Date(a.fecha_publicacion));
        // Si en el futuro agregás precios:
        // case "precio_asc":
        //   return productos.sort((a, b) => a.precio - b.precio);
        // case "precio_desc":
        //   return productos.sort((a, b) => b.precio - a.precio);
        default:
            return productosFiltrados;
    }
}

function mantenerValoresFormulario() {
    // CARGADO DE PRODUCTOS con FILTRADO por URL
    const params = new URLSearchParams(window.location.search);

    const filtros = {
        categoria: params.get("categoria"),
        orden: params.get("orden"),
        busqueda: params.get("busqueda")
    };

    if (filtros.orden) {
        document.getElementById("orden").value = filtros.orden;
    }

    if (filtros.busqueda) {
        document.getElementById("texto").value = filtros.busqueda;
    }
}

// Cambia el CSS del boton de Busqueda segun el dispositivo (PC-Tablet-Celu)
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

// Funcion que carga por primera vez los productos
cargarProductos();

// SELECT DE ORDEN _______________________________
document.getElementById("orden").addEventListener("change", () => {
    cargarProductos();
});

// INPUT DE BUSQUEDA _______________________________
const input = document.getElementById("texto");
const clearBtn = document.getElementById("clearInput");

// Mostrar/ocultar la X
input.addEventListener("input", () => {
    clearBtn.style.display = input.value.length > 0 ? "block" : "none";
});

// Al hacer click, limpiar
clearBtn.addEventListener("click", () => {
    input.value = "";
    clearBtn.style.display = "none";
    input.focus();
});


// ⬇️ PROCESO PRINCIPAL
document.addEventListener("DOMContentLoaded", () => {

    // Si el usuario busco con filtros recientemente, que los valores se mantengan para visualizar
    mantenerValoresFormulario();

    // Cambia el CSS del boton de Busqueda
    actualizarBotonBuscar();

    mostrarCategoriaActiva();

    // Llamar cuando se cambia el tamaño de la ventana
    window.addEventListener("resize", actualizarBotonBuscar);

    // Mostrar/ocultar la X
    clearBtn.style.display = input.value.length > 0 ? "block" : "none";

});