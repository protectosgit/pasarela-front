// Script de debug para Wompi - Ejecutar en Console del navegador

console.log('🔍 === WOMPI DEBUG TOOL ===');
console.log('');

// 1. Verificar scripts de Wompi
const wompiScripts = document.querySelectorAll('script[src*="checkout.wompi.co"]');
console.log(`📜 Scripts de Wompi encontrados: ${wompiScripts.length}`);
wompiScripts.forEach((script, index) => {
  console.log(`   Script ${index + 1}:`, script.src);
  console.log(`   Atributos:`, Array.from(script.attributes).map(attr => `${attr.name}="${attr.value}"`));
});

// 2. Verificar containers de Wompi
const wompiContainers = document.querySelectorAll('.wompi-widget-container, .wompi-payment-container');
console.log(`📦 Containers de Wompi: ${wompiContainers.length}`);
wompiContainers.forEach((container, index) => {
  console.log(`   Container ${index + 1}:`, container.id || container.className);
  console.log(`   Contenido:`, container.innerHTML.length, 'caracteres');
});

// 3. Verificar event listeners de mensaje
console.log('📡 Event listeners activos en window:');
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
let messageListeners = 0;

// Mock para contar listeners (esto es solo informativo)
console.log('   (No se puede verificar exactamente cuántos listeners hay)');

// 4. Verificar estado de React
try {
  const reactRoot = document.querySelector('#root');
  if (reactRoot && reactRoot._reactInternalFiber) {
    console.log('⚛️ React detectado y funcionando');
  } else {
    console.log('⚛️ React estado desconocido');
  }
} catch (error) {
  console.log('⚛️ Error verificando React:', error.message);
}

// 5. Verificar errores recientes
const errors = [];
const originalError = console.error;
console.error = function(...args) {
  errors.push(args.join(' '));
  originalError.apply(console, args);
};

// 6. Test de conectividad con Wompi
console.log('🌐 Probando conectividad con Wompi...');
fetch('https://api.wompi.co/v1/merchants/pub_stagint_fjIqRyHmHvmqYgPFCO5nibfrtraL6ixq')
  .then(response => {
    console.log(`📡 Status API Wompi: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ API Wompi accesible');
    } else if (response.status === 403) {
      console.log('⚠️ API Wompi - Restricciones de permisos');
    } else {
      console.log('❌ API Wompi - Error desconocido');
    }
  })
  .catch(error => {
    console.log('❌ Error conectando con API Wompi:', error.message);
  });

// 7. Funciones de ayuda
window.wompiDebug = {
  cleanAll: () => {
    console.log('🧹 Limpiando todo Wompi...');
    document.querySelectorAll('script[src*="checkout.wompi.co"]').forEach(s => s.remove());
    document.querySelectorAll('.wompi-widget-container').forEach(c => c.innerHTML = '');
    console.log('✅ Limpieza completada');
  },
  
  reload: () => {
    console.log('🔄 Recargando página...');
    window.location.reload();
  },
  
  checkMessages: () => {
    console.log('📨 Monitoreando mensajes de Wompi...');
    window.addEventListener('message', (event) => {
      if (event.origin.includes('wompi')) {
        console.log('📨 Mensaje de Wompi:', event);
      }
    });
  }
};

console.log('');
console.log('🛠️ Funciones disponibles:');
console.log('   wompiDebug.cleanAll() - Limpiar todo');
console.log('   wompiDebug.reload() - Recargar página');
console.log('   wompiDebug.checkMessages() - Monitorear mensajes');
console.log('');
console.log('=== FIN DEBUG ==='); 