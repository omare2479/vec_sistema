import { GalleryPhoto } from '../types';

export const DEFAULT_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'vec-p1',
    title: 'Banda Voces en Cristo • Foto Oficial de Fraternidad',
    description: 'Integrantes, músicos y salmistas con la camiseta oficial VEC junto a la batería acústica en el patio parroquial.',
    category: 'fraternidad',
    date: 'Concierto Anual',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1000&auto=format&fit=crop&q=80',
    tags: ['Oficial', 'Fraternidad', 'Banda VEC', 'Batería'],
    isUserUploaded: false,
    uploadedAt: 1
  },
  {
    id: 'vec-p2',
    title: 'Santa Misa & Misión: "Espíritu Santo compañero de camino"',
    description: 'Animación litúrgica junto a nuestro Padre Párroco frente al hermoso mural de Pentecostés.',
    category: 'misiones',
    date: 'Misión Parroquial',
    imageUrl: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=1000&auto=format&fit=crop&q=80',
    tags: ['Santa Misa', 'Párroco', 'Pentecostés', 'Misión'],
    isUserUploaded: false,
    uploadedAt: 2
  },
  {
    id: 'vec-p3',
    title: 'Guitarra Eléctrica & Solos de Alabanza en Vivo',
    description: 'Solo vibrante de guitarra eléctrica Les Paul y acompañamiento del bajo en noche de alabanza.',
    category: 'conciertos',
    date: 'Noche de Alabanza',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
    tags: ['Guitarra', 'Bajo', 'En Vivo', 'Alabanza'],
    isUserUploaded: false,
    uploadedAt: 3
  },
  {
    id: 'vec-p4',
    title: 'Trío Vocal Femenino VEC ante la Paloma de la Paz',
    description: 'Voces soprano y contralto entonando cantos marianos y salmos con unción y entrega.',
    category: 'conciertos',
    date: 'Vigilia Juvenil',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1000&auto=format&fit=crop&q=80',
    tags: ['Voces', 'Salmistas', 'Armonía', 'Adoración'],
    isUserUploaded: false,
    uploadedAt: 4
  },
  {
    id: 'vec-p5',
    title: 'Sesión de Grabación en Estudio Profesional VEC',
    description: 'Grabación de armonías a tres voces en cabina profesional con micrófono de condensador.',
    category: 'estudio',
    date: 'Grabación de Álbum',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80',
    tags: ['Estudio', 'Grabación', 'Voz', 'Producción'],
    isUserUploaded: false,
    uploadedAt: 5
  },
  {
    id: 'vec-p6',
    title: 'Concierto Nocturno & Alabanza en Escenario Parroquial',
    description: 'Toda la banda Voces en Cristo en tarima con brazos en alto alabando al Rey de Reyes.',
    category: 'conciertos',
    date: 'Festival Parroquial',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1000&auto=format&fit=crop&q=80',
    tags: ['Concierto', 'Nocturno', 'Comunidad', 'Adoración'],
    isUserUploaded: false,
    uploadedAt: 6
  },
  {
    id: 'vec-p7',
    title: 'Misión & Encuentro Comunitario VEC Frente al Mar',
    description: 'Jornada fraterna de esparcimiento y misión comunitaria a orillas del mar con todo el equipo.',
    category: 'fraternidad',
    date: 'Paseo Misionero',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
    tags: ['Paseo', 'Playa', 'Misión', 'Fraternidad'],
    isUserUploaded: false,
    uploadedAt: 7
  },
  {
    id: 'vec-p8',
    title: 'Vigilia Nocturna y Adoración Eucarística Viva',
    description: 'Noche de oración y adoración al Santísimo con cánticos de sanación, paz y recogimiento espiritual.',
    category: 'conciertos',
    date: 'Adoración Eucarística',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1000&auto=format&fit=crop&q=80',
    tags: ['Vigilia', 'Adoración', 'Sanación', 'Alabanza'],
    isUserUploaded: false,
    uploadedAt: 8
  },
  {
    id: 'vec-p9',
    title: 'Alegría Juvenil en el Salón de Ensayos VEC',
    description: 'Momento de gozo, sonrisas y ensayo de voces en el salón comunal con los integrantes jóvenes.',
    category: 'ensayos',
    date: 'Ensayo General',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80',
    tags: ['Ensayo', 'Juventud', 'Alegría', 'Músicos'],
    isUserUploaded: false,
    uploadedAt: 9
  },
  {
    id: 'vec-p10',
    title: 'Concierto en Vivo Carabayllo',
    description: 'Presentación en vivo sobre tarima de Carabayllo con toda la instrumentación y sonido profesional.',
    category: 'conciertos',
    date: 'Carabayllo en Vivo',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1000&auto=format&fit=crop&q=80',
    tags: ['Carabayllo', 'En Vivo', 'Escenario', 'Banda'],
    isUserUploaded: false,
    uploadedAt: 10
  },
  {
    id: 'vec-p11',
    title: 'Voz Principal en Alabanza y Animación Espiritual',
    description: 'Solista principal interpretando himnos con pasión y unción para elevar el corazón de los fieles.',
    category: 'conciertos',
    date: 'Festival de la Voz',
    imageUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1000&auto=format&fit=crop&q=80',
    tags: ['Voz Principal', 'Salmista', 'Entrega', 'Oración'],
    isUserUploaded: false,
    uploadedAt: 11
  },
  {
    id: 'vec-p12',
    title: 'Set de Televisión y Grabación Especial VEC',
    description: 'Presentación en estudio televisivo con cámaras, micrófonos, atriles y batería VEC rotulada.',
    category: 'estudio',
    date: 'Grabación Televisiva',
    imageUrl: 'https://images.unsplash.com/photo-1518929458119-e5bf404ecb0f?w=1000&auto=format&fit=crop&q=80',
    tags: ['Televisión', 'Transmisión', 'Set VEC', 'Especial'],
    isUserUploaded: false,
    uploadedAt: 12
  },
  {
    id: 'vec-p13',
    title: 'Presentación de Gala VEC con Sacerdote Asesor',
    description: 'Fotografía conmemorativa de la banda en pleno junto a nuestro reverendo sacerdote en set.',
    category: 'estudio',
    date: 'Conmemoración de Gala',
    imageUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1000&auto=format&fit=crop&q=80',
    tags: ['Gala', 'Sacerdote', 'Estudio', 'Voces en Cristo'],
    isUserUploaded: false,
    uploadedAt: 13
  },
  {
    id: 'vec-p14',
    title: 'Ensayo Acústico en Sala Parroquial con Batería VEC',
    description: 'Afinación de temas y ensamble rítmico en sala parroquial junto al maestro y los fundadores.',
    category: 'ensayos',
    date: 'Sesión Acústica',
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1000&auto=format&fit=crop&q=80',
    tags: ['Acústico', 'Sala Parroquial', 'Batería', 'Ensayo'],
    isUserUploaded: false,
    uploadedAt: 14
  },
  {
    id: 'vec-p15',
    title: 'Diploma de Reconocimiento Parroquia San Damián de Molokai (Ecosdam)',
    description: 'Diploma de Reconocimiento otorgado al ministerio Voces en Cristo por su labor apostólica y musical.',
    category: 'misiones',
    date: 'Reconocimiento Pastoral',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80',
    tags: ['Diploma', 'Ecosdam', 'San Damián', 'Reconocimiento'],
    isUserUploaded: false,
    uploadedAt: 15
  }
];
