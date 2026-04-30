const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');
const https = require('https');
const axios = require('axios');
const sharp = require('sharp');

// ==================== SPECIES DATA ====================
const species = [
  {
    sciName: "Tlacuatzin canescens",
    comName: "Tlacuache ratón gris",
    desc: "Descripción: Marsupial didélfido de tamaño pequeño (longitud total de 20 a 30 cm). Presenta pelaje corto y denso, con una coloración dorsal que varía del grisáceo al pardo claro, y una región ventral blanquecina o crema. Posee orejas grandes, desnudas y redondeadas, prominentes anillos oculares oscuros y un hocico aguzado con vibrisas táctiles bien desarrolladas. Su cola es prensil, ligeramente bicoloreada y desprovista de pelo en sus dos tercios distales. Es una especie de hábitos marcadamente nocturnos, solitarios y semiarborícolas, con una dieta omnívora oportunista que incluye insectos, pequeños vertebrados, frutos y néctar (CONABIO, 2025a). Distribución: Especie endémica de México. Su distribución se extiende principalmente por la vertiente del Pacífico y centro del país, habitando matorrales xerófilos, selvas bajas caducifolias y zonas de transición (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Cathartes aura",
    comName: "Zopilote aura",
    desc: "Descripción: Ave rapaz carroñera de gran envergadura (hasta 1.8 metros con las alas abiertas) y peso aproximado de 1.5 a 2 kg. Presenta plumaje negro parduzco oscuro en todo el cuerpo, contrastando fuertemente con la cabeza y la parte superior del cuello, los cuales están desprovistos de plumas y exhiben una piel rugosa de color rojo intenso en los adultos (grisácea en juveniles). Su pico es corto, pálido y en forma de gancho, adaptado para desgarrar. Se distingue en vuelo por mantener sus alas en una forma de \"V\" poco profunda (diedro) y por su vuelo oscilante. Posee un lóbulo olfativo altamente desarrollado, rasgo inusual en aves, que le permite detectar el gas etilmercaptano emitido por la carroña bajo el dosel forestal (CONABIO, 2025a). Distribución: Especie nativa con una distribución sumamente amplia, abarcando desde el sur de Canadá hasta el extremo sur de Sudamérica, siendo común en casi todo el territorio mexicano y altamente adaptable (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Melanerpes formicivorus",
    comName: "Carpintero bellotero",
    desc: "Descripción: Pájaro carpintero de tamaño medio (aprox. 21 cm) y complexión robusta. Presenta un marcado patrón de plumaje: dorso, alas, cola y pecho de color negro lustroso, y blanco puro en la garganta, frente y vientre inferior, así como en la rabadilla (visible en vuelo). Ambos sexos presentan una corona roja brillante, aunque en los machos se extiende hasta la frente. Sus iris son pálidos, blanquecinos o amarillentos. Su morfología está adaptada para una estructura social compleja (cría cooperativa). Desarrollan \"graneros\", perforando miles de agujeros en árboles muertos o postes de madera para almacenar bellotas, su principal fuente de alimento invernal (CONABIO, 2025a). Distribución: Especie nativa que se distribuye desde el oeste de Estados Unidos hasta la región norandina de Colombia. En México habita primordialmente los bosques de pino-encino en sistemas montañosos como la Sierra Madre Occidental (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Buteo jamaicensis",
    comName: "Aguililla Cola Roja",
    desc: "Descripción: Ave rapaz diurna robusta, catalogada como uno de los falconiformes más grandes de Norteamérica (45 a 65 cm de longitud y hasta 1.4 metros de envergadura). Presenta un ligero dimorfismo sexual inverso, siendo las hembras un 25% más grandes que los machos. El morfo típico exhibe dorso marrón oscuro moteado y partes ventrales pálidas con una \"banda del vientre\" oscura y estriada. Su característica diagnóstica en etapa adulta es el color rufo o ladrillo intenso en el haz de las rectrices de su cola. Sus tarsos son fuertes y carecen de plumas. Es un depredador generalista de percha y vuelo alto, alimentándose principalmente de roedores, lagomorfos y reptiles (CONABIO, 2025a). Distribución: Especie nativa ampliamente distribuida desde Alaska hasta las Antillas y Centroamérica, ocupando desde ecosistemas áridos y pastizales hasta bosques templados y selvas de México (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010. Está incluida en el Apéndice II de CITES."
  },
  {
    sciName: "Crotalus spp.",
    comName: "Víboras de foseta y cascabeles",
    desc: "Descripción: Serpientes venenosas solenoglifas (con colmillos inoculadores tubulares, móviles y retráctiles en la parte anterior del maxilar). Morfológicamente se caracterizan por una cabeza marcadamente subtriangular o acorazonada (diferenciada del cuello), pupilas elípticas verticales que denotan sus hábitos principalmente crepusculares/nocturnos, y escamas fuertemente quilladas que les otorgan un aspecto áspero. El rasgo diagnóstico de la subfamilia Crotalinae es la foseta loreal, un órgano termosensor situado entre el ojo y la narina que les permite detectar presas endotérmicas. Las especies del género Crotalus poseen un apéndice córneo en el extremo de la cola (cascabel) formado por segmentos de queratina entrelazados (CONABIO, 2025a). Distribución: Familia nativa con una extensa radiación evolutiva a lo largo del país. Muchas especies del norte de México y la Sierra Madre Occidental son endemismos mexicanos asociados a hábitats templados y rocosos (CONABIO, 2025a). Estatus de conservación: Al tratarse de una familia y no de una especie concreta, no cuenta con una categoría única; sin embargo, se indica explícitamente que diversas especies de esta familia documentadas en Durango (ej. especies del género Crotalus) se encuentran Amenazadas (A) o Sujetas a Protección Especial (Pr) dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Toxostoma curvirostre",
    comName: "Cuitlacoche pico curvo",
    desc: "Descripción: Ave paseriforme mimética de tamaño mediano (aprox. 25 a 28 cm). Su rasgo morfológico más distintivo es su pico oscuro, notablemente largo, delgado y marcadamente curvado hacia abajo, adaptado para escarbar en la hojarasca y el suelo. Exhibe un plumaje dorsal pardo grisáceo monótono, mientras que su región ventral es gris más claro con motas o estrías circulares oscuras difusas en el pecho. Presenta una cola larga que suele mantener alzada y ojos de color naranja a amarillo brillante. Es un ave marcadamente terrestre que prefiere correr rápidamente entre los matorrales antes que volar largas distancias (CONABIO, 2025a). Distribución: Especie nativa con amplia presencia en zonas áridas, semiáridas y de matorrales desde el suroeste de los Estados Unidos hasta el sur de México (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Cyrtonyx montezumae",
    comName: "Codorniz de Moctezuma",
    desc: "Descripción: Ave galliforme rechoncha, de patas robustas y cola sumamente corta, con una longitud de apenas 20-22 cm. Presenta un fuerte dimorfismo sexual. El macho exhibe un patrón facial tipo arlequín muy marcado en blanco y negro, una cresta occipital cobriza orientada hacia atrás, dorso finamente vermiculado y flancos grises a negruzcos profusamente salpicados de puntos blancos gruesos. La hembra es de un tono castaño críptico para el camuflaje, con motas canela. Tienen garras excepcionalmente largas, especializadas para desenterrar bulbos, tubérculos y rizomas. Su principal estrategia de defensa es el estatismo (quedarse inmóviles) en lugar de volar al sentirse amenazadas (CONABIO, 2025a). Distribución: Especie nativa que se distribuye a lo largo de las áreas montañosas desde el sur de Estados Unidos (Arizona, Nuevo México) hasta el centro-sur de México, habitando principalmente los bosques de encino, pino-encino y pastizales altos (CONABIO, 2025a). Estatus de conservación: Se encuentra bajo la categoría de Sujeta a Protección Especial (Pr) dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Dicotyles tajacu",
    comName: "Pecarí de collar",
    desc: "Descripción: Mamífero artiodáctilo de complexión robusta, patas delgadas y cola vestigial, con un peso que oscila entre los 15 y 25 kg. Su pelaje es denso, hirsuto y de coloración grisácea oscura o negruzca, caracterizándose por una banda o \"collar\" de pelo de color crema o blanco amarillento que cruza sus hombros diagonalmente. Su cabeza es grande en proporción al cuerpo, con un hocico en forma de disco truncado adaptado para hozar. Poseen caninos rectos y afilados que se auto-afilan mediante fricción. Presentan una glándula odorífera dorsal (en la grupa) utilizada para el reconocimiento social y la marcación de territorio en sus grupos, los cuales son altamente cohesivos (CONABIO, 2025a). Distribución: Especie nativa de gran plasticidad ecológica, distribuida desde el suroeste estadounidense, pasando por todo México, hasta el norte de Argentina. Ocupa desiertos, sabanas, zonas montañosas y selvas (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Puma concolor",
    comName: "Puma",
    desc: "Descripción: Es el felino silvestre más grande de México que carece de rosetas o manchas en su etapa adulta (concolor = de un solo color). Posee un cuerpo esbelto y sumamente musculoso, con un peso de 35 a 70 kg. Su pelaje es corto y uniforme, variando de tonos leonados o pardo rojizos a grises, con áreas blanquecinas en la garganta, pecho y zona ventral. Su cabeza es relativamente pequeña y redondeada, con fuertes mandíbulas. Las extremidades posteriores son más largas y fuertes que las anteriores, lo que le confiere una excepcional capacidad de salto. Su cola es larga, cilíndrica y rematada con un mechón oscuro. Es un depredador ápice de hábitos solitarios y territoriales (CONABIO, 2025a). Distribución: Especie nativa con la distribución más amplia de cualquier mamífero terrestre silvestre en las Américas, abarcando desde Canadá hasta la Patagonia, presente en diversos ecosistemas de México, especialmente zonas serranas y de difícil acceso (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010. Se regula bajo la Ley General de Vida Silvestre y figura en el Apéndice I y II de CITES."
  },
  {
    sciName: "Zenaida asiatica",
    comName: "Paloma alas blancas",
    desc: "Descripción: Ave columbiforme de cuerpo robusto y cabeza pequeña, midiendo entre 25 y 30 cm de largo. Exhibe un plumaje mayormente gris parduzco liso, tornándose ligeramente rosáceo en el pecho. Su característica diagnóstica clave es una extensa franja blanca en las coberteras mayores de las alas, la cual aparece como un borde blanco cuando el ave está posada, pero es sumamente visible como una media luna brillante durante el vuelo. Presenta un anillo de piel desnuda color azul celeste alrededor de sus ojos de iris rojo-anaranjado, y una pequeña mancha negra en las coberteras auriculares. Es una especie gregaria con un importante rol ecológico como dispersora de semillas (CONABIO, 2025a). Distribución: Especie nativa que se reproduce desde el suroeste de EE. UU. a través de México hasta América Central. Altamente común en zonas áridas, áreas agrícolas y matorrales (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Megascapheus umbrinus",
    comName: "Tuza sureña",
    desc: "Descripción: Roedor fosorial altamente modificado morfológicamente para la vida subterránea. Presenta un cuerpo cilíndrico, cuello corto y musculoso, ojos y orejas notablemente reducidos, y extremidades anteriores cortas y fuertes provistas de poderosas garras para la excavación. Se distingue por poseer abazones externos forrados de pelo (bolsas en las mejillas) utilizados para transportar alimento sin tragar tierra. Los incisivos son prominentes y quedan expuestos fuera de los labios cerrados. Su coloración dorsal es altamente variable según el sustrato de su hábitat, variando desde castaños oscuros a grisáceos (CONABIO, 2025a). Distribución: Especie nativa, distribuida principalmente en las elevaciones medias a altas desde el suroeste de Estados Unidos hasta las áreas de la Faja Volcánica Transmexicana y la Sierra Madre Occidental (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Odocoileus virginianus",
    comName: "Venado cola blanca",
    desc: "Descripción: Ungulado artiodáctilo de tamaño mediano (peso adulto entre 40 y 100 kg según la subespecie). Su pelaje carece de manchas en la madurez y varía estacionalmente: pardo rojizo brillante y ligero durante el verano, y más denso y grisáceo en invierno. Es inconfundible por el blanco puro de la región anal y el envés de su cola, la cual erigen rápidamente a modo de \"bandera\" como señal visual de alarma al emprender la huida. Presentan dimorfismo sexual pronunciado; únicamente los machos desarrollan astas caducas anuales, las cuales surgen de un tallo principal hacia adelante del que se desprenden puntas individuales (rara vez bifurcadas) (CONABIO, 2025a). Distribución: Especie nativa con una vasta distribución que recorre desde el sur de Canadá hasta la porción norte de Sudamérica, con múltiples subespecies adaptadas a la gran variedad de biomas mexicanos, incluyendo los bosques templados duranguenses (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Urocyon cinereoargenteus",
    comName: "Zorra gris",
    desc: "Descripción: Cánido de talla pequeña a mediana, grácil, con un peso aproximado de 3 a 7 kg. Posee un pelaje denso y áspero, color gris salpicado (\"pimienta\"), fuertemente contrastado con tonalidades cálidas rojizas o anaranjadas en la nuca, los flancos, la parte inferior de las extremidades y el pecho; la garganta y el vientre son blancuzcos. Su cola es larga y frondosa, caracterizada por presentar una distintiva línea o \"cresta\" de pelo negro rígido a lo largo del borde dorsal y una punta oscura. Anatómicamente, posee garras semi-retráctiles e inusualmente curvadas para un cánido, lo que le confiere una notable destreza para trepar árboles y arbustos (CONABIO, 2025a). Distribución: Especie nativa, distribuida ampliamente desde el sur de Canadá hasta el norte de Sudamérica. Ocupa gran variedad de hábitats mexicanos y es uno de los pocos cánidos con destreza biológica para trepar árboles (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Sciurus aberti",
    comName: "Ardilla de Abert",
    desc: "Descripción: Roedor esciuromorfo de tamaño mediano a grande (hasta 50 cm de longitud total, incluyendo la cola). Su rasgo más diagnóstico es la presencia de prominentes y alargados mechones de pelo en las puntas de sus orejas, los cuales son particularmente densos y evidentes durante la temporada invernal. Presenta pelaje dorsal gris oscuro o negro salpicado, generalmente con una banda longitudinal rojiza u óxido a lo largo de la espalda. Las partes inferiores y el contorno de los ojos son de color blanco puro. Su cola es muy ancha y tupida, gris en el haz y predominantemente blanca en el envés. No almacena alimento en escondites, forrajeando diariamente (CONABIO, 2025a). Distribución: Especie nativa con una estrecha afinidad ecológica a los bosques de coníferas (asociación directa con Pinus spp.) de los ecosistemas montañosos del sur de Estados Unidos, extendiéndose a la Sierra Madre Occidental en México (CONABIO, 2025a). Estatus de conservación: Como taxón global no se lista en peligro; sin embargo, en México, la subespecie endémica poblacional Sciurus aberti phaeiurus está formalmente clasificada como Sujeta a Protección Especial (Pr) en la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Myotis thysanodes",
    comName: "Murciélago ratón peludo",
    desc: "Descripción: Mamífero volador de la familia Vespertilionidae, de tamaño mediano (envergadura alar de unos 26-30 cm). Se identifica morfológicamente por una característica única dentro del género: el borde libre de su uropatagio (membrana interfemoral) está conspicuamente ribeteado por una franja de pelos cortos y rígidos, claramente visibles a simple vista. Su pelaje corporal no es brillante, presentando tonos canela a pardo amarillento en el dorso, y un color ante o blancuzco en la zona ventral. Posee alas negruzcas y orejas relativamente grandes (16-20 mm) con un trago largo y delgado. Tiene un vuelo lento y altamente maniobrable para capturar insectos cerca del dosel o el suelo (CONABIO, 2025a). Distribución: Especie nativa que habita desde la zona occidental y centro de América del Norte hasta el centro-sur de México. Frecuenta bosques templados, selvas y matorrales secos, siendo una especie principalmente insectívora y troglófila (CONABIO, 2025a). Estatus de conservación: No presenta alguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  }
];

// ===================== BIBLIOGRAPHY DATA =====================
// ===================== BIBLIOGRAPHY DATA =====================
const biblio = [
  "Comisión Nacional para el Conocimiento y Uso de la Biodiversidad. (CONABIO, 2025a). Catálogo de autoridades taxonómicas de especies de flora y fauna con distribución en México. Base de datos SNIB-CONABIO, México.",
  "CONABIO. (2025). Buteo jamaicensis. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Buteo+jamaicensis",
  "CONABIO. (2025). Cathartes aura. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Cathartes+aura",
  "CONABIO. (2025). Crotalus spp. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Crotalus",
  "CONABIO. (2025). Cyrtonyx montezumae. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Cyrtonyx+montezumae",
  "CONABIO. (2025). Dicotyles tajacu. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Dicotyles+tajacu",
  "CONABIO. (2025). Megascapheus umbrinus. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Megascapheus+umbrinus",
  "CONABIO. (2025). Melanerpes formicivorus. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Melanerpes+formicivorus",
  "CONABIO. (2025). Myotis thysanodes. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Myotis+thysanodes",
  "CONABIO. (2025). Odocoileus virginianus. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Odocoileus+virginianus",
  "CONABIO. (2025). Puma concolor. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Puma+concolor",
  "CONABIO. (2025). Sciurus aberti. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Sciurus+aberti",
  "CONABIO. (2025). Tlacuatzin canescens. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Tlacuatzin+canescens",
  "CONABIO. (2025). Toxostoma curvirostre. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Toxostoma+curvirostre",
  "CONABIO. (2025). Urocyon cinereoargenteus. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Urocyon+cinereoargenteus",
  "CONABIO. (2025). Zenaida asiatica. EncicloVida. Recuperado de: https://enciclovida.mx/busqueda?nombre=Zenaida+asiatica",
  "Secretaría de Medio Ambiente y Recursos Naturales (SEMARNAT, 2010). Norma Oficial Mexicana NOM-059-SEMARNAT-2010. Protección ambiental, especies nativas de flora y fauna silvestres de México. Diario Oficial de la Federación."
];

// ===================== OBSERVATIONS FETCHING LOGIC =====================
function fetchTwoImageUrls(sciName) {
  return new Promise((resolve) => {
    // 1. Limpiamos el " spp." si existe (para Crotalus)
    const queryName = sciName.replace(' spp.', '');
    // 2. Agregamos quality_grade=research para mejores fotos de tu mismo código
    const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(queryName)}&photos=true&per_page=10&quality_grade=research`;
    
    https.get(url, { headers: { 'User-Agent': 'FloraScript/Final' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const photos = [];
          if (json.results) {
            for (const obs of json.results) {
              if (obs.photos) {
                for (const p of obs.photos) {
                  // 3. Modificamos square por large en tu propio replace
                  let photoUrl = p.url.replace('square', 'large');
                  photoUrl = photoUrl.replace('http://', 'https://');
                  photos.push(photoUrl);
                  if (photos.length >= 2) break;
                }
              }
              if (photos.length >= 2) break;
            }
          }
          resolve(photos.length ? photos : [null, null]);
        } catch {
          resolve([null, null]);
        }
      });
    }).on('error', () => resolve([null, null]));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(resolve(true));
      });
    }).on('error', () => {
      fs.unlink(dest, () => resolve(false));
    });
  });
}

async function fetchPageText(url) {
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'FaunaScript/1.0',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    timeout: 20000
  });
  return response.data;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanHtmlString(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractDescriptionFromHtml(html) {
  const meta = html.match(/<meta\s+(?:property=["']og:description["']|name=["']description["'])\s+content=["']([^"']+)["']/i);
  if (meta && meta[1]) {
    return meta[1].trim();
  }

  const descBlock = html.match(/<div[^>]+(?:class|id)=["'][^"']*(?:description|descripcion|sobre|resumen)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
  if (descBlock && descBlock[1]) {
    return cleanHtmlString(descBlock[1]).trim();
  }

  const paragraph = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (paragraph && paragraph[1]) {
    return cleanHtmlString(paragraph[1]).trim();
  }

  return null;
}

function findFirstTaxonLink(html, sciName) {
  const term = sciName.toLowerCase().replace(/\s+/g, ' ');
  const linkRegex = /<a[^>]+href=["'](\/taxon\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const linkText = cleanHtmlString(match[2]).toLowerCase();
    if (linkText.includes(term)) {
      return match[1];
    }
  }
  return null;
}

async function fetchEnciclovidaDescription(sciName) {
  const searchUrl = `https://enciclovida.mx/busqueda?nombre=${encodeURIComponent(sciName)}`;
  const html = await fetchPageText(searchUrl);
  let description = extractDescriptionFromHtml(html);
  if (description) return description;

  const taxonPath = findFirstTaxonLink(html, sciName);
  if (taxonPath) {
    const pageHtml = await fetchPageText(`https://enciclovida.mx${taxonPath}`);
    description = extractDescriptionFromHtml(pageHtml);
    return description;
  }

  return null;
}

async function fetchConabioDescription(sciName) {
  const searchUrl = `https://enciclovida.mx/busqueda?nombre=${encodeURIComponent(sciName)}`;
  const html = await fetchPageText(searchUrl);
  const taxonPath = findFirstTaxonLink(html, sciName);
  if (!taxonPath) return null;

  const pageHtml = await fetchPageText(`https://enciclovida.mx${taxonPath}`);
  return extractDescriptionFromHtml(pageHtml);
}

async function fetchNaturalistDescription(sciName) {
  const searchUrl = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sciName)}&locale=es&per_page=1`;
  const response = await axios.get(searchUrl, {
    headers: { 'User-Agent': 'FaunaScript/1.0', Accept: 'application/json' },
    timeout: 20000
  });
  const results = response.data && response.data.results ? response.data.results : [];
  if (!results.length) return null;

  const taxon = results[0].record || results[0];
  if (!taxon) return null;

  if (taxon.wikipedia_summary) {
    return taxon.wikipedia_summary.trim();
  }
  if (taxon.preferred_common_name) {
    return `Nombre común en iNaturalist: ${taxon.preferred_common_name}`;
  }
  if (taxon.wikipedia_url) {
    return `Wikipedia: ${taxon.wikipedia_url}`;
  }
  return null;
}

async function fetchDescriptionsForSpecies(list) {
  const result = {};
  for (const sp of list) {
    console.log(`Buscando descripciones para ${sp.sciName}...`);
    const [conabioDesc, enciclovidaDesc, naturalistDesc] = await Promise.all([
      fetchConabioDescription(sp.sciName).catch(() => null),
      fetchEnciclovidaDescription(sp.sciName).catch(() => null),
      fetchNaturalistDescription(sp.sciName).catch(() => null)
    ]);

    result[sp.sciName] = {
      commonName: sp.comName,
      conabio: conabioDesc,
      enciclovida: enciclovidaDesc,
      naturalist: naturalistDesc,
      updatedAt: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  const outputPath = path.join(__dirname, 'descripciones_fauna.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Descripciones almacenadas en ${outputPath}`);
  return result;
}

// ===================== HELPERS AND SHARP CROPPING =====================
function imgPath(sp, index) {
  return path.join(__dirname, 'imgs_fauna', `${sp.sciName.replace(/ /g, '_')}_${index}.jpg`);
}

async function getCroppedImgData(sp, index, width, height) {
  const file = imgPath(sp, index);
  try {
    if (fs.existsSync(file)) {
      return await sharp(file)
        .resize(width, height, { fit: 'cover' })
        .toBuffer();
    }
  } catch(e) {
    return null;
  }
  return null;
}

const borderNone = { style: BorderStyle.NONE, size: 0 };

async function speciesTable(sp) {
  const tW = 9180;
  const col1Width = 6000;
  const col2Width = 3180;

  function fullWidthCell(children, shade) {
    return new TableCell({
      columnSpan: 2,
      width: { size: tW, type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 140, right: 140 },
      shading: shade || undefined,
      borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
      children
    });
  }

  const nameRow = new TableRow({
    children: [fullWidthCell([
      new Paragraph({
        children: [
          new TextRun({ text: "Nombre científico: ", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: sp.sciName, italics: true, bold: true, size: 22, font: "Arial" })
        ]
      })
    ], { fill: "E3F2FD", type: ShadingType.CLEAR })]
  });

  const cnRow = new TableRow({
    children: [fullWidthCell([
      new Paragraph({
        children: [
          new TextRun({ text: "Nombre común: ", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: sp.comName, size: 22, font: "Arial" })
        ]
      })
    ])]
  });

  const img1Data = await getCroppedImgData(sp, 1, 450, 300);
  const img1Run = img1Data ? new ImageRun({ data: img1Data, transformation: { width: 450, height: 300 }, type: 'jpg' }) : null;
  const img1Content = img1Run 
    ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: [img1Run] })] 
    : [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 120 }, children: [new TextRun({ text: "[Fotografía de hábito / panorámica]", italics: true, color: "666666", size: 18 })] })];

  const imgRow = new TableRow({
    children: [new TableCell({
      columnSpan: 2,
      width: { size: tW, type: WidthType.DXA },
      borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
      children: img1Content
    })]
  });

  const parts = sp.desc.split(/(?=Distribución:|Estatus de conservación:)/);
  const descText = parts[0] || '';
  const distText = parts.find(p => p.startsWith('Distribución:')) || '';
  const statusText = parts.find(p => p.startsWith('Estatus de conservación:')) || '';

  function makeRun(text, bold) {
    return new TextRun({ text, bold, size: 20, font: "Arial" });
  }

  function splitBold(text) {
    const colon = text.indexOf(':');
    if(colon === -1) return [makeRun(text, false)];
    return [
      makeRun(text.substring(0, colon + 1), true),
      makeRun(' ' + text.substring(colon + 2), false)
    ];
  }

  const textCell = new TableCell({
    width: { size: col1Width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
    children: [
      new Paragraph({ spacing: { after: 100 }, children: splitBold(descText.trim()) }),
      new Paragraph({ spacing: { after: 100 }, children: splitBold(distText.trim()) }),
      new Paragraph({ spacing: { after: 60 }, children: splitBold(statusText.trim()) }),
    ]
  });

  const img2Data = await getCroppedImgData(sp, 2, 220, 320);
  const img2Run = img2Data ? new ImageRun({ data: img2Data, transformation: { width: 220, height: 320 }, type: 'jpg' }) : null;
  const img2Content = img2Run 
    ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [img2Run] })] 
    : [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "[Fotografía de detalle vertical]", italics: true, color: "666666", size: 18 })] })];

  const img2Cell = new TableCell({
    width: { size: col2Width, type: WidthType.DXA },
    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
    verticalAlign: VerticalAlign.CENTER,
    children: img2Content
  });

  const contentRow = new TableRow({
    children: [textCell, img2Cell]
  });

  return new Table({
    width: { size: tW, type: WidthType.DXA },
    columnWidths: [col1Width, col2Width],
    borders: {
      top: borderNone, bottom: { style: BorderStyle.SINGLE, size: 6, color: "D3D3D3" },
      left: borderNone, right: borderNone,
      insideH: borderNone, insideV: borderNone
    },
    rows: [nameRow, cnRow, imgRow, contentRow]
  });
}

// ===================== MAIN EXECUTION =====================
async function main() {
  const imgDir = path.join(__dirname, 'imgs_fauna');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
  }

  try {
    await fetchDescriptionsForSpecies(species);
  } catch (error) {
    console.error('No fue posible buscar descripciones de fauna:', error.message);
  }

  console.log('Verificando descarga de imágenes...');
  for (const sp of species) {
    const dest1 = imgPath(sp, 1);
    const dest2 = imgPath(sp, 2);

    if (!fs.existsSync(dest1) || !fs.existsSync(dest2)) {
      process.stdout.write(`Buscando imágenes para ${sp.sciName}... `);
      const urls = await fetchTwoImageUrls(sp.sciName);
      if (urls[0]) await downloadImage(urls[0], dest1);
      if (urls[1]) await downloadImage(urls[1], dest2);
      console.log('¡Listo!');
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log('\nConstruyendo el documento Word...');
  const children = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: "MANIFESTACIÓN DE IMPACTO AMBIENTAL MIA LA SOLEDAD", bold: true, size: 28, font: "Noto Sans", color: "1565C0" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: "Anexo VI", bold: true, size: 24, font: "Noto Sans", color: "1976D2" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1976D2", space: 1 } },
      children: [new TextRun({ text: "Fichas técnicas de las especies de fauna observadas", bold: true, size: 24, font: "Noto Sans" })]
    })
  );

  for (let i = 0; i < species.length; i++) {
    if (i > 0) children.push(new Paragraph({ pageBreakBefore: true, children: [] }));
    const table = await speciesTable(species[i]);
    children.push(table);
    children.push(new Paragraph({ spacing: { before: 120, after: 60 }, children: [] }));
  }

  // ===================== BIBLIOGRAPHY SECTION =====================
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1976D2", space: 1 } },
    children: [new TextRun({ text: "BIBLIOGRAFÍA", bold: true, size: 24, font: "Noto Sans", color: "1565C0" })]
  }));

  biblio.forEach(ref => {
    children.push(new Paragraph({
      spacing: { before: 80, after: 80 },
      indent: { left: 720, hanging: 720 },
      children: [new TextRun({ text: ref, size: 18, font: "Noto Sans" })]
    }));
  });

  const doc = new Document({
    styles: { default: { document: { run: { font: "Noto Sans", size: 22 } } } },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 } } },
      children
    }]
  });

  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync('Anexo_VI_Fichas_Fauna_La_Soledad.docx', buffer);
    console.log('\n¡Éxito! Archivo generado con imágenes de alta resolución y bibliografía.');
  }).catch(e => { console.error('Error al generar el Word:', e); });
}

main();