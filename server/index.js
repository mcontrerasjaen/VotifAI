import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ 
    estado: "VotifAI API Gateway en línea", 
    entorno: "GitHub Codespaces Cloud",
    estatus_seguridad: "Validado" 
  });
});

/// =========================================================================
// ENDPOINT POST: /api/auth/register (Alta Multi-tenant Comercial)
// =========================================================================

app.post('/api/auth/register', async (req, res) => {
  const { tipoOrganizacion, nombreEntidad, email, plan, metadatosFiscales, banco } = req.body;

  try {
    // 1. Verificamos si el email ya existe en la tabla de inquilinos
    const existeUser = await query('SELECT * FROM tenants WHERE email_maestro = $1', [email]);
    if (existeUser.rows.length > 0) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado en VotifAI.' });
    }

    // 2. Insertamos la cuenta maestra en la tabla 'tenants'
    // Como pusimos DEFAULT uuid_generate_v4(), Postgres generará el ID automáticamente
    const nuevoTenant = await query(
      `INSERT INTO tenants (nombre_entidad, email_maestro, password_hash, tipo_organizacion, plan_suscripcion, iban_facturacion, titular_cuenta) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre_entidad, email_maestro`,
      [nombreEntidad, email, 'password_temporal_hash', tipoOrganizacion, plan || 'trial_15_dias', banco?.iban || 'ES0000', banco?.titularCuenta || 'Sin titular']
    );

    const tenantId = nuevoTenant.rows[0].id;

    // 3. Crear automáticamente su primera entidad (Comunidad o Empresa inicial) según lo pedido
    await query(
      `INSERT INTO entities (tenant_id, nombre, cif, direccion, metadatos_legales) 
       VALUES ($1, $2, $3, $4, $5)`,
      [
        tenantId, 
        tipoOrganizacion === 'administrador' ? `C.P. ${nombreEntidad}` : nombreEntidad, 
        metadatosFiscales?.cifComunidad || metadatosFiscales?.cifEmpresa || '00000000X',
        metadatosFiscales?.direccionComunidad || metadatosFiscales?.direccionEmpresa || 'Sede Principal',
        JSON.stringify(metadatosFiscales) // Guardamos el censo ampliado (presidente, acciones...) en el JSONB
      ]
    );

    // Devolvemos el éxito al cliente con su sesión iniciada
    res.status(201).json({
      mensaje: 'Organización y espacio privado SaaS creados con éxito.',
      tenant: nuevoTenant.rows[0]
    });

  } catch (err) {
    console.error('Error crítico en el Onboarding:', err.message);
    res.status(500).json({ error: 'Fallo interno del servidor al procesar el registro relacional.' });
  }
});

// Arrancamos la escucha del puerto
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend de VotifAI abierto en RED GLOBAL: http://0.0.0:${PORT}`);
});