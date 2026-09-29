// Servicio para obtener y actualizar diariamente el Evangelio desde Dominicos.org y fuentes católicas

export interface EvangelioData {
  fechaFormateada: string;
  diaSemana: string;
  diaMes: number;
  mesNombre: string;
  anio: number;
  tiempoLiturgico: string;
  colorLiturgico: string;
  colorLiturgicoBg: string;
  colorLiturgicoBorder: string;
  colorLiturgicoText: string;
  cicloLiturgico: string;
  santoDelDia: string;
  citaEvangelio: string;
  pasajeEvangelio: string;
  lemaOFrase?: string;
  autorComentario?: string;
  fuenteUrl: string;
  podcastUrl?: string;
  widgetUrl: string;
  ultimaActualizacion: string;
  origen: 'dominicos_vivo' | 'calculado_liturgico';
}

const DOMINICOS_HOY_URL = 'https://www.dominicos.org/predicacion/evangelio-del-dia/hoy/';
const DOMINICOS_WIDGET_URL = 'https://widget.dominicos.org';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const DIAS_SEMANA = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
];

/**
 * Calcula metadatos litúrgicos aproximados basados en la fecha actual
 */
export function getLiturgicalInfo(date: Date) {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const year = date.getFullYear();

  // Ciclo litúrgico (A, B, C)
  const ciclos = ['Ciclo C', 'Ciclo A', 'Ciclo B'];
  const cicloLiturgico = ciclos[year % 3];

  let tiempoLiturgico = 'Tiempo Ordinario';
  let colorLiturgico = 'Verde';
  let colorLiturgicoBg = 'bg-emerald-950/60';
  let colorLiturgicoBorder = 'border-emerald-500/40';
  let colorLiturgicoText = 'text-emerald-300';

  // Adviento y Navidad (Diciembre - Enero)
  if (month === 11 && day >= 1) {
    if (day <= 24) {
      tiempoLiturgico = 'Tiempo de Adviento';
      colorLiturgico = 'Morado Penitencial';
      colorLiturgicoBg = 'bg-purple-950/60';
      colorLiturgicoBorder = 'border-purple-500/40';
      colorLiturgicoText = 'text-purple-300';
    } else {
      tiempoLiturgico = 'Tiempo de Navidad';
      colorLiturgico = 'Blanco Litúrgico';
      colorLiturgicoBg = 'bg-amber-950/60';
      colorLiturgicoBorder = 'border-amber-400/40';
      colorLiturgicoText = 'text-amber-200';
    }
  } else if (month === 0 && day <= 12) {
    tiempoLiturgico = 'Tiempo de Navidad / Epifanía';
    colorLiturgico = 'Blanco Litúrgico';
    colorLiturgicoBg = 'bg-amber-950/60';
    colorLiturgicoBorder = 'border-amber-400/40';
    colorLiturgicoText = 'text-amber-200';
  } else if (month >= 1 && month <= 3) {
    // Estimación Cuaresma / Pascua
    if (month === 1 && day > 15 || month === 2) {
      tiempoLiturgico = 'Tiempo de Cuaresma';
      colorLiturgico = 'Morado de Conversión';
      colorLiturgicoBg = 'bg-purple-950/60';
      colorLiturgicoBorder = 'border-purple-500/40';
      colorLiturgicoText = 'text-purple-300';
    } else if (month === 3) {
      tiempoLiturgico = 'Tiempo de Pascua';
      colorLiturgico = 'Blanco Resurrección';
      colorLiturgicoBg = 'bg-amber-950/60';
      colorLiturgicoBorder = 'border-amber-400/40';
      colorLiturgicoText = 'text-amber-200';
    }
  }

  return {
    tiempoLiturgico,
    colorLiturgico,
    colorLiturgicoBg,
    colorLiturgicoBorder,
    colorLiturgicoText,
    cicloLiturgico,
  };
}

/**
 * Obtiene el Evangelio del día en español intentando consultar Dominicos.org con fallback litúrgico
 */
export async function fetchEvangelioDelDia(): Promise<EvangelioData> {
  const hoy = new Date();
  const diaSemana = DIAS_SEMANA[hoy.getDay()];
  const diaMes = hoy.getDate();
  const mesNombre = MESES[hoy.getMonth()];
  const anio = hoy.getFullYear();

  const fechaFormateada = `${diaSemana}, ${diaMes} de ${mesNombre} de ${anio}`;
  const litInfo = getLiturgicalInfo(hoy);

  // Intentar cargar la predicación de hoy desde dominicos.org vía AllOrigins proxy (con timeout rápido de 3.5 segundos)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(DOMINICOS_HOY_URL)}`;
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const html = data?.contents || '';

      if (html && html.length > 500) {
        // 1. Extraer JSON-LD
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
        let parsedLd: any = null;
        if (jsonLdMatch && jsonLdMatch[1]) {
          try {
            parsedLd = JSON.parse(jsonLdMatch[1].trim());
          } catch {
            // ignore
          }
        }

        // 2. Extraer Cita del Evangelio
        let cita = 'San Mateo 18, 19-20';
        const metaDescMatch = html.match(/<meta content="([^"]+)" name="description"/i);
        const metaDesc = metaDescMatch ? metaDescMatch[1] : '';

        // Buscar patrón tipo "evangelio de hoy según san Lucas 9, 46-50" o "san Juan 1,47-51"
        const evMatch = metaDesc.match(/(san (?:Mateo|Marcos|Lucas|Juan) [0-9, \-–.]+)/i) ||
                        html.match(/Lectura del santo evangelio según (san (?:Mateo|Marcos|Lucas|Juan) [0-9, \-–.]+)/i);
        if (evMatch && evMatch[1]) {
          cita = evMatch[1].trim();
        }

        // 3. Extraer lema / frase
        let lema = parsedLd?.name || parsedLd?.headline || '';
        const titleMatch = html.match(/<meta content="([^"]+)" property="og:title"/i);
        if (titleMatch && titleMatch[1]) {
          lema = titleMatch[1].replace(/ - dominicos.*$/i, '').trim();
        }

        // 4. Extraer Santo del día
        let santo = 'Celebración Litúrgica del Día';
        const santoMatch = metaDesc.match(/Santo[s]? del d[ií]a:\s*([^.]+)/i) ||
                           html.match(/Hoy es:\s*<a[^>]*>([^<]+)<\/a>/i) ||
                           html.match(/Hoy la Iglesia celebra[^<]*<h3[^>]*><a[^>]*>([^<]+)<\/a>/i);
        if (santoMatch && santoMatch[1]) {
          santo = santoMatch[1].trim();
        }

        // 5. Extraer autor del comentario
        let autor = 'Comunidad de Predicación - Orden de Predicadores (Dominicos)';
        if (parsedLd?.author?.name) {
          autor = parsedLd.author.name;
        }

        return {
          fechaFormateada,
          diaSemana,
          diaMes,
          mesNombre,
          anio,
          ...litInfo,
          santoDelDia: santo,
          citaEvangelio: cita,
          pasajeEvangelio: metaDesc || '«El que recibe a un niño como este en mi nombre, a mí me recibe; y el que a mí me recibe, no me recibe a mí sino al que me envió.»',
          lemaOFrase: lema,
          autorComentario: autor,
          fuenteUrl: DOMINICOS_HOY_URL,
          podcastUrl: 'https://www.dominicos.org/predicacion/podcast/',
          widgetUrl: DOMINICOS_WIDGET_URL,
          ultimaActualizacion: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          origen: 'dominicos_vivo',
        };
      }
    }
  } catch {
    // Si falla o no hay conexión externa al proxy, usar cálculo litúrgico nativo
  }

  // Fallback litúrgico predeterminado con fecha exacta de hoy
  return {
    fechaFormateada,
    diaSemana,
    diaMes,
    mesNombre,
    anio,
    ...litInfo,
    santoDelDia: 'Santoral Litúrgico de la Iglesia Católica',
    citaEvangelio: 'Lectura del Santo Evangelio del Día',
    pasajeEvangelio: '«Les aseguro que si dos de ustedes se ponen de acuerdo en la tierra para pedir cualquier cosa, la obtendrán de mi Padre celestial. Porque donde dos o tres están reunidos en mi nombre, allí estoy yo en medio de ellos.» (Mt 18, 19-20)',
    lemaOFrase: '«El que canta, ora dos veces» — San Agustín',
    autorComentario: 'Orden de Predicadores (Dominicos) • Predicación y Espiritualidad',
    fuenteUrl: DOMINICOS_HOY_URL,
    podcastUrl: 'https://www.dominicos.org/predicacion/podcast/',
    widgetUrl: DOMINICOS_WIDGET_URL,
    ultimaActualizacion: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    origen: 'calculado_liturgico',
  };
}
