import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CreditCard, ShieldCheck, Zap } from 'lucide-react-native';
import { BookingSuccessModal } from '../../../src/components/booking/BookingSuccessModal';
import { Button } from '../../../src/components/common/Button';
import { Header } from '../../../src/components/common/Header';
import { HoldTimerBanner, HoldTimerRing } from '../../../src/components/common/HoldTimerRing';
import { PaymentLoader } from '../../../src/components/common/PaymentLoader';
import { ScreenWash } from '../../../src/components/common/ScreenWash';
import { RazorpayModal } from '../../../src/components/payment/RazorpayModal';
import { useAuth } from '../../../src/context/AuthContext';
import {
  useArena,
  useCreateBookingOrder,
  useVerifyBookingPayment,
} from '../../../src/hooks/useArenas';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../../src/theme';
import { formatDateShort, formatTimeRange } from '../../../src/utils/calendar';
import { formatCurrency } from '../../../src/utils/text';
import {
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
  openRazorpayCheckout,
} from '../../../src/utils/razorpay';
import { useStripeCheckout } from '../../../src/hooks/useStripeCheckout';

export default function BookingCheckoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const openStripeCheckout = useStripeCheckout();
  const { id, court, date, slotStarts: slotStartsRaw, pricePerHour: pphRaw } =
    useLocalSearchParams<{
      id: string;
      court: string;
      date: string;
      slotStarts: string;
      pricePerHour: string;
    }>();

  const arenaId = Number(id) || 1;
  const slotStarts: string[] = slotStartsRaw ? JSON.parse(slotStartsRaw) : [];
  const pricePerHour = Number(pphRaw) || 400;
  const slotCount = slotStarts.length;
  const subtotal = slotCount * pricePerHour;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + tax;

  const { data: arena } = useArena(arenaId);
  const createOrderMutation = useCreateBookingOrder();
  const verifyPaymentMutation = useVerifyBookingPayment();

  const [createdAt] = useState(new Date().toISOString());
  const [orderData, setOrderData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [paymentRef, setPaymentRef] = useState('');
  const [rzpModalVisible, setRzpModalVisible] = useState(false);
  const [rzpOptions, setRzpOptions] = useState<RazorpayCheckoutOptions | null>(null);
  const [activeBookingId, setActiveBookingId] = useState<number | null>(null);

  // Automatically create pending hold order on entry per API specification §10
  useEffect(() => {
    async function initOrder() {
      try {
        const order = await createOrderMutation.mutateAsync({
          arenaId,
          court: court || 'Court 1',
          slotStarts,
        });
        setOrderData(order);
      } catch (err: any) {
        if (err.message?.includes('409') || err.message?.includes('no longer available')) {
          Alert.alert(
            'Slot Unavailable',
            'Someone just took one of the selected slots. Please pick another slot.',
            [{ text: 'Pick Again', onPress: () => router.back() }]
          );
        }
      }
    }
    if (slotStarts.length > 0) {
      initOrder();
    }
  }, []);

  const handleHoldExpire = () => {
    Alert.alert(
      'Hold Expired',
      'The 15-minute hold time for these slots has expired and the slots have been released.',
      [{ text: 'Pick Again', onPress: () => router.back() }]
    );
  };

  const handleRazorpaySuccess = async (response: RazorpaySuccessResponse) => {
    if (!activeBookingId) return;
    setIsProcessing(true);
    try {
      await verifyPaymentMutation.mutateAsync({
        bookingId: activeBookingId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      setRzpModalVisible(false);
      setPaymentRef(response.razorpay_payment_id);
      setSuccessModalVisible(true);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Payment verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

const handlePay = async () => {
    setIsProcessing(true);
    try {
      let currentOrder = orderData;
      if (!currentOrder) {
        currentOrder = await createOrderMutation.mutateAsync({
          arenaId,
          court: court || 'Court 1',
          slotStarts,
        });
        setOrderData(currentOrder);
      }

      if (!currentOrder) {
        throw new Error('Unable to create booking order. Please try again.');
      }

      const isStripe = currentOrder.provider === 'stripe' || currentOrder.currency === 'USD';

      if (isStripe) {
        // Native Stripe PaymentSheet (recommended Stripe RN integration).
        const stripeRes = await openStripeCheckout({
          clientSecret: currentOrder.clientSecret,
          publishableKey: currentOrder.publishableKey || '',
          amount: currentOrder.amount,
          currency: 'usd',
          description: `${arena?.title || 'Arena'} - ${court} (${slotCount} hrs)`,
          prefill: {
            name: user?.fullname,
            email: user?.email,
          },
        });

        const bookingId = currentOrder.bookingIds?.[0];
        const verifyRes = await verifyPaymentMutation.mutateAsync({
          bookingId,
          paymentIntentId: stripeRes.paymentIntentId,
        });

        setPaymentRef(stripeRes.paymentIntentId);
        if (!verifyRes?.isPaid) {
          Alert.alert(
            'Payment Pending',
            'Your payment is being processed. We will confirm your booking shortly.'
          );
          return;
        }
        setSuccessModalVisible(true);
      } else {
        const options: RazorpayCheckoutOptions = {
          keyId: currentOrder.keyId,
          orderId: currentOrder.orderId,
          amount: currentOrder.amount,
          currency: currentOrder.currency || 'INR',
          name: 'SmashLive Booking',
          description: `${arena?.title || 'Arena'} - ${court} (${slotCount} hrs)`,
          prefill: {
            name: user?.fullname,
            email: user?.email,
            contact: user?.phoneNumber,
          },
        };

        const bookingId = currentOrder.bookingIds?.[0];

        if (Platform.OS === 'web') {
          const paymentRes = await openRazorpayCheckout(options);
          await verifyPaymentMutation.mutateAsync({
            bookingId,
            razorpay_order_id: paymentRes.razorpay_order_id,
            razorpay_payment_id: paymentRes.razorpay_payment_id,
            razorpay_signature: paymentRes.razorpay_signature,
          });
          setPaymentRef(paymentRes.razorpay_payment_id);
          setSuccessModalVisible(true);
        } else {
          // Mobile (iOS / Android) — Open Razorpay WebView Modal
          setActiveBookingId(bookingId);
          setRzpOptions(options);
          setRzpModalVisible(true);
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg !== 'Payment cancelled by user' && msg !== 'Payment cancelled') {
        Alert.alert('Booking Error', msg || 'Payment could not be processed.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const firstSlot = slotStarts[0] || new Date().toISOString();
  const dateFormatted = formatDateShort(date || firstSlot);
  const timeRangeFormatted = formatTimeRange(firstSlot, slotCount);

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header
        title="Confirm Booking"
        subtitle={arena?.title || 'Arena Booking'}
        showBack
        rightAction={<HoldTimerRing createdAt={createdAt} onExpire={handleHoldExpire} />}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Slot Hold Active Banner */}
        <HoldTimerBanner createdAt={createdAt} onExpire={handleHoldExpire} />

        {/* Arena & Court Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeader}>BOOKING SUMMARY</Text>
          <Text style={styles.arenaTitle}>{arena?.title}</Text>
          <Text style={styles.courtName}>{court}</Text>
          <Text style={styles.venueAddress}>{arena?.venue}</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{dateFormatted}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>{timeRangeFormatted}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{slotCount} {slotCount === 1 ? 'Hour' : 'Hours'}</Text>
          </View>
        </View>

        {/* Bill Breakdown */}
        <View style={styles.billCard}>
          <Text style={styles.cardHeader}>PRICE BREAKDOWN</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>
              {slotCount} hrs × ₹{pricePerHour}
            </Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Taxes & GST (5%)</Text>
            <Text style={styles.billValue}>₹{tax}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, arena?.currency)}</Text>
          </View>
        </View>

        {/* Trust Badge */}
        <View style={styles.trustBadge}>
          <ShieldCheck size={18} color={Colors.green} />
          <Text style={styles.trustText}>
            100% Secure Checkout • 15-Minute Slot Hold Active
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Pay Button */}
      <View style={styles.bottomBar}>
        <Button
          title={
            isProcessing
              ? 'Processing Payment...'
              : createOrderMutation.isPending && !orderData
              ? 'Securing Slot Hold...'
              : `Pay ₹${total} via Razorpay`
          }
          onPress={handlePay}
          loading={isProcessing || (createOrderMutation.isPending && !orderData)}
          fullWidth
          size="lg"
          icon={<CreditCard size={18} color={Colors.textInverse} />}
        />
      </View>

      {/* Processing Loader Modal */}
      <PaymentLoader
        visible={isProcessing && !rzpModalVisible}
        title="Securing Court Reservation..."
        subtitle="Communicating with payment gateway. Please do not exit."
      />

      {/* Success Overlay Modal */}
      <BookingSuccessModal
        visible={successModalVisible}
        arenaTitle={arena?.title || 'Arena'}
        court={court || 'Court 1'}
        slotStart={firstSlot}
        durationHours={slotCount}
        totalAmount={total}
        paymentRef={paymentRef}
        venue={arena?.venue}
        venueCoords={arena?.location}
        onClose={() => setSuccessModalVisible(false)}
      />

      {/* Razorpay Mobile Secure Modal */}
      <RazorpayModal
        visible={rzpModalVisible}
        options={rzpOptions}
        onSuccess={handleRazorpaySuccess}
        onClose={() => {
          setRzpModalVisible(false);
          setIsProcessing(false);
        }}
        onError={(err) => {
          setRzpModalVisible(false);
          setIsProcessing(false);
          Alert.alert('Payment Failed', err);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    padding: Spacing.screenPadding,
    paddingBottom: 110,
  },
  summaryCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    color: Colors.textTertiary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  arenaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.title3,
    fontFamily: Fonts.headingSemibold,
  },
  courtName: {
    color: Colors.green,
    fontSize: Typography.headline,
    fontFamily: Fonts.bodyBold,
    marginTop: 2,
  },
  venueAddress: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  infoValue: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
  },
  billCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  billLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  billValue: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  totalLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.bodyBold,
  },
  totalValue: {
    color: Colors.green,
    fontSize: Typography.title2,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trustText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(13, 17, 15, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    padding: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
  },
});
