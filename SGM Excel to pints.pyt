# -*- coding: utf-8 -*-
"""
ExcelToPoints.pyt
-----------------
Toolbox para ArcGIS Pro que convierte un archivo Excel con coordenadas
a una capa de puntos, limpiando automáticamente el formato de las celdas para trabajar en la subgerencia de Geología Ambiental 
en el SGM.

Hecho por Pablo Baltazar Jiménez
"""

import arcpy
import os
import sys

class Toolbox:
    def __init__(self):
        self.label = "Excel to Points"
        self.alias = "ExcelToPoints"
        self.tools = [ExcelToPoints]

class ExcelToPoints:
    def __init__(self):
        self.label = "Excel a Puntos"
        self.description = "Convierte un archivo Excel con coordenadas a una capa de puntos ignorando el formato de celda y separadores de miles."
        self.canRunInBackground = False

    def getParameterInfo(self):
        p0 = arcpy.Parameter(displayName="Archivo Excel", name="in_excel", datatype="DEFile", parameterType="Required", direction="Input")
        p0.filter.list = ["xlsx", "xls", "xlsm"]
        p1 = arcpy.Parameter(displayName="Hoja (Sheet)", name="sheet_name", datatype="GPString", parameterType="Required", direction="Input")
        p1.value = "Sheet1"
        p2 = arcpy.Parameter(displayName="Fila de encabezados", name="header_row", datatype="GPLong", parameterType="Required", direction="Input")
        p2.value = 1
        p3 = arcpy.Parameter(displayName="Campo X", name="x_field", datatype="GPString", parameterType="Required", direction="Input")
        p4 = arcpy.Parameter(displayName="Campo Y", name="y_field", datatype="GPString", parameterType="Required", direction="Input")
        p5 = arcpy.Parameter(displayName="Campo Z (Opcional)", name="z_field", datatype="GPString", parameterType="Optional", direction="Input")
        p6 = arcpy.Parameter(displayName="Sistema de Referencia", name="spatial_ref", datatype="GPSpatialReference", parameterType="Required", direction="Input")
        p6.value = arcpy.SpatialReference(32614)
        p7 = arcpy.Parameter(displayName="Guarda el Shape generado", name="out_fc", datatype="DEFeatureClass", parameterType="Required", direction="Output")
        p8 = arcpy.Parameter(displayName="Agregar al mapa", name="add_to_map", datatype="GPBoolean", parameterType="Optional", direction="Input")
        p8.value = True

        return [p0, p1, p2, p3, p4, p5, p6, p7, p8]

    def updateParameters(self, parameters):
        p_excel, p_sheet, p_header, p_x, p_y, p_z = parameters[0:6]

        if p_excel.altered and p_excel.value:
            excel_path = str(p_excel.value)
            if os.path.exists(excel_path):
                sheets = _get_sheet_names(excel_path)
                p_sheet.filter.type = "ValueList"
                p_sheet.filter.list = sheets
                if sheets and not p_sheet.altered:
                    p_sheet.value = sheets[0]

        if (p_excel.value and p_sheet.value and (p_excel.altered or p_sheet.altered or p_header.altered)):
            cols = _get_column_names(str(p_excel.value), str(p_sheet.value), int(p_header.value) if p_header.value else 1)
            if cols:
                for p in [p_x, p_y, p_z]:
                    p.filter.type = "ValueList"
                    p.filter.list = cols
                if not p_x.altered: p_x.value = _guess_field(cols, ["x", "este", "easting", "lon"])
                if not p_y.altered: p_y.value = _guess_field(cols, ["y", "norte", "northing", "lat"])
                if not p_z.altered: p_z.value = _guess_field(cols, ["z", "elev", "elevacion"])
        return

    def updateMessages(self, parameters):
        return

    def execute(self, parameters, messages):
        try:
            import openpyxl
        except ImportError:
            arcpy.AddError("Se requiere openpyxl. Instálalo con: pip install openpyxl")
            return

        excel_path = str(parameters[0].value)
        sheet_name = str(parameters[1].value)
        header_row = int(parameters[2].value)
        x_field    = str(parameters[3].value)
        y_field    = str(parameters[4].value)
        z_field    = str(parameters[5].value) if parameters[5].value else None
        spatial_ref = parameters[6].value
        out_fc     = str(parameters[7].value)
        add_to_map  = parameters[8].value

        arcpy.AddMessage("Extrayendo datos de Excel...")
        rows, fields = _read_excel_clean(excel_path, sheet_name, header_row)

        if not rows:
            arcpy.AddError("No se encontraron datos.")
            return

        arcpy.management.CreateFeatureclass(os.path.dirname(out_fc), os.path.basename(out_fc), "POINT3D" if z_field else "POINT", spatial_reference=spatial_ref)

        field_map = {}
        for col in fields:
            safe_name = _safe_field_name(col)
            if safe_name.upper() in ["SHAPE", "OBJECTID", "FID", "ID", "OID"]: safe_name += "_"
            arcpy.management.AddField(out_fc, safe_name, "DOUBLE" if _is_numeric_col(rows, col) else "TEXT", field_length=255)
            field_map[col] = safe_name

        insert_fields = ["SHAPE@X", "SHAPE@Y", "SHAPE@Z"] + list(field_map.values()) if z_field else ["SHAPE@XY"] + list(field_map.values())
        
        skipped, inserted = 0, 0
        with arcpy.da.InsertCursor(out_fc, insert_fields) as cursor:
            for row in rows:
                try:
                    x_val = _to_float(row.get(x_field))
                    y_val = _to_float(row.get(y_field))

                    if x_val is None or y_val is None:
                        skipped += 1
                        continue

                    attr_values = []
                    for col in fields:
                        raw = row.get(col)
                        attr_values.append(_to_float(raw) if _is_numeric_col(rows, col) else (str(raw) if raw is not None else None))

                    if z_field:
                        cursor.insertRow([x_val, y_val, _to_float(row.get(z_field)) or 0.0] + attr_values)
                    else:
                        cursor.insertRow([(x_val, y_val)] + attr_values)
                    inserted += 1

                except Exception as e:
                    skipped += 1

        arcpy.AddMessage(f"✓ Puntos insertados: {inserted}")
        if skipped: arcpy.AddWarning(f"Filas omitidas: {skipped}")

        if add_to_map:
            aprx = arcpy.mp.ArcGISProject("CURRENT")
            if aprx.activeMap: aprx.activeMap.addDataFromPath(out_fc)

        return

def _get_sheet_names(excel_path):
    try:
        import openpyxl
        wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)
        names = wb.sheetnames
        wb.close()
        return names
    except: return []

def _get_column_names(excel_path, sheet_name, header_row=1):
    try:
        import openpyxl
        wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)
        cols = []
        for row in wb[sheet_name].iter_rows(min_row=header_row, max_row=header_row, values_only=True):
            for i, cell in enumerate(row, 1): cols.append(str(cell).strip() if cell is not None else f"COL_{i}")
            break
        wb.close()
        return cols
    except: return []

def _read_excel_clean(excel_path, sheet_name, header_row=1):
    import openpyxl
    wb = openpyxl.load_workbook(excel_path, read_only=True, data_only=True)
    all_rows = list(wb[sheet_name].iter_rows(min_row=header_row, values_only=True))
    wb.close()
    if not all_rows: return [], []
    headers = [str(h).strip() if h is not None else f"COL_{i+1}" for i, h in enumerate(all_rows[0])]
    records = []
    for row in all_rows[1:]:
        if all(v is None for v in row): continue
        records.append({col: (val.strip().replace("\xa0", "") if isinstance(val, str) else val) for col, val in zip(headers, row)})
    return records, headers

def _to_float(value):
    import re
    if value is None or str(value).strip() == "": return None
    if isinstance(value, (int, float)): return float(value)
    
    s = str(value).strip()
    match = re.search(r'-?\d+[\.,\d]*', s)
    if not match: return None
    s = match.group(0)

    # Arreglo para las comas de miles:
    if ',' in s and '.' in s:
        s = s.replace(',', '') 
    elif ',' in s:
        parts = s.split(',')
        if s.count(',') > 1 or len(parts[-1]) == 3:
            s = s.replace(',', '') # Es separador de miles (ej. 3,219,812)
        else:
            s = s.replace(',', '.') # Es decimal (ej. 715141,5)

    try: return float(s)
    except: return None

def _is_numeric_col(rows, col_name, sample=20):
    tested, numeric = 0, 0
    for row in rows[:sample]:
        val = row.get(col_name)
        if val is None: continue
        tested += 1
        if _to_float(val) is not None: numeric += 1
    return tested > 0 and (numeric / tested) >= 0.8

def _safe_field_name(name):
    import re
    safe = re.sub(r"[^a-zA-Z0-9_]", "_", str(name))
    return ("F_" + safe if safe and safe[0].isdigit() else safe)[:64]

def _guess_field(columns, keywords):
    for kw in keywords:
        for col in columns:
            if kw == col.lower() or kw in col.lower(): return col
    return None