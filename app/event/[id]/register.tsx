import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, CreditCard, Search, ShieldCheck, UserCheck, Users, Zap } from 'lucide-react-native';
import { api } from '../../../src/api/client';
import { Button } from '../../../src/components/common/Button';
import { ConfettiOverlay } from '../../../src/components/common/ConfettiOverlay';
import { Header } from '../../../src/components/common/Header';
import { Input } from '../../../src/components/common/Input';
import { PaymentLoader } from '../../../src/components/common/PaymentLoader';
import { ScreenWash } from '../../../src/components/common/ScreenWash';
import { RazorpayModal } from '../../../src/components/payment/RazorpayModal';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/context/AuthContext';
import {
  useCreateRegistrationOrder,
  useFreeRegister,
  useVerifyRegistrationPayment,
} from '../../../src/hooks/useTournaments';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../../src/theme';
import { User } from '../../../src/types';
import { formatCurrency } from '../../../src/utils/text';
import {
  RazorpayCheckoutOptions,
  RazorpaySuccessResponse,
  openRazorpayCheckout,
} from '../../../src/utils/razorpay';
import { useStripeCheckout } from '../../../src/hooks/useStripeCheckout';

export default function EventRegisterScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const openStripeCheckout = useStripeCheckout();
  const { id, eventTitle, eventType, cost: costRaw, currency: currencyRaw, tournamentTitle, tournamentId, normalCost: normalCostRaw, eventDescription } =
    useLocalSearchParams<{
      id: string;
      eventTitle: string;
      eventType: string;
      cost: string;
      currency?: string;
      tournamentTitle: string;
      tournamentId?: string;
      normalCost?: string;
      eventDescription?: string;
    }>();

  const eventId = Number(id) || 101;
  const cost = Number(costRaw) || 600;
  const normalCost = Number(normalCostRaw) || cost;
  const isDiscounted = normalCost > cost;
  const currency = currencyRaw === 'USD' ? ('USD' as const) : ('INR' as const);
  const isDoubles = eventType === 'doubles';

  const [partnerQuery, setPartnerQuery] = useState('');
  const [partnerResults, setPartnerResults] = useState<User[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<User | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [rzpModalVisible, setRzpModalVisible] = useState(false);
  const [rzpOptions, setRzpOptions] = useState<RazorpayCheckoutOptions | null>(null);
  const [activeRegId, setActiveRegId] = useState<number | null>(null);

  const createOrderMutation = useCreateRegistrationOrder();
  const verifyPaymentMutation = useVerifyRegistrationPayment();
  const freeRegisterMutation = useFreeRegister();

  const invalidateTournamentQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
    queryClient.invalidateQueries({ queryKey: ['tournament'] });
    queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
  };

  const handlePartnerSearch = async (q: string) => {
    setPartnerQuery(q);
    if (!q.trim()) {
      setPartnerResults([]);
      return;
    }
    const results = await api.searchPartners(q);
    setPartnerResults(results);
  };

  const handleRazorpaySuccess = async (response: RazorpaySuccessResponse) => {
    if (!activeRegId) return;
    setIsProcessing(true);
    try {
      await verifyPaymentMutation.mutateAsync({
        registrationId: activeRegId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
      invalidateTournamentQueries();
      setRzpModalVisible(false);
      setRegisteredSuccess(true);
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Payment verification failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayAndRegister = async () => {
    if (isDoubles && !selectedPartner) {
      Alert.alert('Partner Required', 'Please select a doubles teammate to proceed.');
      return;
    }

    setIsProcessing(true);
    try {
      if (cost === 0) {
        await freeRegisterMutation.mutateAsync({
          eventId,
          partnerId: selectedPartner?.id,
        });
        invalidateTournamentQueries();
        setRegisteredSuccess(true);
      } else {
        const order = await createOrderMutation.mutateAsync({
          eventId,
          partnerId: selectedPartner?.id,
        });

        const isStripe = order.provider === 'stripe' || order.currency === 'USD';

        if (isStripe) {
          // Native Stripe PaymentSheet (recommended Stripe RN integration).
          const stripeRes = await openStripeCheckout({
            clientSecret: order.clientSecret,
            publishableKey: order.publishableKey || '',
            amount: order.amount,
            currency: 'usd',
            description: `${tournamentTitle || 'Tournament'} - ${eventTitle || 'Event'}`,
            prefill: {
              name: user?.fullname,
              email: user?.email,
            },
          });

          const verifyRes = await verifyPaymentMutation.mutateAsync({
            registrationId: order.registrationId,
            paymentIntentId: stripeRes.paymentIntentId,
          });
          if (!verifyRes?.isPaid) {
            Alert.alert(
              'Payment Pending',
              'Your payment is being processed. Your registration will be confirmed shortly.'
            );
            return;
          }
          invalidateTournamentQueries();
          setRegisteredSuccess(true);
        } else {
          const options: RazorpayCheckoutOptions = {
            keyId: order.keyId,
            orderId: order.orderId,
            amount: order.amount,
            currency: order.currency || 'INR',
            name: 'SmashLive Tournament Entry',
            description: `${tournamentTitle || 'Tournament'} - ${eventTitle || 'Event'}`,
            prefill: {
              name: user?.fullname,
              email: user?.email,
              contact: user?.phoneNumber,
            },
          };

          if (Platform.OS === 'web') {
            const paymentRes = await openRazorpayCheckout(options);
            await verifyPaymentMutation.mutateAsync({
              registrationId: order.registrationId,
              razorpay_order_id: paymentRes.razorpay_order_id,
              razorpay_payment_id: paymentRes.razorpay_payment_id,
              razorpay_signature: paymentRes.razorpay_signature,
            });
            invalidateTournamentQueries();
            setRegisteredSuccess(true);
          } else {
            // Mobile (iOS / Android) — Open Razorpay Secure Modal
            setActiveRegId(order.registrationId);
            setRzpOptions(options);
            setRzpModalVisible(true);
          }
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg !== 'Payment cancelled by user' && msg !== 'Payment cancelled') {
        Alert.alert('Registration Error', msg || 'Could not complete registration.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header
        title="Tournament Entry"
        subtitle={tournamentTitle || 'Registration Wizard'}
        showBack
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Event Details Card */}
        <View style={styles.eventCard}>
          <Text style={styles.cardHeader}>EVENT DETAILS</Text>
          <Text style={styles.eventTitle}>{eventTitle || "Tournament Event"}</Text>
          <Text style={styles.eventTypeTag}>
            {isDoubles ? 'Doubles Event • 2 Players per Team' : 'Singles Event'}
          </Text>

          {!!eventDescription && (
            <Text style={styles.eventDesc}>{eventDescription}</Text>
          )}

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Player (Anchor)</Text>
            <Text style={styles.infoValue}>{user?.fullname || 'Your full name'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Entry Fee (per team)</Text>
            {isDiscounted ? (
              <View style={styles.feeRow}>
                <Text style={styles.feeStrike}>{formatCurrency(normalCost, currency)}</Text>
                <Text style={styles.feeValue}>{formatCurrency(cost, currency)}</Text>
              </View>
            ) : (
              <Text style={styles.feeValue}>{formatCurrency(cost, currency)}</Text>
            )}
          </View>

          {isDiscounted && (
            <View style={styles.discountNote}>
              <Text style={styles.discountNoteText}>
                Multi-event discount applied — this is your 2nd+ registration in this tournament.
              </Text>
            </View>
          )}
        </View>

        {/* Doubles Partner Picker */}
        {isDoubles && (
          <View style={styles.partnerCard}>
            <Text style={styles.cardHeader}>SELECT DOUBLES PARTNER</Text>

            {selectedPartner ? (
              <View style={styles.selectedPartnerBox}>
                <View style={styles.partnerInfo}>
                  <View style={styles.checkCircle}>
                    <UserCheck size={16} color={Colors.textInverse} />
                  </View>
                  <View>
                    <Text style={styles.partnerName}>{selectedPartner.fullname}</Text>
                    <Text style={styles.partnerEmail}>{selectedPartner.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedPartner(null)}
                  style={styles.changePartnerBtn}
                >
                  <Text style={styles.changePartnerText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.searchPartnerBox}>
                <Input
                  value={partnerQuery}
                  onChangeText={handlePartnerSearch}
                  placeholder="Search partner by name or email..."
                  icon={<Search size={16} color={Colors.textTertiary} />}
                  containerStyle={{ marginBottom: Spacing.sm }}
                />

                <View style={styles.partnersList}>
                  {partnerResults.map((partner) => (
                    <TouchableOpacity
                      key={partner.id}
                      onPress={() => setSelectedPartner(partner)}
                      style={styles.partnerOptionRow}
                      activeOpacity={0.8}
                    >
                      <View>
                        <Text style={styles.partnerOptionName}>{partner.fullname}</Text>
                        <Text style={styles.partnerOptionEmail}>{partner.email}</Text>
                      </View>
                      <View style={styles.selectCircle}>
                        <Text style={styles.selectText}>Select</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardHeader}>PAYMENT SUMMARY</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Team Registration Fee</Text>
            <Text style={styles.summaryValue}>{formatCurrency(cost, currency)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{formatCurrency(cost, currency)}</Text>
          </View>
        </View>

        <View style={styles.trustBadge}>
          <ShieldCheck size={18} color={Colors.green} />
          <Text style={styles.trustText}>
            Instant Draw Placement • Razorpay Secured
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={styles.bottomBar}>
        <Button
          title={isProcessing ? 'Processing Entry...' : `Register & Pay ${formatCurrency(cost, currency)}`}
          onPress={handlePayAndRegister}
          loading={isProcessing}
          fullWidth
          size="lg"
          variant="primary"
        />
      </View>

      {/* Success Modal */}
      {registeredSuccess && (
        <View style={StyleSheet.absoluteFillObject}>
          <ConfettiOverlay active />
          <View style={styles.successModal}>
            <View style={styles.successCard}>
              <View style={styles.successCircle}>
                <Check size={36} color={Colors.textInverse} strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Registration Complete!</Text>
              <Text style={styles.successSubtitle}>
                Your team is registered for {eventTitle}. Fixture slots and match times will appear in the Draw.
              </Text>
              <Button
                title="View Tournament Draw"
                onPress={() => {
                  router.replace(`/tournament/${eventId}/draw`);
                }}
                fullWidth
                size="lg"
              />
            </View>
          </View>
        </View>
      )}

      {/* Payment Processing Loader Modal */}
      <PaymentLoader
        visible={isProcessing && !rzpModalVisible}
        title="Registering Tournament Entry..."
        subtitle="Confirming your team slot with the tournament organizer..."
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
  eventCard: {
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
  eventTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.title3,
    fontFamily: Fonts.bodyBold,
  },
  eventTypeTag: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    marginTop: 2,
  },
  eventDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    lineHeight: 19,
    marginTop: Spacing.sm,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feeStrike: {
    color: Colors.textTertiary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
    textDecorationLine: 'line-through',
  },
  feeValue: {
    color: Colors.green,
    fontSize: Typography.body,
    fontFamily: Fonts.headingSemibold,
    fontVariant: ['tabular-nums'],
  },
  discountNote: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: Spacing.sm,
  },
  discountNoteText: {
    color: Colors.gold,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
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
  partnerCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  selectedPartnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.green,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodyBold,
  },
  partnerEmail: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
  },
  changePartnerBtn: {
    backgroundColor: Colors.surface3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  changePartnerText: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  searchPartnerBox: {
    width: '100%',
  },
  partnersList: {
    gap: Spacing.sm,
  },
  partnerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  partnerOptionName: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
  },
  partnerOptionEmail: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
  },
  selectCircle: {
    backgroundColor: Colors.greenMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  selectText: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  summaryCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  summaryValue: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
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
  successModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  successCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.sheet,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.title2,
    fontFamily: Fonts.heading,
    marginBottom: 4,
  },
  successSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
});
