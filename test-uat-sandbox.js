#!/usr/bin/env node

// Script para probar UAT Sandbox específicamente
console.log('🔍 Probando UAT Sandbox de Wompi...');

const publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

async function testUATSandbox() {
    try {
        console.log('🔑 Probando llave UAT:', publicKey);
        
        // Test con UAT Sandbox URL
        console.log('\n📡 Test UAT Sandbox: Verificando merchant...');
        const sandboxResponse = await fetch(`https://sandbox.wompi.co/v1/merchants/${publicKey}`);
        console.log('Sandbox Status:', sandboxResponse.status);
        
        if (sandboxResponse.ok) {
            const sandboxData = await sandboxResponse.json();
            console.log('✅ ¡SANDBOX FUNCIONA! Merchant data:', JSON.stringify(sandboxData, null, 2));
        } else {
            const errorText = await sandboxResponse.text();
            console.log('❌ Error sandbox:', errorText);
        }

        // Test métodos de pago en sandbox
        console.log('\n📡 Test UAT Sandbox: Métodos de pago...');
        const paymentResponse = await fetch(`https://sandbox.wompi.co/v1/payment_methods?public_key=${publicKey}`);
        console.log('Payment methods status:', paymentResponse.status);
        
        if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json();
            console.log('✅ Payment methods:', JSON.stringify(paymentData, null, 2));
        } else {
            const errorText = await paymentResponse.text();
            console.log('❌ Error payment methods:', errorText);
        }

        // URLs de checkout para probar
        console.log('\n🌐 URLs de checkout para probar:');
        const testFormData = {
            'public-key': publicKey,
            'currency': 'COP',
            'amount-in-cents': '770000',
            'reference': `UAT-TEST-${Date.now()}`,
            'redirect-url': 'http://localhost:5173/payment-result'
        };

        const params = new URLSearchParams(testFormData);
        
        console.log('1. UAT Checkout:', `https://checkout.co.uat.wompi.dev/p/?${params.toString()}`);
        console.log('2. UAT Sandbox Checkout:', `https://checkout-sandbox.co.uat.wompi.dev/p/?${params.toString()}`);
        console.log('3. Regular Checkout:', `https://checkout.wompi.co/p/?${params.toString()}`);

    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

testUATSandbox(); 