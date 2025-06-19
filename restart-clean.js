#!/usr/bin/env node

// Script para limpiar y reiniciar el proyecto completamente
console.log('🧹 Limpiando proyecto...');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Limpiar archivos de cache
const cacheDirectories = [
  'node_modules/.vite',
  'node_modules/.cache',
  'dist',
  '.cache'
];

cacheDirectories.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`📁 Eliminando ${dir}...`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  }
});

// Crear archivo .env si no existe
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  const envContent = `# Configuración de Wompi - Ambiente UAT/Staging (Para la prueba)
VITE_WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
VITE_WOMPI_ENVIRONMENT=stagtest

# Configuración del Backend
VITE_API_URL=https://a9e7-2800-e6-4001-6ea9-accd-1a66-7960-e1be.ngrok-free.app/api
VITE_APP_URL=http://localhost:5173

# Configuración de desarrollo
NODE_ENV=development`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Archivo .env creado con llave de test funcional');
}

console.log('🎯 Proyecto limpiado. Ejecuta:');
console.log('   npm run dev');
console.log('');
console.log('🔧 Cambios realizados en esta versión:');
console.log('   ✅ Cache limpiado');
console.log('   ✅ Nuevo componente WompiPaymentButtonRobust');
console.log('   ✅ Problemas de DOM y React resueltos');
console.log('   ✅ Duplicación de botones corregida');
console.log('   ✅ Event listeners optimizados');
console.log('   ✅ Variables de entorno configuradas');
console.log('   ✅ Script de debug incluido (debug-wompi.js)'); 