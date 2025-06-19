#!/usr/bin/env node

// Script para probar diferentes URLs de checkout de Wompi UAT
console.log('🔍 Probando URLs de checkout de Wompi UAT...');

const publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

const testFormData = {
    'public-key': publicKey,
    'currency': 'COP',
    'amount-in-cents': '20000',
    'reference': `TEST-${Date.now()}`,
    'redirect-url': 'http://localhost:5173/payment-result'
};

const params = new URLSearchParams(testFormData);

const checkoutUrls = [
    'https://checkout.co.uat.wompi.dev/p/',           // UAT checkout
    'https://checkout-sandbox.co.uat.wompi.dev/p/',   // UAT sandbox checkout (no funciona)
    'https://checkout.wompi.co/p/',                   // Producción (podría funcionar con staging)
    'https://sandbox.wompi.co/checkout/p/',           // Posible sandbox alternativo
    'https://staging.wompi.co/p/',                    // Posible staging
    'https://checkout.uat.wompi.co/p/'                // Posible UAT alternativo
];

async function testCheckoutUrl(url, index) {
    const fullUrl = `${url}?${params.toString()}`;
    console.log(`\n📡 Test ${index + 1}: ${url}`);
    console.log(`Full URL: ${fullUrl.substring(0, 100)}...`);
    
    try {
        // Hacer un HEAD request para verificar si la URL responde
        const response = await fetch(fullUrl, { method: 'HEAD' });
        console.log(`✅ Status: ${response.status} - ${response.statusText}`);
        
        if (response.ok) {
            console.log(`🎉 ¡FUNCIONA! Esta URL es accesible: ${url}`);
            return url;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
    
    return null;
}

async function findWorkingCheckoutUrl() {
    console.log('Probando todas las URLs de checkout...\n');
    
    for (let i = 0; i < checkoutUrls.length; i++) {
        const workingUrl = await testCheckoutUrl(checkoutUrls[i], i);
        if (workingUrl) {
            console.log(`\n✨ URL FUNCIONAL ENCONTRADA: ${workingUrl}`);
            console.log(`\n🔗 URL completa para probar:`);
            console.log(`${workingUrl}?${params.toString()}`);
            return;
        }
    }
    
    console.log('\n❌ Ninguna URL de checkout funcionó. Puede ser que el entorno UAT no esté disponible públicamente.');
    console.log('\n💡 Recomendación: Usar la URL de producción con las llaves de staging:');
    console.log(`https://checkout.wompi.co/p/?${params.toString()}`);
}

findWorkingCheckoutUrl(); 