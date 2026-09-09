import { Platform } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export interface StripeCheckoutOptions {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
  };
}

export interface StripeSuccessResponse {
  paymentIntentId: string;
}

/**
 * Stripe-recommended PaymentSheet integration.
 * Must be used inside <StripeProvider> (mounted in the root layout) —
 * the provider initializes PaymentConfiguration, which PaymentSheet
 * requires to launch.
 */
export function useStripeCheckout() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  return async (options: StripeCheckoutOptions): Promise<StripeSuccessResponse> => {
    const intentId = options.clientSecret.split('_secret_')[0] || '';

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Web — confirm the card payment with Stripe.js.
      if (!(window as any).Stripe) {
        await new Promise<void>((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://js.stripe.com/v3/';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => resolve();
          document.body.appendChild(script);
        });
      }
      const stripe = (window as any).Stripe?.(options.publishableKey);
      if (stripe) {
        const result = await stripe.confirmCardPayment(options.clientSecret, {
          payment_method: {
            billing_details: {
              name: options.prefill?.name || 'SmashLive Player',
              email: options.prefill?.email || '',
            },
          },
        });
        if (result.error) {
          throw new Error(result.error.message || 'Stripe payment failed.');
        }
        return { paymentIntentId: result.paymentIntent?.id || intentId };
      }
    }

    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: options.clientSecret,
      merchantDisplayName: 'SmashLive',
      style: 'alwaysLight',
      defaultBillingDetails: {
        name: options.prefill?.name || 'SmashLive Player',
        email: options.prefill?.email || '',
      },
      returnURL: 'smashlive://stripe-redirect',
      allowsDelayedPaymentMethods: false,
      // Apple Pay / Google Pay — enable once the merchant IDs are
      // configured in the Stripe Dashboard:
      // applePay: { merchantCountryCode: 'US' },
      // googlePay: { merchantCountryCode: 'US', testEnv: false },
    });

    if (initError) {
      throw new Error(initError.message || 'Unable to open payment sheet.');
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === 'Canceled') {
        throw new Error('Payment cancelled');
      }
      throw new Error(error.message || 'Stripe payment failed.');
    }

    return { paymentIntentId: intentId };
  };
}