// Script para verificar configuración de Wompi
// Ejecutar con: node verify-wompi.js

const publicKey = 'pub_stagint_fjIqRyHmHvmqYgPFCO5nibfrtraL6ixq';

console.log('🔍 Verificando configuración de Wompi...\n');

console.log(`🔑 Llave pública: ${publicKey}`);
console.log(`✅ Formato válido: ${/^pub_stagint_[a-zA-Z0-9]+$/.test(publicKey)}`);

// Test de conectividad
fetch(`https://api.wompi.co/v1/merchants/${publicKey}`)
  .then(response => {
    console.log(`📡 Status de conectividad: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Llave válida y activa');
    } else if (response.status === 403) {
      console.log('⚠️  Llave válida pero con restricciones de permisos');
    } else if (response.status === 404) {
      console.log('❌ Llave no encontrada');
    } else {
      console.log(`⚠️  Respuesta inesperada: ${response.status}`);
    }
    
    return response.json();
  })
  .then(data => {
    console.log('📄 Datos del merchant:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('❌ Error al verificar:', error.message);
  });

console.log('\n📋 Pasos siguientes:');
console.log('1. Si ves errores 403/422, la llave funciona pero necesita configuración');
console.log('2. Verificar permisos en tu cuenta de Wompi');  
console.log('3. Contactar soporte de Wompi si persisten los errores'); 