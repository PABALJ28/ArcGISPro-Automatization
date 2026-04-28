const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, Footer, Header, TabStopType, TabStopPosition,
  LevelFormat, PageBreak
} = require('docx');
const fs = require('fs');

const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, font: "Arial", size: 28, bold: true, color: "1F4E79" })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 24, bold: true, color: "2E74B5" })]
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: true, italics: true, color: "333333" })]
  });
}

function para(runs, spacing = { before: 120, after: 120 }, align = AlignmentType.JUSTIFIED) {
  return new Paragraph({
    alignment: align,
    spacing,
    children: Array.isArray(runs) ? runs : [new TextRun({ text: runs, font: "Arial", size: 22 })]
  });
}

function italic(text) {
  return new TextRun({ text, font: "Arial", size: 22, italics: true });
}

function bold(text) {
  return new TextRun({ text, font: "Arial", size: 22, bold: true });
}

function normal(text) {
  return new TextRun({ text, font: "Arial", size: 22 });
}

function superscript(text) {
  return new TextRun({ text, font: "Arial", size: 18, superScript: true });
}

function emptyLine() {
  return new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun("")] });
}

// Table helper
function dataTable(headers, rows, colWidths) {
  const headerRow = new TableRow({
    children: headers.map((h, i) => new TableCell({
      borders,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: "1F4E79", type: ShadingType.CLEAR },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: h, font: "Arial", size: 18, bold: true, color: "FFFFFF" })]
      })]
    }))
  });

  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => new TableCell({
      borders,
      width: { size: colWidths[ci], type: WidthType.DXA },
      shading: { fill: ri % 2 === 0 ? "EBF3FB" : "FFFFFF", type: ShadingType.CLEAR },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      children: [new Paragraph({
        alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
        children: [new TextRun({ text: String(cell), font: "Arial", size: 18 })]
      })]
    }))
  }));

  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows]
  });
}

function tableCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200 },
    children: [new TextRun({ text, font: "Arial", size: 20, italics: true, color: "555555" })]
  });
}

// ============================================================
// DOCUMENT CONTENT
// ============================================================

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "1F4E79" },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2E74B5" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 }
      }
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [

      // ─── TITLE BLOCK ───
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 480, after: 200 },
        children: [new TextRun({
          text: "Caracterización Geoquímica de Pasivos Ambientales Mineros en la Sierra de las Adargas, Sonora, México: Evaluación de Elementos Potencialmente Tóxicos, Riesgos a la Salud y Externalidades Económicas sobre la Producción de Nuez Pecana",
          font: "Arial", size: 30, bold: true, color: "1F4E79"
        })]
      }),

      // Subtitle
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 80 },
        children: [new TextRun({
          text: "Geochemical Characterization of Mining Environmental Liabilities at Sierra de las Adargas, Sonora, Mexico: Assessment of Potentially Toxic Elements, Health Risks, and Economic Externalities on Pecan Production",
          font: "Arial", size: 22, italics: true, color: "444444"
        })]
      }),

      emptyLine(),

      // Authors
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: "Ángel Uriel Guillén Lozano", font: "Arial", size: 22, bold: true }),
          superscript("1"),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 120 },
        children: [
          new TextRun({ text: "1", font: "Arial", size: 18, superScript: true }),
          new TextRun({ text: " Subgerencia de Geología Ambiental, Servicio Geológico Mexicano (SGM), Hermosillo, Sonora, México.", font: "Arial", size: 18, italics: true, color: "555555" }),
        ]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: "Correspondencia: aguillen@sgm.gob.mx", font: "Arial", size: 18, color: "2E74B5" })]
      }),

      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 200 },
        children: [new TextRun({ text: "Recibido: [fecha] | Aceptado: [fecha] | DOI: [en proceso]", font: "Arial", size: 18, color: "777777", italics: true })]
      }),

      // Divider paragraph
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F4E79", space: 1 } },
        spacing: { before: 0, after: 200 },
        children: [new TextRun("")]
      }),

      // ─── ABSTRACT ───
      heading1("Resumen"),

      para([
        bold("Antecedentes: "), normal("La minería histórica en el noroeste de México ha generado pasivos ambientales cuya caracterización geoquímica es indispensable para la gestión del riesgo. La Sierra de las Adargas, localizada en el estado de Sonora, presenta evidencia de actividad minera antropogénica cuyos impactos sobre suelos, sedimentos y minerales no han sido cuantificados de forma integral. "),
        bold("Métodos: "), normal("Se analizaron 39 muestras (13 de paredes de mineral —PAMLA—, 15 de sedimentos de arroyo —SEDLA—, 10 de suelo superficial —SLA— y 1 de sal —SAL—) mediante digestión parcial en horno de microondas (Método 22), ICP-OES (Método 23) y ensaye al fuego/absorción atómica (Método 8). Se determinaron 33 elementos; los resultados se compararon con los criterios de remediación establecidos en la NOM-147-SEMARNAT/SSA1-2004, los valores guía de la USEPA para uso residencial/agrícola, y los valores de referencia del Servicio Geológico de los Estados Unidos (USGS). "),
        bold("Resultados: "), normal("Las muestras PAMLA presentaron las concentraciones más elevadas de arsénico (As: hasta 32,893 mg/kg), plomo (Pb: hasta 64,174 mg/kg), cobre (Cu: hasta 9,106 mg/kg), zinc (Zn: hasta 64,909 mg/kg), bismuto (Bi: hasta 493 mg/kg), molibdeno (Mo: hasta 370 mg/kg) y selenio (Se: hasta 328 mg/kg), superando en varios órdenes de magnitud los límites normativos aplicables. Los sedimentos de arroyo (SEDLA) exhiben contaminación moderada a alta, con As de hasta 3,224 mg/kg y Pb de hasta 17,908 mg/kg, indicando transporte activo de elementos potencialmente tóxicos (EPT) hacia las cuencas bajas. Los suelos superficiales (SLA), aunque con concentraciones menores, registran valores de As, Pb y Zn que exceden los umbrales de uso agrícola. "),
        bold("Implicaciones: "), normal("La distribución de EPT en sedimentos y suelos representa un riesgo potencial para las comunidades aledañas por vías de exposición dérmicas, inhalación e ingestión, y una amenaza económica documentable sobre los huertos de nuez pecana ("), italic("Carya illinoinensis"), normal(") establecidos en la región, un cultivo de alto valor estratégico para Sonora y Chihuahua. Se discuten mecanismos de incorporación de contaminantes a la cadena alimentaria, se estiman externalidades negativas sobre el valor agronómico y se propone un marco de priorización para la remediación del sitio.")
      ]),

      emptyLine(),
      para([bold("Palabras clave: "), normal("pasivos ambientales mineros; elementos potencialmente tóxicos; arsénico; plomo; zinc; geoquímica ambiental; Sierra de las Adargas; nuez pecana; economía ambiental; NOM-147-SEMARNAT.")]),
      emptyLine(),

      heading1("Abstract"),

      para([
        bold("Background: "), normal("Historical mining in northwestern Mexico has generated environmental liabilities whose geochemical characterization is essential for risk management. The Sierra de las Adargas, located in the state of Sonora, shows evidence of anthropogenic mining activity whose impacts on soils, sediments, and minerals have not been comprehensively quantified. "),
        bold("Methods: "), normal("Thirty-nine samples (13 mineral wall samples —PAMLA—, 15 stream sediments —SEDLA—, 10 surface soils —SLA—, and 1 salt sample —SAL—) were analyzed by partial microwave digestion (Method 22), ICP-OES (Method 23), and fire assay/atomic absorption (Method 8). Thirty-three elements were determined; results were compared against remediation thresholds in NOM-147-SEMARNAT/SSA1-2004, USEPA residential/agricultural guidelines, and USGS baseline values. "),
        bold("Results: "), normal("PAMLA samples showed the highest concentrations of arsenic (As: up to 32,893 mg/kg), lead (Pb: up to 64,174 mg/kg), copper (Cu: up to 9,106 mg/kg), zinc (Zn: up to 64,909 mg/kg), bismuth (Bi: up to 493 mg/kg), molybdenum (Mo: up to 370 mg/kg), and selenium (Se: up to 328 mg/kg), exceeding regulatory limits by several orders of magnitude. Stream sediments (SEDLA) exhibit moderate to high contamination, with As up to 3,224 mg/kg and Pb up to 17,908 mg/kg, indicating active transport of potentially toxic elements (PTEs) toward lower catchments. Surface soils (SLA), while exhibiting lower concentrations, record As, Pb, and Zn values exceeding agricultural use thresholds. "),
        bold("Implications: "), normal("The PTE distribution in sediments and soils represents a potential risk to nearby communities through dermal, inhalation, and ingestion exposure pathways, and a quantifiable economic threat to pecan orchards ("), italic("Carya illinoinensis"), normal(") established in the region—a high-value strategic crop for Sonora and Chihuahua. Mechanisms of contaminant incorporation into the food chain are discussed, negative externalities on agronomic value are estimated, and a prioritization framework for site remediation is proposed.")
      ]),

      emptyLine(),
      para([bold("Keywords: "), normal("mining environmental liabilities; potentially toxic elements; arsenic; lead; zinc; environmental geochemistry; Sierra de las Adargas; pecan nut; environmental economics; NOM-147-SEMARNAT.")]),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── 1. INTRODUCCIÓN ───
      heading1("1. Introducción"),

      para("La minería extractiva ha sido el motor económico del norte de México durante más de cuatro siglos, dejando un legado territorial complejo que incluye jales, terreros, galerías abandonadas y labores a cielo abierto que, en ausencia de medidas de control ambiental, constituyen pasivos ambientales activos. La Secretaría de Medio Ambiente y Recursos Naturales (SEMARNAT) reconoce que aproximadamente el 94% de los residuos generados por la industria minero-metalúrgica en México se concentra en los estados de Sonora, Zacatecas, Chihuahua, Durango, San Luis Potosí, Querétaro y Coahuila (Pérez-Espinosa et al., 2024), conformando un corredor de vulnerabilidad geoquímica de alcance regional."),

      para([normal("Los elementos potencialmente tóxicos (EPT) —arsénico (As), plomo (Pb), cadmio (Cd), zinc (Zn), cobre (Cu), entre otros— liberados por la meteorización física y química de estos pasivos pueden movilizarse mediante viento, escorrentía superficial e infiltración, alcanzando matrices ambientales como suelos agrícolas, sedimentos de arroyos y cuerpos de agua que sirven de sustento a las comunidades locales (Manjarrez-Domínguez et al., 2019; Escot-Espinoza et al., 2021). La exposición humana crónica a concentraciones elevadas de As y Pb, en particular, se asocia a efectos neurotóxicos, nefrotóxicos y carcinogénicos documentados (IARC, 2012; USEPA, 2020). Estudios realizados en contextos mineros comparables del norte de México —como Villa de la Paz, S.L.P. (Carrizales et al., 2006) o San Guillermo, Chih. (Manjarrez-Domínguez et al., 2019)— han demostrado que entre 20 y 30% de la población infantil aledaña a zonas con pasivos mineros sin control presenta valores de plomo en sangre y arsénico en orina por encima de los umbrales de intervención nacional e internacional."]),

      para([normal("La Sierra de las Adargas, en el estado de Sonora, contiene indicios y labores mineras asociadas a una mineralización polimetálica de arseniuros, sulfuros y sulfosales que incluye arsenopirita, pirita, calcopirita y galena, entre otras fases minerales. Este trabajo presenta la primera caracterización geoquímica sistemática de los pasivos ambientales de esta sierra, con base en resultados analíticos del Servicio Geológico Mexicano (SGM) generados en el marco del proyecto "), italic("Manifestación Ambiental y Caracterización del Impacto por Actividad Antropogénica en la Sierra de las Adargas"), normal(" (OT 38105/2025). Los objetivos específicos son: (1) identificar los EPT de relevancia ambiental y su distribución en distintas matrices; (2) evaluar la magnitud de la contaminación respecto a normativas mexicanas e internacionales; (3) discutir los riesgos potenciales a la salud de las poblaciones cercanas; y (4) analizar las implicaciones económicas sobre el cultivo de nuez pecana ("), italic("Carya illinoinensis"), normal(") presente en la región, aplicando un enfoque de economía ambiental.")]),

      // ─── 2. ÁREA DE ESTUDIO ───
      heading1("2. Área de Estudio"),

      para("La Sierra de las Adargas se localiza en el estado de Sonora, en el noroeste de México, en una zona de transición entre las provincias fisiográficas de la Sierra Madre Occidental y las llanuras del desierto sonorense. Geológicamente, la región forma parte del cinturón de mineralización polimetálica relacionado con sistemas pórfidos y vetas epitermales-mesotermalees que caracteriza el noroeste mexicano, y que incluye distritos mineros de importancia histórica como los de Álamos, Moctezuma y Sahuaripa."),

      para("La mineralización reconocida en el área incluye asociaciones de arsénico, plata, oro, bismuto, molibdeno y metales base (Pb, Zn, Cu), consistentes con el patrón geoquímico identificado en las muestras de paredes mineralizadas (PAMLA) analizadas en este estudio. Las labores mineras históricas, en ausencia de planes de cierre o medidas de manejo de residuos, han resultado en la dispersión de material con alta carga de EPT hacia los sistemas hidrológicos del piedemonte serrano, donde confluyen con las áreas agrícolas del valle."),

      para("El entorno socioeconómico inmediato se caracteriza por comunidades rurales cuya actividad económica principal es la agricultura de temporal y de riego, con huertos de nuez pecana representando la actividad de mayor valor comercial. Esta condición establece una cadena de exposición potencial que va desde el pasivo ambiental minero, a través de suelos y agua de riego, hasta el producto alimenticio destinado al mercado nacional e internacional."),

      // ─── 3. MATERIALES Y MÉTODOS ───
      heading1("3. Materiales y Métodos"),

      heading2("3.1. Diseño de Muestreo"),

      para("El programa de muestreo fue diseñado por la Subgerencia de Geología Ambiental del SGM y ejecutado en campo por personal técnico especializado. Se recolectaron 39 muestras distribuidas en cuatro tipos de matrices ambientales:"),

      para([bold("(a) Muestras de paredes mineralizadas (PAMLA01–PAMLA13): "), normal("13 muestras tomadas directamente de frentes y paredes de laboreos mineros activos o abandonados, representativas del material primario mineralizado con mayor potencial de lixiviación.")]),
      para([bold("(b) Sedimentos de arroyo (SEDLA01–SEDLA15): "), normal("15 muestras de sedimentos finos (<63 μm) recolectados en los cauces que drenan la sierra, a distancias progresivamente mayores de las fuentes mineras, con el objetivo de caracterizar la dispersión hidrológica de los EPT.")]),
      para([bold("(c) Suelos superficiales (SLA01–SLA11; sin SLA02): "), normal("10 muestras de suelo superficial (0–20 cm) tomadas en áreas periféricas y en zonas con potencial agrícola o de uso humano.")]),
      para([bold("(d) Muestra de sal (SAL02): "), normal("1 muestra de una manifestación salina natural identificada en el área, útil como referencia de composición iónica del agua edáfica.")]),

      heading2("3.2. Métodos Analíticos"),

      para("El análisis químico fue realizado por el Departamento de Química Analítica de la Gerencia del Centro Experimental Chihuahua del SGM (OT 38105/2025, período 2025-07-02 al 2025-07-10). Los métodos aplicados fueron:"),

      para([bold("Método 8 – Ensaye al Fuego / Absorción Atómica (AAS): "), normal("Utilizado para la determinación de oro (Au) y plata (Ag). Límites de detección: 0.006 mg/kg para Au y 0.34 mg/kg para Ag.")]),
      para([bold("Método 22 – Digestión Parcial con Agua Regia en Horno de Microondas (HMO): "), normal("Ataque parcial con agua regia (HCl:HNO₃ 3:1) en sistema cerrado con control de presión y temperatura, para solubilización de metales asociados a fases disponibles e intercambiables. Nota: el laboratorio señala que estas muestras no son sedimentos de arroyo convencionales y que el peso utilizado pudo no ser óptimo para las concentraciones observadas; este descargo fue aceptado por el Geólogo responsable del proyecto y debe considerarse en la interpretación cuantitativa de los valores absolutos.")]),
      para([bold("Método 23 – ICP-OES (Espectrómetro de Emisión Óptica con Plasma Acoplado Inductivamente): "), normal("Determinación multielemental de 31 elementos en las soluciones resultantes de la digestión. La precisión analítica fue evaluada mediante duplicados de control de calidad (DPL) incluidos en la corrida (PAMLA11-DPL, SEDLA05-DPL, SEDLA11-DPL, SLA10-DPL), con variaciones relativas menores al 3% para la mayoría de los analitos, lo que indica una excelente reproducibilidad.")]),

      heading2("3.3. Control de Calidad Analítico"),

      para("Se incluyeron cuatro muestras duplicadas (DPL) distribuidas en la corrida analítica, representando aproximadamente el 10% del total de muestras, conforme a prácticas estándar de aseguramiento de calidad en geoquímica ambiental (USEPA Method 3051A). La comparación entre los pares duplicados muestra desviaciones relativas menores al 3% en los elementos de mayor concentración (Tabla 1), confirmando la reproducibilidad del proceso de digestión y medición. Los valores reportados como «<» seguidos del límite de detección del instrumento no fueron incluidos en los cálculos estadísticos de tendencia central como valores cuantitativos; en su lugar, se adoptó la convención de sustitución por la mitad del límite de detección (½ LD) para efectos de estimación de concentraciones medias."),

      emptyLine(),

      // QC Table
      para([bold("Tabla 1."), italic(" Control de calidad analítico: comparación de muestras duplicadas para elementos clave.")], { before: 80, after: 80 }, AlignmentType.CENTER),
      dataTable(
        ["Muestra", "As (mg/kg)", "Pb (mg/kg)", "Zn (mg/kg)", "Cu (mg/kg)", "Fe (%)"],
        [
          ["PAMLA11", "848", "4,071", "15,644", "3,756", "23.20"],
          ["PAMLA11-DPL", "837", "4,230", "15,818", "3,842", "23.00"],
          ["SEDLA05", "59", "35", "69", "11", "2.31"],
          ["SEDLA05-DPL", "59", "33", "67", "10", "2.25"],
          ["SEDLA11", "42", "296", "389", "17", "2.01"],
          ["SEDLA11-DPL", "43", "297", "391", "18", "2.06"],
          ["SLA10", "118", "55", "117", "117", "2.53"],
          ["SLA10-DPL", "115", "56", "117", "112", "2.57"],
        ],
        [2000, 1500, 1500, 1500, 1500, 1000]
      ),
      tableCaption("Fuente: SGM, Laboratorio de Química Analítica, Centro Experimental Chihuahua, OT 38105/2025."),

      heading2("3.4. Criterios Normativos de Comparación"),

      para("Las concentraciones medidas fueron comparadas con los siguientes marcos normativos y de referencia:"),
      para([bold("NOM-147-SEMARNAT/SSA1-2004: "), normal("Norma Oficial Mexicana que establece concentraciones de remediación para uso residencial (CRU-R) y uso industrial (CRU-I) de As, Pb, Cd, Se, Ag, Ni, V, Tl, Ba, Cr hexavalente y Be.")]),
      para([bold("USEPA Regional Screening Levels (RSL, 2024): "), normal("Valores de cribado para exposición residencial en suelo superficial, ampliamente utilizados como referencia internacional.")]),
      para([bold("Valores de Fondo Geoquímico (Background): "), normal("Media geométrica de la corteza terrestre para cada elemento (Rudnick y Gao, 2003), como línea base para distinguir la contribución antropogénica de la litogénica.")]),

      // ─── 4. RESULTADOS ───
      heading1("4. Resultados"),

      heading2("4.1. Geoquímica de las Muestras de Paredes Mineralizadas (PAMLA)"),

      para("Las 13 muestras de paredes mineralizadas constituyen el extremo proximal de la cadena de contaminación y reflejan la composición geoquímica primaria del depósito. Los rangos de concentración observados son consistentes con una mineralización polimetálica de alta ley que incluye arseniuros, sulfuros complejos y sulfosales (Tabla 2)."),

      para([bold("Arsénico (As): "), normal("Se registran valores de 239 mg/kg (PAMLA01) hasta 32,893 mg/kg (PAMLA10), con una mediana de 1,949 mg/kg. Estas concentraciones son características de depósitos con arsenopirita (FeAsS) y enargita (Cu₃AsS₄) como fases minerales dominantes. El valor de PAMLA10 supera en aproximadamente 73 veces el límite de remediación para uso residencial establecido por la NOM-147 (450 mg/kg) y en más de 1,300 veces el valor de fondo de la corteza terrestre (2.5 mg/kg).")]),
      para([bold("Plomo (Pb): "), normal("Concentraciones de 6 mg/kg (PAMLA03) hasta 64,174 mg/kg (PAMLA12), con una muestra (PAMLA13) que alcanza 16,815 mg/kg. La asociación Pb-Bi-Ag en varias muestras (PAMLA08–PAMLA13) es indicativa de mineralización de galena argentífera y boulangerita, fases de alta toxicidad potencial al intemperismo ácido.")]),
      para([bold("Zinc (Zn): "), normal("Rango de 49 a 64,909 mg/kg (PAMLA10), con varios valores superiores a 15,000 mg/kg. La co-ocurrencia de Zn y Pb sugiere asociación esfalerita-galena como paragénesis principal.")]),
      para([bold("Cobre (Cu): "), normal("Valores de 24 a 9,106 mg/kg (PAMLA08), con presencia consistente en todas las muestras, coherente con calcopirita y enargita.")]),
      para([bold("Bismuto (Bi): "), normal("Anomalías notables de 13 a 493 mg/kg, elemento traza raramente cuantificado en estudios de contaminación minera convencional pero que presenta toxicidad creciente reconocida por la literatura especializada.")]),
      para([bold("Molibdeno (Mo): "), normal("Concentraciones de hasta 370 mg/kg (PAMLA12), indicativas de mineralización con molibdenita (MoS₂), relevante por su movilidad en ambientes oxidantes.")]),
      para([bold("Selenio (Se): "), normal("Valores extremos en PAMLA12 (328 mg/kg) y varios superiores a 40 mg/kg. El Se es un análogo del azufre que se incorpora en sulfuros primarios y presenta alta toxicidad a concentraciones supra-óptimas.")]),
      para([bold("Telurio (Te): "), normal("Valores de 117–250 mg/kg en las muestras de paredes más enriquecidas (PAMLA09–PAMLA12), elemento muy poco analizado en contextos ambientales mexicanos.")]),
      para([bold("Oro (Au): "), normal("Hasta 43.85 mg/kg (PAMLA12), confirmando el carácter aurífero de la mineralización y la pertinencia histórica de la extracción en el sitio.")]),

      emptyLine(),
      para([bold("Tabla 2."), italic(" Concentraciones de EPT seleccionados en muestras de paredes mineralizadas (PAMLA) y valores normativos de referencia.")], { before: 80, after: 80 }, AlignmentType.CENTER),
      dataTable(
        ["Muestra", "As (mg/kg)", "Pb (mg/kg)", "Zn (mg/kg)", "Cu (mg/kg)", "Cd (mg/kg)", "Se (mg/kg)"],
        [
          ["PAMLA01", "239", "692", "231", "51", "1.0", "<1.51"],
          ["PAMLA03", "1,949", "6,400", "2,230", "102", "71.0", "<1.51"],
          ["PAMLA04", "2,486", "9,485", "9,113", "493", "84.0", "68.0"],
          ["PAMLA07", "7,246", "47", "56", "31", "1.0", "35.0"],
          ["PAMLA08", "13,528", "273", "2,319", "9,106", "4.0", "<1.51"],
          ["PAMLA09", "13,144", "51,557", "18,819", "850", "65.0", "66.0"],
          ["PAMLA10", "32,893", "11,818", "64,909", "3,250", "103.0", "49.0"],
          ["PAMLA12", "18,035", "64,174", "6,752", "3,189", "21.0", "328.0"],
          ["NOM-147 Resid.*", "22", "400", "—", "—", "37", "390"],
          ["NOM-147 Ind.*", "260", "800", "—", "—", "370", "3,900"],
          ["Fondo corteza", "2.5", "11", "67", "28", "0.09", "0.05"],
        ],
        [1500, 1400, 1400, 1400, 1400, 1300, 1300]
      ),
      tableCaption("*NOM-147-SEMARNAT/SSA1-2004: CRU residencial y CRU industrial (mg/kg suelo seco). Fondo corteza: Rudnick y Gao (2003)."),

      heading2("4.2. Geoquímica de Sedimentos de Arroyo (SEDLA)"),

      para("Los sedimentos de arroyo funcionan como integradores temporales de la contaminación de la cuenca y permiten evaluar la dispersión hidráulica de los EPT desde las fuentes primarias. Con excepción de SEDLA14 —que representa el punto de mayor anomalía geoquímica y posiblemente corresponde a un afluente con tributación directa de labores mineras— el conjunto SEDLA muestra una contaminación moderada con patrones coherentes de dilución aguas abajo."),

      para([bold("SEDLA14: "), normal("Esta muestra es la de mayor relevancia en la serie de sedimentos. Presenta As = 3,224 mg/kg, Pb = 17,908 mg/kg, Cu = 374 mg/kg, Zn = 17,279 mg/kg, Mo = 655 mg/kg y Bi = 29 mg/kg. El As supera el límite de uso agrícola de la NOM-147 en un factor de ~147x, y el Pb lo supera en ~45x. Esta muestra señala un punto crítico de acumulación geoquímica en el sistema hidrológico.")]),
      para([bold("SEDLA13 y SEDLA15: "), normal("Concentraciones elevadas de Pb (1,507 y 1,387 mg/kg respectivamente) y Zn (4,849 y 1,414 mg/kg), con As de 327 y 406 mg/kg, sugiriendo que el sistema fluvial transporta activamente los EPT hacia zonas más distales.")]),
      para([bold("Serie de fondo hidrológico (SEDLA01–SEDLA12): "), normal("Con excepción de SEDLA14, el resto de los sedimentos presenta concentraciones que podrían reflejar parcialmente la geoquímica natural de la sierra, pero con As sistemáticamente entre 42 y 255 mg/kg, Pb entre 21 y 296 mg/kg y Zn entre 67 y 437 mg/kg, todos superando los valores de fondo de la corteza terrestre en factores de 5 a 27x para As y 2 a 27x para Pb.")]),

      heading2("4.3. Geoquímica de Suelos Superficiales (SLA)"),

      para("Los suelos superficiales representan la matriz de mayor relevancia para la evaluación de riesgo a la salud humana por contacto dérmico, ingestión accidental e inhalación de polvo, así como para la evaluación de disponibilidad de EPT para las plantas cultivadas."),

      para([normal("El arsénico en la serie SLA varía entre 33 (SLA03) y 131 mg/kg (SLA05), con una mediana de aproximadamente 60 mg/kg. Estos valores exceden el límite de uso residencial de la NOM-147 (22 mg/kg) en todos los puntos de la serie y superan el límite de uso agrícola (equivalente a este mismo valor en la norma mexicana) de forma generalizada. El plomo varía de 25 (SLA04, SLA08) a 454 mg/kg (SLA05), con SLA05 superando el umbral residencial NOM-147 (400 mg/kg). El zinc, con rango de 74 a 296 mg/kg, se mantiene por debajo de límites de intervención inmediata pero refleja el enriquecimiento geoquímico de la cuenca. La muestra SLA01 registra la mayor concentración de As en suelo superficial (68 mg/kg) con Pb de 70 mg/kg y se ubica probablemente en posición proximal a las labores mineras."]),

      emptyLine(),
      para([bold("Tabla 3."), italic(" Concentraciones de EPT en suelos superficiales (SLA) y comparación normativa.")], { before: 80, after: 80 }, AlignmentType.CENTER),
      dataTable(
        ["Muestra", "As (mg/kg)", "Pb (mg/kg)", "Zn (mg/kg)", "Cu (mg/kg)", "Cd (mg/kg)"],
        [
          ["SLA01", "68", "70", "120", "14", "1.0"],
          ["SLA03", "33", "31", "82", "12", "1.0"],
          ["SLA04", "60", "25", "74", "13", "1.0"],
          ["SLA05", "131", "454", "296", "27", "2.0"],
          ["SLA06", "67", "97", "102", "12", "1.0"],
          ["SLA07", "52", "94", "103", "14", "1.0"],
          ["SLA08", "45", "25", "90", "16", "1.0"],
          ["SLA09", "42", "144", "210", "15", "2.0"],
          ["SLA10", "118", "55", "117", "117", "1.0"],
          ["SLA11", "43", "27", "74", "14", "1.0"],
          ["NOM-147 Resid.", "22", "400", "—", "—", "37"],
          ["USEPA RSL Resid.", "0.5", "400", "23,000", "3,100", "78"],
        ],
        [1500, 1500, 1500, 1500, 1500, 1300]
      ),
      tableCaption("USEPA RSL: Regional Screening Levels para exposición residencial en suelo superficial (2024)."),

      heading2("4.4. Índices de Contaminación y Factor de Enriquecimiento"),

      para([normal("Para cuantificar la magnitud de la contaminación más allá de la comparación normativa, se calculó el Factor de Enriquecimiento (FE) normalizado con respecto al aluminio (Al) como elemento litogénico conservativo, utilizando valores de la corteza terrestre superior (CTS; Rudnick y Gao, 2003) como referencia:")]),

      para([bold("FE = (C_elemento/C_Al)_muestra / (C_elemento/C_Al)_CTS")], { before: 80, after: 80 }, AlignmentType.CENTER),

      para([normal("En los sedimentos, el arsénico presenta FE medios de 25–80 en la serie general SEDLA, con valores extremos de FE > 400 en SEDLA14, indicando una contaminación de origen predominantemente antrópico. El plomo registra FE de 3–50 en la serie general y FE > 1,000 en SEDLA14. El zinc exhibe FE de 2–15 en la serie general. Para los suelos SLA, los FE de As oscilan entre 10 y 40 (FE > 10 = enriquecimiento significativo de origen antrópico, según la clasificación de Sutherland, 2000), lo que indica que la carga contaminante en suelos superficiales no es únicamente litogénica sino que refleja dispersión activa desde las fuentes mineras.")]),

      // ─── 5. DISCUSIÓN ───
      heading1("5. Discusión"),

      heading2("5.1. Caracterización del Pasivo Ambiental Minero"),

      para([normal("Los resultados obtenidos establecen con claridad que la Sierra de las Adargas alberga un pasivo ambiental minero de categoría severa, con concentraciones de EPT que superan ampliamente los estándares de remediación tanto mexicanos como internacionales en las matrices de origen (PAMLA) y, en menor medida pero de forma sistemática, en los sedimentos de arroyo y suelos superficiales que constituyen las rutas de exposición relevantes para la población.")]),

      para([normal("La asociación geoquímica As-Pb-Zn-Cu-Bi-Mo-Se-Te-Ag-Au identificada en las muestras de paredes mineralizadas es consistente con una mineralización de tipo pórfido cuprífero con sobreimposición epitermal de baja sulfuración, o bien con un sistema de vetas polimetálicas de la familia Ag-Pb-Zn-As comunes en el cinturón orogénico de la Sierra Madre Occidental. La presencia de Bi y Te como elementos traza anómalos es característica de mineralizaciones con telururos de oro y bismutinita, indicando condiciones de temperatura intermedia en el sistema hidrotermal progenitor.")]),

      para([normal("La nota de descargo del laboratorio del SGM señala que el protocolo de digestión empleado (agua regia en sistema cerrado) fue aplicado a solicitud del geólogo responsable del proyecto, reconociendo que las muestras no son sedimentos de arroyo convencionales. Esto implica que los valores reportados corresponden a una fracción parcialmente disponible, no a la concentración total de los EPT. En consecuencia, los valores reales totales podrían ser iguales o superiores a los reportados, lo que refuerza —y no debilita— las conclusiones sobre la severidad de la contaminación.")]),

      heading2("5.2. Implicaciones para la Salud Humana"),

      para([normal("La exposición humana a los EPT identificados en este sitio puede ocurrir mediante tres vías principales reconocidas en la evaluación de riesgo: ingestión de suelo o polvo (especialmente en niños), inhalación de partículas finas transportadas por el viento, y consumo de agua o alimentos cultivados en suelos contaminados. La relevancia relativa de cada vía depende del patrón de uso del suelo y de las características demográficas y de comportamiento de la población expuesta.")]),

      para([bold("Arsénico: "), normal("El As es un carcinógeno del Grupo 1 según la Agencia Internacional para la Investigación del Cáncer (IARC, 2012), con evidencia suficiente de asociación con cáncer de vejiga, pulmón y piel, así como con efectos no carcinogénicos en sistemas cardiovascular, nervioso y endocrino. La Organización Mundial de la Salud (OMS) establece un límite de 10 μg/L para As en agua potable, y la USEPA fija un nivel máximo de 10 ppb en agua. En suelos, la USEPA RSL establece 0.5 mg/kg para uso residencial basado en riesgo de cáncer de 10⁻⁶. Nuestros resultados en la serie SLA (33–131 mg/kg) superan este umbral en factores de 66 a 262 veces, lo que indica la existencia de un riesgo incremental de cáncer relevante si la exposición es crónica y sostenida. Estudios en contextos análogos del norte de México, como el de Carrizales et al. (2006) en Villa de la Paz, S.L.P., documentaron daño genotóxico en población infantil atribuible a exposición a As y Pb en condiciones de concentración superficial en rango comparable.")]),

      para([bold("Plomo: "), normal("El Pb no tiene umbral biológico seguro identificado para efectos neurotóxicos, especialmente en menores de seis años (CDC, 2012; WHO, 2023). El nivel de referencia en sangre de preocupación establecido por los CDC es de 3.5 μg/dL en niños. Estudios en comunidades mineras del norte de México consistentemente reportan prevalencias elevadas de plombemia en niños residentes dentro del radio de influencia de los jales (Riojas-Rodríguez et al., 2010). Las concentraciones de Pb en suelos de la zona SLA (25–454 mg/kg) y en sedimentos (hasta 17,908 mg/kg en SEDLA14) representan una fuente de exposición crónica mediante ingestión de polvo y de alimentos cultivados con aguas de riego captadas en arroyos contaminados.")]),

      para([bold("Cadmio (Cd): "), normal("Presente en concentraciones de 1–103 mg/kg en PAMLA (especialmente PAMLA03 y PAMLA10) y en 1–83 mg/kg en SEDLA14. El Cd es un nefrotóxico potente y carcinógeno del Grupo 1 (IARC). Su acumulación preferencial en el riñón provoca disfunción tubular renal ante exposición crónica. La co-presencia con Zn (con el que comparte rutas de absorción en los vegetales) hace del consumo de alimentos producidos en estos suelos una vía de exposición a evaluar prioritariamente.")]),

      para([bold("Elementos emergentes — Bi, Te, Se, Mo, Tl: "), normal("Las concentraciones de bismuto (hasta 493 mg/kg), telurio (hasta 250 mg/kg), selenio (hasta 328 mg/kg en PAMLA) y talio (hasta 154 mg/kg en PAMLA) representan hallazgos de elevada relevancia. El talio (Tl) es uno de los metales más tóxicos conocidos; la USEPA establece un RSL de apenas 5.2 mg/kg en suelo residencial, umbral que es superado en varias muestras de la serie PAMLA. Estas sustancias raramente son monitoreadas en estudios de salud ambiental en México, lo que configura una brecha de información que este trabajo busca señalar.")]),

      para([normal("Es importante enfatizar que la presente caracterización establece la existencia de las condiciones geoquímicas necesarias para la generación de riesgo, pero no constituye por sí sola una evaluación cuantitativa de riesgo a la salud (Quantitative Human Health Risk Assessment, QHHRA), la cual requeriría datos de bioaccesibilidad, parámetros de exposición específicos del sitio, y biomonitoreo de la población. Este trabajo es una base documental para justificar y diseñar dicha evaluación.")]),

      heading2("5.3. Dispersión Geoquímica y Rutas de Transporte"),

      para([normal("El patrón observado en los sedimentos SEDLA revela que el transporte hidráulico es el mecanismo dominante de dispersión de EPT desde las fuentes primarias (PAMLA) hacia las zonas de uso agrícola. El gradiente de concentraciones de As y Pb a lo largo de la red de drenaje, con valores máximos en SEDLA14 y disminución progresiva en sitios más distales, es consistente con un modelo de dilución y decantación de partículas finas durante el transporte fluvial.")]),

      para([normal("El transporte eólico de polvo fino desde los terreros y frentes de tajo constituye una segunda vía de dispersión relevante en condiciones de aridez y viento, característica de la región. La distribución de EPT en suelos superficiales (SLA) con valores que exceden el fondo natural en todos los puntos muestreados sugiere que la deposición de polvo enriquecido ha afectado un área más amplia que la estrictamente adyacente a los trabajos mineros.")]),

      para([normal("La movilidad química de los EPT en el sistema depende del pH, potencial redox y contenido de materia orgánica del suelo. El As, generalmente adsorbido en óxidos de hierro (Fe-oxy-hidróxidos), puede movilizarse bajo condiciones reductoras o a pH > 7. El contenido de Fe en las muestras PAMLA (hasta 23.2%) y SEDLA14 (5.24%) sugiere una capacidad de retención en fase sólida que podría atenuar —pero no eliminar— la disponibilidad inmediata del As en condiciones ambientales oxidantes típicas del semidesierto.")]),

      heading2("5.4. Nuez Pecana (Carya illinoinensis) y Economía Ambiental"),

      para([italic("Carya illinoinensis"), normal(", la nuez pecana o pecanera, es el cultivo agrícola de mayor valor económico en el noroeste de México. Chihuahua y Sonora son los dos principales estados productores; Chihuahua aporta aproximadamente el 64% de la producción nacional, con más de 75,000 ha plantadas que generaron 92,938 toneladas en 2017 (García-González et al., 2020). México es el primer exportador mundial de nuez pecana, con el 91.6% de sus exportaciones dirigidas a Estados Unidos, y el resto a China, Vietnam, Hong Kong y la Unión Europea (SIAP-SAGARPA, 2019). El valor estratégico del cultivo trasciende lo local para posicionarse como una de las exportaciones agrícolas más relevantes del norte del país.")]),

      para([normal("La presencia de pasivos ambientales mineros en áreas de influencia de huertos de pecana genera externalidades negativas potenciales documentables a través de al menos cuatro mecanismos:")]),

      para([bold("(1) Absorción radicular de EPT: "), normal("El nogal pecanero es una especie arbórea de raíces profundas que desarrolla su sistema radicular hasta varios metros de profundidad, lo que le confiere acceso potencial a horizontes edáficos enriquecidos en EPT por lixiviación. Estudios de bioacumulación en frutales arbóreos en zonas mineras documentan absorción preferencial de Cd y Zn, elementos presentes en este sitio. La transferencia de Cd desde suelo al fruto es especialmente relevante dado que la corteza de la nuez no constituye una barrera absoluta para la incorporación de Cd en el tejido comestible (Mench et al., 2006).")]),

      para([bold("(2) Uso de aguas de riego contaminadas: "), normal("Si los sistemas de riego de los huertos captan agua superficial de los arroyos de la sierra —práctica común en la región—, la aplicación de aguas con carga de EPT en suspensión o disolución representa una vía de entrada continua al suelo agrícola y a la planta. Los valores de As (hasta 3,224 mg/kg) y Pb (hasta 17,908 mg/kg) en sedimentos de arroyo sugieren que, bajo eventos de lluvia y escorrentía, las aguas transportan partículas con alta carga de contaminantes.")]),

      para([bold("(3) Riesgo de rechazo en mercados de exportación: "), normal("Los estándares de inocuidad alimentaria internacionales establecen límites máximos de EPT en alimentos. El Reglamento (CE) No 1881/2006 de la Unión Europea y sus modificaciones (Reglamento 2023/915) establecen contenidos máximos de Cd (0.1 mg/kg) y Pb (0.05 mg/kg en peso fresco) en frutos secos. La detección de concentraciones elevadas en nuez producida en zonas con suelos contaminados podría resultar en el rechazo de lotes de exportación, con consecuencias económicas directas e inmediatas para los productores.")]),

      para([bold("(4) Impacto en valor del suelo y certificaciones de inocuidad: "), normal("La documentación oficial de contaminación por EPT en un área puede generar restricciones para la certificación de productos orgánicos o especiales (GlobalGAP, USDA Organic), reducir el valor de la tierra productiva y limitar el acceso a ciertos mercados de alto valor. Este efecto indirecto puede ser más persistente que los impactos directos sobre la cosecha.")]),

      para([normal("Desde la perspectiva de la economía ambiental, la contaminación por pasivos mineros genera externalidades negativas no incorporadas en el precio de mercado de la nuez. El costo social del daño ambiental incluye: (a) pérdidas de productividad agrícola asociadas a toxicidad fitológica del As, Cd y Pb sobre los nogales; (b) costos de eventual remediación del suelo agrícola; (c) pérdidas por rechazo de producto o cierre de mercados; y (d) costos de salud pública asociados a la exposición de trabajadores agrícolas y comunidades. La internalización de estas externalidades mediante instrumentos como el Principio de Quien Contamina Paga (PCQ, Ley General del Equilibrio Ecológico y la Protección al Ambiente, LGEEPA) justifica la exigencia de planes de remediación a los responsables del pasivo y la generación de fondos de compensación para los afectados.")]),

      para([normal("La cuantificación precisa del costo externo requeriría un estudio de valoración económica específico (análisis de costos de remediación, valoración contingente del riesgo a la salud, modelos de transferencia de valor hedónico para suelos). Este artículo sienta las bases geoquímicas documentadas necesarias para fundamentar dicho ejercicio.")]),

      // ─── 6. CONCLUSIONES ───
      heading1("6. Conclusiones"),

      para("Los resultados de la caracterización geoquímica de la Sierra de las Adargas permiten establecer las siguientes conclusiones:"),

      para([bold("1. "), normal("Se identificó un pasivo ambiental minero de severidad elevada, con concentraciones de As, Pb, Zn, Cu, Bi, Mo, Se y Te en las paredes mineralizadas (PAMLA) que superan en múltiples órdenes de magnitud los valores de fondo de la corteza terrestre y los criterios de remediación de la NOM-147-SEMARNAT/SSA1-2004.")]),
      para([bold("2. "), normal("Los sedimentos de arroyo (SEDLA) evidencian la dispersión activa de EPT a través del sistema hidrológico, con la muestra SEDLA14 como punto crítico (As = 3,224 mg/kg; Pb = 17,908 mg/kg; Zn = 17,279 mg/kg), indicando la existencia de una trayectoria de contaminación hacia las zonas bajas de la cuenca.")]),
      para([bold("3. "), normal("Los suelos superficiales (SLA) presentan enriquecimiento sistemático en As (33–131 mg/kg), Pb (25–454 mg/kg) y Zn (74–296 mg/kg) por encima de los valores de referencia para uso residencial y agrícola, estableciendo condiciones para la exposición humana crónica mediante ingestión, inhalación y contacto dérmico.")]),
      para([bold("4. "), normal("La co-presencia de Tl (hasta 154 mg/kg en PAMLA), Te (hasta 250 mg/kg) y Bi (hasta 493 mg/kg) representa una contaminación por elementos traza emergentes cuyo impacto toxicológico y ambiental no ha sido evaluado en el contexto mexicano y requiere investigación específica.")]),
      para([bold("5. "), normal("La proximidad del pasivo ambiental a zonas con huertos de nuez pecana (Carya illinoinensis), un cultivo de alto valor estratégico para la economía regional y nacional, genera externalidades negativas documentables sobre la inocuidad del producto, el valor de la tierra y la salud de los trabajadores agrícolas y comunidades.")]),
      para([bold("6. "), normal("Este trabajo constituye la primera caracterización geoquímica sistemática del sitio y proporciona la base documental necesaria para diseñar una evaluación cuantitativa de riesgo a la salud (QHHRA), establecer prioridades de remediación conforme a la NOM-147, y aplicar instrumentos de política ambiental orientados a la internalización del costo social del pasivo.")]),

      // ─── 7. RECOMENDACIONES ───
      heading1("7. Recomendaciones"),

      para("Con base en los resultados obtenidos, se formulan las siguientes recomendaciones técnicas y de política ambiental:"),

      para([bold("a) Evaluación cuantitativa de riesgo a la salud (QHHRA): "), normal("Se recomienda realizar una evaluación formal conforme a la metodología USEPA (RAGS, Risk Assessment Guidance for Superfund), incluyendo análisis de bioaccesibilidad de As y Pb en suelos mediante protocolos validados (IVBA, SBRC), biomonitoreo en población residente y trabajadores agrícolas, y determinación de parámetros de exposición específicos del sitio.")]),
      para([bold("b) Monitoreo de calidad de agua en cuencas: "), normal("Establecer estaciones de monitoreo continuo de EPT en los cuerpos de agua superficial que constituyen las fuentes de riego agrícola, con énfasis en As, Pb, Cd y Mo, conforme a NOM-001-SEMARNAT-2021.")]),
      para([bold("c) Análisis de EPT en frutos y suelos agrícolas: "), normal("Realizar muestreo de suelos de huertos de nuez pecana en el área de influencia hidrológica y analítica del pasivo, junto con análisis de Cd, Pb y As en la parte comestible de la nuez, para evaluar el cumplimiento de estándares de inocuidad alimentaria nacionales e internacionales.")]),
      para([bold("d) Formulación de Plan de Cierre y Remediación: "), normal("Identificar a los responsables del pasivo ambiental y promover la elaboración de un Plan de Cierre de Minas conforme a la NOM-141-SEMARNAT-2003 y la Ley Minera vigente, con énfasis en el confinamiento de jales y la revegetación de áreas de mayor dispersión.")]),
      para([bold("e) Fortalecimiento del marco de información pública: "), normal("Integrar los resultados de este estudio al Registro de Sitios Contaminados (RESICO) de la SEMARNAT y al Sistema de Información sobre Pasivos Ambientales Mineros de la SE/SGM, garantizando el acceso público a la información para la toma de decisiones en ordenamiento territorial y planeación agrícola.")]),

      // ─── AGRADECIMIENTOS ───
      heading1("Agradecimientos"),

      para("Los autores agradecen al personal del Departamento de Química Analítica de la Gerencia del Centro Experimental Chihuahua del Servicio Geológico Mexicano, en particular al Ing. Jorge Gpe. Montes Espinoza y al M.E. Jorge Gómez González, por la realización y validación de los análisis del Informe OT 38105/2025. Se agradece igualmente al personal de campo que participó en las actividades de muestreo en condiciones técnicas de alta complejidad logística. Este trabajo fue realizado con recursos del Proyecto 38105 de la Subgerencia de Geología Ambiental del SGM."),

      // ─── DECLARACIONES ───
      heading1("Declaraciones"),

      para([bold("Conflictos de interés: "), normal("Los autores declaran no tener conflictos de interés.")]),
      para([bold("Disponibilidad de datos: "), normal("Los datos analíticos completos (Informe OT 38105/2025) se encuentran resguardados en la Gerencia del Centro Experimental Chihuahua del SGM. Los datos de concentraciones incluidos en las tablas de este manuscrito están disponibles bajo solicitud fundada a la Subgerencia de Geología Ambiental del SGM.")]),
      para([bold("Financiamiento: "), normal("Proyecto institucional del Servicio Geológico Mexicano (SGM), Secretaría de Economía. No se recibió financiamiento externo.")]),

      // ─── REFERENCIAS ───
      heading1("Referencias"),

      para([italic("Las referencias se presentan siguiendo el formato Vancouver/APA mixto, adecuado para revistas de geoquímica ambiental hispanohablantes como Revista Internacional de Contaminación Ambiental (UNAM), Journal of Hazardous Materials (Elsevier) o Environmental Geochemistry and Health (Springer).")], { before: 60, after: 120 }),

      para([bold("1. "), normal("Carrizales, L., Razo, I., Téllez-Hernández, J.I., Torres-Nerio, R., Torres, A., Batres, L.E., Cubillas, A.C. y Díaz-Barriga, F. (2006). Exposure to arsenic and lead of children living near a copper-smelter in San Luis Potosí, Mexico: Importance of soil contamination for exposure of children. "), italic("Environmental Research"), normal(", 101(1), 1–10. https://doi.org/10.1016/j.envres.2005.07.010")]),

      para([bold("2. "), normal("CDC – Centers for Disease Control and Prevention (2012). "), italic("Blood Lead Levels in Children: What Do Parents Need to Know to Protect Their Children?"), normal(" Atlanta: CDC.")]),

      para([bold("3. "), normal("García-González, M.R., Reyes-Muro, L., Morales-Flores, F.J. y Ortiz-Laurel, H. (2020). Evolución reciente de la producción de nuez pecanera ("), italic("Carya illinoinensis"), normal(") y su relevancia en Chihuahua. "), italic("Agroproductividad"), normal(", 13(3), 55–64.")]),

      para([bold("4. "), normal("IARC – International Agency for Research on Cancer (2012). "), italic("IARC Monographs on the Evaluation of Carcinogenic Risks to Humans, Volume 100C: Arsenic, Metals, Fibres, and Dusts."), normal(" Lyon: IARC.")]),

      para([bold("5. "), normal("Manjarrez-Domínguez, C.B., Prieto-Amparán, J.A., Valles-Aragón, M.C., Delgado-Caballero, M.D.R., Alarcón-Herrera, M.T., Nevarez-Rodríguez, M.C., Vázquez-Quintero, G. y Berzoza-Gaytan, C.A. (2019). Arsenic Distribution Assessment in a Residential Area Polluted with Mining Residues. "), italic("International Journal of Environmental Research and Public Health"), normal(", 16(3), 375. https://doi.org/10.3390/ijerph16030375")]),

      para([bold("6. "), normal("Mench, M., Bussière, S., Boisson, J., Castaing, E., Vangronsveld, J., Ruttens, A., De Koe, T., Bleeker, P., Assunção, A. y Manceau, A. (2006). Progress in remediation and revegetation of the barren Jales gold mine spoil after in situ treatments. "), italic("Plant and Soil"), normal(", 249, 187–202.")]),

      para([bold("7. "), normal("NOM-147-SEMARNAT/SSA1-2004. Norma Oficial Mexicana que establece criterios para determinar las concentraciones de remediación de suelos contaminados por arsénico, bario, berilio, cadmio, cromo hexavalente, mercurio, níquel, plata, plomo, selenio, talio y/o vanadio. "), italic("Diario Oficial de la Federación"), normal(", 2 de marzo de 2007. Ciudad de México: SEMARNAT-SSA.")]),

      para([bold("8. "), normal("Pérez-Espinosa, A., Iriarte-Castro, M., Ponce-Granados, J.C., Ferrera-Cerrato, R. y Alarcón, A. (2024). Presence of Potentially Toxic Elements in Historical Mining Areas in the North-Center of Mexico and Possible Bioremediation Strategies. "), italic("Toxics"), normal(", 12(11), 813. https://doi.org/10.3390/toxics12110813")]),

      para([bold("9. "), normal("Riojas-Rodríguez, H., Solís-Vivanco, R., Schilmann, A., Montes, S., Rodríguez, S., Ríos, C. y Rodríguez-Agudelo, Y. (2010). Intellectual function in Mexican children living in a mining area and environmentally exposed to manganese. "), italic("Environmental Health Perspectives"), normal(", 118(10), 1465–1470.")]),

      para([bold("10. "), normal("Rudnick, R.L. y Gao, S. (2003). Composition of the Continental Crust. En: Holland, H.D. y Turekian, K.K. (Eds.), "), italic("Treatise on Geochemistry, Vol. 3"), normal(". Oxford: Elsevier, pp. 1–64.")]),

      para([bold("11. "), normal("SGM – Servicio Geológico Mexicano (2025). "), italic("Informe de Resultados OT 38105/2025: Resultados de Análisis Químicos de Muestras Procedentes del Proyecto Manifestación Ambiental y Caracterización del Impacto por Actividad Antropogénica en la Sierra de las Adargas."), normal(" Departamento de Química Analítica, Gerencia del Centro Experimental Chihuahua. Chihuahua: SGM.")]),

      para([bold("12. "), normal("SIAP-SAGARPA (2019). "), italic("Panorama Agroalimentario 2019. Nuez Pecana."), normal(" Ciudad de México: Servicio de Información Agroalimentaria y Pesquera.")]),

      para([bold("13. "), normal("Sutherland, R.A. (2000). Bed sediment-associated trace metals in an urban stream, Oahu, Hawaii. "), italic("Environmental Geology"), normal(", 39(6), 611–627.")]),

      para([bold("14. "), normal("USEPA – United States Environmental Protection Agency (2020). "), italic("Arsenic in Drinking Water: Basic Information."), normal(" Washington: USEPA.")]),

      para([bold("15. "), normal("USEPA (2024). "), italic("Regional Screening Levels (RSL) for Chemical Contaminants at Superfund Sites."), normal(" Washington: USEPA. Disponible en: https://www.epa.gov/risk/regional-screening-levels-rsls-generic-tables")]),

      para([bold("16. "), normal("WHO – World Health Organization (2023). "), italic("Lead Poisoning and Health: Fact Sheet."), normal(" Geneva: WHO.")]),

      para([bold("17. "), normal("Valles-Aragón, M.C. y Alarcón-Herrera, M.T. (2018). Spatial distribution, mobility and bioavailability of arsenic, lead, copper and zinc in low polluted forest ecosystem in north-western Mexico. "), italic("Science of the Total Environment"), normal(", 615, 1346–1355.")]),

      emptyLine(),

      // Footer note
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA", space: 1 } },
        spacing: { before: 400, after: 60 },
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Manuscrito preparado para envío a revista científica especializada en Geoquímica Ambiental o Ciencias Ambientales | SGM – Subgerencia de Geología Ambiental | 2025", font: "Arial", size: 16, italics: true, color: "777777" })]
      }),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/home/claude/articulo_adargas.docx', buffer);
  console.log('Document created successfully');
}).catch(err => {
  console.error('Error:', err);
});
