-- ============================================
-- SEED: Registros de ejemplo para Experiencias
-- Ejecutar en Supabase SQL Editor DESPUÉS de crear las tablas
-- Usa el primer usuario y la primera organización existentes
-- ============================================

INSERT INTO "experiences" (
    "title", "description", "pricePerParticipant", "currency", "maxParticipants",
    "duration", "category", "status", "address", "city", "state", "country",
    "latitude", "longitude", "hostId", "organizationId",
    "includes", "excludes", "images", "meetingPoint", "languages", "ageRestriction",
    "updatedAt"
) VALUES
(
    'Recorrido a pie compartido por La Candelaria',
    'Descubre el centro histórico de Bogotá con un guía local. Recorremos calles coloniales, plazas y museos.',
    60000, 'COP', 10, 180, 'tour', 'PUBLISHED',
    'Plaza de Bolívar, La Candelaria', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.5981, -74.0758,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Guía local", "Recorrido a pie", "Historia"]',
    '["Comida", "Propinas"]',
    '["https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800"]',
    'Plaza de Bolívar, frente a la Catedral',
    '["es", "en"]', 'All ages',
    CURRENT_TIMESTAMP
),
(
    'Tour por Monserrate en Bogotá (entradas incluidas)',
    'Sube al cerro de Monserrate en teleférico. Vistas panorámicas de Bogotá y santuario.',
    230000, 'COP', 8, 240, 'tour', 'PUBLISHED',
    'Cerro de Monserrate', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.6097, -74.0558,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Entradas", "Transporte", "Guía"]',
    '["Comida en restaurante"]',
    '["https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800"]',
    'Estación del teleférico de Monserrate',
    '["es", "en"]', 'All ages',
    CURRENT_TIMESTAMP
),
(
    'Tour de frutas en el mercado más dulce del mundo',
    'Recorre Paloquemao y prueba frutas exóticas colombianas con un experto.',
    85000, 'COP', 6, 120, 'tasting', 'PUBLISHED',
    'Mercado de Paloquemao', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.6321, -74.1023,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Degustación de frutas", "Guía", "Entrada"]',
    '["Compras personales"]',
    '["https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=800"]',
    'Entrada principal mercado Paloquemao',
    '["es"]', 'All ages',
    CURRENT_TIMESTAMP
),
(
    'Diseña y crea tu anillo de esmeralda colombiana',
    'Taller con joyero. Diseña y crea tu anillo con esmeraldas colombianas auténticas.',
    350000, 'COP', 4, 180, 'workshop', 'PUBLISHED',
    'Zona G, Bogotá', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.6561, -74.0592,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Materiales", "Esmeralda", "Anillo terminado"]',
    '["Oro o plata extra"]',
    '["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800"]',
    'Taller Zona G (dirección al reservar)',
    '["es", "en"]', '18+',
    CURRENT_TIMESTAMP
),
(
    'Recorrido gastronómico por los barrios más cool de Bogotá',
    'Paseo por Chapinero y Zona G: cafés, restaurantes y bares locales.',
    275000, 'COP', 8, 210, 'tasting', 'PUBLISHED',
    'Chapinero, Bogotá', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.6428, -74.0632,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Degustaciones en 4 lugares", "Guía foodie", "Bebida"]',
    '["Propinas", "Compras adicionales"]',
    '["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"]',
    'Calle 70 con Carrera 7',
    '["es", "en"]', '18+',
    CURRENT_TIMESTAMP
),
(
    'Cabalga en Los Andes',
    'Cabalgata por senderos en la sabana de Bogotá. Caballos tranquilos y guía experto.',
    359000, 'COP', 6, 180, 'adventure', 'PUBLISHED',
    'Sopó, Cundinamarca', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.9083, -73.9403,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Caballo y equipo", "Guía", "Seguro"]',
    '["Transporte hasta la finca"]',
    '["https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800"]',
    'Finca en Sopó (enviada al reservar)',
    '["es"]', 'All ages',
    CURRENT_TIMESTAMP
),
(
    'Experiencia de degustación de café en Bogotá',
    'Cata de café colombiano con barista. Origen, tostión y métodos de preparación.',
    95000, 'COP', 8, 90, 'tasting', 'PUBLISHED',
    'Usaquén, Bogotá', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.6942, -74.0306,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Cata de 4 cafés", "Postre", "Barista"]',
    NULL,
    '["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"]',
    'Cafetería en Usaquén',
    '["es", "en"]', 'All ages',
    CURRENT_TIMESTAMP
),
(
    'Descubre el barrio gay de Chapinero',
    'Tour por la zona rosa y Chapinero. Historia, cultura y los mejores bares.',
    120000, 'COP', 10, 150, 'tour', 'PUBLISHED',
    'Chapinero, Bogotá', 'Bogotá', 'Cundinamarca', 'Colombia',
    4.6389, -74.0628,
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM organizations LIMIT 1),
    '["Guía local", "Una bebida de cortesía"]',
    '["Comida", "Otras bebidas"]',
    '["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800"]',
    'Carrera 13 con Calle 83',
    '["es", "en"]', '18+',
    CURRENT_TIMESTAMP
);
