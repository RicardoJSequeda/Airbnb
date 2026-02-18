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
    if (!existing) {
      await prisma.property.create({
        data: {
          ...p,
          hostId: host.id,
          organizationId: org.id,
          status: 'PUBLISHED',
          amenities: serializeArray(p.amenities),
          images: serializeArray(p.images),
        },
      });
    }
  }

  const properties = await prisma.property.findMany({
    where: { organizationId: org.id, hostId: host.id },
  });

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
