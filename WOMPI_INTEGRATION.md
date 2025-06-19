# Integración con Wompi - Documentación

## Resumen
Este proyecto implementa **dos métodos** de integración con Wompi siguiendo la documentación oficial:

1. **Botón Automático** - Script que se renderiza automáticamente
2. **Widget Programático** - Control completo mediante JavaScript

## 🔧 Configuración

### Variables de Entorno Requeridas
```env
VITE_WOMPI_PUBLIC_KEY=pub_test_X0zDA9xoKdePzhd8a0x9HAez7HgGO2fH
VITE_WOMPI_ENVIRONMENT=test
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:5173
```

### Configuración de Seguridad
- Se removieron cabeceras de seguridad conflictivas en `axiosConfig.ts`
- Se permite específicamente el dominio `checkout.wompi.co`
- CSP configurado para permitir scripts de Wompi

## 📁 Estructura de Archivos

```
src/
├── services/
│   └── wompiService.ts          # Servicio principal de Wompi
├── components/
│   ├── WompiPaymentButton.tsx   # Botón automático de Wompi
│   └── CreditCardModal.tsx      # Modal con ambas opciones
└── pages/
    └── PaymentResultPage.tsx    # Página de resultados
```

## 🎯 Métodos de Integración

### 1. Botón Automático (Recomendado)

**Componente:** `WompiPaymentButton.tsx`

Este método sigue **exactamente** la documentación oficial de Wompi:

```tsx
// Configuración del script según documentación
script.src = 'https://checkout.wompi.co/widget.js';
script.setAttribute('data-render', 'button');
script.setAttribute('data-public-key', publicKey);
script.setAttribute('data-currency', 'COP');
script.setAttribute('data-amount-in-cents', amountInCents.toString());
script.setAttribute('data-reference', reference);
script.setAttribute('data-signature:integrity', signature);
```

**Características:**
- ✅ Se renderiza automáticamente
- ✅ Manejo de eventos integrado
- ✅ Estilo consistente con Wompi
- ✅ Menos código personalizado

### 2. Widget Programático

**Servicio:** `WompiService`

Control completo del widget mediante JavaScript:

```tsx
const checkout = new window.WidgetCheckout(config);
checkout.open(callback);
```

**Características:**
- ⚙️ Control total del flujo
- 🎨 Personalización completa
- 📊 Manejo detallado de estados
- 🔄 Callback personalizado

## 🔐 Seguridad y Firmas

### Ambiente de Desarrollo (Sandbox)
- **Llave pública:** `pub_test_X0zDA9xoKdePzhd8a0x9HAez7HgGO2fH`
- **Firma:** Opcional en ambiente de pruebas
- **Datos de prueba:** [Ver documentación oficial](https://docs.wompi.co/docs/colombia/datos-de-prueba/)

### Ambiente de Producción
```typescript
// La firma DEBE generarse en el backend
static generateSignature(reference: string, amountInCents: number): string {
  // En producción: usar llave privada en backend
  // Esta implementación es solo para desarrollo
  const data = `${reference}${amountInCents}COP${this.publicKey}`;
  return btoa(data).slice(0, 32);
}
```

## 🎨 Interfaz de Usuario

### Modal de Pago (`CreditCardModal.tsx`)

El modal presenta **ambas opciones** de pago:

1. **Opción Automática (Azul)**
   - Botón de Wompi que se renderiza automáticamente
   - Marcada como "Recomendado"
   - Manejo de eventos transparente

2. **Opción Programática (Verde)**
   - Widget controlado por nuestro servicio
   - Más control sobre el flujo
   - Indicador de carga personalizado

### Página de Resultados (`PaymentResultPage.tsx`)

- ✅ Maneja redirecciones de Wompi
- 📊 Muestra estado de transacciones
- 🔍 Debug info en desarrollo
- 📱 Diseño responsive

## 📋 Flujo de Pago

### 1. Usuario añade productos al carrito
```typescript
// En ProductPage
dispatch(addToCart({ product, quantity: 1 }));
```

### 2. Abre modal de pago
```typescript
// En FloatingCart
setShowPaymentModal(true);
```

### 3. Selecciona método de pago

#### Opción A: Botón Automático
- El script de Wompi se carga automáticamente
- Se renderiza el botón oficial
- Usuario hace clic → redirección a Wompi

#### Opción B: Widget Programático
- Se inicializa el servicio
- Se abre el widget programáticamente
- Callback maneja el resultado

### 4. Procesamiento del pago
- Wompi procesa la transacción
- Redirección a `/payment-result`
- Actualización del estado en Redux

### 5. Resultado final
- Información guardada en Redux
- Carrito limpiado
- Usuario ve resultado

## 🧪 Testing en Sandbox

### Datos de Prueba (Wompi)
```
Tarjeta de Crédito Exitosa:
- Número: 4242424242424242
- CVC: Cualquier valor de 3 dígitos
- Fecha: Cualquier fecha futura

Tarjeta Fallida:
- Número: 4000000000000002
```

### Referencias de Prueba
```typescript
// Se generan automáticamente
const reference = `ORDER-${Date.now()}-${randomString}`;
```

## 🚀 Despliegue a Producción

### Checklist
- [ ] Cambiar llave pública a producción
- [ ] Implementar generación de firma en backend
- [ ] Configurar webhook para eventos
- [ ] Validar HTTPS en dominio
- [ ] Probar con tarjetas reales

### Variables de Producción
```env
VITE_WOMPI_PUBLIC_KEY=pub_prod_TU_LLAVE_DE_PRODUCCION
VITE_WOMPI_ENVIRONMENT=prod
```

## 🐛 Troubleshooting

### Error: "No se pudo cargar la información del widget" + 404 en DevTools

**Síntomas:**
- Error 404 en peticiones a `pub_test_X0zDA9xoKdePzhd8a0x9HAez7HgGO2fH?feature=...`
- Mensaje "No se pudo cargar la información del widget"
- Widget no se renderiza correctamente

**Causa:** 
Llave pública incorrecta o desactualizada

**Solución:**

1. **Obtener llaves correctas desde tu cuenta Wompi:**
   ```bash
   # Ingresar a https://wompi.co
   # Login → Desarrolladores → Copiar llaves
   ```

2. **Crear archivo .env en el frontend:**
   ```env
   # Frontend (.env)
   VITE_WOMPI_PUBLIC_KEY=pub_stagint_TU_LLAVE_REAL_AQUI
   VITE_WOMPI_ENVIRONMENT=staging
   VITE_API_URL=http://localhost:3000
   VITE_APP_URL=http://localhost:5173
   ```

3. **Crear archivo .env en el backend:**
   ```env
   # Backend (.env)
   WOMPI_API_URL=https://api-sandbox.co/v1
   WOMPI_PUBLIC_KEY=pub_stagint_TU_LLAVE_PUBLICA
   WOMPI_PRIVATE_KEY=prv_stagint_TU_LLAVE_PRIVADA
   WOMPI_EVENTS_KEY=stagint_events_TU_LLAVE_EVENTOS
   ```

4. **Verificar formato de llaves:**
   - ✅ `pub_test_` para test
   - ✅ `pub_stagint_` para staging  
   - ✅ `pub_prod_` para producción
   - ❌ `pub_test_X0zDA9xoKdePzhd8a0x9HAez7HgGO2fH` (formato incorrecto)

5. **Reiniciar servicios:**
   ```bash
   # Frontend
   npm run dev
   
   # Backend  
   npm run dev
   ```

### Error: "Script no se carga"
```typescript
// Verificar CSP y permisos de dominio
// Revisar console.log para errores de CORS
```

### Error: "Widget no se inicializa"
```typescript
// Verificar que window.WidgetCheckout esté disponible
if (!window.WidgetCheckout) {
  throw new Error('Widget de Wompi no disponible');
}
```

### Error: "Callback no se ejecuta"
```typescript
// Verificar configuración de redirectUrl
redirectUrl: `${window.location.origin}/payment-result`
```

## 📚 Referencias

- [Documentación Oficial de Wompi](https://docs.wompi.co/docs/colombia/widget-checkout-web/)
- [Widget & Checkout Web](https://docs.wompi.co/docs/colombia/widget-checkout-web/)
- [Datos de Prueba](https://docs.wompi.co/docs/colombia/datos-de-prueba/)

## 🔗 Componentes Relacionados

- `FloatingCart.tsx` - Botón que abre el modal
- `paymentSlice.ts` - Estado global del carrito y transacciones
- `axiosConfig.ts` - Configuración de seguridad 