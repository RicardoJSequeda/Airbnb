import { PrismaClient } from '@prisma/client';
import { serializeArray } from '../src/helpers';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Organization demo (upsert para idempotencia)
  const org = await prisma.organization.upsert({
    where: { slug: 'demo' },
    create: {
      name: 'Demo Organization',
      slug: 'demo',
    },
    update: {},
  });

  // 2. Subscription para la organización (una por org)
  let sub = await prisma.subscription.findFirst({ where: { organizationId: org.id } });
  if (!sub) {
    sub = await prisma.subscription.create({
      data: { organizationId: org.id, plan: 'FREE', status: 'ACTIVE' },
    });
  }

  // 3. Host asociado a la organización
  const hostPassword = await bcrypt.hash('host123456', 10);
  const host = await prisma.user.upsert({
    where: { email: 'host@demo.com' },
    create: {
      email: 'host@demo.com',
      password: hostPassword,
      name: 'John Host',
      role: 'HOST',
      organizationId: org.id,
    },
    update: { organizationId: org.id },
  });

  // 4. Guest para pruebas
  const guestPassword = await bcrypt.hash('guest123456', 10);
  const guest = await prisma.user.upsert({
    where: { email: 'guest@demo.com' },
    create: {
      email: 'guest@demo.com',
      password: guestPassword,
      name: 'Jane Guest',
      role: 'GUEST',
      organizationId: org.id,
    },
    update: { organizationId: org.id },
  });

  // 5. Propiedades demo con imágenes reales (Unsplash) y datos profesionales
  const propsData = [
    {
      title: 'Casa frente al mar en Miami Beach',
      description:
        'Villa de lujo con vistas panorámicas al océano, acceso directo a la playa privada y piscina infinita. Diseño contemporáneo con amplios ventanales, terraza con zona de barbacoa y zonas de descanso al aire libre. Ideal para familias o grupos que buscan una escapada inolvidable en la costa de Florida.',
      price: 320.0,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'HOUSE',
      address: '123 Ocean Drive',
      city: 'Miami Beach',
      state: 'FL',
      country: 'Estados Unidos',
      zipCode: '33139',
      latitude: 25.7617,
      longitude: -80.1918,
      amenities: ['WiFi de alta velocidad', 'Piscina', 'Acceso a playa privada', 'Barbacoa', 'Aire acondicionado', 'Cocina equipada', 'Estacionamiento'],
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800',
        'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
      ],
    },
    {
      title: 'Cabaña de montaña con vistas a las Rocosas',
      description:
        'Encantadora cabaña de madera en las montañas de Colorado, con chimenea de piedra y vistas impresionantes a las cumbres nevadas. Ambiente acogedor perfecto para desconectar. Incluye cocina completa, sala de estar con grandes ventanales y terraza para contemplar las estrellas. A minutos de rutas de senderismo y esquí.',
      price: 195.0,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      propertyType: 'CABIN',
      address: '456 Pine Ridge Road',
      city: 'Denver',
      state: 'CO',
      country: 'Estados Unidos',
      zipCode: '80201',
      latitude: 39.7392,
      longitude: -104.9903,
      amenities: ['WiFi', 'Chimenea', 'Cocina equipada', 'Estacionamiento', 'Calefacción', 'Terraza'],
      images: [
        'https://images.unsplash.com/photo-1542718610-a1d656d1884a?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1518789248391-509a9a91ef46?w=800',
        'https://images.unsplash.com/photo-1524660988542-c440de9c0fde?w=800',
      ],
    },
  ];

  // Generar propiedades adicionales hasta tener al menos 16 alojamientos demo.
  // Reutilizamos la estructura de la primera propiedad cambiando título, dirección y ciudad.
  const baseExtraProperty = propsData[0];
  const extraCities = [
    { city: 'Bogotá', country: 'Colombia' },
    { city: 'Medellín', country: 'Colombia' },
    { city: 'Ciudad de México', country: 'México' },
    { city: 'Cancún', country: 'México' },
    { city: 'Barcelona', country: 'España' },
    { city: 'Madrid', country: 'España' },
    { city: 'Buenos Aires', country: 'Argentina' },
    { city: 'Santiago', country: 'Chile' },
    { city: 'Lima', country: 'Perú' },
    { city: 'Toronto', country: 'Canadá' },
    { city: 'Vancouver', country: 'Canadá' },
    { city: 'Lisboa', country: 'Portugal' },
    { city: 'París', country: 'Francia' },
    { city: 'Roma', country: 'Italia' },
  ];

  extraCities.forEach((loc, index) => {
    propsData.push({
      ...baseExtraProperty,
      title: `Alojamiento demo ${index + 1} en ${loc.city}`,
      address: `${100 + index} Demo Street`,
      city: loc.city,
      country: loc.country,
    });
  });

  // Eliminar propiedades demo antiguas (títulos previos) para reemplazar con datos mejorados
  await prisma.property.deleteMany({
    where: {
      organizationId: org.id,
      hostId: host.id,
      title: { in: ['Beautiful Beach House', 'Cozy Mountain Cabin'] },
    },
  });

  for (const p of propsData) {
    const existing = await prisma.property.findFirst({
      where: { title: p.title, organizationId: org.id, hostId: host.id },
    });

    const data = {
      ...p,
      hostId: host.id,
      organizationId: org.id,
      status: 'PUBLISHED',
      amenities: serializeArray(p.amenities),
      images: serializeArray(p.images),
    };

    if (existing) {
      await prisma.property.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.property.create({ data });
    }
  }

  const properties = await prisma.property.findMany({
    where: { organizationId: org.id, hostId: host.id },
  });

  // 6. Departamentos y ciudades demo (Antioquia y Córdoba)
  const departmentsData = [
    { name: 'Antioquia', slug: 'antioquia', country: 'CO', displayOrder: 1 },
    { name: 'Córdoba', slug: 'cordoba', country: 'CO', displayOrder: 2 },
  ];

  const departmentsBySlug: Record<string, { id: string }> = {};

  for (const dep of departmentsData) {
    const department = await prisma.department.upsert({
      where: { slug: dep.slug },
      create: {
        name: dep.name,
        slug: dep.slug,
        country: dep.country,
        displayOrder: dep.displayOrder,
      },
      update: {
        name: dep.name,
        country: dep.country,
        displayOrder: dep.displayOrder,
        isActive: true,
      },
    });

    departmentsBySlug[dep.slug] = department;
  }

  const citiesData = [
    {
      name: 'Medellín',
      slug: 'medellin',
      departmentSlug: 'antioquia',
      suggestionDescription: 'Capital de Antioquia, clima primaveral todo el año.',
      latitude: 6.2442,
      longitude: -75.5812,
      displayOrder: 1,
    },
    {
      name: 'Bello',
      slug: 'bello',
      departmentSlug: 'antioquia',
      suggestionDescription: 'Ciudad cercana a Medellín con fuerte vida residencial.',
      latitude: 6.3373,
      longitude: -75.5580,
      displayOrder: 2,
    },
    {
      name: 'Envigado',
      slug: 'envigado',
      departmentSlug: 'antioquia',
      suggestionDescription: 'Municipio del sur del Valle de Aburrá, muy residencial.',
      latitude: 6.1759,
      longitude: -75.5917,
      displayOrder: 3,
    },
    {
      name: 'Rionegro',
      slug: 'rionegro',
      departmentSlug: 'antioquia',
      suggestionDescription: 'Puerta de entrada al oriente antioqueño y al aeropuerto.',
      latitude: 6.1554,
      longitude: -75.3737,
      displayOrder: 4,
    },
    {
      name: 'Montería',
      slug: 'monteria',
      departmentSlug: 'cordoba',
      suggestionDescription: 'Capital de Córdoba, a orillas del río Sinú.',
      latitude: 8.74798,
      longitude: -75.8814,
      displayOrder: 1,
    },
    {
      name: 'Lorica',
      slug: 'lorica',
      departmentSlug: 'cordoba',
      suggestionDescription: 'Municipio colonial a orillas del río Sinú.',
      latitude: 9.2360,
      longitude: -75.8137,
      displayOrder: 2,
    },
    {
      name: 'Cereté',
      slug: 'cerete',
      departmentSlug: 'cordoba',
      suggestionDescription: 'Municipio agrícola cercano a Montería.',
      latitude: 8.8866,
      longitude: -75.7905,
      displayOrder: 3,
    },
  ];

  for (const city of citiesData) {
    const department = departmentsBySlug[city.departmentSlug];
    if (!department) continue;

    await prisma.city.upsert({
      where: {
        slug_departmentId: {
          slug: city.slug,
          departmentId: department.id,
        },
      },
      create: {
        name: city.name,
        slug: city.slug,
        departmentId: department.id,
        suggestionDescription: city.suggestionDescription,
        latitude: city.latitude,
        longitude: city.longitude,
        displayOrder: city.displayOrder ?? 0,
        isActive: true,
      },
      update: {
        name: city.name,
        suggestionDescription: city.suggestionDescription,
        latitude: city.latitude,
        longitude: city.longitude,
        displayOrder: city.displayOrder ?? 0,
        isActive: true,
      },
    });
  }

  // 7. Experiencias demo básicas para el catálogo
  const experiencesData = [
    {
      title: 'Tour gastronómico por el centro histórico',
      description:
        'Recorrido guiado por los mejores sitios de comida típica, con degustaciones en cada parada y explicación de la cultura local.',
      pricePerParticipant: 45.0,
      maxParticipants: 10,
      duration: 180,
      category: 'tasting',
      address: 'Plaza Central',
      city: 'Bogotá',
      state: 'Cundinamarca',
      country: 'Colombia',
      zipCode: '110111',
      latitude: 4.710989,
      longitude: -74.07209,
      includes: ['Guía local', 'Degustaciones', 'Seguro básico'],
      excludes: ['Transporte hasta el punto de encuentro'],
      images: [
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
        'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=800',
        'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
      ],
      languages: ['es', 'en'],
    },
    {
      title: 'Clase privada de surf al amanecer',
      description:
        'Sesión de surf personalizada con instructor certificado, ideal para principiantes. Incluye todo el equipo necesario.',
      pricePerParticipant: 60.0,
      maxParticipants: 4,
      duration: 120,
      category: 'adventure',
      address: 'Playa Norte',
      city: 'Cancún',
      state: 'Quintana Roo',
      country: 'México',
      zipCode: '77500',
      latitude: 21.1619,
      longitude: -86.8515,
      includes: ['Tabla de surf', 'Neopreno', 'Instructor'],
      excludes: ['Transporte', 'Comidas'],
      images: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
        'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&sig=1',
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
      ],
      languages: ['es', 'en'],
    },
    {
      title: 'Workshop de fotografía urbana al atardecer',
      description:
        'Taller práctico para mejorar tus habilidades fotográficas en entornos urbanos, con enfoque en luz natural y composición.',
      pricePerParticipant: 80.0,
      maxParticipants: 6,
      duration: 210,
      category: 'workshop',
      address: 'Barrio Gótico',
      city: 'Barcelona',
      state: 'Cataluña',
      country: 'España',
      zipCode: '08002',
      latitude: 41.3839,
      longitude: 2.1763,
      includes: ['Guía/fotógrafo profesional', 'Material de apoyo'],
      excludes: ['Equipo fotográfico'],
      images: [
        'https://images.unsplash.com/photo-1457269449834-928af64c684d?w=800',
        'https://images.unsplash.com/photo-1500534314211-0a24cd03f2c0?w=800',
        'https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=800',
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
      ],
      languages: ['es', 'en'],
    },
    {
      title: 'Ruta de viñedos y cata de vinos',
      description:
        'Visita guiada a viñedos locales con cata dirigida por sommelier, transporte incluido desde el centro de la ciudad.',
      pricePerParticipant: 120.0,
      maxParticipants: 8,
      duration: 240,
      category: 'tasting',
      address: 'Punto de encuentro: Plaza Mayor',
      city: 'Santiago',
      state: 'Región Metropolitana',
      country: 'Chile',
      zipCode: '8320000',
      latitude: -33.4489,
      longitude: -70.6693,
      includes: ['Transporte', 'Visita a viñedo', 'Cata de vinos'],
      excludes: ['Comidas completas'],
      images: [
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d50?w=800',
        'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=800',
        'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?w=800',
      ],
      languages: ['es', 'en', 'pt'],
    },
    {
      title: 'Experiencia de chef a domicilio en Medellín',
      description:
        'Menú colombiano de varios tiempos preparado en tu alojamiento por un chef profesional, con maridaje básico.',
      pricePerParticipant: 55.0,
      maxParticipants: 8,
      duration: 150,
      category: 'tasting',
      address: 'Zona El Poblado',
      city: 'Medellín',
      state: 'Antioquia',
      country: 'Colombia',
      zipCode: '050021',
      latitude: 6.2088,
      longitude: -75.5670,
      includes: ['Chef profesional', 'Ingredientes', 'Limpieza básica'],
      excludes: ['Bebidas alcohólicas'],
      images: [
        'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=800',
        'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Entrenamiento funcional al aire libre en Medellín',
      description:
        'Sesión grupal de entrenamiento funcional en parque, enfocada en fuerza y resistencia con tu propio peso corporal.',
      pricePerParticipant: 25.0,
      maxParticipants: 12,
      duration: 90,
      category: 'adventure',
      address: 'Parque Ciudad del Río',
      city: 'Medellín',
      state: 'Antioquia',
      country: 'Colombia',
      zipCode: '050021',
      latitude: 6.2280,
      longitude: -75.5768,
      includes: ['Entrenador certificado', 'Implementos básicos'],
      excludes: ['Hidratación'],
      images: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=800',
        'https://images.unsplash.com/photo-1526402461234-4f3f9d1d5d83?w=800',
        'https://images.unsplash.com/photo-1526403220003-4f3f9d1d5d83?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Taller de fotografía de ciudad en Medellín',
      description:
        'Recorrido fotográfico por el centro de Medellín para practicar composición, luz natural y fotografía urbana.',
      pricePerParticipant: 65.0,
      maxParticipants: 6,
      duration: 180,
      category: 'workshop',
      address: 'Parque Berrío',
      city: 'Medellín',
      state: 'Antioquia',
      country: 'Colombia',
      zipCode: '050011',
      latitude: 6.2520,
      longitude: -75.5695,
      includes: ['Guía/fotógrafo', 'Recorrido guiado'],
      excludes: ['Equipo fotográfico', 'Transporte'],
      images: [
        'https://images.unsplash.com/photo-1457269449834-928af64c684d?w=800',
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800',
        'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800',
        'https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Ruta gastronómica por el río Sinú en Montería',
      description:
        'Paseo por el malecón del río Sinú con paradas en restaurantes locales para probar platos típicos de la región.',
      pricePerParticipant: 40.0,
      maxParticipants: 10,
      duration: 150,
      category: 'tasting',
      address: 'Malecón del Río Sinú',
      city: 'Montería',
      state: 'Córdoba',
      country: 'Colombia',
      zipCode: '230001',
      latitude: 8.7480,
      longitude: -75.8814,
      includes: ['Guía local', 'Degustaciones seleccionadas'],
      excludes: ['Bebidas alcohólicas'],
      images: [
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
        'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?w=800',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Experiencia de cocina costeña en Montería',
      description:
        'Clase práctica para aprender a preparar platos tradicionales de la costa Caribe en una casa local.',
      pricePerParticipant: 50.0,
      maxParticipants: 6,
      duration: 180,
      category: 'tasting',
      address: 'Barrio La Castellana',
      city: 'Montería',
      state: 'Córdoba',
      country: 'Colombia',
      zipCode: '230002',
      latitude: 8.7485,
      longitude: -75.8780,
      includes: ['Ingredientes', 'Recetario digital'],
      excludes: ['Transporte'],
      images: [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&sig=1',
        'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Tour fotográfico por el centro histórico de Lorica',
      description:
        'Recorrido guiado por las calles coloniales de Lorica para capturar su arquitectura y vida cotidiana.',
      pricePerParticipant: 35.0,
      maxParticipants: 8,
      duration: 150,
      category: 'workshop',
      address: 'Parque Central de Lorica',
      city: 'Lorica',
      state: 'Córdoba',
      country: 'Colombia',
      zipCode: '231020',
      latitude: 9.2360,
      longitude: -75.8137,
      includes: ['Guía local', 'Asesoría fotográfica básica'],
      excludes: ['Equipo fotográfico'],
      images: [
        'https://images.unsplash.com/photo-1457269449834-928af64c684d?w=800',
        'https://images.unsplash.com/photo-1500534314211-0a24cd03f2c0?w=800',
        'https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=800',
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Entrenamiento funcional en parques de Montería',
      description:
        'Sesión grupal de entrenamiento en el parque lineal de Montería, ideal para viajeros que no quieren perder la rutina.',
      pricePerParticipant: 20.0,
      maxParticipants: 15,
      duration: 75,
      category: 'adventure',
      address: 'Parque lineal Ronda del Sinú',
      city: 'Montería',
      state: 'Córdoba',
      country: 'Colombia',
      zipCode: '230003',
      latitude: 8.7510,
      longitude: -75.8770,
      includes: ['Entrenador', 'Plan de entrenamiento'],
      excludes: ['Hidratación'],
      images: [
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=800',
        'https://images.unsplash.com/photo-1526402461234-4f3f9d1d5d83?w=800',
        'https://images.unsplash.com/photo-1526403220003-4f3f9d1d5d83?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Workshop de fotografía de naturaleza en Rionegro',
      description:
        'Taller de fotografía de paisajes y naturaleza en las montañas del oriente antioqueño.',
      pricePerParticipant: 70.0,
      maxParticipants: 6,
      duration: 210,
      category: 'workshop',
      address: 'Mirador de Rionegro',
      city: 'Rionegro',
      state: 'Antioquia',
      country: 'Colombia',
      zipCode: '054040',
      latitude: 6.1554,
      longitude: -75.3737,
      includes: ['Guía/fotógrafo', 'Recorrido guiado'],
      excludes: ['Transporte', 'Equipo fotográfico'],
      images: [
        'https://images.unsplash.com/photo-1526481280695-3c687fd543c0?w=800',
        'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        'https://images.unsplash.com/photo-1519817650390-64a93db511aa?w=800',
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800',
      ],
      languages: ['es'],
    },
    {
      title: 'Cata de quesos y vinos en Envigado',
      description:
        'Experiencia guiada de maridaje de quesos artesanales y vinos seleccionados en un local acogedor de Envigado.',
      pricePerParticipant: 65.0,
      maxParticipants: 10,
      duration: 150,
      category: 'tasting',
      address: 'Zona parque principal de Envigado',
      city: 'Envigado',
      state: 'Antioquia',
      country: 'Colombia',
      zipCode: '055420',
      latitude: 6.1759,
      longitude: -75.5917,
      includes: ['Degustación de quesos', 'Cata de vinos'],
      excludes: ['Transporte'],
      images: [
        'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=800',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d50?w=800',
        'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?w=800&sig=1',
      ],
      languages: ['es'],
    },
    {
      title: 'Sesión de entrenamiento personalizado en Bello',
      description:
        'Entrenamiento uno a uno en gimnasio local con entrenador personal, adaptado a tu nivel y objetivos.',
      pricePerParticipant: 35.0,
      maxParticipants: 1,
      duration: 60,
      category: 'adventure',
      address: 'Gimnasio en zona centro de Bello',
      city: 'Bello',
      state: 'Antioquia',
      country: 'Colombia',
      zipCode: '051050',
      latitude: 6.3373,
      longitude: -75.5580,
      includes: ['Entrenador personal', 'Plan de entrenamiento'],
      excludes: ['Membresía de gimnasio'],
      images: [
        'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=800',
        'https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?w=800&sig=1',
        'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
        'https://images.unsplash.com/photo-1526402461234-4f3f9d1d5d83?w=800',
      ],
      languages: ['es'],
    },
  ];

  for (const e of experiencesData) {
    const existing = await prisma.experience.findFirst({
      where: { title: e.title, organizationId: org.id, hostId: host.id },
    });
    const data = {
      title: e.title,
      description: e.description,
      pricePerParticipant: e.pricePerParticipant,
      currency: 'USD',
      maxParticipants: e.maxParticipants,
      duration: e.duration,
      category: e.category,
      status: 'PUBLISHED',
      address: e.address,
      city: e.city,
      state: e.state,
      country: e.country,
      zipCode: e.zipCode,
      latitude: e.latitude,
      longitude: e.longitude,
      hostId: host.id,
      organizationId: org.id,
      includes: serializeArray(e.includes),
      excludes: serializeArray(e.excludes ?? []),
      images: serializeArray(e.images),
      languages: serializeArray(e.languages),
      meetingPoint: e.address,
    };

    if (existing) {
      await prisma.experience.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.experience.create({ data });
    }
  }

  console.log('Seed completed! (Multi-Tenant)');
  console.log({
    organization: { id: org.id, name: org.name, slug: org.slug },
    host: { id: host.id, email: host.email },
    guest: { id: guest.id, email: guest.email },
    properties: properties.length,
    credentials: {
      host: 'host@demo.com / host123456',
      guest: 'guest@demo.com / guest123456',
    },
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
