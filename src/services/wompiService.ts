export interface WompiFormData {
  publicKey: string;
  currency: string;
  amountInCents: number;
  reference: string;
  redirectUrl: string;
  customerEmail?: string;
  integrity?: string;
}

export class WompiService {
  static readonly WOMPI_CHECKOUT_URL = 'https://checkout.co.uat.wompi.dev/p/';
  static readonly WOMPI_PUBLIC_KEY = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';
  static readonly BACKEND_URL = 'http://localhost:3000';

  /**
   * Inicialización del servicio con logs
   */
  static initialize() {
    console.log('🚀 WompiService inicializado');
    console.log('🌐 Frontend URL:', window.location.origin);
    console.log('🔧 Backend URL:', this.BACKEND_URL);
    console.log('🔧 Wompi URL:', this.WOMPI_CHECKOUT_URL);
    console.log('🔧 Public Key:', this.WOMPI_PUBLIC_KEY);
  }

  /**
   * Genera una referencia única para la transacción
   */
  static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const reference = `TX_${timestamp}_${random}`;
    console.log('📝 Referencia generada:', reference);
    return reference;
  }

  /**
   * Bloquea completamente cualquier script o widget de Wompi
   */
  static blockWompiWidgets(): void {
    // 1. Eliminar todos los scripts de Wompi existentes
    const existingScripts = document.querySelectorAll('script[src*="wompi"], script[src*="checkout"]');
    existingScripts.forEach(script => script.remove());

    // 2. Limpiar cualquier contenedor del widget
    const widgetContainers = document.querySelectorAll('[id*="wompi"], [class*="wompi"], [data-wompi]');
    widgetContainers.forEach(container => container.remove());

    // 3. Interceptar y bloquear la carga de scripts de Wompi
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(this, tagName);
      if (tagName.toLowerCase() === 'script') {
        const script = element as HTMLScriptElement;
        const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')?.set;
        if (originalSetSrc) {
          Object.defineProperty(script, 'src', {
            set: function(value: string) {
              if (value.includes('wompi') || value.includes('checkout.co')) {
                console.warn('🚫 Bloqueado script de Wompi:', value);
                return; // No cargar el script
              }
              originalSetSrc.call(this, value);
            },
            get: function() {
              return this.getAttribute('src') || '';
            }
          });
        }
      }
      return element;
    };

    // 4. Bloquear fetch/XHR a endpoints de widget
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0].toString();
      if (url.includes('/widget') || url.includes('/v1/transactions')) {
        console.warn('🚫 Bloqueada petición a widget de Wompi:', url);
        return Promise.reject(new Error('Widget bloqueado intencionalmente'));
      }
      return originalFetch.apply(this, args);
    };

    // 5. Meta tags para prevenir carga automática
    const metaTags = [
      { name: 'wompi-disable-widget', content: 'true' },
      { name: 'wompi-form-only', content: 'true' },
      { 'http-equiv': 'Content-Security-Policy', content: "script-src 'self' 'unsafe-inline'; object-src 'none';" }
    ];

    metaTags.forEach(meta => {
      const existing = document.querySelector(`meta[name="${meta.name}"], meta[http-equiv="${meta['http-equiv']}"]`);
      if (existing) existing.remove();

      const metaElement = document.createElement('meta');
      Object.entries(meta).forEach(([key, value]) => {
        metaElement.setAttribute(key, value);
      });
      document.head.appendChild(metaElement);
    });

    console.log('🛡️ Sistema anti-widget de Wompi activado');
  }

  /**
   * Procesa un pago usando formulario directo (sin widget)
   */
  static async processPayment(amount: number, customerEmail: string): Promise<{
    reference: string;
    amount_in_cents: number;
    integrity: string;
  }> {
    try {
      console.log('💳 Iniciando proceso de pago con Wompi...');
      console.log('🔧 URL del backend:', this.BACKEND_URL);
      console.log('🔧 URL de Wompi:', this.WOMPI_CHECKOUT_URL);
      console.log('🔧 Public Key:', this.WOMPI_PUBLIC_KEY);
      
      // 1. ACTIVAR BLOQUEO DE WIDGETS ANTES DE TODO
      this.blockWompiWidgets();

      // 2. Generar referencia única
      const reference = this.generateReference();
      const amountInCents = Math.round(amount * 100);

      console.log('📝 Datos del pago:', {
        reference,
        amount,
        amountInCents,
        customerEmail
      });

      // 3. Obtener firma de integridad del backend
      const integrityPayload = {
        reference,
        amount_in_cents: amountInCents,
        currency: 'COP'
      };

      console.log('📤 Enviando a backend:', integrityPayload);

      const integrityResponse = await fetch(`${this.BACKEND_URL}/api/payments/integrity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(integrityPayload)
      });

      console.log('📥 Respuesta del backend - Status:', integrityResponse.status);
      
      if (!integrityResponse.ok) {
        const errorText = await integrityResponse.text();
        console.error('❌ Error del backend:', errorText);
        throw new Error(`Error al generar firma: ${integrityResponse.status} - ${errorText}`);
      }

      const integrityData = await integrityResponse.json();
      console.log('🔐 Firma de integridad obtenida:', integrityData);

      // 4. CREAR FORMULARIO SIMPLE Y DIRECTO
      const form = document.createElement('form');
      form.method = 'GET';
      form.action = this.WOMPI_CHECKOUT_URL;
      form.target = '_self';
      form.style.display = 'none';

      // 5. Parámetros del formulario (SIN prefijos raros)
      const formFields = [
        { name: 'public-key', value: this.WOMPI_PUBLIC_KEY },
        { name: 'currency', value: 'COP' },
        { name: 'amount-in-cents', value: amountInCents.toString() },
        { name: 'reference', value: reference },
        { name: 'signature:integrity', value: integrityData.integrity },
        { name: 'customer-email', value: customerEmail },
        { name: 'redirect-url', value: `${window.location.origin}/payment-result` },
      ];

      console.log('📋 Todos los campos que se enviarán:');
      
      // 6. Agregar campos al formulario
      formFields.forEach((field, index) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        form.appendChild(input);
        console.log(`   ${index + 1}. ${field.name} = "${field.value}"`);
      });

      // 7. Crear URL completa para verificación
      const urlParams = new URLSearchParams();
      formFields.forEach(field => {
        urlParams.append(field.name, field.value);
      });
      const fullUrl = `${this.WOMPI_CHECKOUT_URL}?${urlParams.toString()}`;
      
      console.log('🌐 URL completa que se generará:');
      console.log(fullUrl);

      // 8. Agregar formulario al body y enviar
      document.body.appendChild(form);

      console.log('🚀 Enviando formulario a Wompi...');
      console.log('📋 Método:', form.method);
      console.log('📋 Action:', form.action);
      console.log('📋 Total de campos:', form.children.length);

      // 9. Debug: Mostrar HTML del formulario
      console.log('🔍 HTML del formulario:');
      console.log(form.outerHTML);

      // 10. Enviar formulario inmediatamente
      console.log('⏰ Enviando en 2 segundos...');
      setTimeout(() => {
        console.log('🚀 ¡ENVIANDO AHORA!');
        form.submit();
      }, 2000);

      return {
        reference,
        amount_in_cents: amountInCents,
        integrity: integrityData.integrity
      };

    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      throw new Error(`Error al procesar el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Verifica el estado de una transacción
   */
  static async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/payments/${transactionId}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener estado: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estado de transacción:', error);
      throw error;
    }
  }
} 