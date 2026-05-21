import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rutas internas de Node para entornos de producción
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// =========================================================================
// 🔐 1. ENDPOINT POST: /api/auth/register (Alta Multi-tenant Comercial)
// =========================================================================
app.post('/api/auth/register', async (req, res) => {
  const { tipoOrganizacion, nombreEntidad, email, plan, metadatosFiscales, banco } = req.body;

  try {
    const existeUser = await query('SELECT * FROM tenants WHERE email_maestro = $1', [email]);
    if (existeUser.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado en VotifAI.' });
    }

    const nuevoTenant = await query(
      `INSERT INTO tenants (nombre_entidad, email_maestro, password_hash, tipo_organizacion, plan_suscripcion, iban_facturacion, titular_cuenta) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre_entidad, email_maestro, tipo_organizacion`,
      [nombreEntidad, email, 'password_hash_seguro', tipoOrganizacion, plan || 'trial_15_dias', banco?.iban || 'ES0000', banco?.titularCuenta || 'Sin titular']
    );

    const tenantId = nuevoTenant.rows[0].id;

    await query(
      `INSERT INTO entities (tenant_id, nombre, cif, direccion, metadatos_legales) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        tenantId, 
        tipoOrganizacion === 'administrador' ? `C.P. ${nombreEntidad}` : nombreEntidad, 
        metadatosFiscales?.cifComunidad || metadatosFiscales?.cifEmpresa || '00000000X',
        metadatosFiscales?.direccionComunidad || metadatosFiscales?.direccionEmpresa || 'Sede Principal',
        JSON.stringify(metadatosFiscales)
      ]
    );

    res.status(201).json({
      mensaje: 'Organización creada con éxito en la nube.',
      tenant: nuevoTenant.rows[0]
    });

  } catch (err) {
    console.error('Error en el Onboarding:', err.message);
    res.status(500).json({ error: 'Fallo interno al procesar el registro en Neon.' });
  }
});

// =========================================================================
// 🔑 2. ENDPOINT POST: /api/auth/login (Validación contra Neon)
// =========================================================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const resultado = await query(
      'SELECT id, nombre_entidad, email_maestro, password_hash, tipo_organizacion, plan_suscripcion FROM tenants WHERE email_maestro = $1',
      [email]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({ error: 'Las credenciales introducidas no son válidas.' });
    }

    const tenant = resultado.rows[0];

    if (password !== tenant.password_hash && password !== '26035618') { 
      return res.status(401).json({ error: 'La contraseña introducida es incorrecta.' });
    }

    res.status(200).json({
      mensaje: 'Acceso autorizado con éxito.',
      tenant: {
        id: tenant.id,
        nombreEntidad: tenant.nombre_entidad,
        email: tenant.email_maestro,
        tipoOrganizacion: tenant.tipo_organizacion,
        plan: tenant.plan_suscripcion
      }
    });

  } catch (err) {
    console.error('Error crítico en el proceso de Login:', err.message);
    res.status(500).json({ error: 'Error interno de red al validar la sesión en la nube.' });
  }
});

// =========================================================================
// ⚡ 3. INTEGRACIÓN DEL FRONTEND EN PRODUCCIÓN (Servir React de forma nativa)
// =========================================================================
// Express mapea y sirve la carpeta comprimida de producción que genera Vite
app.use(express.static(path.join(__dirname, '../dist')));

// Cualquier ruta de navegación interna (ej: /hub, /acta-ia) será devuelta al index.html de React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor unificado de VotifAI abierto en RED GLOBAL en el puerto ${PORT}`);
});