#!/usr/bin/env node

// Script para probar la generación de firma de integridad
console.log('🔍 Probando generación de firma de integridad...');

async function testIntegritySignature() {
    try {
        const testData = {
            reference: `TEST-${Date.now()}`,
            amount_in_cents: 200000, // $2000 COP
            currency: 'COP'
        };

        console.log('📝 Datos de prueba:', testData);

        // Probar endpoint del backend
        console.log('\n📡 Llamando al backend...');
        const response = await fetch('http://localhost:3000/api/payments/integrity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Firma generada exitosamente:');
            console.log('🔑 Integrity:', result.integrity);
            console.log('📋 Datos completos:', result);
        } else {
            const error = await response.text();
            console.log('❌ Error del backend:', response.status, error);
        }

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('\n💡 Asegúrate de que el backend esté ejecutándose en http://localhost:3000');
    }
}

testIntegritySignature(); 