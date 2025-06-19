#!/usr/bin/env node

// Script para probar variaciones de la llave de staging
console.log('🔍 Probando variaciones de la llave...');

const keyVariations = [
    'pub_stagint_fjIqRyHmHvmqYgPFCO5nibfrtraL6ixq',  // Original
    'pub_staging_fjIqRyHmHvmqYgPFCO5nibfrtraL6ixq',   // staging en lugar de stagint
    'pub_stagint_fjlqRyHmHvmqYgPFCO5nibfrtraL6ixq',   // l en lugar de I
    'pub_stagint_fjIqRyHmHvmqYgPFCO5nibfrtraL6Ixq',   // I en lugar de i al final
];

async function testKeyVariation(key, index) {
    console.log(`\n📡 Test ${index + 1}: ${key}`);
    
    try {
        const response = await fetch(`https://api.wompi.co/v1/merchants/${key}`);
        console.log(`Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ ¡FUNCIONA! Merchant data:', JSON.stringify(data, null, 2));
            return key; // Esta llave funciona
        } else {
            const errorText = await response.text();
            console.log('❌ Error:', errorText.substring(0, 100) + '...');
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
    }
    
    return null;
}

async function testAllVariations() {
    console.log('Probando todas las variaciones...\n');
    
    for (let i = 0; i < keyVariations.length; i++) {
        const workingKey = await testKeyVariation(keyVariations[i], i);
        if (workingKey) {
            console.log(`\n🎉 ¡LLAVE FUNCIONAL ENCONTRADA: ${workingKey}`);
            return;
        }
    }
    
    console.log('\n❌ Ninguna variación funcionó. La llave original podría necesitar verificación.');
}

testAllVariations(); 