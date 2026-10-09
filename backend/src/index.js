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

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', //URL de front
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

connectDB();

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-docs.json', (req, res) => res.json(swaggerDocument));
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
