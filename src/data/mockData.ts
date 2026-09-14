import { Song, LiturgicalMoment, BandMember, PrayerIntention, RehearsalEvent } from '../types';

export const INITIAL_CONCERT_SONGS: Song[] = [
  {
    id: 'song-1',
    orderNumber: '01',
    title: 'Ven Espíritu de Dios',
    subtitle: 'Invocación inicial para abrir el concierto, arreglo acústico que crece con batería y bajo.',
    category: 'adoracion',
    categoryLabel: 'Adoración y Contemplación',
    duration: '6:30 min',
    originalKey: 'Sol',
    currentKey: 'Sol',
    rhythmNote: 'Sol Mayor • Clímax con Banda',
    arrangementNote: 'Arreglo acústico con crescendo sinfónico y pads atmosféricos',
    introTags: ['Acústico', 'Crescendo Banda', 'Oración Invocación'],
    audioDurationSeconds: 390,
    lyricsAndChords: `[Intro] G - Em - C - D

[Verso 1]
G                 Em
Ven Espíritu de Dios sobre mí,
C                     D
llena mi alma con tu luz y tu poder.
G                 Em
Guía mis pasos en sendas de paz,
C                 D
derrama tu gracia en este lugar.

[Coro]
C        D           G      Em
Espíritu Santo ven, sopla aquí,
C            D          G
enciende el fuego en mi corazón.
C        D           B7     Em
Espíritu Santo ven, toma el control,
C             D             G
te adoramos hoy Jesús, Señor y Rey.`
  },
  {
    id: 'song-2',
    orderNumber: '02',
    title: 'Levanto Mis Manos',
    subtitle: 'Canto de entrega y sanación para la asamblea. Piano eléctrico y armonías vocales a 3 voces.',
    category: 'adoracion',
    categoryLabel: 'Adoración',
    duration: '5:15 min',
    originalKey: 'Re',
    currentKey: 'Re',
    rhythmNote: 'Momento Íntimo de Oración',
    arrangementNote: 'Piano Rhodes + Guitarra acústica fingerpicking + Trío vocal femenino/masculino',
    introTags: ['Piano Eléctrico', 'Armonía 3 Voces', 'Sanación'],
    audioDurationSeconds: 315,
    lyricsAndChords: `[Intro] D - G - A - D

[Verso 1]
D              A
Levanto mis manos
Bm               F#m
aunque no tenga fuerzas.
G              D
Levanto mis manos
Em               A
aunque tenga mil problemas.

[Coro]
        G               A
Cuando levanto mis manos
         F#m             Bm
comienzo a sentir una unción
            G               A
que me hace cantar, que me hace vencer,
         D      D7
todo mi ser te alaba.`
  },
  {
    id: 'song-3',
    orderNumber: '03',
    title: 'Fiesta del Señor / En Ti Me Gozaré',
    subtitle: 'Pop/rock católico alegre para poner a toda la comunidad de pie con palmas y coros interactivos.',
    category: 'animacion',
    categoryLabel: 'Animación y Alabanza Viva',
    duration: '4:45 min',
    originalKey: 'Mi',
    currentKey: 'Mi',
    tempoBpm: 128,
    rhythmNote: 'Mi Menor • Ritmo Dinámico (128 BPM)',
    arrangementNote: 'Riff con overdrive, bajo funk/slap y coros responsoriales',
    introTags: ['Intro Batería', 'Solo de Guitarra Eléctrica', 'Palmas con la Asamblea'],
    audioDurationSeconds: 285,
    lyricsAndChords: `[Intro] Em - C - G - D (x2) [Groove activo de batería y bajo]

[Verso]
Em                       C
Esta es la fiesta del Señor Jesús,
G                        D
Él venció la muerte y nos dio la luz.
Em                      C
Con gozo en el alma y el corazón,
G                    D
cantemos unidos con devoción.

[Coro]
Em            C
En Ti me gozaré, Señor,
G             D
en Ti me alegraré.
Em          C
Tú eres la roca de mi salvación,
G            D        Em
¡gloria y honor a Ti mi Dios!`
  },
  {
    id: 'song-4',
    orderNumber: '04',
    title: 'Voces en Cristo (Himno VEC)',
    subtitle: '"Levantamos la voz como un solo cuerpo..." El tema insignia de nuestra misión evangelizadora y fraterna.',
    category: 'propios',
    categoryLabel: 'Canto Propio VEC Original',
    duration: '4:10 min',
    originalKey: 'Sol',
    currentKey: 'Sol',
    tempoBpm: 110,
    rhythmNote: 'Versión Acústica + Banda Oficial',
    arrangementNote: 'Composición: Voces en Cristo • Álbum y Misión Comunitaria',
    introTags: ['Maqueta Oficial', 'Himno de Misión', 'Arreglo Banda Completa'],
    isOriginalVEC: true,
    audioDurationSeconds: 250,
    composer: 'Voces en Cristo Ministerio',
    lyricsAndChords: `[Intro] G - D/F# - Em7 - Cadd9

[Verso 1]
G                 D/F#
Levantamos la voz como un solo cuerpo,
Em7               Cadd9
llevando esperanza por todo sendero.
G                 D/F#
Unidos en fe, con la Madre María,
Em7                 Cadd9
entonamos tu nombre con alegría.

[Coro]
G           D/F#
¡Somos las Voces en Cristo!
Em7         Cadd9
Instrumentos de tu gran amor.
G           D/F#
En cada acorde tu gracia anunciamos,
Em7        Cadd9            G
al Dios de la vida que nos llamó.`
  },
  {
    id: 'song-5',
    orderNumber: '05',
    title: 'Fuego Consumidor',
    subtitle: 'Balada rock de efusión del Espíritu Santo. Momento culminante de intercesión y efusión.',
    category: 'propios',
    categoryLabel: 'Canto Propio VEC Original',
    duration: '5:40 min',
    originalKey: 'La',
    currentKey: 'La',
    tempoBpm: 92,
    rhythmNote: 'La Menor • Balada Rock Espiritual',
    arrangementNote: 'Pad sinfónico, arpegio de guitarra de 12 cuerdas y crescendo de platillos',
    introTags: ['Composición Propia', 'Efusión Espíritu Santo', 'Solo Guitarra'],
    isOriginalVEC: true,
    audioDurationSeconds: 340,
    composer: 'Voces en Cristo',
    lyricsAndChords: `[Intro] Am - F - C - G

[Verso]
Am                 F
Ven como fuego, quema el temor,
C                  G
purifica todo mi corazón.
Am                 F
No tengo nada que ocultar ante Ti,
C                  G
Espíritu Santo, desciende aquí.

[Coro]
Am          F
Fuego consumidor,
C           G
llena este altar.
Am          F
Fuego de amor y perdón,
C           G        Am
haz tu gloria brillar.`
  },
  {
    id: 'song-6',
    orderNumber: '06',
    title: 'Nadie Te Ama Como Yo',
    subtitle: 'Clásico de adoración eucarística para acompañar el paso del Santísimo Sacramento.',
    category: 'adoracion',
    categoryLabel: 'Adoración y Contemplación',
    duration: '5:50 min',
    originalKey: 'Do',
    currentKey: 'Do',
    rhythmNote: 'Do Mayor • Adoración Eucarística',
    arrangementNote: 'Guitarra española, chelo y flauta dulce con coro suave',
    introTags: ['Paso del Santísimo', 'Intimidad con Jesús', 'Clásico'],
    audioDurationSeconds: 350,
  },
  {
    id: 'song-7',
    orderNumber: '07',
    title: 'Renuévame Señor Jesús',
    subtitle: 'Canto de conversión y arrepentimiento sincero ante el altar.',
    category: 'adoracion',
    categoryLabel: 'Adoración',
    duration: '4:20 min',
    originalKey: 'Re',
    currentKey: 'Re',
    rhythmNote: 'Re Mayor • Balada Orante',
    arrangementNote: 'Arreglo acústico suave con campanas tubulares',
    introTags: ['Metanoia', 'Entrega', 'Acústico'],
    audioDurationSeconds: 260,
  },
  {
    id: 'song-8',
    orderNumber: '08',
    title: 'Alaba a Dios / Viva la Fe',
    subtitle: 'Medley dinámico de alabanza carismática y animación para jóvenes y familias.',
    category: 'animacion',
    categoryLabel: 'Animación y Alabanza Viva',
    duration: '6:10 min',
    originalKey: 'Sol',
    currentKey: 'Sol',
    tempoBpm: 135,
    rhythmNote: 'Sol Mayor • Ritmo Festivo (135 BPM)',
    arrangementNote: 'Sección rítmica con percusión latina (congas, cencerro) y metales',
    introTags: ['Percusión Latina', 'Medley', 'Dinámica con Asamblea'],
    audioDurationSeconds: 370,
  },
  {
    id: 'song-9',
    orderNumber: '09',
    title: 'En Tu Presencia',
    subtitle: 'Composición original de adoración comunitaria tras la bendición final con el Santísimo.',
    category: 'propios',
    categoryLabel: 'Canto Propio VEC Original',
    duration: '4:55 min',
    originalKey: 'Mi',
    currentKey: 'Mi',
    tempoBpm: 76,
    rhythmNote: 'Mi Mayor • Contemplación',
    arrangementNote: 'Composición VEC • Arreglo de cuerdas y piano de cola',
    introTags: ['Original VEC', 'Bendición Eucarística'],
    isOriginalVEC: true,
    audioDurationSeconds: 295,
  },
  {
    id: 'song-10',
    orderNumber: '10',
    title: 'Pescador de Hombres (Tú Has Venido a la Orilla)',
    subtitle: 'Canto de envío misionero y compromiso apostólico para el cierre del concierto.',
    category: 'animacion',
    categoryLabel: 'Envío y Cierre Triunfal',
    duration: '5:30 min',
    originalKey: 'Re',
    currentKey: 'Re',
    rhythmNote: 'Re Mayor • Final Concierto',
    arrangementNote: 'Versión moderna rock sinfónico con todos los coros al unísono',
    introTags: ['Canto Misionero', 'Final Setlist', 'Toda la Asamblea'],
    audioDurationSeconds: 330,
  }
];

export const LITURGICAL_MOMENTS: LiturgicalMoment[] = [
  {
    id: 'entrada',
    name: 'Canto de Entrada',
    description: 'Reunión, procesión del sacerdote y alabanza comunitaria al iniciar la Santa Misa.',
    count: 18,
    icon: 'login',
    accentColor: 'text-amber-400',
    recommendedSongs: [
      { title: 'Juntos como Hermanos', key: 'Re', tempo: 'Moderato', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'Vienen con Alegría', key: 'Mi', tempo: 'Alegre', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'Hacia Ti Morada Santa', key: 'Re m', tempo: 'Solemnis', liturgicalSeason: 'Cuaresma' },
      { title: 'Al Altar del Señor', key: 'Sol', tempo: 'Festivo', liturgicalSeason: 'Pascua' },
    ]
  },
  {
    id: 'piedad-gloria',
    name: 'Señor Ten Piedad & Gloria',
    description: 'Petición de perdón y gran himno de alabanza a la Santísima Trinidad.',
    count: 12,
    icon: 'brightness_7',
    accentColor: 'text-sky-400',
    recommendedSongs: [
      { title: 'Kyrie Eleison (Arreglo VEC)', key: 'Mi m', tempo: 'Lento orante', liturgicalSeason: 'Todos' },
      { title: 'Gloria a Dios en el Cielo (Misa Andina / Criolla)', key: 'Sol', tempo: 'Festivo', liturgicalSeason: 'Fiestas y Solemnidades' },
      { title: 'Gloria de los Ángeles (Pascual)', key: 'Re', tempo: 'Triunfal', liturgicalSeason: 'Pascua' },
    ]
  },
  {
    id: 'salmo',
    name: 'Salmo Responsorial',
    description: 'Ciclos A, B y C con antífonas cantadas respondiendo a la Palabra proclamada.',
    count: 32,
    icon: 'auto_stories',
    accentColor: 'text-emerald-400',
    recommendedSongs: [
      { title: 'El Señor es mi Pastor (Salmo 22)', key: 'Do', tempo: 'Calmo', liturgicalSeason: 'Ciclos A, B, C' },
      { title: 'Tu Palabra me da Vida (Salmo 118)', key: 'Re', tempo: 'Caminante', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'A Ti levanto mis Ojos (Salmo 122)', key: 'La m', tempo: 'Suplicante', liturgicalSeason: 'Cuaresma' },
      { title: 'Este es el Día en que Actuó el Señor (Salmo 117)', key: 'Sol', tempo: 'Gozoso', liturgicalSeason: 'Pascua' },
    ]
  },
  {
    id: 'ofertorio',
    name: 'Ofertorio / Presentación de Dones',
    description: 'Presentación del pan, vino y la ofrenda sincera del trabajo de la asamblea.',
    count: 14,
    icon: 'volunteer_activism',
    accentColor: 'text-amber-300',
    recommendedSongs: [
      { title: 'Te Presentamos el Vino y el Pan', key: 'Re', tempo: 'Andante', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'Saber que Vendrás (En este mundo)', key: 'Do', tempo: 'Moderato', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'Entre Tus Manos pongo mi existencia', key: 'Re', tempo: 'Devoto', liturgicalSeason: 'Cuaresma / Exequias' },
      { title: 'Bendito Seas por Siempre Señor', key: 'Mi', tempo: 'Gozoso', liturgicalSeason: 'Pascua' },
    ]
  },
  {
    id: 'santo-paz',
    name: 'Santo & Rito de la Paz',
    description: 'Aclamación celestial con los ángeles y abrazo fraterno de paz.',
    count: 15,
    icon: 'sentiment_satisfied',
    accentColor: 'text-sky-300',
    recommendedSongs: [
      { title: 'Santo es el Señor mi Dios (Digno de Alabanza)', key: 'Re m', tempo: 'Majestuoso', liturgicalSeason: 'General' },
      { title: 'Santo Hosanna en las Alturas (VEC Beat)', key: 'Sol', tempo: 'Contemporáneo', liturgicalSeason: 'Juventud' },
      { title: 'Paz en la Tierra a los hombres de buena voluntad', key: 'Do', tempo: 'Fraterno', liturgicalSeason: 'Navidad / General' },
    ]
  },
  {
    id: 'comunion',
    name: 'Comunión Eucarística',
    description: 'Intimidad sacramental con Cristo vivo en el pan eucarístico.',
    count: 26,
    icon: 'church',
    accentColor: 'text-amber-400',
    recommendedSongs: [
      { title: 'Eucaristía Milagro de Amor', key: 'Sol', tempo: 'Adoración', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'No Podemos Caminar con Hambre', key: 'La m', tempo: 'Caminante', liturgicalSeason: 'Corpus Christi' },
      { title: 'Yo Soy el Pan de Vida', key: 'Mi', tempo: 'Contemplativo', liturgicalSeason: 'Todos' },
      { title: 'Señor no soy Digno', key: 'Re', tempo: 'Íntimo', liturgicalSeason: 'Penitencial' },
    ]
  },
  {
    id: 'accion-gracias',
    name: 'Acción de Gracias / Post-Comunión',
    description: 'Silencio reverente o cántico dulce de gratitud tras recibir al Señor.',
    count: 10,
    icon: 'favorite',
    accentColor: 'text-rose-300',
    recommendedSongs: [
      { title: 'Alma Misionera (Llévame donde los hombres)', key: 'Sol', tempo: 'Esperanzador', liturgicalSeason: 'Misiones' },
      { title: 'Nada te turbe nada te espante (Santa Teresa)', key: 'La m', tempo: 'Meditativo', liturgicalSeason: 'Oración' },
    ]
  },
  {
    id: 'salida',
    name: 'Canto Final y Salida',
    description: 'Envío misionero al mundo con la bendición y protección de María.',
    count: 16,
    icon: 'directions_walk',
    accentColor: 'text-emerald-300',
    recommendedSongs: [
      { title: 'Junto a Ti María como un niño', key: 'Do', tempo: 'Mariano', liturgicalSeason: 'Mes Mariano / General' },
      { title: 'Santa María del Camino', key: 'Re', tempo: 'Marcha alegre', liturgicalSeason: 'Tiempo Ordinario' },
      { title: 'Id y Enseñad (Sois la semilla)', key: 'Sol', tempo: 'Envío misionero', liturgicalSeason: 'General' },
    ]
  }
];

export const BAND_MEMBERS: BandMember[] = [
  {
    id: 'm1',
    name: 'Mateo Sandoval',
    role: 'Director Musical & Teclados',
    instrument: 'Piano / Sintetizadores & Arreglos',
    bio: '8 años guiando la música litúrgica y arreglos contemporáneos en el ministerio.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    joinedYear: '2017'
  },
  {
    id: 'm2',
    name: 'Sofía Valenzuela',
    role: 'Voz Principal & Animación',
    instrument: 'Voz Soprano & Salmista',
    bio: 'Voz de oración en vigilias eucarísticas, compositora de los himnos de Voces en Cristo.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    joinedYear: '2018'
  },
  {
    id: 'm3',
    name: 'Lucas Arismendi',
    role: 'Guitarra Acústica & Eléctrica',
    instrument: 'Guitarras de 6 y 12 cuerdas',
    bio: 'Encargado del tono acústico en la adoración y los solos energéticos en alabanza viva.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    joinedYear: '2019'
  },
  {
    id: 'm4',
    name: 'Camila Morales',
    role: 'Bajo Eléctrico & Coros',
    instrument: 'Bajo de 5 cuerdas & Voz Alto',
    bio: 'Sustento armónico de la banda y formadora de cantores jóvenes en la parroquia.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    joinedYear: '2020'
  },
  {
    id: 'm5',
    name: 'Ignacio Vega',
    role: 'Batería & Percusión Menor',
    instrument: 'Batería Acústica, Cajón & Percusiones',
    bio: 'Dinámica de ritmos litúrgicos respetuosos y beats enérgicos para conciertos de alabanza.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    joinedYear: '2021'
  },
  {
    id: 'm6',
    name: 'Valentina Ríos',
    role: 'Coros & Salmista',
    instrument: 'Voz Mezzosoprano & Flauta Traversa',
    bio: 'Encargada de salmos responsoriales y segundas voces en armonía.',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    joinedYear: '2022'
  }
];

export const UPCOMING_SCHEDULE: RehearsalEvent[] = [
  {
    id: 'e1',
    title: 'Ensayo General - Concierto VEC',
    type: 'ensayo',
    dateStr: 'Jueves 23',
    timeStr: '19:00 - 21:30',
    location: 'Salón Parroquial San Juan Bosco',
    status: 'confirmado',
    agendaNotes: ['Ajuste de dinámicas en "Ven Espíritu de Dios"', 'Soundcheck de batería y retorno in-ear', 'Oración previa comunitaria']
  },
  {
    id: 'e2',
    title: 'Prueba de Sonido (Soundcheck)',
    type: 'concierto',
    dateStr: 'Sábado 25',
    timeStr: '16:00 - 18:00',
    location: 'Auditorio Principal',
    status: 'confirmado',
    agendaNotes: ['Revisión de microfonía de coros', 'Niveles de guitarra acústica y bajo', 'Apertura de puertas a las 19:00']
  },
  {
    id: 'e3',
    title: 'Concierto de Alabanza & Adoración VEC',
    type: 'concierto',
    dateStr: 'Sábado 25',
    timeStr: '19:30 - 22:00',
    location: 'Auditorio San Juan Bosco',
    status: 'confirmado',
    agendaNotes: ['Setlist de 10 cantos', 'Momento central con el Santísimo', 'Testimonio de jóvenes']
  },
  {
    id: 'e4',
    title: 'Misa Dominical de Acción de Gracias',
    type: 'misa',
    dateStr: 'Domingo 26',
    timeStr: '11:30 - 13:00',
    location: 'Templo Parroquial',
    status: 'proximo',
    agendaNotes: ['Repertorio litúrgico del domingo', 'Salmo cantado por Valentina']
  }
];

export const INITIAL_PRAYER_INTENTIONS: PrayerIntention[] = [
  {
    id: 'pi-1',
    author: 'Familia Ramírez Gómez',
    location: 'Parroquia San Juan Bosco',
    intention: 'Por la pronta salud de nuestra abuela Carmen y para que el Señor llene de paz nuestro hogar en este tiempo de prueba.',
    category: 'salud',
    date: 'Hace 3 horas',
    prayersCount: 28,
    hasPrayed: false
  },
  {
    id: 'pi-2',
    author: 'Pastoral Juvenil VEC',
    location: 'Comunidad de Jóvenes',
    intention: 'Por los frutos espirituales del próximo Concierto de Alabanza, para que muchos jóvenes se reencuentren con Cristo.',
    category: 'comunidad',
    date: 'Ayer',
    prayersCount: 45,
    hasPrayed: true
  },
  {
    id: 'pi-3',
    author: 'Hermana Teresa M.',
    location: 'Vocaciones Eucarísticas',
    intention: 'Por las vocaciones consagradas y ministeriales de nuestra diócesis, y por los músicos católicos que sirven al altar.',
    category: 'vocacion',
    date: 'Hace 2 días',
    prayersCount: 34,
    hasPrayed: false
  }
];
