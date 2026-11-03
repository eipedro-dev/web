import mysql from 'mysql2/promise';
import { env } from '../config.js';

export const pool = mysql.createPool({
  uri: env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  // Datas sempre em UTC, entre o driver e o banco
  timezone: 'Z',
});

pool.on('connection', (conn) => {
  conn.query("SET time_zone = '+00:00'");
});

/**
 * Colunas JSON: o MySQL 8 devolve o objeto já convertido, mas outros servidores
 * (ex.: MariaDB) devolvem texto. Aceitamos os dois.
 */
export function parseJson<T>(value: unknown): T {
  return (typeof value === 'string' ? JSON.parse(value) : value) as T;
}
