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

  // 5. Dos propiedades demo
  const propsData = [
    {
      title: 'Beautiful Beach House',
      description: 'Amazing ocean view with private beach access',
      price: 250.0,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: 'HOUSE',
      address: '123 Beach Road',
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      zipCode: '33139',
      latitude: 25.7617,
      longitude: -80.1918,
      amenities: ['WiFi', 'Pool', 'Beach Access', 'BBQ'],
      images: ['beach1.jpg', 'beach2.jpg', 'beach3.jpg'],
    },
    {
      title: 'Cozy Mountain Cabin',
      description: 'Rustic cabin with fireplace and mountain views',
      price: 180.0,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      propertyType: 'CABIN',
      address: '456 Forest Trail',
      city: 'Denver',
      state: 'CO',
      country: 'USA',
      zipCode: '80201',
      latitude: 39.7392,
      longitude: -104.9903,
      amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Parking'],
      images: ['cabin1.jpg', 'cabin2.jpg'],
    },
  ];

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
