#!/usr/bin/env node

// Script para debuggear CORS específicamente en Amplify
console.log('🔍 Debug CORS - Amplify vs Backend\n');

const BACKEND_URL = 'https://back-pasarela.onrender.com';
const AMPLIFY_URL = 'https://main.d10nqda7yg14nv.amplifyapp.com';

async function testCorsFromDifferentOrigins() {
    console.log('📡 Probando CORS desde diferentes origins...\n');

    // Test 1: Sin origin (como Postman)
    console.log('🔍 Test 1: Sin Origin (como Postman)');
    try {
        const response = await fetch(`${BACKEND_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        });
        console.log(`✅ Status: ${response.status}`);
        console.log(`✅ Headers CORS:`);
        console.log(`   - Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
        console.log(`   - Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 2: Simulando la petición desde Amplify
    console.log('🔍 Test 2: Simulando desde Amplify (preflight)');
    try {
        const preflightResponse = await fetch(`${BACKEND_URL}/api/products`, {
            method: 'OPTIONS',
            headers: {
                'Origin': AMPLIFY_URL,
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type,ngrok-skip-browser-warning'
            }
        });
        console.log(`✅ Preflight Status: ${preflightResponse.status}`);
        console.log(`✅ Preflight Headers:`);
        console.log(`   - Allow-Origin: ${preflightResponse.headers.get('access-control-allow-origin')}`);
        console.log(`   - Allow-Methods: ${preflightResponse.headers.get('access-control-allow-methods')}`);
        console.log(`   - Allow-Headers: ${preflightResponse.headers.get('access-control-allow-headers')}`);
        console.log(`   - Max-Age: ${preflightResponse.headers.get('access-control-max-age')}`);
    } catch (error) {
        console.log(`❌ Preflight Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Test 3: Petición real simulando Amplify
    console.log('🔍 Test 3: GET real simulando Amplify');
    try {
        const realResponse = await fetch(`${BACKEND_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Origin': AMPLIFY_URL,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',
                'Referer': AMPLIFY_URL + '/'
            }
        });
        console.log(`✅ Real Status: ${realResponse.status}`);
        console.log(`✅ Real Headers:`);
        console.log(`   - Allow-Origin: ${realResponse.headers.get('access-control-allow-origin')}`);
        
        if (realResponse.ok) {
            const data = await realResponse.json();
            console.log(`✅ Data preview: ${JSON.stringify(data).substring(0, 100)}...`);
        }
    } catch (error) {
        console.log(`❌ Real Request Error: ${error.message}`);
    }
}

async function debugAxiosConfig() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 Debug configuración de Axios\n');
    
    console.log('Variables de entorno esperadas:');
    console.log(`- VITE_API_URL: ${process.env.VITE_API_URL || 'NO DEFINIDA'}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'NO DEFINIDA'}`);
    
    console.log('\nURL que Axios debería usar:');
    console.log(`- BaseURL: ${process.env.VITE_API_URL || 'https://back-pasarela.onrender.com'}`);
    console.log(`- Endpoint completo: ${process.env.VITE_API_URL || 'https://back-pasarela.onrender.com'}/api/products`);
}

async function debugBackendCorsConfig() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 Debug configuración del Backend\n');
    
    try {
        const healthResponse = await fetch(`${BACKEND_URL}/health`);
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Backend health:', JSON.stringify(healthData, null, 2));
        }
    } catch (error) {
        console.log(`❌ Error health check: ${error.message}`);
    }
}

async function runAllTests() {
    await testCorsFromDifferentOrigins();
    await debugAxiosConfig();
    await debugBackendCorsConfig();
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 CONCLUSIONES:');
    console.log('1. Si el preflight (OPTIONS) funciona pero el GET real falla = problema en el browser');
    console.log('2. Si ambos fallan = problema de configuración CORS en backend');
    console.log('3. Si funciona aquí pero falla en Amplify = problema de variables de entorno');
    console.log('4. Verificar que VITE_API_URL esté configurada correctamente en Amplify');
}

runAllTests(); 