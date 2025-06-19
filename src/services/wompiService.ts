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
  static readonly BACKEND_URL = 'https://back-pasarela.onrender.com';

  /**
   * Inicialización del servicio con logs
   */
  static initialize() {
    // ... existing code ...
  }

  /**
   * Genera una referencia única para la transacción
   */
  static generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const reference = `TX_${timestamp}_${random}`;
    return reference;
  }

  /**
   * Bloquea completamente cualquier script o widget de Wompi
   */
  static blockWompiWidgets(): void {
    const existingScripts = document.querySelectorAll('script[src*="wompi"], script[src*="checkout"]');
    existingScripts.forEach(script => script.remove());

    const widgetContainers = document.querySelectorAll('[id*="wompi"], [class*="wompi"], [data-wompi]');
    widgetContainers.forEach(container => container.remove());

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
                return;
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

    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0].toString();
      if (url.includes('/widget') || url.includes('/v1/transactions')) {
        return Promise.reject(new Error('Widget bloqueado intencionalmente'));
      }
      return originalFetch.apply(this, args);
    };

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
      this.blockWompiWidgets();

      const reference = this.generateReference();
      const amountInCents = Math.round(amount * 100);

      const integrityPayload = {
        reference,
        amount_in_cents: amountInCents,
        currency: 'COP'
      };

      const integrityResponse = await fetch(`${this.BACKEND_URL}/api/payments/integrity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(integrityPayload)
      });
      
      if (!integrityResponse.ok) {
        const errorText = await integrityResponse.text();
        throw new Error(`Error al generar firma: ${integrityResponse.status} - ${errorText}`);
      }

      const integrityData = await integrityResponse.json();

      const form = document.createElement('form');
      form.method = 'GET';
      form.action = this.WOMPI_CHECKOUT_URL;
      form.target = '_self';
      form.style.display = 'none';

      const formFields = [
        { name: 'public-key', value: this.WOMPI_PUBLIC_KEY },
        { name: 'currency', value: 'COP' },
        { name: 'amount-in-cents', value: amountInCents.toString() },
        { name: 'reference', value: reference },
        { name: 'signature:integrity', value: integrityData.integrity },
        { name: 'customer-email', value: customerEmail },
        { name: 'redirect-url', value: `${window.location.origin}/payment-result` },
      ];

      formFields.forEach((field) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        form.appendChild(input);
      });

      const urlParams = new URLSearchParams();
      formFields.forEach(field => {
        urlParams.append(field.name, field.value);
      });
      // const fullUrl = `${this.WOMPI_CHECKOUT_URL}?${urlParams.toString()}`;

      document.body.appendChild(form);

      setTimeout(() => {
        form.submit();
      }, 2000);

      return {
        reference,
        amount_in_cents: amountInCents,
        integrity: integrityData.integrity
      };

    } catch (error) {
      throw error;
    }
  }

  /**
   * Verifica el estado de una transacción
   */
  static async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${this.BACKEND_URL}/api/payments/${transactionId}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        }
      });

      if (!response.ok) {
        const urlParams = new URLSearchParams(window.location.search);
        const reference = urlParams.get('reference');
        const amountFromUrl = urlParams.get('amount_in_cents');
        const customerEmail = urlParams.get('customer-email');

        const transactionData = {
          reference: reference || transactionId,
          amount: amountFromUrl ? (parseInt(amountFromUrl) / 100).toString() : '0',
          customer: {
            firstName: 'Cliente',
            lastName: 'Wompi',
            email: customerEmail || 'test@wompi.co',
            phone: '3001234567'
          },
          delivery: null,
          cartItems: [],
          creditCard: null,
          paymentMethod: 'CARD'
        };

        const createResponse = await fetch(`${this.BACKEND_URL}/api/payments/create-transaction`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(transactionData)
        });

        if (createResponse.ok) {
          const createdData = await createResponse.json();
          return createdData;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const retryResponse = await fetch(`${this.BACKEND_URL}/api/payments/${transactionId}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        });

        if (retryResponse.ok) {
          const data = await retryResponse.json();
          return data;
        }

        throw new Error(`Transacción no encontrada: ${transactionId}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      throw error;
    }
  }
} 