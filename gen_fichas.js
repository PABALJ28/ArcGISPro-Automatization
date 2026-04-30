const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// ==================== SPECIES DATA ====================
const species = [
  {
    sciName: "Baccharis heterophylla",
    comName: "Escobilla, Jarilla",
    desc: "Descripción: Arbusto muy ramificado de 0.5 a 2 m de altura perteneciente a la familia Asteraceae. Sus hojas son heteromorfas, alternas, de forma espatulada a linear, de 1 a 5 cm de longitud, con margen entero o dentado. Presenta capítulos pequeños discoides reunidos en panículas terminales con flores blancas a cremas; el papus es blanco y copioso. Florece principalmente de septiembre a noviembre. Habita en laderas rocosas, cañadas y bordes de bosque de pino-encino entre los 1,200 y 2,500 msnm (CONABIO, 2023). Distribución: Se distribuye desde el norte de México (Sonora, Chihuahua, Durango) hasta Oaxaca y Centroamérica. Especie nativa de México. En Durango es frecuente en las laderas y cañadas de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Baccharis pteronioides",
    comName: "Hierba del pasmo, Hierba blanca",
    desc: "Descripción: Arbusto de 0.5 a 1.5 m de altura de la familia Asteraceae, con tallos alados longitudinalmente. Sus hojas son obovadas a espatuladas, de 1 a 3 cm, alternas y coriáceas. Los capítulos son discoides, reunidos en corimbos terminales compactos, con flores blancas; el papus es blancuzco y abundante. Florece de agosto a noviembre. Habita en matorrales semiáridos, pastizales y zonas de transición entre 1,000 y 2,500 msnm (Nesom, 2006). Distribución: Se distribuye en el suroeste de Estados Unidos y el norte y centro de México. Especie nativa. En Durango se encuentra en el matorral xerófilo y zonas de transición bosque-matorral. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Baccharis salicina",
    comName: "Batamote, Saucillo",
    desc: "Descripción: Arbusto de 1 a 3 m de altura de la familia Asteraceae, con tallos verdes provistos de alas longitudinales. Sus hojas son lanceoladas, alternas, de 2 a 7 cm de longitud, de color verde brillante. Las inflorescencias son panículas terminales de numerosos capítulos con flores blancas; la fructificación produce abundante papus algodonoso. Se desarrolla principalmente en vegetación riparia y galerías ribereñas (CONABIO, 2023). Distribución: Nativa del suroeste de Estados Unidos y el noroeste de México. En Durango se localiza frecuentemente a orillas de ríos, arroyos y escorrentías. Especie nativa. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Bartlettina karwinskiana",
    comName: "Eupatorio, Hierba del ángel",
    desc: "Descripción: Arbusto de 0.5 a 2 m de altura perteneciente a la familia Asteraceae (anteriormente clasificada en el género Eupatorium). Sus hojas son opuestas, ovado-lanceoladas, de 3 a 8 cm de longitud, con margen serrado y pecíolo bien definido. Los capítulos son discoides y pequeños, reunidos en corimbos terminales compuestos, con flores de color blanco a lavanda. Florece de octubre a enero. Se encuentra en bosques de pino-encino y vegetación de transición a altitudes de 1,500 a 2,800 msnm (Enciclovida, 2023). Distribución: Endémica de México, distribuida principalmente en la Sierra Madre Occidental, incluyendo los estados de Durango, Sinaloa, Nayarit y Jalisco. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Bouvardia ternifolia",
    comName: "Trompetilla, Mirto silvestre, Bouvardia",
    desc: "Descripción: Arbusto de 0.5 a 1.5 m de altura perteneciente a la familia Rubiaceae. Sus hojas se disponen en verticilos de tres, son lanceoladas a ovadas, de 2 a 5 cm de longitud, con nervadura pinnada bien marcada. Las flores son tubulares, de color rojo a escarlata, de 2 a 3 cm de longitud, reunidas en cimas terminales; son visitadas frecuentemente por colibríes. El fruto es una cápsula bilocular pequeña. Florece de agosto a noviembre. Habita en bosques de encino y pino-encino, así como en vegetación riparia (CONABIO, 2022). Distribución: Se distribuye desde México hasta Centroamérica. Especie nativa de México. En Durango se localiza en bosques templados y laderas húmedas. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Braunia secunda",
    comName: "Musgo, Briofita saxícola",
    desc: "Descripción: Briofita de la familia Leucodontaceae, de hábito epifítico o saxícola. Sus tallos secundarios miden entre 1 y 4 cm de longitud, con hojas imbricadas, ovadas a lanceoladas, con nervio simple que no alcanza el ápice. El color varía de verde oscuro a verde oliva, pudiendo tornarse pardo en condiciones de sequía. Carece de rizoide diferenciado y presenta esporofito reducido. Es indicadora de ambientes con humedad relativa alta y buena calidad del aire (Churchill y Linares, 1995). Distribución: Presente en zonas montañosas tropicales y subtropicales de América. En México se registra en la Sierra Madre Occidental y otras serranías húmedas, incluyendo Durango. Especie nativa. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Buddleja cordata",
    comName: "Tepozán, Tepozán blanco, Mariposa",
    desc: "Descripción: Árbol o arbusto de 2 a 8 m de altura perteneciente a la familia Buddlejaceae. Su corteza es gruesa y corchosa de color grisáceo. Las hojas son opuestas, ovado-lanceoladas, de 5 a 20 cm de longitud, con el haz verde oscuro y el envés cubierto de tomento blancuzco denso. Las flores son pequeñas, de color amarillo a anaranjado, muy fragantes, reunidas en panículas terminales densas de 10 a 30 cm. El fruto es una cápsula pequeña biloculada. Florece principalmente de septiembre a febrero (CONABIO, 2021). Distribución: Especie endémica de México, ampliamente distribuida en el centro, occidente y norte del país. En Durango es común en bosques templados, bordes de caminos y zonas perturbadas, desde los 1,500 hasta los 3,000 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Bursera fagaroides",
    comName: "Copal, Torote copal, Copal amargo",
    desc: "Descripción: Árbol caducifolio de 3 a 8 m de altura perteneciente a la familia Burseraceae. Su corteza es exfoliante, de color grisáceo a verde-amarillento, desprendiéndose en laminillas papiráceas. Las hojas son compuestas imparipinnadas, con 7 a 15 folíolos oblongos, de 1 a 3 cm, aromáticas al estrujarse. Las flores son pequeñas, blancas, en racimos axilares. El fruto es una drupa pequeña con pseudoarilo rojo que envuelve el hueso. Exuda resina aromática de olor característico (CONABIO, 2022). Distribución: Se distribuye en la vertiente del Pacífico mexicano y cuencas interiores, desde Sonora hasta Chiapas. Especie nativa de México. En Durango habita en las laderas cálido-secas de la vertiente occidental de la Sierra Madre. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Cajanus cajan",
    comName: "Frijol de palo, Gandul, Guandul",
    desc: "Descripción: Arbusto perenne de 1 a 3 m de altura perteneciente a la familia Fabaceae. Sus hojas son trifoliadas, con folíolos lanceolados a oblongos, de 4 a 10 cm de longitud. Las flores son papilionáceas, amarillas con venas purpúreas, reunidas en racimos axilares. Las vainas son de 4 a 9 cm de longitud, pubescentes, con 3 a 6 semillas esféricas de color variable. Es una especie ampliamente cultivada por su valor alimenticio y forrajero (FAO, 1977). Distribución: Especie de origen africano-asiático, introducida y cultivada en regiones tropicales y subtropicales de todo el mundo. En México y Durango se encuentra en cultivos, huertos y zonas perturbadas aledañas a asentamientos humanos. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010 (especie exótica cultivada)."
  },
  {
    sciName: "Castilleja arvensis",
    comName: "Yerba de la víbora, Castilleja, Pincel del campo",
    desc: "Descripción: Hierba hemiparásita anual o perenne de 20 a 60 cm de altura, perteneciente a la familia Orobanchaceae. Sus hojas son alternas, linear-lanceoladas, de 2 a 6 cm, enteras a trilobadas. Las brácteas foliosas que rodean las flores son de color rojo a anaranjado brillante, lo que le confiere su carácter ornamental. Las flores son tubulares, verdosas a amarillentas, con el cáliz coloreado. El fruto es una cápsula loculicida. Parásita parcial de raíces de gramíneas (CONABIO, 2020). Distribución: Se distribuye desde México hasta Centroamérica. Especie nativa. En Durango se encuentra en pastizales de altura, bordes de caminos y bosques perturbados entre 1,500 y 3,000 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Clematis dioica",
    comName: "Barba de viejo, Yerba del indio, Clematide",
    desc: "Descripción: Liana trepadora leñosa de la familia Ranunculaceae, de 2 a 10 m de longitud. Sus hojas son opuestas, compuestas, con 3 a 5 folíolos ovados a lanceolados, de 2 a 7 cm de longitud, con margen entero o dentado, y pecíolos volubles que le permiten trepar. Las flores son dioicas, blancas, de 1 a 2 cm de diámetro. Los frutos son aquenios con estilos plumosos de 2 a 5 cm que forman cabezuelas blancas vistosas al madurar. Florece de junio a octubre (Enciclovida, 2022). Distribución: Se distribuye desde México hasta Sudamérica. Especie nativa. En Durango se localiza en bosques húmedos, orillas de arroyos y vegetación riparia. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Clinopodium vulgare",
    comName: "Albahaquilla del monte, Poleo silvestre, Menta de monte",
    desc: "Descripción: Hierba perenne de 20 a 60 cm de altura perteneciente a la familia Lamiaceae. Sus tallos son cuadrangulares y pubescentes. Las hojas son opuestas, ovadas, de 1 a 4 cm de longitud, con margen crenado-aserrado y aroma suave. Las flores son de color rosado a púrpura, bilabiadas, de 1 a 1.5 cm, reunidas en verticilos densos con brácteas aciculares espinosas. El fruto consta de cuatro núculas lisas. Florece de julio a septiembre (Flora of North America, 2014). Distribución: Especie de distribución subcosmopolita, presente en el hemisferio norte. En México se localiza en bosques templados, pastizales y zonas perturbadas. En Durango habita en el sotobosque y praderas de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Critonia hospitalis",
    comName: "Eupatorio, Árnica de monte",
    desc: "Descripción: Arbusto de 1 a 2 m de altura perteneciente a la familia Asteraceae, anteriormente clasificado en el género Eupatorium. Sus hojas son opuestas, ovadas a lanceoladas, de 4 a 12 cm de longitud, trinervadas desde la base, con margen serrado. Los capítulos son discoides, con flores de color blanco a lila pálido, reunidos en corimbos terminales amplios. El papus es blancuzco con cerdas escabrosas. Florece de septiembre a diciembre (Villaseñor, 2003). Distribución: Endémica de México, distribuida en la Sierra Madre Occidental en los estados de Durango, Sinaloa, Nayarit y Jalisco, en bosques de pino-encino de 1,500 a 2,800 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Crotalaria mollicula",
    comName: "Cascabelillo, Chipilín del monte",
    desc: "Descripción: Hierba erecta o subarbusto de 0.3 a 1.5 m de altura perteneciente a la familia Fabaceae. Sus hojas son simples, oblanceoladas a elípticas, de 2 a 6 cm de longitud, con pubescencia suave en ambas caras. Las flores son papilionáceas de color amarillo en racimos terminales. El fruto es una vaina inflada, papiracea, de 2 a 3 cm, con semillas que producen un sonido característico al sacudirla. Florece de agosto a noviembre (Vibrans, 2009). Distribución: Se distribuye desde México hasta Sudamérica. Especie nativa. En Durango se localiza en pastizales, bordes de cultivos y vegetación secundaria de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Crotalaria pumila",
    comName: "Cascabelillo chico, Chipilín silvestre",
    desc: "Descripción: Hierba perenne postrada o ascendente de 10 a 40 cm de altura perteneciente a la familia Fabaceae. Sus hojas son trifoliadas, con folíolos obovados de 1 a 2 cm de longitud, pubescentes en el envés. Las flores son pequeñas, amarillas, en racimos axilares de pocas flores. El fruto es una vaina inflada de 1 a 2 cm, pubescente, con pocas semillas reniformes. Florece de julio a octubre (CONABIO, 2021). Distribución: Se distribuye desde el suroeste de Estados Unidos hasta Sudamérica y el Caribe. Especie nativa. En Durango se localiza en pastizales áridos y semiáridos, y en zonas de transición bosque-matorral. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Crotalaria sagittalis",
    comName: "Cascabelillo, Chícharo de coyote",
    desc: "Descripción: Hierba erecta de 15 a 50 cm de altura perteneciente a la familia Fabaceae. Sus tallos presentan alas foliáceas longitudinales características. Las hojas son simples, lanceoladas a lineares, de 2 a 6 cm de longitud. Las flores son amarillas, pequeñas, en racimos de 2 a 6 flores. El fruto es una vaina inflada de 2 a 3 cm, que adquiere color negro en la madurez y produce un sonido al agitarse. Florece de julio a octubre (Luckow, 1992). Distribución: Desde el este de Estados Unidos hasta Sudamérica. Especie nativa de amplia distribución. En Durango se localiza en pastizales y bordes de bosque. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Dalea foliolosa",
    comName: "Escobilla negra, Dalea, Hierba del oso",
    desc: "Descripción: Arbusto o subarbusto de 0.3 a 1.5 m de altura perteneciente a la familia Fabaceae, con glándulas aromáticas en tallos y hojas. Sus hojas son pinnadas, con 8 a 20 pares de folíolos pequeños de 2 a 4 mm de longitud. Las flores son purpúreas, papilionáceas, en espigas terminales densas, con brácteas conspicuas y calículo glanduloso. Florece de julio a octubre. Habita en matorrales semiáridos y pastizales (Turner, 1997). Distribución: Endémica del norte y centro de México, distribuida en Chihuahua, Durango, Zacatecas y Jalisco. Se localiza en laderas secas y matorrales de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Decachaeta haenkeana",
    comName: "Eupatorio blanquillo, Hierba del ángel",
    desc: "Descripción: Arbusto o subarbusto de 0.5 a 2 m de altura perteneciente a la familia Asteraceae (anteriormente en Eupatorium). Sus hojas son opuestas, ovadas, de 3 a 10 cm de longitud, con pecíolo alado y margen serrado. Los capítulos son discoides, agrupados en corimbos terminales amplios, con flores de color blanco a rosado. El receptáculo es plano y desnudo. Florece de septiembre a enero. Habita en bosques húmedos y zonas de transición (King y Robinson, 1987). Distribución: Se distribuye desde México hasta Centroamérica. Especie nativa. En Durango se localiza en bosques mesófilos y bosques de pino-encino con alta humedad en cañadas. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Desmodium grahamii",
    comName: "Amor seco, Pega-ropa, Pegajosa",
    desc: "Descripción: Hierba o subarbusto de 0.5 a 1.5 m de altura perteneciente a la familia Fabaceae. Sus hojas son trifoliadas, con folíolos elípticos a ovados de 2 a 5 cm, pubescentes en el envés. Las flores son pequeñas, rosadas a lilas, en racimos laxos terminales. El fruto es una legumbre articulada (lomento) de 2 a 4 artejos reniformes cubiertos de tricomas uncinados que se adhieren al pelaje y ropa. Florece de agosto a noviembre (Sousa, 1987). Distribución: México y Centroamérica. Especie nativa. En Durango se localiza en orillas de caminos, bosques secos y vegetación secundaria. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Dodonaea viscosa",
    comName: "Jarilla, Cosahuico, Chapuliztle",
    desc: "Descripción: Arbusto o árbol pequeño de 1 a 5 m de altura perteneciente a la familia Sapindaceae. Sus hojas son simples, alternas, oblanceoladas a lineares, de 2 a 10 cm de longitud, viscosas y brillantes. Las flores son pequeñas, sin pétalos, de color amarillo-verdoso, en racimos axilares y terminales, con planta andromonoica. El fruto es una cápsula membranácea, alada, de color rosa a rojizo, muy vistosa. Florece y fructifica casi todo el año. Indicadora de suelos degradados (CONABIO, 2016). Distribución: Distribución pantropical y subtropical, en todos los continentes. Especie nativa de México. En Durango es común en laderas secas, matorrales y zonas perturbadas. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Elephantopus mollis",
    comName: "Lengua de vaca, Tabaquillo, Oreja de venado",
    desc: "Descripción: Hierba perenne de 30 a 80 cm de altura perteneciente a la familia Asteraceae. Sus hojas basales son grandes, espatuladas, de 10 a 25 cm de longitud, rugosas y pubescentes. Los tallos florales son ramificados en la parte superior; los capítulos contienen 4 flores rosadas o lilas, reunidos en glomérulos terminales rodeados por 3 brácteas foliosas ovadas. El papus es aristado. Florece de julio a noviembre (Villaseñor, 2016). Distribución: Tropical y subtropical de América, extendida a África y Asia. Especie nativa en México. En Durango se localiza en zonas húmedas, sotobosque y vegetación secundaria de la vertiente occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Erigeron longipes",
    comName: "Margarita silvestre, Hierba del burro, Zacate de burro",
    desc: "Descripción: Hierba perenne o subarbusto de 20 a 50 cm de altura perteneciente a la familia Asteraceae. Sus hojas basales son espatuladas, de 5 a 15 cm de longitud, con margen ondulado; las hojas caulinares son alternas y progresivamente más pequeñas. Las cabezuelas son solitarias, con lígulas blancas a lilas, en pedúnculos largos; el disco es amarillo. Florece de agosto a noviembre. Habita en pastizales de montaña y bosques de pino (Nesom, 1989). Distribución: Endémica del noroeste y occidente de México, incluyendo Chihuahua, Durango, Sinaloa y Nayarit. Se localiza en praderas de altura y bordes de bosque de pino entre 1,800 y 3,200 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Eriosema crinitum",
    comName: "Frijolillo, Algarrobillo peludo",
    desc: "Descripción: Hierba perenne de 30 a 80 cm de altura con base leñosa, perteneciente a la familia Fabaceae. Sus hojas son trifoliadas, con folíolos elípticos a oblongos de 3 a 7 cm, densamente pubescentes con tricomas ferrugíneos en el envés. Las flores son amarillas, papilionáceas, en racimos axilares cortos de pocas flores. El fruto es una vaina biarticulada de 1 a 2 cm, densamente pubescente. Florece de agosto a octubre (Stirton, 1978). Distribución: Se distribuye desde México hasta Sudamérica en pastizales y sabanas. Especie nativa. En Durango se localiza en pastizales de pino-encino y orillas de bosque. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Eriosema diffusum",
    comName: "Frijolillo de campo, Algarrobillo",
    desc: "Descripción: Hierba perenne postrada a ascendente de 20 a 60 cm de longitud, perteneciente a la familia Fabaceae. Sus hojas son trifoliadas, con folíolos angostamente elípticos de 2 a 5 cm, pubescentes en ambas caras con tricomas suaves. Las flores son amarillas, papilionáceas, en racimos axilares cortos. El fruto es una vaina pequeña biarticulada, pubescente. Florece de julio a octubre (Brandbyge, 1986). Distribución: Se distribuye desde México hasta Centroamérica, en pastizales y vegetación secundaria. Especie nativa. En Durango se localiza en zonas de pastizal y orillas de bosque de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Evolvulus alsinoides",
    comName: "Hierba de la virgen, Evólvulo azul, Campanilla azul",
    desc: "Descripción: Hierba perenne postrada o ascendente de 10 a 50 cm de longitud, perteneciente a la familia Convolvulaceae. Sus tallos son delgados y pubescentes. Las hojas son alternas, ovadas a elípticas, de 0.5 a 2 cm de longitud. Las flores son solitarias axilares, de color azul a morado brillante, de 0.8 a 1.5 cm de diámetro, con 5 pétalos fusionados en embudo; de corta duración, abren por la mañana. El fruto es una cápsula globosa de 4 semillas (Verdcourt, 1963). Distribución: Distribución pantropical. Especie nativa de México, ampliamente distribuida en pastizales y matorrales. En Durango se localiza en pastizales y zonas perturbadas de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Flavoparmelia caperata",
    comName: "Liquen pardoverde, Parmelia, Liquen foliáceo",
    desc: "Descripción: Liquen foliáceo de la familia Parmeliaceae, con talo de 5 a 20 cm de diámetro. La cara superior es de color verde grisáceo con lóbulos redondeados y presencia de sorales y propágulos (isidios o sorediados) que facilitan su dispersión. La cara inferior es de color café oscuro con rizinas abundantes. Los apotecios son poco frecuentes. Es un indicador biológico de calidad de aire, pues es sensible a la contaminación atmosférica (Hawksworth y Seaward, 1977). Distribución: Distribución cosmopolita, en zonas templadas y húmedas de ambos hemisferios. En México se registra en la Sierra Madre Occidental. En Durango crece sobre cortezas de árboles del bosque de pino-encino. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Heliotropium procumbens",
    comName: "Cola de mico, Palomilla, Hierba del sapo",
    desc: "Descripción: Hierba anual postrada de 10 a 40 cm de longitud perteneciente a la familia Boraginaceae. Sus tallos son delgados y ramificados, cubiertos de tricomas rígidos. Las hojas son alternas, ovadas a elípticas, de 1 a 4 cm de longitud, rugosas y pubescentes. Las flores son pequeñas, blancas, en espigas escorpioides enrolladas en el ápice que se desenrollan progresivamente durante la antesis. El fruto es un esquizocarpo de 4 núculas con superficie rugosa (Johnston, 1928). Distribución: Desde el sur de Estados Unidos hasta Sudamérica. Especie nativa de México. En Durango se localiza en suelos alterados, caminos, pastizales y vegetación secundaria a diferentes altitudes. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Heterotheca subaxillaris",
    comName: "Camphor weed, Hierba de la vaquita, Margarita campestre",
    desc: "Descripción: Hierba anual o bienal de 30 a 100 cm de altura perteneciente a la familia Asteraceae. Sus hojas son alternas, las inferiores con pecíolo auriculado-amplexicaule, las superiores sésiles y algo clasantes, de forma ovada a espatulada, pubescentes. Las cabezuelas presentan lígulas de color amarillo brillante y disco también amarillo; el receptáculo tiene paleas persistentes. El papus es doble, con cerdas externas cortas e internas largas. Florece de agosto a noviembre (CONABIO, 2025). Distribución: Nativa del sur de Estados Unidos y norte de México. En Durango se localiza en suelos arenosos, pastizales y orillas de caminos. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Ipomoea arborescens",
    comName: "Cazahuate, Palo de manjar, Cazahuate blanco, Palo bobo",
    desc: "Descripción: Árbol caducifolio de 3 a 10 m de altura perteneciente a la familia Convolvulaceae. Su corteza es corchosa, de color blanco a grisáceo, muy característica. Las hojas son acorazonadas, de 7 a 20 cm de longitud, pubescentes, caducas en la época seca. Las flores son grandes, blancas, de 7 a 10 cm de diámetro, con forma de embudo, abren durante la noche y atraen polinizadores nocturnos. El fruto es una cápsula leñosa con semillas aladas. Florece de enero a marzo, antes de la aparición de las hojas (Carranza, 2007). Distribución: Endémica de México, distribuida en la vertiente del Pacífico y cuencas interiores, desde Sonora hasta Oaxaca. En Durango habita en bosque tropical caducifolio y vegetación de transición. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Karwinskia humboldtiana",
    comName: "Coyotillo, Tullidora, Cacachila, Tullidor",
    desc: "Descripción: Arbusto o árbol pequeño de 1 a 5 m de altura perteneciente a la familia Rhamnaceae. Sus hojas son opuestas a subopuestas, ovado-elípticas, de 3 a 8 cm de longitud, con nervaduras secundarias paralelas arqueadas muy características. Las flores son pequeñas, de color verde amarillento, en cimas axilares. El fruto es una drupa ovoide de color negro-purpúreo en la madurez, de 8 a 12 mm. Sus frutos contienen antracenonoides con toxicidad neuromuscular severa para humanos y fauna doméstica. Florece de marzo a octubre (González-Espinosa et al., 1991). Distribución: Endémica de México y sur de Texas (EE.UU.). Ampliamente distribuida en matorrales semiáridos y bosques de encino del norte y centro de México. En Durango es frecuente en laderas y matorrales. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Lantana canescens",
    comName: "Cinco negritos, Frutillo, Lantana silvestre",
    desc: "Descripción: Arbusto de 0.5 a 2 m de altura perteneciente a la familia Verbenaceae. Sus hojas son opuestas, ovadas, de 3 a 7 cm de longitud, rugosas y aromáticas, con margen serrado y pubescencia canescente. Las flores son pequeñas y reunidas en cabezuelas planas; la coloración varía del amarillo al naranja conforme maduran, presentando con frecuencia ambas coloraciones simultáneamente. El fruto es una drupa jugosa de color negro-azulado al madurar, agrupada en cabezuelas (CONABIO, 2020). Distribución: Nativa de México y Centroamérica, distribuida en matorrales secundarios y bordes de bosque. En Durango se localiza en zonas de transición y áreas perturbadas. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Lippia umbellata",
    comName: "Orégano del monte, Salvia real, Yerba dulce",
    desc: "Descripción: Arbusto aromático de 1 a 3 m de altura perteneciente a la familia Verbenaceae. Sus hojas son opuestas, ovadas a elípticas, de 2 a 7 cm de longitud, con margen crenado-aserrado, aromáticas al estrujarse por su contenido en aceites esenciales. Las flores son pequeñas, blancas a lilas, reunidas en espigas umbeladas o cabezuelas densas terminales. El fruto es un esquizocarpo bipartido. Florece de julio a noviembre. Habita en zonas semiáridas y subhúmedas de montaña (Atkins, 2004). Distribución: Endémica de México, distribuida principalmente en la Sierra Madre Occidental en Durango, Sinaloa y Jalisco. En Durango se localiza en laderas y matorrales de altura. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Lobelia fenestralis",
    comName: "Lobelia, Flor de cardinal, Cempasúchil de agua",
    desc: "Descripción: Hierba erecta de 30 a 80 cm de altura perteneciente a la familia Campanulaceae. Sus hojas son alternas, ovadas a elípticas, de 2 a 6 cm de longitud, con margen irregularmente dentado. Las flores son bilabiadas, de color azul a violáceo, de 1.5 a 2.5 cm de longitud, con el labio inferior trífido y el superior bífido, formando el característico tubo abierto lateralmente. Se disponen en racimos terminales. El fruto es una cápsula bilocular. Florece de agosto a noviembre. Habita en bosques húmedos de montaña (Enciclovida, 2022). Distribución: Se distribuye desde México hasta Centroamérica. Especie nativa. En Durango se localiza en cañadas húmedas y bosques de pino-encino con alta humedad edáfica. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Mimosa aculeaticarpa",
    comName: "Gatuño, Uña de gato, Zarzaparrilla",
    desc: "Descripción: Arbusto espinoso de 0.5 a 2 m de altura perteneciente a la familia Fabaceae. Sus hojas son bipinnadas, con 2 a 5 pares de pinas y numerosos folíolos muy pequeños de 1 a 3 mm de longitud; los tallos presentan espinas ganchudas robustas, características de la especie. Las flores son esféricas, de color blanco a rosado, y se agrupan en racimos axilares. Los frutos son vainas articuladas, con artejos espinosos en los márgenes, de 3 a 6 cm de longitud (Barneby, 1991). Distribución: Endémica del norte y centro de México, distribuida en Chihuahua, Durango, Zacatecas, Jalisco y estados adyacentes. En Durango es común en matorrales semiáridos y zonas de transición. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Mimosa biuncifera",
    comName: "Gatuño, Uña de gato, Biznaga",
    desc: "Descripción: Arbusto espinoso de 0.5 a 2 m de altura perteneciente a la familia Fabaceae. Sus hojas son bipinnadas con 3 a 7 pares de pinas y 6 a 14 pares de folíolos de 2 a 4 mm; presenta espinas en pares de 3 a 5 mm (biuncifera = dos ganchos), característica que la distingue. Las flores son esféricas blancas a rosadas en cabezuelas axilares. El fruto es una vaina plana de 3 a 7 cm, con reticulado visible. Florece de mayo a agosto (Barneby, 1991). Distribución: Sur de Estados Unidos y norte y centro de México. Especie nativa ampliamente distribuida en matorrales, chaparrales y pastizales. En Durango es común en zonas de transición entre el bosque y el matorral. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Montanoa leucantha",
    comName: "Vara blanca, Árnica blanca, Jara blanca",
    desc: "Descripción: Arbusto o subarbusto de 1 a 3 m de altura perteneciente a la familia Asteraceae. Sus hojas son opuestas, profundamente pinnatífidas, de 5 a 20 cm de longitud, con segmentos lanceolados y margen dentado. Las cabezuelas tienen lígulas de color blanco y disco amarillo, agrupadas en panículas terminales vistosas. El receptáculo es cónico con paleas. Florece de septiembre a enero. Habita en bosques secos, laderas y vegetación secundaria (Turner y Dillon, 1986). Distribución: México y Centroamérica. Especie nativa. En Durango se localiza en laderas de clima cálido subhúmedo y zonas de transición en la vertiente occidental de la Sierra Madre. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Muhlenbergia robusta",
    comName: "Zacate liendrilla, Muhlenbergia grande, Zacate aparejo",
    desc: "Descripción: Gramínea perenne cespitosa de 0.5 a 2 m de altura perteneciente a la familia Poaceae. Sus hojas son planas, de 20 a 50 cm de longitud y 3 a 8 mm de ancho, con lígula membranácea de 2 a 5 mm. La inflorescencia es una panícula terminal espiciforme de 20 a 50 cm, densa y plumosa, de color verde-purpúreo, muy vistosa. Las espiguillas son sésiles o subsésiles, con una lemma aristada. Florece de agosto a noviembre (Peterson, 2003). Distribución: México y Centroamérica. Especie nativa ampliamente distribuida en bosques de pino-encino y pastizales de altura. En Durango es una de las gramíneas más conspicuas de la Sierra Madre Occidental, entre 1,500 y 3,000 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Ocimum campechianum",
    comName: "Albahaca del monte, Hierba santa, Ocimum silvestre",
    desc: "Descripción: Hierba aromática anual o perenne de 30 a 80 cm de altura perteneciente a la familia Lamiaceae. Sus tallos son cuadrangulares. Las hojas son opuestas, ovadas, de 2 a 5 cm de longitud, con superficie glandulosa que produce el aroma característico a alcanfor-anís. Las flores son pequeñas, de color blanco a lila, en espigas terminales verticiladas con hasta 6 flores por verticilo. El fruto son cuatro núculas ovoides. Florece de agosto a enero (Paton, 1992). Distribución: México a Sudamérica y Caribe. Especie nativa. En Durango se localiza en zonas perturbadas, orillas de caminos y vegetación secundaria de áreas cálidas. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Opuntia leucotricha",
    comName: "Nopal blanco, Duraznillo blanco, Nopal gatuno",
    desc: "Descripción: Árbol o arbusto de 3 a 6 m de altura perteneciente a la familia Cactaceae, con tronco cilíndrico leñoso bien definido en los ejemplares adultos. Sus cladodios (pencas) son ovalados, de 15 a 35 cm de longitud, con espinas blancas de 2 a 4 cm y gloquidios amarillentos abundantes. Las flores son de color amarillo, de 5 a 7 cm de diámetro. El fruto (tuna) es rojo a morado en la madurez, de 3 a 5 cm, comestible. El nombre leucotricha alude a los pelos blancos de los areoles (CONABIO, 2021). Distribución: Endémica del centro-norte de México, en los estados de Durango, Zacatecas, Aguascalientes, San Luis Potosí y Jalisco. En Durango se localiza en matorrales semiáridos y zonas de transición. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Pinus lumholtzii",
    comName: "Pino triste, Ocote torcido, Pino llorón",
    desc: "Descripción: Árbol de 5 a 20 m de altura perteneciente a la familia Pinaceae. Su fuste puede ser recto o ligeramente tortuoso; la corteza es pardo-rojiza con placas gruesas y escamosas. Las hojas se agrupan en fascículos de 3 (ocasionalmente 2 o 4), son de 20 a 40 cm de longitud, notablemente péndulas (colgantes) lo que le da su nombre común de \"pino triste\" o \"pino llorón\". Los conos son ovoides, de 5 a 8 cm de longitud. Las semillas tienen ala articulada. Habita en bosques de pino-encino de la Sierra Madre Occidental entre 1,500 y 2,800 msnm (Farjon y Styles, 1997). Distribución: Especie endémica de México, con distribución restringida a la Sierra Madre Occidental en los estados de Sonora, Chihuahua, Sinaloa y Durango. Estatus de conservación: Se encuentra en la categoría de Sujeta a Protección Especial (Pr) conforme a la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Pinus rudis",
    comName: "Ocote, Pino rugoso, Pino de las alturas",
    desc: "Descripción: Árbol de 10 a 25 m de altura perteneciente a la familia Pinaceae. Su corteza es grisácea a pardo-rojiza, con fisuras longitudinales profundas. Las hojas se agrupan en fascículos de 5, son rígidas y ligeramente curvas, de 10 a 20 cm de longitud. Los conos son subglobosos a ovoides, de 5 a 10 cm, con apófisis engrosadas y mucronadas. La madera es de alta densidad y dureza. Forma bosques puros o mixtos en las partes más altas de las sierras. Actualmente varios autores consideran este taxón como sinónimo de Pinus hartwegii (Farjon, 2010). Distribución: Se distribuye en la Sierra Madre Occidental y Sierra Madre Oriental de México, así como en Guatemala y Honduras, en bosques de coníferas de alta montaña entre 2,500 y 4,000 msnm. En Durango ocupa las partes más elevadas de la sierra. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Pinus teocote",
    comName: "Ocote chino, Pino teocote, Ocote colorado",
    desc: "Descripción: Árbol de 10 a 30 m de altura perteneciente a la familia Pinaceae, uno de los pinos más abundantes y de mayor importancia económica de México. Su corteza es pardo-rojiza a grisácea, con placas irregulares. Las hojas se agrupan en fascículos de 3 (rara vez 2 o 4), de 8 a 18 cm de longitud. Los conos son ovoides de 3 a 6 cm, persistentes y deflexos; las escamas tienen escudetes planos con múcron pequeño. Las semillas tienen ala larga. Tolera una amplia variación climática y edáfica (Perry, 1991). Distribución: Especie endémica de México y Guatemala, ampliamente distribuida en la Sierra Madre Occidental, Sierra Madre Oriental y Eje Neovolcánico. Durango es uno de sus principales centros de abundancia y diversidad. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Potentilla anserina",
    comName: "Hierba de la plata, Cincoenrama, Argentina",
    desc: "Descripción: Hierba perenne estolonifera de la familia Rosaceae, con tallos rastreros de 20 a 80 cm de longitud. Sus hojas son imparipinnadas, con 7 a 25 folíolos aserrados de 1 a 4 cm; el envés es plateado-tomentoso por densa pubescencia sedosa. Las flores son solitarias, amarillas, de 1.5 a 2.5 cm de diámetro, con 5 pétalos. El receptáculo es carnoso, con numerosos aquenios en la madurez. La especie presenta actualmente el nombre válido de Argentina anserina (L.) Rydb. (Eriksson et al., 2003). Distribución: Distribución circumboreal; especie nativa del hemisferio norte, también naturalizada en México en zonas templadas y húmedas. En Durango se localiza en pastizales de alta montaña y orillas de corrientes de agua fría entre 2,000 y 3,500 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Psacalium eriocarpum",
    comName: "Matarique, Hierba del venado, Chicura",
    desc: "Descripción: Hierba perenne de 30 a 80 cm de altura perteneciente a la familia Asteraceae, con raíces tuberosas ovoides. Sus hojas basales son palmatifidas a profundamente lobuladas, de 10 a 30 cm de longitud, con el envés densamente blanquecino-tomentoso; las hojas caulinares son reducidas. Los capítulos son discoides, de flores blancas a cremas, agrupados en corimbos terminales amplios. Los frutos son aquenios con papus blanco. Florece de agosto a noviembre (Robinson y Brettell, 1973). Distribución: Endémica de México, distribuida en la Sierra Madre Occidental en los estados de Durango, Sinaloa, Jalisco y Nayarit. En Durango se localiza en bosques de pino-encino y pastizales de la sierra entre 1,500 y 2,800 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Pseudognaphalium canescens",
    comName: "Gordolobo, Hierba del venado, Viejito",
    desc: "Descripción: Hierba perenne o bienal de 20 a 60 cm de altura perteneciente a la familia Asteraceae, densamente lanuginosa-blanquecina. Sus hojas son alternas, lanceoladas, de 3 a 8 cm de longitud, con la cara superior verde-grisácea y la inferior blanco-tomentosa. Los capítulos son pequeños, cilíndricos, con flores amarillas, reunidos en corimbos terminales compactos con brácteas papiráceas hialinas o amarillentas. El papus es blanco. Florece de agosto a noviembre (Andenberg, 1991). Distribución: Oeste de Estados Unidos y México. Especie nativa ampliamente distribuida en pastizales, matorrales y bordes de bosque. En Durango se localiza en pastizales y laderas perturbadas de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Pteridium aquilinum",
    comName: "Helecho bracken, Helecho aguileño, Calaguala",
    desc: "Descripción: Helecho rizomatoso de 0.5 a 2 m de altura perteneciente a la familia Dennstaedtiaceae. Sus frondes son grandes, triangulares, 2 a 4 pinnadas, con pecíolo robusto de color pardo. Las pínnulas son alargadas con el margen revoluto que cubre los soros en línea continua (soros marginales protegidos por el margen revolto). Presenta un rizoma horizontal subterráneo profundo y muy resistente al fuego, lo que le permite colonizar rápidamente áreas quemadas. Es tóxica para el ganado en altas dosis (Page, 1976). Distribución: Distribución subcosmopolita, una de las plantas vasculares de mayor distribución en el mundo. En México se localiza en zonas templadas y húmedas. En Durango es frecuente en bordes de bosque, zonas quemadas y áreas perturbadas. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Quercus albocincta",
    comName: "Encino blanco, Encino prieto, Encino blanco de la sierra",
    desc: "Descripción: Árbol de 5 a 15 m de altura perteneciente a la familia Fagaceae. Sus hojas son obovadas a obovado-oblongas, de 5 a 15 cm de longitud, con margen entero u ondulado. La cara superior es verde oscuro brillante; la inferior presenta mechones de pelos blancos en las axilas de los nervios secundarios, característica diagnóstica de la especie (albocincta = cinturada de blanco). Las bellotas son ovoides, de 1.5 a 2.5 cm, en cúpulas hemisféricas profundas con escamas planas. Florece de marzo a mayo. Habita en bosques de encino-pino (Nixon, 1993). Distribución: Endémica de México, restringida a la Sierra Madre Occidental en los estados de Sonora, Chihuahua, Sinaloa y Durango, entre 1,500 y 2,500 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Quercus castanea",
    comName: "Encino negro, Encino castaño, Encino colorado",
    desc: "Descripción: Árbol de 5 a 20 m de altura perteneciente a la familia Fagaceae. Sus hojas son oblanceoladas a obovadas, de 8 a 18 cm de longitud, con 5 a 10 pares de lóbulos aristados terminados en punto duro. La cara superior es verde oscuro brillante y la inferior es pálida con pubescencia estrellada. La corteza es oscura y fisurada. Las bellotas son semiexsertas en cúpulas con escamas aplanadas apretadas. Forma bosques densos en zonas templadas (CONABIO, 2020). Distribución: México y Guatemala, ampliamente distribuido en la Sierra Madre Occidental, Sierra Madre Oriental y Eje Neovolcánico. En Durango es uno de los encinos más abundantes del bosque de pino-encino. Especie nativa. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Quercus crassifolia",
    comName: "Encino de asta, Encino roble, Encino colorado",
    desc: "Descripción: Árbol de 5 a 25 m de altura perteneciente a la familia Fagaceae. Sus hojas son ovadas a elípticas, de 6 a 18 cm de longitud, gruesas y coriáceas, con margen ondulado-lobulado y dientes aristados; el envés presenta escamas estrelladas de color amarillo-blanquecino. Las bellotas son pequeñas, ovoides, de 1 a 1.5 cm, en cúpulas con escamas planas y apretadas. La corteza es grisácea con fisuras verticales. Importante para la producción de madera y carbón (Enciclovida, 2022). Distribución: México y Centroamérica. Especie nativa ampliamente distribuida en la Sierra Madre Occidental, Oriental y Eje Neovolcánico. Durango es uno de los estados de mayor diversidad y abundancia de esta especie. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Quercus obtusata",
    comName: "Encino duraznillo, Encino garrancho, Encino chino",
    desc: "Descripción: Árbol de 5 a 15 m de altura perteneciente a la familia Fagaceae. Sus hojas son obovadas, de 5 a 12 cm de longitud, con 3 a 5 pares de lóbulos obtusos (sin punta aristada) que distinguen a esta especie de los encinos del grupo Lobatae. La cara superior es verde oscuro y la inferior presenta pubescencia estrellada densa. Las bellotas son ovoides en cúpulas hemisféricas profundas con escamas planas. Florece de marzo a mayo (CONABIO, 2022). Distribución: Endémica de México, distribuida en la Sierra Madre Occidental y zona de transición al Eje Neovolcánico, en Durango, Jalisco, Sinaloa y Nayarit. En Durango se localiza en bosques de pino-encino y encino puro de 1,200 a 2,500 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Quercus rugosa",
    comName: "Encino rugoso, Encino peñasco, Encino tesmolillo",
    desc: "Descripción: Árbol de 5 a 20 m de altura perteneciente a la familia Fagaceae. Sus hojas son características por ser oblanceoladas a espatuladas, de 8 a 22 cm de longitud, con la cara superior rugosa y brillante de color verde oscuro, margen con dientes aristados; el envés presenta pubescencia estrellada densa de color amarillento. Las bellotas son alargadas en cúpulas profundas con escamas tuberculadas. Corteza oscura y fisurada. Es de las especies de encino más fácilmente reconocibles por su follaje rugoso (Nixon, 1993). Distribución: México (Sierra Madre Occidental y Oriental) y Centroamérica. Especie nativa distribuida en bosques de pino-encino desde 1,200 hasta 3,000 msnm. En Durango es frecuente en las serranías. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Quercus sideroxyla",
    comName: "Encino amarillo, Encino roble, Encino prieto",
    desc: "Descripción: Árbol de 8 a 25 m de altura perteneciente a la familia Fagaceae, con madera extremadamente dura y densa (sideroxyla = madera de hierro). Sus hojas son lanceoladas a oblanceoladas, de 6 a 18 cm de longitud, coriáceas, con margen aristado; la cara superior es brillante verde oscuro. Las bellotas son alargadas y angostas, semiexsertas en cúpulas planas con escamas planas. La corteza es oscura y agrietada. Es una especie de alto valor maderable (Enciclovida, 2021). Distribución: Endémica de México, con distribución en la Sierra Madre Occidental en los estados de Chihuahua, Durango, Sinaloa y Nayarit, entre 1,200 y 2,800 msnm. Es uno de los encinos más representativos de Durango. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Richardia scabra",
    comName: "Estrellita, Yerba del moro, Buchuda",
    desc: "Descripción: Hierba anual o perenne de 15 a 50 cm de longitud, postrada o ascendente, perteneciente a la familia Rubiaceae. Sus tallos son pubescentes a hirtos. Las hojas son opuestas, ovadas a elípticas, de 2 a 5 cm de longitud, pubescentes y ásperas al tacto. Las flores son blancas, pequeñas, en cabezuelas terminales densas rodeadas de brácteas. El fruto es un esquizocarpo de 3 a 6 mericarpios ovoides, tuberculados o rugosos, de 2 a 3 mm. Florece todo el año en zonas con precipitación (Standley y Steyermark, 1974). Distribución: México a Sudamérica y el Caribe. Especie nativa. En Durango se localiza en sitios abiertos, pastizales, bordes de caminos y zonas perturbadas de diversas altitudes. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Salvia elegans",
    comName: "Salvia piña, Salvia roja, Mirto rojo",
    desc: "Descripción: Arbusto de 0.5 a 2 m de altura perteneciente a la familia Lamiaceae. Sus hojas son opuestas, ovadas, de 4 a 10 cm de longitud, pubescentes y aromáticas, con un olor característico a piña. Las flores son tubulares, de color rojo escarlata, de 2 a 3 cm de longitud, con cáliz también rojizo; se disponen en verticilastros formando racimos terminales que atraen colibríes. El fruto son cuatro núculas ovoides. Florece de agosto a enero (Epling, 1939). Distribución: México y Guatemala. Especie nativa distribuida en bosques de pino-encino mesófilos y cañadas húmedas. En Durango se localiza en laderas con alta humedad y cañadas boscosas de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Salvia lavanduloides",
    comName: "Salvia lavanda, Hierba del perro, Salvia grisácea",
    desc: "Descripción: Arbusto de 0.3 a 1.5 m de altura perteneciente a la familia Lamiaceae. Sus hojas son opuestas, ovadas a lanceoladas, de 2 a 5 cm de longitud, con pubescencia grisácea a blanquecina densa en ambas superficies que le dan un aspecto plateado. Las flores son de color lavanda a violáceo, bilabiadas, en espigas terminales interrumpidas con verticilastros de 6 flores y brácteas ovadas. Florece de agosto a noviembre. Habita en matorrales y pastizales semiáridos (Ramamoorthy, 1984). Distribución: Endémica de México, distribuida en el centro, occidente y noroeste del país. En Durango se localiza en laderas y zonas de transición de la Sierra Madre Occidental, en matorrales semiáridos subhúmedos. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Salvia polystachya",
    comName: "Salvia multiespiga, Chía silvestre, Hierba del negro",
    desc: "Descripción: Hierba o subarbusto de 0.3 a 1.5 m de altura perteneciente a la familia Lamiaceae. Sus hojas son opuestas, ovadas, de 5 a 12 cm de longitud, con margen crenado-aserrado, pubescentes. Las flores son bilabiadas, de color rosado a lila, en espigas múltiples terminales y axilares, con 4 a 20 flores por verticilo y brácteas pequeñas. Los frutos son núculas ovoides lisas. Florece de septiembre a enero. Habita en pastizales, matorrales y orillas de bosque (Enciclovida, 2022). Distribución: México y Centroamérica. Especie nativa. En Durango se localiza en pastizales, matorrales y áreas perturbadas de la Sierra Madre Occidental. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Salvia regla",
    comName: "Salvia real, Salvia orejona, Mirto montañés",
    desc: "Descripción: Arbusto de 1 a 3 m de altura perteneciente a la familia Lamiaceae. Sus hojas son opuestas, ovadas a deltoides, de 3 a 8 cm de longitud, con margen crenado y nerviación bien marcada. Las flores son tubulares, de color escarlata a rojo intenso, de 3 a 4 cm de longitud, con cáliz infundibuliforme rojo oscuro; se disponen en racimos terminales y son visitadas preferentemente por colibríes. Florece de agosto a enero. Habita en bosques templados húmedos (Ramamoorthy, 1984). Distribución: Endémica de México, distribuida en la Sierra Madre Occidental y Eje Neovolcánico en los estados de Durango, Jalisco y Michoacán. En Durango se localiza en bosques de pino-encino y zonas templadas con alta humedad. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Senna pallida",
    comName: "Frijolillo, Venadillo, Sena pálida",
    desc: "Descripción: Arbusto de 1 a 3 m de altura perteneciente a la familia Fabaceae. Sus hojas son paripinnadas, con 3 a 5 pares de folíolos elípticos a ovados, de 2 a 4 cm de longitud, con un nectario extrafloral en el pecíolo. Las flores son papilionáceas, de color amarillo brillante, de 1.5 a 2.5 cm de diámetro, en racimos axilares de 5 a 10 flores. Las vainas son lineares, planas o subcilíndricas, de 8 a 15 cm de longitud. Florece de agosto a noviembre (Irwin y Barneby, 1982). Distribución: México a Sudamérica y el Caribe. Especie nativa. En Durango se localiza en matorrales semiáridos, vegetación secundaria y zonas de transición de la vertiente cálida. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Solanum torvum",
    comName: "Berenjena de monte, Chichiquelite, Tobaco silvestre",
    desc: "Descripción: Arbusto o árbol pequeño de 1 a 4 m de altura perteneciente a la familia Solanaceae, con espinas ganchudas en tallos y hojas. Sus hojas son grandes, ovadas, de 8 a 20 cm de longitud, profundamente lobuladas o sinuosas, pubescentes con tricomas estrellados. Las flores son blancas, de 1.5 a 2 cm de diámetro, en cimas compuestas con estambres amarillos prominentes. El fruto es una baya esférica de 1 a 1.5 cm de diámetro, amarillo-verdosa. El látex puede causar irritación en piel sensible (Nee, 1993). Distribución: México a Sudamérica y el Caribe; también introducida en Asia y África. Especie nativa. En Durango se localiza en matorrales secundarios y zonas perturbadas de clima cálido y subcálido. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  },
  {
    sciName: "Tagetes lucida",
    comName: "Pericón, Cempasúchil del monte, Hierba del venado, Santa María",
    desc: "Descripción: Hierba perenne aromática de 30 a 80 cm de altura perteneciente a la familia Asteraceae. Sus hojas son alternas, lanceoladas, de 4 a 9 cm de longitud, con puntuaciones glandulares transparentes visibles al trasluz que producen un intenso aroma a anís. Las cabezuelas son liguladas, con 3 a 5 lígulas amarillas y disco amarillo, reunidas en corimbos terminales compactos. El papus es de escamas desiguales. Florece de agosto a noviembre. Tiene usos medicinales y rituales tradicionales, y como condimento (CONABIO, 2021). Distribución: Endémica de México y Guatemala. En México se distribuye ampliamente en zonas templadas a subhúmedas. En Durango se localiza en bordes de camino, pastizales y orillas de bosque de la Sierra Madre Occidental, entre 1,200 y 2,800 msnm. Estatus de conservación: No se encuentra ubicada en ninguna categoría de riesgo dentro de la NOM-059-SEMARNAT-2010."
  }
];

// ===================== BIBLIOGRAPHY DATA =====================
const biblio = [
  "Andenberg, A. A. (1991). Taxonomy and phylogeny of the tribe Gnaphalieae. Opera Botanica, 104, 1–195.",
  "Atkins, S. (2004). Verbenaceae. En Kadereit, J. W. (Ed.), The Families and Genera of Vascular Plants. Vol. VII. Springer.",
  "Barneby, R. C. (1991). Sensitivae Censitae: A description of the genus Mimosa Linnaeus (Mimosaceae) in the New World. Mem. New York Bot. Gard., 65, 1–835.",
  "Brandbyge, J. (1986). A revision of the genus Eriosema (Leguminosae). Nordic Journal of Botany, 6(4), 381–558.",
  "Carranza, E. (2007). Convolvulaceae. Flora del Bajío y Regiones Adyacentes, fasc. 150. Instituto de Ecología, A.C.",
  "Churchill, S. P. y Linares, E. L. (1995). Prodromus Bryologiae Novo-Granatensis. Biblioteca José Jerónimo Triana 12(1-2). Instituto de Ciencias Naturales, Bogotá.",
  "CONABIO. (2016). Dodonaea viscosa. Enciclovida. https://enciclovida.mx/especies/167357",
  "CONABIO. (2020). Lantana canescens. Enciclovida. https://enciclovida.mx/especies/",
  "CONABIO. (2021). Pinus lumholtzii. Enciclovida. https://enciclovida.mx/especies/",
  "CONABIO. (2021). Tagetes lucida. Enciclovida. https://enciclovida.mx/especies/",
  "CONABIO. (2022). Bursera fagaroides. Enciclovida. https://enciclovida.mx/especies/",
  "CONABIO. (2023). Baccharis heterophylla. Enciclovida. https://enciclovida.mx/especies/",
  "Enciclovida. (2023). Bartlettina karwinskiana. Comisión Nacional para el Conocimiento y Uso de la Biodiversidad. https://enciclovida.mx/especies/",
  "Epling, C. (1939). A revision of Salvia, subgenus Calosphace. Feddes Repert. Spec. Nov. Regni Veg. Beih. 110, 1–383.",
  "Eriksson, T., Donoghue, M. J. y Hibbs, M. S. (2003). Phylogenetic analysis of Potentilla using DNA sequences of nuclear ribosomal internal transcribed spacers. Syst. Bot., 28, 211–229.",
  "Farjon, A. (2010). A Handbook of the World's Conifers. Brill.",
  "Farjon, A. y Styles, B. T. (1997). Flora Neotropica. Monograph 75. Pinus (Pinaceae). New York Botanical Garden.",
  "Flora of North America Editorial Committee. (2014). Flora of North America North of Mexico. Oxford University Press.",
  "Food and Agriculture Organization (FAO). (1977). Cajanus cajan (Millsp.) Huth. En: El cajanus. FAO, Roma.",
  "González-Espinosa, M., Meave, J. A. y Ramírez-Marcial, N. (1991). Karwinskia humboldtiana. Flora de Veracruz, fasc. 68.",
  "Hawksworth, D. L. y Seaward, M. R. D. (1977). Lichenology in the British Isles 1568–1975. The Richmond Publishing Co.",
  "Irwin, H. S. y Barneby, R. C. (1982). The American Cassiinae. Mem. New York Bot. Gard., 35, 1–918.",
  "Johnston, I. M. (1928). Studies in the Boraginaceae. Contr. Gray Herb., 81, 3–83.",
  "King, R. M. y Robinson, H. (1987). The genera of the Eupatorieae (Asteraceae). Monogr. Syst. Bot. Missouri Bot. Gard., 22, 1–581.",
  "Luckow, M. (1992). Crotalaria. Flora of the Guianas. Koenigstein.",
  "Nee, M. (1993). Solanaceae II. En Sosa, V. (ed.). Flora de Veracruz. Fasc. 72.",
  "Nesom, G. L. (1989). The genus Erigeron (Asteraceae) in Mexico and Central America. Phytologia, 67, 67–88.",
  "Nesom, G. L. (2006). Baccharis. En Flora of North America Editorial Committee (Ed.), Flora of North America North of Mexico (Vol. 19). Oxford University Press.",
  "Nixon, K. C. (1993). The genus Quercus in Mexico. En: Ramamoorthy, T. P. et al. (eds.), Biological Diversity of Mexico: Origins and Distribution. Oxford University Press.",
  "Page, C. N. (1976). The taxonomy and phytogeography of bracken — a review. Bot. J. Linn. Soc., 73, 1–34.",
  "Paton, A. (1992). A synopsis of Ocimum (Labiatae) in Africa. Kew Bull., 47, 403–435.",
  "Perry, J. P. (1991). The Pines of Mexico and Central America. Timber Press.",
  "Peterson, P. M. (2003). Muhlenbergia. En Flora of North America Vol. 25. Oxford University Press.",
  "Ramamoorthy, T. P. (1984). Salvia (Lamiaceae) in Mexico. J. Arnold Arb., 65, 135–180.",
  "Robinson, H. y Brettell, R. D. (1973). Studies in the Senecioneae (Asteraceae). I. Psacalium. Phytologia, 27, 57–68.",
  "SEMARNAT. (2010). Norma Oficial Mexicana NOM-059-SEMARNAT-2010. Protección ambiental, especies nativas de flora y fauna silvestres de México. Diario Oficial de la Federación.",
  "Sousa, M. (1987). Los géneros de leguminosas de México. Instituto de Biología, UNAM.",
  "Standley, P. C. y Steyermark, J. A. (1974). Rubiaceae. Flora of Guatemala. Fieldiana, Bot. 24.",
  "Stirton, C. H. (1978). Eriosema. En: Polhill, R. M. y Raven, P. H. (eds.), Advances in Legume Systematics. Royal Botanic Gardens, Kew.",
  "Turner, B. L. (1997). The Comps of Mexico. Vol. 6. Phytologia Memoirs 11.",
  "Turner, B. L. y Dillon, M. O. (1986). Montanoa. Phytologia, 60, 432–440.",
  "Verdcourt, B. (1963). Convolvulaceae. En Flora of Tropical East Africa. Crown Agents.",
  "Vibrans, H. (coord.). (2009). Malezas de México. Comisión Nacional para el Conocimiento y Uso de la Biodiversidad (CONABIO).",
  "Villaseñor, J. L. (2003). Diversidad y distribución de la familia Asteraceae en México. Interciencia, 28, 1–7.",
  "Villaseñor, J. L. (2016). Checklist of the native vascular plants of Mexico. Rev. Mex. Biodivers., 87, 559–902."
];

// ===================== OBSERVATIONS FETCHING LOGIC =====================
function fetchTwoImageUrls(sciName) {
  return new Promise((resolve) => {
    const url = `https://api.inaturalist.org/v1/observations?taxon_name=${encodeURIComponent(sciName)}&photos=true&per_page=5`;
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
                  let photoUrl = p.url.replace('square', 'medium');
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

// ===================== HELPERS AND SHARP CROPPING =====================
function imgPath(sp, index) {
  return path.join(__dirname, 'imgs_flora', `${sp.sciName.replace(/ /g, '_')}_${index}.jpg`);
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
    ], { fill: "E8F5E9", type: ShadingType.CLEAR })]
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
  const imgDir = path.join(__dirname, 'imgs_flora');
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir);
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
      children: [new TextRun({ text: "MANIFESTACIÓN DE IMPACTO AMBIENTAL", bold: true, size: 28, font: "Noto Sans", color: "1B5E20" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      children: [new TextRun({ text: "Anexo V", bold: true, size: 24, font: "Noto Sans", color: "2E7D32" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "2E7D32", space: 1 } },
      children: [new TextRun({ text: "Fichas técnicas de las especies de flora observadas", bold: true, size: 24, font: "Noto Sans" })]
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
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "2E7D32", space: 1 } },
    children: [new TextRun({ text: "BIBLIOGRAFÍA", bold: true, size: 24, font: "Noto Sans", color: "1B5E20" })]
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
    fs.writeFileSync('Anexo_V_Fichas_Flora_Durango.docx', buffer);
    console.log('\n¡Éxito! Archivo generado con imágenes y bibliografía .');
  }).catch(e => { console.error('Error al generar el Word:', e); });
}

main();