import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import swaggerDocument from './docs/swagger.js';
import routes from './routes/index.js';

// Código temporal para verificar las variables en Render
console.log("=== VARIABLES DE ENTORNO DISPONIBLES ===");
console.log(Object.keys(process.env));
console.log("========================================");

console.log(`¿JWT_SECRET existe en el entorno?: ${process.env.JWT_SECRET ? "SÍ" : "NO"}`);

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite Postman, Swagger y requests sin Origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('No permitido por CORS'));
    },
    credentials: true,
  })
);

connectDB();
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => res.json(swaggerDocument));
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'NovaMarket API funcionando', docs: '/api-docs' });
});
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
