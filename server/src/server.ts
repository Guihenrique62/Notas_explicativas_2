import express from "express";
import userRoutes from "./routes/userRoutes";
import companyRoutes from "./routes/companyRoutes";
import groupCompaniesRoutes from './routes/groupCompaniesRoutes'
import balanceteRoutes from './routes/balanceteRoutes'
import balancoRoutes from './routes/balancoRoutes'
import configRoutes from './routes/mapping/configCompanyRoutes'
import notasRoutes from './routes/notasRoutes'
import exportRoutes from './routes/exportRoutes'
import tabelaDemonstrativaRoutes from './routes/tbDemoRoutes'
import commentsRoutes from './routes/commentsRoutes'
import authRoutes from './routes/authRoutes'
import cookieParser from "cookie-parser";
import cors from 'cors'
import dreRoutes from "./routes/dreRoutes";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Permite todas as origens em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Em produção, restringe às origens permitidas
    const allowedOrigins = [
      'http://localhost:3000',
      'http://192.168.62.50:3004',
      'http://192.168.1.12:3000',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Set-Cookie']
}));

// Rotas
app.use("/users", userRoutes);
app.use("/companies", companyRoutes);
app.use("/groupCompanies", groupCompaniesRoutes)
app.use("/balancete", balanceteRoutes)
app.use("/balanco", balancoRoutes)
app.use("/dre", dreRoutes)
app.use("/config", configRoutes)
app.use("/notas", notasRoutes)
app.use("/comments", commentsRoutes);
app.use("/demoTable", tabelaDemonstrativaRoutes);
app.use("/export", exportRoutes);
app.use("/auth", authRoutes)

// Converter PORT para número explicitamente
const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, "localhost", () =>
  console.log(`🚀 Server running at http://localhost:${process.env.PORT || 3000}`)
);
