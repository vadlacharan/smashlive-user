import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { Colors, Fonts, Spacing, Typography } from '../../theme';
import { RazorpayCheckoutOptions, RazorpaySuccessResponse } from '../../utils/razorpay';

interface RazorpayModalProps {
  visible: boolean;
  options: RazorpayCheckoutOptions | null;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onClose: () => void;
  onError: (error: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  visible,
  options,
  onSuccess,
  onClose,
  onError,
}) => {
  if (!visible || !options) return null;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          * { box-sizing: border-box; }
          body {
            background-color: #0B0F0D;
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #FFFFFF;
          }
          .spinner {
            border: 3px solid rgba(57, 255, 136, 0.2);
            border-top: 3px solid #39FF88;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 0.8s linear infinite;
            margin: 0 auto 16px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .text {
            color: #A1A1AA;
            font-size: 14px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div>
          <div class="spinner"></div>
          <div class="text">Connecting to Razorpay Secure Gateway...</div>
        </div>

        <script>
          function initRazorpay() {
            var options = {
              key: "${options.keyId}",
              amount: ${options.amount},
              currency: "${options.currency || 'INR'}",
              name: "${options.name || 'SmashLive'}",
              description: "${options.description || 'Booking'}",
              order_id: "${options.orderId}",
              prefill: {
                name: "${options.prefill?.name || ''}",
                email: "${options.prefill?.email || ''}",
                contact: "${options.prefill?.contact || ''}"
              },
              theme: {
                color: "${options.themeColor || '#39FF88'}"
              },
              handler: function(response) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'SUCCESS',
                  data: {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                  }
                }));
              },
              modal: {
                ondismiss: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'DISMISS'
                  }));
                }
              }
            };

            var rzp = new Razorpay(options);
            rzp.on('payment.failed', function(resp) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'FAILED',
                error: resp.error ? resp.error.description : 'Payment failed'
              }));
            });
            rzp.open();
          }

          if (window.Razorpay) {
            initRazorpay();
          } else {
            window.onload = initRazorpay;
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'SUCCESS') {
        onSuccess(msg.data);
      } else if (msg.type === 'DISMISS') {
        onClose();
      } else if (msg.type === 'FAILED') {
        onError(msg.error || 'Payment failed');
      }
    } catch (e) {
      console.warn('Error parsing WebView message:', e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Razorpay Secure Payment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <WebView
          originWhitelist={['*']}
          source={{ html: htmlContent, baseUrl: 'https://checkout.razorpay.com' }}
          onMessage={handleMessage}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.green} />
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    height: 52,
    backgroundColor: Colors.surface1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodyBold,
  },
  closeButton: {
    padding: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.canvas,
  },
});
