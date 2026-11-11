/* =====================================================
   LAB ENACCIÓN
   Catálogo interactivo
===================================================== */

let documentos = [];

/* ===== CARGAR DOCUMENTOS.JSON ===== */

async function cargarDocumentos() {

  try {

    const respuesta = await fetch(
      "documentos.json?v=" + Date.now()
    );

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar documentos.json");
    }

    documentos = await respuesta.json();

    cargarAnios();
    mostrarDocumentos();
    crearNube();

  } catch (error) {

    console.error(error);

    document.getElementById("documentos").innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠</div>
        <h3>No se pudo cargar el catálogo</h3>
        <p>
          Revise que documentos.json exista
          en la raíz del repositorio.
        </p>
      </div>
    `;
  }
}


/* ===== GENERAR FILTRO DE AÑOS ===== */

function cargarAnios() {

  const selector =
    document.getElementById("filtro-anio");

  const anios = [
    ...new Set(
      documentos
        .map(documento => documento.anio)
        .filter(Boolean)
    )
  ].sort((a, b) => b - a);

  anios.forEach(anio => {

    const opcion =
      document.createElement("option");

    opcion.value = anio;
    opcion.textContent = anio;

    selector.appendChild(opcion);

  });
}


/* ===== FILTRAR DOCUMENTOS ===== */

function filtrarDocumentos() {

  const texto =
    document
      .getElementById("busqueda")
      .value
      .toLowerCase()
      .trim();

  const anio =
    document.getElementById("filtro-anio").value;

  const categoria =
    document.getElementById("filtro-categoria").value;

  return documentos.filter(documento => {

    const contenidoBusqueda = [
      documento.titulo || "",
      documento.categoria || "",
      ...(documento.palabras_clave || [])
    ]
      .join(" ")
      .toLowerCase();

    const coincideTexto =
      !texto ||
      contenidoBusqueda.includes(texto);

    const coincideAnio =
      !anio ||
      String(documento.anio) === anio;

    const coincideCategoria =
      !categoria ||
      documento.categoria === categoria;

    return (
      coincideTexto &&
      coincideAnio &&
      coincideCategoria
    );

  });
}


/* ===== MOSTRAR DOCUMENTOS ===== */

function mostrarDocumentos() {

  const resultados =
    filtrarDocumentos();

  const contenedor =
    document.getElementById("documentos");

  const contador =
    document.getElementById("contador");

  contador.textContent =
    `${resultados.length} documento${
      resultados.length === 1 ? "" : "s"
    }`;


  /* SIN RESULTADOS */

  if (resultados.length === 0) {

    contenedor.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">⌕</div>

        <h3>No hay documentos para mostrar</h3>

        <p>
          El repositorio está funcionando correctamente.
          Los documentos aparecerán aquí cuando sean
          incorporados e indexados.
        </p>

      </div>
    `;

    return;
  }


  /* CREAR TARJETAS */

  contenedor.innerHTML =
    resultados.map(documento => `

      <article class="document-card">

        <div class="badges">

          <span class="badge">
            ${escaparHTML(documento.categoria)}
          </span>

          <span class="badge badge-year">
            ${escaparHTML(documento.anio)}
          </span>

        </div>

        <h3>
          ${escaparHTML(documento.titulo)}
        </h3>

        ${
          documento.palabras_clave?.length
          ?
          `
          <p class="keywords">
            ${documento.palabras_clave
              .map(escaparHTML)
              .join(" · ")}
          </p>
          `
          :
          ""
        }

        <div class="document-footer">

          <span class="file-type">
            ${escaparHTML(
              documento.tipo || "DOCUMENTO"
            )}
          </span>

          <a
            class="open-document"
            href="${codificarRuta(documento.archivo)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir documento ↗
          </a>

        </div>

      </article>

    `).join("");
}


/* ===== NUBE DE PALABRAS ===== */

function crearNube() {

  const frecuencias = {};

  documentos.forEach(documento => {

    (documento.palabras_clave || [])
      .forEach(palabra => {

        const termino =
          palabra
            .toLowerCase()
            .trim();

        if (!termino) {
          return;
        }

        frecuencias[termino] =
          (frecuencias[termino] || 0) + 1;

      });

  });


  const palabras =
    Object.entries(frecuencias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);


  const nube =
    document.getElementById("nube-palabras");


  if (palabras.length === 0) {

    nube.innerHTML = `
      <span
        style="
          color:#65758B;
          font-size:0.84rem;
          line-height:1.5;
        "
      >
        La nube se generará automáticamente
        cuando existan documentos indexados.
      </span>
    `;

    return;
  }


  const frecuenciaMaxima =
    Math.max(
      ...palabras.map(
        elemento => elemento[1]
      )
    );


  nube.innerHTML =
    palabras.map(([palabra, frecuencia], indice) => {

      const tamano =
        0.82 +
        (frecuencia / frecuenciaMaxima) * 1.15;

      return `
        <span
          class="cloud-word"
          style="
            font-size:${tamano}rem;
            animation-delay:${indice * 0.1}s
          "
        >
          ${escaparHTML(palabra)}
        </span>
      `;

    }).join("");
}


/* ===== SEGURIDAD ===== */

function escaparHTML(valor) {

  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function codificarRuta(ruta) {

  return String(ruta || "")
    .split("/")
    .map(parte => encodeURIComponent(parte))
    .join("/");
}


/* ===== EVENTOS ===== */

document
  .getElementById("busqueda")
  .addEventListener(
    "input",
    mostrarDocumentos
  );


document
  .getElementById("filtro-anio")
  .addEventListener(
    "change",
    mostrarDocumentos
  );


document
  .getElementById("filtro-categoria")
  .addEventListener(
    "change",
    mostrarDocumentos
  );


/* ===== INICIAR LAB ENACCIÓN ===== */

cargarDocumentos();
