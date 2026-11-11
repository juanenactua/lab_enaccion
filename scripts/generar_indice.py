from pathlib import Path
import json
import re


BASE = Path(__file__).resolve().parent.parent
DOCUMENTOS = BASE / "documentos"
SALIDA = BASE / "documentos.json"

CATEGORIAS = {
    "proyectos-investigacion": "Proyectos de investigación",
    "semillero-investigacion": "Semillero de investigación",
    "saberpro": "SaberPro",
    "internacionalizacion": "Internacionalización",
}

EXTENSIONES = {
    ".pdf": "PDF",
    ".html": "HTML",
    ".htm": "HTML",
}


def obtener_anio(nombre):
    coincidencia = re.match(r"^(19|20)\d{2}", nombre)

    if coincidencia:
        return int(coincidencia.group())

    return None


def crear_titulo(archivo):
    nombre = archivo.stem

    nombre = re.sub(
        r"^(19|20)\d{2}[-_ ]*",
        "",
        nombre
    )

    nombre = nombre.replace("-", " ")
    nombre = nombre.replace("_", " ")

    nombre = re.sub(
        r"\s+",
        " ",
        nombre
    ).strip()

    if not nombre:
        return archivo.stem

    return nombre[0].upper() + nombre[1:]


def generar_catalogo():

    catalogo = []

    for carpeta, categoria in CATEGORIAS.items():

        ruta_categoria = DOCUMENTOS / carpeta

        if not ruta_categoria.exists():
            continue

        for archivo in ruta_categoria.rglob("*"):

            if not archivo.is_file():
                continue

            extension = archivo.suffix.lower()

            if extension not in EXTENSIONES:
                continue

            anio = obtener_anio(archivo.name)

            ruta_relativa = archivo.relative_to(BASE)

            documento = {
                "titulo": crear_titulo(archivo),
                "anio": anio,
                "categoria": categoria,
                "tipo": EXTENSIONES[extension],
                "archivo": ruta_relativa.as_posix(),
                "palabras_clave": []
            }

            catalogo.append(documento)

    catalogo.sort(
        key=lambda doc: (
            -(doc["anio"] or 0),
            doc["titulo"].lower()
        )
    )

    return catalogo


def guardar_catalogo(catalogo):

    with open(
        SALIDA,
        "w",
        encoding="utf-8"
    ) as archivo:

        json.dump(
            catalogo,
            archivo,
            ensure_ascii=False,
            indent=2
        )


if __name__ == "__main__":

    catalogo = generar_catalogo()

    guardar_catalogo(catalogo)

    print(
        f"Catálogo generado: "
        f"{len(catalogo)} documentos."
    )
