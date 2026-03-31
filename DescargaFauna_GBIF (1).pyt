# -*- coding: utf-8 -*-
"""
DescargaFauna_GBIF.pyt
Descarga ocurrencias de fauna desde GBIF para un área de estudio.
Consulta la base global completa de GBIF sin restricciones de organización.

Desarrollado para ArcGIS Pro
"""

import arcpy
import requests
import time
import os


class Toolbox(object):
    def __init__(self):
        self.label = "Descarga Fauna GBIF"
        self.alias = "DescargaFaunaGBIF"
        self.tools = [DescargaFauna]


class DescargaFauna(object):
    def __init__(self):
        self.label = "Descargar Ocurrencias de Fauna (GBIF)"
        self.description = (
            "Descarga todos los registros de ocurrencias de fauna desde GBIF "
            "dentro del área definida por una capa de polígonos. "
            "Incluye registros de CONABIO, iNaturalist, eBird y todas las "
            "instituciones que publican en GBIF."
        )
        self.canRunInBackground = False

    def getParameterInfo(self):

        # 0 — Área de estudio
        p_area = arcpy.Parameter(
            displayName="Área de Estudio (polígono)",
            name="area_estudio",
            datatype="GPFeatureLayer",
            parameterType="Required",
            direction="Input",
        )
        p_area.filter.list = ["Polygon"]

        # 1 — Grupo taxonómico
        p_grupo = arcpy.Parameter(
            displayName="Grupo Taxonómico",
            name="grupo",
            datatype="GPString",
            parameterType="Required",
            direction="Input",
        )
        p_grupo.filter.type = "ValueList"
        p_grupo.filter.list = [
            "Toda la Fauna (Animalia)",
            "Aves",
            "Mammalia (Mamíferos)",
            "Reptilia",
            "Amphibia (Anfibios)",
            "Actinopterygii (Peces)",
            "Insecta",
        ]
        p_grupo.value = "Toda la Fauna (Animalia)"

        # 2 — Año inicio
        p_anio_ini = arcpy.Parameter(
            displayName="Año Inicio",
            name="anio_inicio",
            datatype="GPLong",
            parameterType="Optional",
            direction="Input",
        )
        p_anio_ini.value = 1900

        # 3 — Año fin
        p_anio_fin = arcpy.Parameter(
            displayName="Año Fin",
            name="anio_fin",
            datatype="GPLong",
            parameterType="Optional",
            direction="Input",
        )
        p_anio_fin.value = 2026

        # 4 — Solo coordenadas verificadas
        p_verificados = arcpy.Parameter(
            displayName="Solo registros con coordenadas verificadas",
            name="verificados",
            datatype="GPBoolean",
            parameterType="Optional",
            direction="Input",
        )
        p_verificados.value = True

        # 5 — Capa de salida
        p_salida = arcpy.Parameter(
            displayName="Capa de Salida (puntos)",
            name="salida",
            datatype="DEShapefile",
            parameterType="Required",
            direction="Output",
        )

        return [p_area, p_grupo, p_anio_ini, p_anio_fin, p_verificados, p_salida]

    def isLicensed(self):
        return True

    def updateParameters(self, parameters):
        return

    def updateMessages(self, parameters):
        anio_ini = parameters[2].value
        anio_fin = parameters[3].value
        if anio_ini and anio_fin and anio_ini > anio_fin:
            parameters[2].setErrorMessage("El año inicio no puede ser mayor al año fin.")
        return

    def execute(self, parameters, messages):
        area_lyr    = parameters[0].valueAsText
        grupo       = parameters[1].valueAsText
        anio_ini    = parameters[2].value or 1900
        anio_fin    = parameters[3].value or 2026
        verificados = parameters[4].value
        salida_shp  = parameters[5].valueAsText

        # ── Bounding box ───────────────────────────────────────────────
        messages.addMessage("Calculando extensión del área de estudio...")
        min_lon, min_lat, max_lon, max_lat = self._bbox(area_lyr)
        messages.addMessage(
            f"Bounding box: {min_lat:.4f}N, {min_lon:.4f}W  ->  "
            f"{max_lat:.4f}N, {max_lon:.4f}W"
        )

        # ── Descarga GBIF ──────────────────────────────────────────────
        messages.addMessage("\nConsultando GBIF (base global completa)...")
        messages.addMessage("Esto puede tardar varios minutos segun el area y grupo...")

        registros = self._descargar_gbif(
            min_lon, min_lat, max_lon, max_lat,
            grupo, anio_ini, anio_fin, verificados, messages
        )

        messages.addMessage(f"\nTotal de registros obtenidos: {len(registros)}")

        if not registros:
            messages.addWarningMessage(
                "No se encontraron registros en el area con los filtros seleccionados."
            )
            return

        # ── Crear shapefile ────────────────────────────────────────────
        messages.addMessage("\nGenerando shapefile de salida...")
        self._crear_shapefile(registros, salida_shp, messages)
        messages.addMessage(f"\nListo! Shapefile guardado en: {salida_shp}")

    # ------------------------------------------------------------------
    # MÉTODOS INTERNOS
    # ------------------------------------------------------------------

    def _bbox(self, lyr):
        desc      = arcpy.Describe(lyr)
        sr_wgs84  = arcpy.SpatialReference(4326)
        sr_origen = desc.spatialReference
        ext       = desc.extent

        if sr_origen.factoryCode != 4326:
            poly = arcpy.Polygon(
                arcpy.Array([
                    arcpy.Point(ext.XMin, ext.YMin),
                    arcpy.Point(ext.XMax, ext.YMin),
                    arcpy.Point(ext.XMax, ext.YMax),
                    arcpy.Point(ext.XMin, ext.YMax),
                ]),
                sr_origen,
            )
            ext = poly.projectAs(sr_wgs84).extent

        return ext.XMin, ext.YMin, ext.XMax, ext.YMax

    def _clase_gbif(self, grupo):
        mapa = {
            "Toda la Fauna (Animalia)":  None,
            "Aves":                       "Aves",
            "Mammalia (Mamíferos)":       "Mammalia",
            "Reptilia":                   "Reptilia",
            "Amphibia (Anfibios)":        "Amphibia",
            "Actinopterygii (Peces)":     "Actinopterygii",
            "Insecta":                    "Insecta",
        }
        return mapa.get(grupo)

    def _descargar_gbif(self, min_lon, min_lat, max_lon, max_lat,
                        grupo, anio_ini, anio_fin, verificados, messages):
        url       = "https://api.gbif.org/v1/occurrence/search"
        registros = []
        offset    = 0
        limite    = 300
        clase     = self._clase_gbif(grupo)

        while True:
            params = {
                "kingdomKey":         1,          # Animalia completo
                "hasCoordinate":      "true",
                "decimalLongitude":   f"{min_lon},{max_lon}",
                "decimalLatitude":    f"{min_lat},{max_lat}",
                "year":               f"{anio_ini},{anio_fin}",
                "limit":              limite,
                "offset":             offset,
            }
            # Solo filtrar por problemas geoespaciales si el usuario lo pide
            if verificados:
                params["hasGeospatialIssue"] = "false"
            if clase:
                params["class"] = clase

            try:
                resp = requests.get(url, params=params, timeout=60)
                resp.raise_for_status()
                datos = resp.json()
            except Exception as e:
                messages.addWarningMessage(
                    f"Error en consulta (offset={offset}): {e}. Reintentando en 10 seg..."
                )
                time.sleep(10)
                continue

            resultados = datos.get("results", [])
            registros.extend(resultados)
            total = datos.get("count", 0)
            messages.addMessage(f"  Descargados: {len(registros)} de {total}")

            if datos.get("endOfRecords", True):
                break

            offset += limite
            time.sleep(0.5)

        return registros

    def _crear_shapefile(self, registros, salida_shp, messages):
        sr_wgs84 = arcpy.SpatialReference(4326)
        carpeta  = os.path.dirname(salida_shp)
        nombre   = os.path.basename(salida_shp).replace(".shp", "")

        if arcpy.Exists(salida_shp):
            arcpy.Delete_management(salida_shp)

        arcpy.CreateFeatureclass_management(
            carpeta, nombre, "POINT", spatial_reference=sr_wgs84
        )

        campos = [
            ("gbif_id",    "TEXT",  50),
            ("especie",    "TEXT",  150),
            ("familia",    "TEXT",  100),
            ("orden",      "TEXT",  100),
            ("clase",      "TEXT",  100),
            ("reino",      "TEXT",  50),
            ("pais",       "TEXT",  10),
            ("estado",     "TEXT",  100),
            ("municipio",  "TEXT",  100),
            ("localidad",  "TEXT",  200),
            ("fecha",      "TEXT",  30),
            ("anio",       "SHORT", None),
            ("fuente",     "TEXT",  150),
            ("coleccion",  "TEXT",  150),
        ]

        for nom, tipo, largo in campos:
            if largo:
                arcpy.AddField_management(salida_shp, nom, tipo, field_length=largo)
            else:
                arcpy.AddField_management(salida_shp, nom, tipo)

        nombres   = [c[0] for c in campos]
        sin_coord = 0

        with arcpy.da.InsertCursor(salida_shp, ["SHAPE@XY"] + nombres) as cur:
            for r in registros:
                lon = r.get("decimalLongitude")
                lat = r.get("decimalLatitude")
                if lon is None or lat is None:
                    sin_coord += 1
                    continue

                anio_val  = None
                fecha_str = r.get("eventDate", "")
                if fecha_str and len(fecha_str) >= 4:
                    try:
                        anio_val = int(fecha_str[:4])
                    except Exception:
                        pass

                cur.insertRow((
                    (lon, lat),
                    str(r.get("gbifID",      ""))[:50],
                    str(r.get("species",
                        r.get("scientificName", "Sin dato")))[:150],
                    str(r.get("family",      ""))[:100],
                    str(r.get("order",       ""))[:100],
                    str(r.get("class",       ""))[:100],
                    str(r.get("kingdom",     ""))[:50],
                    str(r.get("countryCode", ""))[:10],
                    str(r.get("stateProvince",""))[:100],
                    str(r.get("county",      ""))[:100],
                    str(r.get("locality",    ""))[:200],
                    str(fecha_str)[:30],
                    anio_val,
                    str(r.get("datasetName", ""))[:150],
                    str(r.get("collectionCode",""))[:150],
                ))

        if sin_coord:
            messages.addWarningMessage(
                f"{sin_coord} registros omitidos por no tener coordenadas validas."
            )
