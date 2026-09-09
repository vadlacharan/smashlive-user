import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Clock,
  Info,
  MapPin,
  Navigation,
  Share2,
  Star,
  Zap,
} from 'lucide-react-native';
import { CourtGroup } from '../../../src/components/arena/CourtGroup';
import { DateStrip } from '../../../src/components/arena/DateStrip';
import { PriceBar } from '../../../src/components/arena/PriceBar';
import { SlotGrid } from '../../../src/components/arena/SlotGrid';
import { Header } from '../../../src/components/common/Header';
import { SlotGridSkeleton } from '../../../src/components/common/Skeleton';
import { useLocation } from '../../../src/context/LocationContext';
import { useArena, useAvailability } from '../../../src/hooks/useArenas';
import { ScreenWash } from '../../../src/components/common/ScreenWash';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../../src/theme';
import { formatOperatingHours, openMapsDirections } from '../../../src/utils/calendar';
import { resolveMediaUrl } from '../../../src/utils/media';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ArenaDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const arenaId = Number(id) || 1;

  const { data: arena, isLoading: arenaLoading } = useArena(arenaId);
  const { getDistanceFromUser } = useLocation();

  // Selected state
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Set default court once arena loads
  useEffect(() => {
    if (arena && arena.Courts && arena.Courts.length > 0 && !selectedCourt) {
      setSelectedCourt(arena.Courts[0].CourtIdentifier);
    }
  }, [arena]);

  const { data: availability, isLoading: availLoading } = useAvailability(
    arenaId,
    selectedDate
  );

  const distanceInfo = getDistanceFromUser(arena?.location);

  // Open / closes soon / closed based on the arena's operating hours
  const parseHour = (s?: string): number => {
    const h = parseInt(s ?? '', 10);
    return isNaN(h) ? -1 : h;
  };
  const openH = parseHour(arena?.openTime);
  const closeH = parseHour(arena?.closeTime);
  const nowVal = new Date().getHours() + new Date().getMinutes() / 60;
  const isOpenNow = openH >= 0 && closeH > openH && nowVal >= openH && nowVal < closeH;
  const closesSoon = isOpenNow && closeH - nowVal <= 1.5;
  const statusLabel = isOpenNow ? (closesSoon ? 'CLOSES SOON' : 'OPEN NOW') : 'CLOSED';

  const selectedCourtConfig = arena?.Courts?.find(
    (c) => c.CourtIdentifier === selectedCourt
  );
  const pricePerHour = selectedCourtConfig?.pricePerHour || 400;
  const totalPrice = selectedSlots.length * pricePerHour;

  const handleToggleSlot = (slotIso: string) => {
    if (selectedSlots.length === 0) {
      setSelectedSlots([slotIso]);
      return;
    }

    // Deselect logic
    if (selectedSlots.includes(slotIso)) {
      if (selectedSlots.length === 1) {
        setSelectedSlots([]);
        return;
      }
      const sorted = [...selectedSlots].sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      // If clicking either edge (earliest or latest slot), deselect only that edge
      if (slotIso === sorted[0]) {
        setSelectedSlots(sorted.slice(1));
      } else if (slotIso === sorted[sorted.length - 1]) {
        setSelectedSlots(sorted.slice(0, -1));
      } else {
        // If clicking a middle slot, reset to only the clicked slot to maintain contiguity
        setSelectedSlots([slotIso]);
      }
      return;
    }

    // Adding a new slot
    const sorted = [...selectedSlots].sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    const clickTime = new Date(slotIso).getTime();
    const minTime = new Date(sorted[0]).getTime();
    const maxTime = new Date(sorted[sorted.length - 1]).getTime();

    // 1 hour immediately before earliest slot
    if (Math.abs(minTime - clickTime - 3600000) < 60000) {
      if (sorted.length >= 8) {
        Alert.alert('Max 8 Hours', 'You can select up to 8 continuous hours per booking.');
        return;
      }
      setSelectedSlots([slotIso, ...sorted]);
      return;
    }

    // 1 hour immediately after latest slot
    if (Math.abs(clickTime - maxTime - 3600000) < 60000) {
      if (sorted.length >= 8) {
        Alert.alert('Max 8 Hours', 'You can select up to 8 continuous hours per booking.');
        return;
      }
      setSelectedSlots([...sorted, slotIso]);
      return;
    }

    // Attempt contiguous auto-fill range if user clicked a distant slot on the same day
    const startT = Math.min(minTime, clickTime);
    const endT = Math.max(maxTime, clickTime);
    const totalHours = Math.round((endT - startT) / 3600000) + 1;

    if (totalHours <= 8 && availability?.slots) {
      const candidateSlots: string[] = [];
      let allAvailable = true;

      for (let t = startT; t <= endT; t += 3600000) {
        const match = availability.slots.find(
          (s) => Math.abs(new Date(s.slotStart).getTime() - t) < 60000
        );
        const courtInfo = match?.courts?.find((c) => c.court === selectedCourt);
        const isAvail = courtInfo ? courtInfo.available : match?.available;
        const isPast = t < Date.now();

        if (!match || !isAvail || isPast) {
          allAvailable = false;
          break;
        }
        candidateSlots.push(match.slotStart);
      }

      if (allAvailable) {
        setSelectedSlots(candidateSlots);
        return;
      }
    }

    // If slots cannot be bridged contiguously, switch to the newly clicked slot
    setSelectedSlots([slotIso]);
  };

  const handleCourtChange = (courtName: string) => {
    setSelectedCourt(courtName);
    setSelectedSlots([]); // Clear slots on court change per specification
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setSelectedSlots([]); // Clear slots on date change per same-day rule
  };

  const handleContinue = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Select Slots', 'Please select at least 1 hour slot to continue.');
      return;
    }

    router.push({
      pathname: `/arena/${arenaId}/checkout`,
      params: {
        court: selectedCourt,
        date: selectedDate,
        slotStarts: JSON.stringify(selectedSlots),
        pricePerHour: String(pricePerHour),
      },
    });
  };

  if (arenaLoading || !arena) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  const photos = arena.photos || [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header
        transparent
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => openMapsDirections(arena.location, arena.venue)}
            style={styles.navHeaderButton}
          >
            <Navigation size={18} color={Colors.textPrimary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 130 }]}
      >
        {/* Zone A: Hero Photo Gallery */}
        <View style={styles.heroSection}>
          <FlatList
            data={photos}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <Image
                source={{ uri: resolveMediaUrl(item.url) }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            )}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIdx(idx);
            }}
          />

          <LinearGradient
            colors={['transparent', 'rgba(11, 15, 13, 0.95)', '#0B0F0D']}
            style={styles.heroScrim}
          />

          {/* Dots Indicator */}
          {photos.length > 1 && (
            <View style={styles.dotsRow}>
              {photos.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activePhotoIdx && styles.dotActive]}
                />
              ))}
            </View>
          )}

          {/* Title & Info Card */}
          <View style={styles.heroInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{arena.title}</Text>
              {arena.rating && (
                <View style={styles.ratingBadge}>
                  <Star size={12} color={Colors.gold} fill={Colors.gold} />
                  <Text style={styles.ratingText}>{arena.rating}</Text>
                </View>
              )}
            </View>

            {/* Info rows separated by hairlines */}
            <View style={styles.infoRow}>
              <TouchableOpacity
                onPress={() => openMapsDirections(arena.location, arena.venue)}
                style={styles.infoRowTouch}
                activeOpacity={0.75}
              >
                <View style={styles.infoIconSlot}>
                  <MapPin size={14} color={Colors.green} />
                </View>
                <Text style={styles.infoText} numberOfLines={2}>
                  {arena.venue}
                </Text>
                {distanceInfo.formatted ? (
                  <View style={styles.distPill}>
                    <Text style={styles.distText}>{distanceInfo.formatted}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoRowTouch}>
                <View style={styles.infoIconSlot}>
                  <Clock size={14} color={Colors.green} />
                </View>
                <Text style={styles.infoText}>
                  {formatOperatingHours(arena.openTime, arena.closeTime)}
                </Text>
                <View
                  style={[
                    styles.statusChip,
                    isOpenNow
                      ? closesSoon
                        ? styles.statusChipSoon
                        : styles.statusChipOpen
                      : styles.statusChipClosed,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusChipText,
                      isOpenNow
                        ? closesSoon
                          ? styles.statusChipTextSoon
                          : styles.statusChipTextOpen
                        : styles.statusChipTextClosed,
                    ]}
                  >
                    {statusLabel}
                  </Text>
                </View>
              </View>
            </View>

            {arena.description && (
              <Text style={styles.descriptionText}>{arena.description}</Text>
            )}
          </View>
        </View>

        {/* Zone B: Courts Grouped by Sport */}
        <View style={styles.zoneDivider} />
        <Text style={styles.zoneHeader}>1. SELECT COURT OR TURF</Text>
        <CourtGroup
          courts={arena.Courts || []}
          selectedCourt={selectedCourt}
          onSelectCourt={handleCourtChange}
        />

        {/* Zone C: 14-Day Date Strip & Hourly Availability Grid */}
        <View style={styles.zoneDivider} />
        <Text style={styles.zoneHeader}>2. CHOOSE DATE</Text>
        <DateStrip
          selectedDate={selectedDate}
          onSelectDate={handleDateChange}
        />

        <View style={styles.zoneDivider} />
        {availLoading ? (
          <SlotGridSkeleton />
        ) : (
          <SlotGrid
            slots={availability?.slots || []}
            selectedCourt={selectedCourt}
            selectedSlots={selectedSlots}
            onToggleSlot={handleToggleSlot}
          />
        )}
      </ScrollView>

      {/* Sticky Price Bar */}
      <PriceBar
        slotCount={selectedSlots.length}
        totalPrice={totalPrice}
        currency={arena.currency}
        onContinue={handleContinue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  navHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(23, 28, 25, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroSection: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 240,
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  dotsRow: {
    position: 'absolute',
    top: 200,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.green,
  },
  heroInfo: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: Typography.title1,
    fontFamily: Fonts.heading,
    flex: 1,
    marginRight: Spacing.sm,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  ratingText: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.14)',
    marginTop: Spacing.sm,
  },
  infoRowTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
  },
  infoIconSlot: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  infoText: {
    color: 'rgba(245, 247, 246, 0.85)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    flex: 1,
    lineHeight: 19,
  },
  distPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginLeft: 8,
    flexShrink: 0,
  },
  distText: {
    color: Colors.green,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  statusChip: {
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  statusChipOpen: {
    backgroundColor: 'rgba(57, 255, 136, 0.14)',
    borderColor: 'rgba(57, 255, 136, 0.35)',
  },
  statusChipSoon: {
    backgroundColor: 'rgba(251, 191, 36, 0.14)',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  statusChipClosed: {
    backgroundColor: 'rgba(255, 92, 92, 0.12)',
    borderColor: 'rgba(255, 92, 92, 0.35)',
  },
  statusChipText: {
    fontSize: 9,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.8,
  },
  statusChipTextOpen: {
    color: Colors.green,
  },
  statusChipTextSoon: {
    color: Colors.gold,
  },
  statusChipTextClosed: {
    color: Colors.danger,
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: 22,
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  zoneDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.md,
  },
  zoneHeader: {
    color: Colors.green,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
  },
  loadingBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
  },
});
