# Instrucciones para Migración Manual de Experiencias

## 📋 Pasos para ejecutar en Supabase

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en https://supabase.com
   - Navega a **SQL Editor** en el menú lateral

2. **Copia y pega el script SQL**
   - Abre el archivo `manual_experiences_tables.sql`
   - Copia todo el contenido
   - Pégalo en el SQL Editor de Supabase

3. **Ejecuta el script**
   - Haz clic en **Run** o presiona `Ctrl+Enter`
   - Verifica que todas las tablas se crearon correctamente

4. **Verifica las tablas creadas**
   - Ve a **Table Editor** en Supabase
   - Deberías ver estas nuevas tablas:
     - `experiences`
     - `experience_slots`
     - `experience_bookings`
     - `experience_payments`
     - `experience_reviews`

5. **Genera el cliente de Prisma** (después de crear las tablas)
   ```bash
   cd packages/database
   npx prisma generate
   ```

## ✅ Verificación

Después de ejecutar el script, puedes verificar con esta consulta:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'experience%'
ORDER BY table_name;
```

Deberías ver:
- experience_bookings
- experience_payments
- experience_reviews
- experience_slots
- experiences

## 🔍 Si hay errores

- **Error de foreign key**: Asegúrate de que las tablas `users` y `organizations` existan
- **Error de tipo**: Verifica que los tipos de datos coincidan con tu schema actual
- **Error de índice duplicado**: Los índices usan `IF NOT EXISTS`, así que no debería haber problema

## 📝 Notas

- El script usa `CREATE TABLE IF NOT EXISTS` para evitar errores si las tablas ya existen
- Los índices también usan `IF NOT EXISTS`
- Las foreign keys se añaden después de crear las tablas
- Todos los campos coinciden exactamente con el schema de Prisma
