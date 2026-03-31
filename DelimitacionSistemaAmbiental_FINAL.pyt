# -*- coding: utf-8 -*-

import arcpy
from arcpy.sa import *

class Toolbox(object):
    def __init__(self):
        self.label = "Herramientas Hidrologicas"
        self.alias = "hidro_tools"
        self.tools = [DelimitacionSistemaAmbiental]


class DelimitacionSistemaAmbiental(object):
    def __init__(self):
        self.label = "Delimitacion de Sistema Ambiental (Estable)"
        self.description = "Version optimizada y estable para delimitar cuencas a partir de un MDE"
        self.canRunInBackground = False

    def getParameterInfo(self):

        dem = arcpy.Parameter(
            displayName="Modelo Digital de Elevacion (DEM)",
            name="dem",
            datatype="GPRasterLayer",
            parameterType="Required",
            direction="Input")

        points = arcpy.Parameter(
            displayName="Puntos de Area de Estudio",
            name="points",
            datatype="GPFeatureLayer",
            parameterType="Required",
            direction="Input")

        threshold = arcpy.Parameter(
            displayName="Umbral de Acumulacion de Flujo",
            name="threshold",
            datatype="GPLong",
            parameterType="Required",
            direction="Input")
        threshold.value = 10000

        output = arcpy.Parameter(
            displayName="Sistema Ambiental (Salida)",
            name="output",
            datatype="DEFeatureClass",
            parameterType="Required",
            direction="Output")

        return [dem, points, threshold, output]

    def execute(self, parameters, messages):

        arcpy.env.overwriteOutput = True
        arcpy.env.addOutputsToMap = False
        arcpy.CheckOutExtension("Spatial")

        workspace = arcpy.env.scratchGDB

        dem = parameters[0].valueAsText
        points = parameters[1].valueAsText
        threshold = int(parameters[2].value)
        output = parameters[3].valueAsText

        try:

            messages.addMessage("Fill...")
            filled = Fill(dem)

            messages.addMessage("Flow Direction...")
            fdir = FlowDirection(filled)

            messages.addMessage("Flow Accumulation...")
            facc = FlowAccumulation(fdir)

            messages.addMessage("Stream definition...")
            stream = Con(facc > threshold, 1)

            messages.addMessage("Stream Link...")
            stream_link = StreamLink(stream, fdir)

            messages.addMessage("Watershed...")
            catchments_raster_path = workspace + "/catchments"
            catchments = Watershed(fdir, stream_link)
            catchments.save(catchments_raster_path)

            messages.addMessage("Raster a poligono...")
            catchments_poly = workspace + "/catchments_poly"
            arcpy.conversion.RasterToPolygon(catchments_raster_path, catchments_poly, "NO_SIMPLIFY")

            messages.addMessage("Intersect...")
            intersect_fc = workspace + "/intersect"
            arcpy.analysis.Intersect([catchments_poly, points], intersect_fc)

            messages.addMessage("IDs unicos...")
            unique_ids = set()
            with arcpy.da.SearchCursor(intersect_fc, ["GRIDCODE"]) as cursor:
                for row in cursor:
                    unique_ids.add(row[0])

            if not unique_ids:
                raise Exception("Ninguna cuenca intersecta con los puntos.")

            id_list = ",".join(map(str, unique_ids))
            query = f"GRIDCODE IN ({id_list})"

            arcpy.management.MakeFeatureLayer(catchments_poly, "layer")
            arcpy.management.SelectLayerByAttribute("layer", "NEW_SELECTION", query)

            selected = workspace + "/selected"
            arcpy.management.CopyFeatures("layer", selected)

            messages.addMessage("Dissolve final...")
            arcpy.management.Dissolve(selected, output)

            messages.addMessage("Proceso completado correctamente.")

        finally:
            try:
                del filled, fdir, facc, stream, stream_link, catchments
            except:
                pass

            try:
                arcpy.management.Delete("in_memory")
            except:
                pass

            arcpy.CheckInExtension("Spatial")
