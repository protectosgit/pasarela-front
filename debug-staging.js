#!/usr/bin/env node

// Script para debuggear la llave de staging de Wompi
console.log('🔍 Debugging llave de staging de Wompi...');

const publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

async function testStagingKey() {
    try {
        console.log('🔑 Probando llave:', publicKey);
        
        // Test 1: Verificar merchant info
        console.log('\n📡 Test 1: Verificando información del merchant...');
        const merchantResponse = await fetch(`https://api.co.uat.wompi.dev/v1/merchants/${publicKey}`);
        console.log('Status:', merchantResponse.status);
        
        if (merchantResponse.ok) {
            const merchantData = await merchantResponse.json();
            console.log('✅ Merchant data:', JSON.stringify(merchantData, null, 2));
        } else {
            const errorData = await merchantResponse.text();
            console.log('❌ Error merchant:', errorData);
        }

        // Test 2: Verificar payment methods
        console.log('\n📡 Test 2: Verificando métodos de pago...');
        const paymentMethodsResponse = await fetch(`https://api.co.uat.wompi.dev/v1/payment_methods?public_key=${publicKey}`);
        console.log('Status:', paymentMethodsResponse.status);
        
        if (paymentMethodsResponse.ok) {
            const paymentMethodsData = await paymentMethodsResponse.json();
            console.log('✅ Payment methods:', JSON.stringify(paymentMethodsData, null, 2));
        } else {
            const errorData = await paymentMethodsResponse.text();
            console.log('❌ Error payment methods:', errorData);
        }

        // Test 3: Crear URL de redirección
        console.log('\n🌐 Test 3: Creando URL de redirección...');
        const testFormData = {
            'public-key': publicKey,
            'currency': 'COP',
            'amount-in-cents': '770000',
            'reference': `TEST-${Date.now()}`,
            'redirect-url': 'http://localhost:5173/payment-result'
        };

        const params = new URLSearchParams(testFormData);
        const redirectUrl = `https://checkout.co.uat.wompi.dev/p/?${params.toString()}`;
        
        console.log('✅ URL generada:', redirectUrl);
        console.log('\n💡 Puedes probar esta URL directamente en el navegador');

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

testStagingKey(); 