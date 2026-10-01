"use strict";

const buscador = document.querySelector("#buscador");

const ruta = document.querySelector("#ruta");
const botonVolver = document.querySelector("#boton-volver");
const vistaCategorias = document.querySelector("#vista-categorias");
const vistaMarcas = document.querySelector("#vista-marcas");
const vistaProductos = document.querySelector("#vista-productos");

const contenedorCategorias = document.querySelector("#categorias");
const contenedorMarcas = document.querySelector("#marcas");
const contenedorProductos = document.querySelector("#productos");

const tituloMarcas = document.querySelector("#titulo-marcas");
const tituloProductos = document.querySelector("#titulo-productos");

const estado = document.querySelector("#estado");
const mensajeError = document.querySelector("#mensaje-error");

const panelFiltros = document.querySelector("#panel-filtros");

const filtroEtapa = document.querySelector("#filtro-etapa");
const filtroTipo = document.querySelector("#filtro-tipo");
const filtroIndicacion = document.querySelector("#filtro-indicacion");

const grupoEtapa = document.querySelector("#grupo-etapa");
const grupoTipo = document.querySelector("#grupo-tipo");
const grupoIndicacion = document.querySelector("#grupo-indicacion");

const botonLimpiarFiltros = document.querySelector("#limpiar-filtros");

let productos = [];

let vistaActual = "inicio";
let categoriaSeleccionada = "";
let marcaSeleccionada = "";

const localesWhatsApp = {
    local1: {
        nombre: "Local Calle 1",
        telefono: "5492214182251"
    },

    local122: {
        nombre: "Local Calle 122",
        telefono: "5492215934569"
    }
};

const etiquetasCategoria = {
    perros: "Perros",
    gatos: "Gatos"
};


/* =========================================================
   UTILIDADES
========================================================= */

function normalizar(texto) {
    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


function crearElemento(etiqueta, clase, texto) {
    const elemento = document.createElement(etiqueta);

    if (clase) {
        elemento.className = clase;
    }

    if (texto !== undefined) {
        elemento.textContent = texto;
    }

    return elemento;
}


function crearBoton(texto, clase, accion) {
    const boton = crearElemento(
        "button",
        clase,
        texto
    );

    boton.type = "button";

    boton.addEventListener(
        "click",
        accion
    );

    return boton;
}

function consultarPorWhatsApp(
    producto,
    local
) {

    const mensaje =
        `Hola, quisiera consultar por el producto ${producto.nombre}.`;

    const url =
        `https://wa.me/${local.telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );
}

/* =========================================================
   DATOS DEL CATÁLOGO
========================================================= */

function obtenerCategorias() {
    return [
        ...new Set(
            productos.map(
                (producto) => producto.categoria
            )
        )
    ].filter(
        (categoria) => etiquetasCategoria[categoria]
    );
}


function obtenerProductosCategoria(categoria) {
    return productos.filter(
        (producto) => {
            return producto.categoria === categoria;
        }
    );
}


function obtenerMarcas(categoria) {
    return [
        ...new Set(
            obtenerProductosCategoria(categoria)
                .map(
                    (producto) => producto.marca
                )
        )
    ].sort(
        (a, b) => a.localeCompare(b, "es")
    );
}


/* =========================================================
   VISTAS
========================================================= */

function mostrarVista(nombre) {
    vistaCategorias.hidden =
        nombre !== "inicio";

    vistaMarcas.hidden =
        nombre !== "marcas";

    vistaProductos.hidden =
        !["productos", "busqueda"].includes(nombre);
}


/* =========================================================
   BREADCRUMB
========================================================= */

function agregarPasoRuta(texto, accion) {
    if (ruta.childElementCount > 0) {
        ruta.append(
            crearElemento(
                "span",
                "",
                "›"
            )
        );
    }

    if (accion) {
        ruta.append(
            crearBoton(
                texto,
                "",
                accion
            )
        );
    } else {
        ruta.append(
            crearElemento(
                "span",
                "",
                texto
            )
        );
    }
}


function renderizarRuta() {
    ruta.replaceChildren();

    if (vistaActual === "inicio") {
        return;
    }

    agregarPasoRuta(
        "Inicio",
        irInicio
    );

    if (vistaActual === "busqueda") {
        agregarPasoRuta(
            "Resultados de búsqueda"
        );

        return;
    }

    agregarPasoRuta(
        etiquetasCategoria[categoriaSeleccionada],

        vistaActual === "productos"
            ? () => seleccionarCategoria(
                categoriaSeleccionada
            )
            : null
    );

    if (vistaActual === "productos") {
        agregarPasoRuta(
            marcaSeleccionada
        );
    }
}


/* =========================================================
   CATEGORÍAS

   Las imágenes ya contienen visualmente
   "Gatos" y "Perros".
========================================================= */

function renderizarCategorias() {
    contenedorCategorias.replaceChildren();

    const categorias =
        obtenerCategorias();

    for (const categoria of categorias) {

        const boton = crearBoton(
            "",
            "tarjeta-navegacion tarjeta-categoria",
            () => seleccionarCategoria(categoria)
        );

        const imagen =
            document.createElement("img");

        imagen.className =
            "imagen-categoria";

        imagen.src =
            categoria === "perros"
                ? "./assets/categorias/perro.png"
                : "./assets/categorias/gato.png";

        imagen.alt =
            categoria === "perros"
                ? "Alimentos para perros"
                : "Alimentos para gatos";

        imagen.loading = "eager";
        imagen.decoding = "async";

        boton.append(imagen);

        contenedorCategorias.append(boton);
    }
}


/* =========================================================
   MARCAS
========================================================= */

function obtenerRutaLogoMarca(marca) {

    const nombreArchivo = String(marca ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "y")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    return `./assets/marcas/${nombreArchivo}.png`;
}

function renderizarMarcas() {

    contenedorMarcas.replaceChildren();


    tituloMarcas.textContent =
        `Marcas de alimentos para ${categoriaSeleccionada}`;


    const marcas =
        obtenerMarcas(categoriaSeleccionada);


    for (const marca of marcas) {

        const boton = crearBoton(
            "",
            "tarjeta-navegacion tarjeta-marca",
            () => seleccionarMarca(marca)
        );


        /*
         * Accesibilidad.
         *
         * Aunque visualmente mostremos solamente
         * el logo, el botón sigue teniendo un
         * nombre accesible.
         */
        boton.setAttribute(
            "aria-label",
            `Ver productos de ${marca}`
        );


        /*
         * CONTENEDOR DEL LOGO
         */
        const contenedorLogo =
            crearElemento(
                "div",
                "contenedor-logo-marca"
            );


        /*
         * IMAGEN
         */
        const imagen =
            document.createElement("img");


        imagen.className =
            "logo-marca";


        imagen.src =
            obtenerRutaLogoMarca(marca);


        imagen.alt =
            `Logo de ${marca}`;


        imagen.loading =
            "lazy";


        imagen.decoding =
            "async";


        /*
         * FALLBACK
         *
         * Si todavía no existe el PNG de una
         * determinada marca, ocultamos la imagen
         * y mostramos el nombre.
         */
        const fallback =
            crearElemento(
                "span",
                "nombre-marca-fallback",
                marca
            );


        fallback.hidden = true;


        imagen.addEventListener(
            "error",
            () => {

                imagen.hidden = true;

                fallback.hidden = false;
            }
        );


        contenedorLogo.append(
            imagen,
            fallback
        );


        boton.append(
            contenedorLogo
        );


        contenedorMarcas.append(
            boton
        );
    }
}


/* =========================================================
   BÚSQUEDA
========================================================= */

function coincideBusqueda(
    producto,
    consulta
) {

    const variantes =
        obtenerVariantes(producto);

    const sabores = variantes
        .map(
            (variante) => variante.nombre
        )
        .join(" ");

    const pesos = variantes
        .flatMap(
            (variante) => variante.pesos
        )
        .map(
            (peso) => formatearPeso(peso)
        )
        .join(" ");

    const textoBuscable = [
        producto.nombre,
        producto.marca,
        producto.categoria,
        producto.etapaVida,
        producto.tipoAlimento,
        producto.indicacion,
        ...(producto.tamanoRaza ?? []),
        sabores,
        pesos
    ].join(" ");

    return normalizar(textoBuscable)
        .includes(consulta);
}


/* =========================================================
   VARIANTES DE PRODUCTO
========================================================= */

function obtenerVariantes(producto) {

    return (producto.sabores ?? []).map(
        (sabor) => ({
            nombre: sabor.nombre,
            imagen: sabor.imagen,
            pesos: sabor.presentaciones ?? []
        })
    );
}


/* =========================================================
   PESOS
========================================================= */

function formatearPeso(peso) {
    return `${peso} kg`;
}


function crearEtiquetasPeso(pesos) {

    const contenedor =
        crearElemento(
            "div",
            "etiquetas-peso"
        );

    const pesosUnicos = [
        ...new Set(
            Array.isArray(pesos)
                ? pesos
                : []
        )
    ];

    for (const peso of pesosUnicos) {

        contenedor.append(
            crearElemento(
                "span",
                "etiqueta-peso",
                formatearPeso(peso)
            )
        );
    }

    return contenedor;
}

function formatearSabor(valor) {

    const texto = String(valor ?? "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase("es");

    if (!texto) {
        return "";
    }

    return (
        texto.charAt(0).toLocaleUpperCase("es") +
        texto.slice(1)
    );
}


/* =========================================================
   TARJETA DE PRODUCTO
   ETAPA 1
========================================================= */

function crearTarjetaProducto(producto) {

    const tarjeta =
        crearElemento(
            "article",
            "tarjeta-producto"
        );


    /* -----------------------------------------------------
       VARIANTES
    ----------------------------------------------------- */

    const variantes =
        obtenerVariantes(producto);

    let varianteActual =
        variantes[0];


    /* -----------------------------------------------------
       MARCA
    ----------------------------------------------------- */

    const marca =
        crearElemento(
            "span",
            "marca-producto",
            producto.marca
        );

    tarjeta.append(marca);


    /* -----------------------------------------------------
       IMAGEN
    ----------------------------------------------------- */

    const contenedorImagen =
        crearElemento(
            "div",
            "contenedor-imagen-producto"
        );

    const imagen =
        document.createElement("img");

    imagen.className =
        "imagen-producto";

    imagen.alt =
        `${producto.nombre} para ${producto.categoria}`;

    imagen.loading = "lazy";
    imagen.decoding = "async";

    contenedorImagen.append(imagen);

    tarjeta.append(contenedorImagen);


    /* -----------------------------------------------------
       INFORMACIÓN
    ----------------------------------------------------- */

    const informacion =
        crearElemento(
            "div",
            "informacion-producto"
        );


    /* -----------------------------------------------------
       NOMBRE
    ----------------------------------------------------- */

    const nombre =
        crearElemento(
            "h3",
            "nombre-producto",
            producto.nombre
        );

    informacion.append(nombre);


    /* -----------------------------------------------------
   ETAPA DE VIDA
----------------------------------------------------- */

    if (
        producto.etapaVida !== null &&
        producto.etapaVida !== undefined &&
        String(producto.etapaVida).trim() !== ""
    ) {

        const bloqueEtapa = crearElemento(
            "div",
            "bloque-etapa"
        );

        const etiquetaEtapa = crearElemento(
            "span",
            "etiqueta-info",
            "Etapa"
        );

        const valorEtapa = crearElemento(
            "span",
            "valor-etapa",
            formatearEtiqueta(producto.etapaVida)
        );

        bloqueEtapa.append(
            etiquetaEtapa,
            valorEtapa
        );

        informacion.append(
            bloqueEtapa
        );
    }
    /* -----------------------------------------------------
       SABOR
    ----------------------------------------------------- */

    const bloqueSabor =
        crearElemento(
            "div",
            "bloque-sabor"
        );

    const etiquetaSabor =
        crearElemento(
            "span",
            "etiqueta-info",
            "Sabor"
        );

    const valorSabor =
        crearElemento(
            "span",
            "valor-sabor"
        );

    bloqueSabor.append(
        etiquetaSabor,
        valorSabor
    );

    informacion.append(
        bloqueSabor
    );


    /* -----------------------------------------------------
       PROTEÍNA
    ----------------------------------------------------- */

    const tieneProteina =
        producto.proteina !== null &&
        producto.proteina !== undefined &&
        producto.proteina !== "";

    if (tieneProteina) {

        const bloqueProteina =
            crearElemento(
                "div",
                "bloque-proteina"
            );

        const etiquetaProteina =
            crearElemento(
                "span",
                "etiqueta-info",
                "Proteína"
            );

        const valorProteina =
            crearElemento(
                "span",
                "valor-proteina",
                `${producto.proteina}%`
            );

        bloqueProteina.append(
            etiquetaProteina,
            valorProteina
        );

        informacion.append(
            bloqueProteina
        );
    }


    /* -----------------------------------------------------
       SELECTOR DE SABORES
    ----------------------------------------------------- */

    const contenedorSabores =
        crearElemento(
            "div",
            "selector-sabores"
        );


    /* -----------------------------------------------------
       PRESENTACIONES
    ----------------------------------------------------- */

    const contenedorPesos =
        crearElemento(
            "div",
            "presentaciones-producto"
        );


    /* -----------------------------------------------------
       ACTUALIZAR VARIANTE
    ----------------------------------------------------- */

    function actualizarVariante(variante) {

        varianteActual = variante;


        /* IMAGEN */

        imagen.src =
            varianteActual.imagen ?? "";


        /* ALT */

        imagen.alt =
            varianteActual.nombre

                ? `${producto.nombre}, sabor ${varianteActual.nombre}`

                : `${producto.nombre} para ${producto.categoria}`;


        /* SABOR */

        if (varianteActual.nombre) {

            valorSabor.textContent =
                formatearSabor(
                    varianteActual.nombre
                );

            bloqueSabor.hidden = false;

        } else {

            valorSabor.textContent = "";

            bloqueSabor.hidden = true;
        }


        /* PESOS */

        contenedorPesos.replaceChildren(
            ...crearEtiquetasPeso(
                varianteActual.pesos ?? []
            ).children
        );


        /* BOTÓN ACTIVO */

        for (
            const boton
            of contenedorSabores
                .querySelectorAll(
                    ".boton-sabor"
                )
        ) {

            boton.setAttribute(
                "aria-pressed",

                String(
                    boton.dataset.sabor ===
                    varianteActual.nombre
                )
            );
        }
    }


    /* -----------------------------------------------------
       SI EXISTEN VARIOS SABORES
    ----------------------------------------------------- */

    if (variantes.length > 1) {

        for (const variante of variantes) {

            const boton =
                crearBoton(
                    formatearEtiqueta(
                        variante.nombre
                    ),

                    "boton-sabor",

                    () =>
                        actualizarVariante(
                            variante
                        )
                );

            boton.dataset.sabor =
                variante.nombre;

            boton.setAttribute(
                "aria-pressed",
                "false"
            );

            contenedorSabores.append(
                boton
            );
        }

        informacion.append(
            contenedorSabores
        );
    }


    /* -----------------------------------------------------
       PRESENTACIONES
    ----------------------------------------------------- */

    informacion.append(
        contenedorPesos
    );

    /* -----------------------------------------------------
       CONSULTA POR WHATSAPP
    ----------------------------------------------------- */

    const bloqueConsulta =
        crearElemento(
            "div",
            "bloque-consulta"
        );


    const botonConsultar =
        crearBoton(
            "Consultar",
            "boton-consultar",
            () => {

                const estaAbierto =
                    bloqueConsulta.classList.contains(
                        "activo"
                    );

                /*
                 * Cerramos cualquier otro selector
                 * de WhatsApp que esté abierto.
                 */
                document
                    .querySelectorAll(".bloque-consulta.activo")
                    .forEach((bloqueAbierto) => {

                        if (bloqueAbierto !== bloqueConsulta) {

                            bloqueAbierto.classList.remove("activo");

                            const botonAbierto =
                                bloqueAbierto.querySelector(
                                    ".boton-consultar"
                                );

                            botonAbierto?.setAttribute(
                                "aria-expanded",
                                "false"
                            );
                        }
                    });

                /*
                 * Abrimos o cerramos el selector
                 * correspondiente a esta card.
                 */
                bloqueConsulta.classList.toggle(
                    "activo",
                    !estaAbierto
                );

                botonConsultar.setAttribute(
                    "aria-expanded",
                    String(!estaAbierto)
                );
            }
        );


    botonConsultar.setAttribute(
        "aria-expanded",
        "false"
    );


    const selectorLocal =
        crearElemento(
            "div",
            "selector-local"
        );


    const textoLocal =
        crearElemento(
            "span",
            "texto-selector-local",
            "¿En qué local querés consultar?"
        );


    const botonesLocales =
        crearElemento(
            "div",
            "botones-locales"
        );


    const botonLocal1 =
        crearBoton(
            "Local 1",
            "boton-local",
            () => consultarPorWhatsApp(
                producto,
                localesWhatsApp.local1
            )
        );


    const botonLocal122 =
        crearBoton(
            "Local 122",
            "boton-local",
            () => consultarPorWhatsApp(
                producto,
                localesWhatsApp.local122
            )
        );


    botonesLocales.append(
        botonLocal1,
        botonLocal122
    );


    selectorLocal.append(
        textoLocal,
        botonesLocales
    );


    bloqueConsulta.append(
        botonConsultar,
        selectorLocal
    );


    informacion.append(
        bloqueConsulta
    );


    /* -----------------------------------------------------
       FINALIZAR CARD
    ----------------------------------------------------- */

    tarjeta.append(
        informacion
    );

    actualizarVariante(
        varianteActual
    );

    return tarjeta;
}


/* =========================================================
   RENDERIZAR LISTADO
========================================================= */

function renderizarListado(lista) {

    contenedorProductos.replaceChildren();

    estado.textContent =
        `${lista.length} productos encontrados.`;

    if (lista.length === 0) {

        estado.textContent =
            "No encontramos productos con esos criterios.";

        return;
    }

    for (const producto of lista) {

        contenedorProductos.append(
            crearTarjetaProducto(producto)
        );
    }
}


/* =========================================================
   PRODUCTOS DE UNA MARCA
========================================================= */

function obtenerProductosMarca() {

    return obtenerProductosCategoria(
        categoriaSeleccionada
    )
        .filter(
            (producto) =>
                producto.marca ===
                marcaSeleccionada
        );
}


/* =========================================================
   FILTROS
========================================================= */

function obtenerValoresDisponibles(
    lista,
    campo
) {

    return [
        ...new Set(
            lista
                .map(
                    (producto) =>
                        producto[campo]
                )
                .filter(
                    (valor) =>
                        typeof valor === "string" &&
                        valor.trim() !== ""
                )
        )
    ].sort(
        (a, b) =>
            a.localeCompare(b, "es")
    );
}


function formatearEtiqueta(valor) {

    return String(valor ?? "")
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\p{L}/gu,
            (letra) =>
                letra.toUpperCase()
        );
}


function cargarOpcionesFiltro(
    select,
    valores
) {

    /*
     * Conserva la primera opción:
     * "Todas las..."
     */

    select.replaceChildren(
        select.options[0]
    );

    for (const valor of valores) {

        const opcion =
            document.createElement(
                "option"
            );

        opcion.value =
            valor;

        opcion.textContent =
            formatearEtiqueta(valor);

        select.append(opcion);
    }
}


function prepararFiltros() {

    const lista =
        obtenerProductosMarca();

    const etapas =
        obtenerValoresDisponibles(
            lista,
            "etapaVida"
        );

    const tipos =
        obtenerValoresDisponibles(
            lista,
            "tipoAlimento"
        );

    const indicaciones =
        obtenerValoresDisponibles(
            lista,
            "indicacion"
        );


    cargarOpcionesFiltro(
        filtroEtapa,
        etapas
    );

    cargarOpcionesFiltro(
        filtroTipo,
        tipos
    );

    cargarOpcionesFiltro(
        filtroIndicacion,
        indicaciones
    );


    grupoEtapa.hidden =
        etapas.length === 0;

    grupoTipo.hidden =
        tipos.length === 0;

    grupoIndicacion.hidden =
        indicaciones.length === 0;


    panelFiltros.hidden =
        etapas.length === 0 &&
        tipos.length === 0 &&
        indicaciones.length === 0;


    limpiarSeleccionFiltros();
}


function limpiarSeleccionFiltros() {

    filtroEtapa.value = "";
    filtroTipo.value = "";
    filtroIndicacion.value = "";

    botonLimpiarFiltros.hidden = true;
}


function coincideConFiltros(producto) {

    const coincideEtapa =
        !filtroEtapa.value ||
        producto.etapaVida ===
        filtroEtapa.value;

    const coincideTipo =
        !filtroTipo.value ||
        producto.tipoAlimento ===
        filtroTipo.value;

    const coincideIndicacion =
        !filtroIndicacion.value ||
        producto.indicacion ===
        filtroIndicacion.value;

    return (
        coincideEtapa &&
        coincideTipo &&
        coincideIndicacion
    );
}


function actualizarBotonLimpiar() {

    botonLimpiarFiltros.hidden =
        !filtroEtapa.value &&
        !filtroTipo.value &&
        !filtroIndicacion.value;
}


/* =========================================================
   RENDERIZAR PRODUCTOS POR MARCA
========================================================= */

function renderizarProductosMarca() {

    tituloProductos.textContent =
        `${marcaSeleccionada} · ${etiquetasCategoria[categoriaSeleccionada]}`;

    const resultados =
        obtenerProductosMarca()
            .filter(
                coincideConFiltros
            );

    renderizarListado(
        resultados
    );
}


/* =========================================================
   RENDERIZAR BÚSQUEDA
========================================================= */

function renderizarBusqueda() {

    tituloProductos.textContent =
        "Resultados de búsqueda";

    const consulta =
        normalizar(
            buscador.value
        );

    const resultados =
        productos.filter(
            (producto) => {

                return coincideBusqueda(
                    producto,
                    consulta
                );
            }
        );

    renderizarListado(
        resultados
    );
}


/* =========================================================
   ACTUALIZAR PANTALLA
========================================================= */

function actualizarPantalla() {

    const hayBusqueda =
        normalizar(
            buscador.value
        ) !== "";

    if (hayBusqueda) {

        mostrarVista(
            "busqueda"
        );

        panelFiltros.hidden = true;

        renderizarBusqueda();

    } else {

        mostrarVista(
            vistaActual
        );


        if (
            vistaActual === "inicio"
        ) {

            renderizarCategorias();
        }


        if (
            vistaActual === "marcas"
        ) {

            renderizarMarcas();
        }


        if (
            vistaActual === "productos"
        ) {

            panelFiltros.hidden =
                grupoEtapa.hidden &&
                grupoTipo.hidden &&
                grupoIndicacion.hidden;

            renderizarProductosMarca();
        }
    }


    if (hayBusqueda) {

        ruta.replaceChildren();

        agregarPasoRuta(
            "Inicio",
            irInicio
        );

        agregarPasoRuta(
            "Resultados de búsqueda"
        );

    } else {

        renderizarRuta();
    }

    actualizarBotonVolver();
}


/* =========================================================
   NAVEGACIÓN
========================================================= */

function volver() {

    const hayBusqueda =
        normalizar(buscador.value) !== "";

    /*
     * Si estamos viendo resultados de búsqueda,
     * volver nos lleva al inicio.
     */
    if (hayBusqueda) {

        irInicio();

        return;
    }


    /*
     * PRODUCTOS
     * ↓
     * MARCAS DE LA CATEGORÍA ACTUAL
     */
    if (vistaActual === "productos") {

        seleccionarCategoria(
            categoriaSeleccionada
        );

        return;
    }


    /*
     * MARCAS
     * ↓
     * INICIO / CATEGORÍAS
     */
    if (vistaActual === "marcas") {

        irInicio();
    }
}

function actualizarBotonVolver() {

    const hayBusqueda =
        normalizar(buscador.value) !== "";

    botonVolver.hidden =
        vistaActual === "inicio" &&
        !hayBusqueda;
}

function irInicio() {

    vistaActual = "inicio";

    categoriaSeleccionada = "";
    marcaSeleccionada = "";

    buscador.value = "";

    actualizarPantalla();
}


function seleccionarCategoria(
    categoria
) {

    vistaActual = "marcas";

    categoriaSeleccionada =
        categoria;

    marcaSeleccionada = "";

    buscador.value = "";

    actualizarPantalla();
}


function seleccionarMarca(
    marca
) {

    vistaActual =
        "productos";

    marcaSeleccionada =
        marca;

    buscador.value = "";

    prepararFiltros();

    actualizarPantalla();
}

botonVolver.addEventListener(
    "click",
    volver
);

/* =========================================================
   EVENTOS DE FILTROS
========================================================= */

function alCambiarFiltro() {

    actualizarBotonLimpiar();

    renderizarProductosMarca();
}


filtroEtapa.addEventListener(
    "change",
    alCambiarFiltro
);


filtroTipo.addEventListener(
    "change",
    alCambiarFiltro
);


filtroIndicacion.addEventListener(
    "change",
    alCambiarFiltro
);


botonLimpiarFiltros.addEventListener(
    "click",
    () => {

        limpiarSeleccionFiltros();

        renderizarProductosMarca();
    }
);


/* =========================================================
   CARGA DEL JSON
========================================================= */

async function cargarProductos() {

    try {

        const respuesta =
            await fetch(
                "./data/productos.json"
            );

        if (!respuesta.ok) {

            throw new Error(
                `Error HTTP ${respuesta.status}`
            );
        }


        const datos =
            await respuesta.json();


        if (!Array.isArray(datos)) {

            throw new Error(
                "El JSON debe contener una lista."
            );
        }


        productos = datos;

        mensajeError.hidden = true;

        actualizarPantalla();

    } catch (error) {

        console.error(
            "Error al cargar productos:",
            error
        );

        mensajeError.textContent =
            "No se pudo cargar el catálogo. Revisá productos.json y el servidor local.";

        mensajeError.hidden = false;
    }
}


/* =========================================================
   BUSCADOR
========================================================= */

buscador.addEventListener(
    "input",
    actualizarPantalla
);


/* =========================================================
   INICIO
========================================================= */

cargarProductos();