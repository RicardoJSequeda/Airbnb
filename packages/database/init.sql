-- Habilitar extensión pgvector para búsqueda vectorial
CREATE EXTENSION IF NOT EXISTS vector;

-- Crear schemas para microservicios
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS property;
CREATE SCHEMA IF NOT EXISTS booking;
CREATE SCHEMA IF NOT EXISTS payment;