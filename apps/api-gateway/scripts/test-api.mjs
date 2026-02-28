#!/usr/bin/env node
/**
 * Script para comprobar el API con el servidor ya corriendo.
 * Uso: node scripts/test-api.mjs   (puerto por defecto 4174)
 *      API_BASE=http://localhost:3000 node scripts/test-api.mjs
 */
const BASE = process.env.API_BASE || 'http://localhost:4174';

async function fetchJSON(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return { status: res.status, data };
}

async function main() {
  console.log('Base URL:', BASE);
  console.log('');

  try {
    const health = await fetchJSON('/health');
    console.log('GET /health', health.status, health.data);
    if (health.data.db === 'error') {
      console.log('  -> BD no conectada. Revisa DATABASE_URL y que la base exista.');
    }
    console.log('');

    const diag = await fetchJSON('/api/public/diagnostic');
    console.log('GET /api/public/diagnostic', diag.status, diag.data);
    if (diag.status === 404) {
      console.log('  -> El endpoint diagnostic no está registrado. Actualiza HealthModule con DiagnosticController.');
    } else if (diag.data.error) {
      console.log('  -> Error:', diag.data.error);
      console.log('  -> Hint:', diag.data.hint);
    } else if (diag.data.dbConnected && diag.data.publishedCount === 0) {
      console.log('  -> No hay propiedades PUBLISHED. Ejecuta: cd packages/database && pnpm run db:seed');
    }
    console.log('');

    const props = await fetchJSON('/api/public/properties');
    console.log('GET /api/public/properties', props.status, Array.isArray(props.data) ? `[${props.data.length} items]` : props.data);
    if (props.status !== 200) {
      console.log('  -> Body:', props.data);
    } else if (Array.isArray(props.data) && props.data.length === 0) {
      console.log('  -> Lista vacía: verifica que existan propiedades con status PUBLISHED (seed o publicar desde dashboard).');
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error('  Asegúrate de que el API Gateway esté corriendo en', BASE);
  }
}

main();
