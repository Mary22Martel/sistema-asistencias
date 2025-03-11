import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const conexion = mysql.createPool({
  host: process.env.BD_HOST,
  user: process.env.BD_USUARIO,
  password: process.env.BD_CONTRASENA,
  database: process.env.BD_NOMBRE,
}).promise();

export default conexion;