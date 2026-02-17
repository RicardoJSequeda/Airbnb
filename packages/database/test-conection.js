const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'airbnb_db',
});

async function test() {
  try {
    await client.connect();
    const result = await client.query('SELECT current_user, current_database()');
    console.log('✅ Conexión exitosa!');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  } finally {
    await client.end();
  }
}

test();