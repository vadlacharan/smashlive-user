import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  ChevronRight,
  Info,
  MapPin,
  Navigation,
  Share2,
  Trophy,
  Zap,
} from 'lucide-react-native';
import { LiveBadge, SportBadge } from '../../../src/components/common/Badge';
import { Button } from '../../../src/components/common/Button';
import { Header } from '../../../src/components/common/Header';
import { ScreenWash } from '../../../src/components/common/ScreenWash';
import { useLocation } from '../../../src/context/LocationContext';
import { useEvents, useTournament, useMyRegistrations } from '../../../src/hooks/useTournaments';
import { API_BASE_URL } from '../../../src/api/client';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../../src/theme';
import { Event } from '../../../src/types';
import { formatDateShort, openMapsDirections } from '../../../src/utils/calendar';
import { formatCurrency, toTitleCase } from '../../../src/utils/text';
import { resolveMediaUrl } from '../../../src/utils/media';

export default function TournamentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = Number(id) || 1;

  const { data: tournament, isLoading: tourneyLoading } = useTournament(tournamentId);
  const { data: events = [], isLoading: eventsLoading } = useEvents(tournamentId);
  const { data: myRegistrations = [] } = useMyRegistrations();
  const { getDistanceFromUser } = useLocation();

  const registeredEventIds = new Set(
    myRegistrations.map((r) => (typeof r.event === 'object' && r.event ? r.event.id : r.event))
  );

  // Multi-event discount: a prior paid registration in this tournament
  // makes every additional event cost the discounted price.
  const hasPriorRegistration =
    myRegistrations.some((r) => {
      const ev = typeof r.event === 'object' && r.event ? r.event : null;
      if (!ev) return false;
      const t = (ev as any).tournament;
      const tId = typeof t === 'object' && t !== null ? t.id : t;
      return tId === tournamentId && r.isPaid;
    }) && !registeredEventIds.has(0);

  const distanceInfo = getDistanceFromUser(tournament?.venueLocation);

  const photoUrl =
    tournament?.thumbnail?.[0]?.url
      ? resolveMediaUrl(tournament.thumbnail[0].url)
      : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80';

  if (tourneyLoading || !tournament) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  const deadlineStr = tournament.tournamentRegistrationEndDate
    ? formatDateShort(tournament.tournamentRegistrationEndDate)
    : '28 Aug';

  const deadlineTime = tournament.tournamentRegistrationEndDate
    ? new Date(tournament.tournamentRegistrationEndDate).getTime()
    : null;
  const isRegistrationOpen = deadlineTime ? Date.now() <= deadlineTime : true;

  const handleShare = async () => {
    // HTTPS link — WhatsApp (and most platforms) only hyperlink http(s).
    // The backend route /share/tournament/:id 302-redirects to the app's
    // smashlive:// deep link, which opens this exact page in the app.
    const shareUrl = `${API_BASE_URL}/share/tournament/${tournamentId}`;
    const message = `${toTitleCase(tournament.title)}\n${tournament.venue}\n${shareUrl}`;
    try {
      await Share.share({ message, url: shareUrl });
    } catch (err) {
      console.warn('Share failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header
        transparent
        showBack
        rightAction={
          <View style={styles.navHeaderRow}>
            <TouchableOpacity
              onPress={() => openMapsDirections(tournament.venueLocation, tournament.venue)}
              style={styles.navHeaderButton}
            >
              <Navigation size={18} color={Colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.navHeaderButton}>
              <Share2 size={17} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]}
      >
        {/* Hero Section */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: photoUrl }} style={styles.heroImage} />
          <LinearGradient
            colors={['transparent', 'rgba(11, 15, 13, 0.95)', '#0B0F0D']}
            style={styles.heroScrim}
          />

          <View style={styles.heroContent}>
            <View style={styles.badgeRow}>
              {tournament.isLive ? (
                <LiveBadge label="TOURNAMENT LIVE" size="sm" />
              ) : (
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingText}>UPCOMING</Text>
                </View>
              )}
              {tournament.prizePool && (
                <View style={styles.prizeBadge}>
                  <Trophy size={12} color={Colors.gold} />
                  <Text style={styles.prizeText}>{tournament.prizePool} Prize Pool</Text>
                </View>
              )}
            </View>

            <Text style={styles.titleText}>{toTitleCase(tournament.title)}</Text>

            {/* Info rows separated by hairlines */}
            <View style={styles.infoRow}>
              <TouchableOpacity
                onPress={() => openMapsDirections(tournament.venueLocation, tournament.venue)}
                style={styles.infoRowTouch}
                activeOpacity={0.75}
              >
                <View style={styles.infoIconSlot}>
                  <MapPin size={14} color={Colors.green} />
                </View>
                <Text style={styles.infoText} numberOfLines={2}>
                  {tournament.venue}
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
                  <Calendar size={14} color={Colors.green} />
                </View>
                <Text style={styles.infoText}>
                  Registration closes{' '}
                  <Text style={styles.infoTextAccent}>{deadlineStr}</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* View Bracket / Draws Banner */}
        <View style={styles.drawBannerContainer}>
          <TouchableOpacity
            onPress={() => router.push(`/tournament/${tournamentId}/draw`)}
            style={styles.drawBanner}
            activeOpacity={0.88}
          >
            {/* Championship gold gradient — distinct from green event cards */}
            <LinearGradient
              colors={['#332B15', '#211B11', '#161310']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.drawRing} />
            <View style={styles.drawRingSmall} />

            <View style={styles.drawBannerLeft}>
              <View style={styles.trophyCircle}>
                <Trophy size={20} color={Colors.textInverse} />
              </View>
              <View style={styles.drawBannerTextCol}>
                <Text style={styles.drawBannerTitle}>Draws & Scores</Text>
                <Text style={styles.drawBannerSubtitle}>
                  Bracket, standings, and live results in one place
                </Text>
              </View>
            </View>
            <View style={styles.drawChevronPill}>
              <ChevronRight size={18} color={Colors.gold} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Events Categories List */}
        <View style={styles.eventsSection}>
          {typeof tournament.additionalEventDiscountPrice === 'number' && (
            <View style={styles.tournamentDiscountBanner}>
              <Zap size={15} color={Colors.gold} />
              <Text style={styles.tournamentDiscountText}>
                Register for one event and get every additional event from the 2nd onwards at just{' '}
                {formatCurrency(
                  tournament.additionalEventDiscountPrice,
                  (events[0] as Event | undefined)?.currency
                )}
                .
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>EVENTS & CATEGORIES ({events.length})</Text>

          {eventsLoading ? (
            <ActivityIndicator size="small" color={Colors.green} />
          ) : (
            events.map((event) => {
              const registered = event.registeredCount || 0;
              const maxTeams = event.maxTeams || 16;
              const spotsLeft = Math.max(maxTeams - registered, 0);
              const fillPct = Math.min(registered / maxTeams, 1);
              const isRegistered = registeredEventIds.has(event.id);
              const discountPrice =
                typeof tournament.additionalEventDiscountPrice === 'number'
                  ? tournament.additionalEventDiscountPrice
                  : null;
              const showDiscount =
                !!discountPrice &&
                hasPriorRegistration &&
                !isRegistered &&
                discountPrice < event.cost;
              const effectiveCost = showDiscount ? discountPrice : event.cost;

              return (
                <View key={event.id} style={styles.eventCard}>
                  {/* Solid diagonal green gradient — like NextUpCard */}
                  <LinearGradient
                    colors={['#1C3526', '#142420', '#101815']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  {/* Decorative rings bleeding off the top-right */}
                  <View style={styles.decorRing} />
                  <View style={styles.decorRingSmall} />

                  <View style={styles.eventTop}>
                    <View style={styles.eventTypeBadge}>
                      <Text style={styles.eventTypeText}>
                        {event.eventType.toUpperCase()} • BEST OF {event.numberOfSets}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventCaption}>{event.title}</Text>
                  {!!event.description && (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                  )}

                  {/* Hero price row */}
                  <View style={styles.eventHeroRow}>
                    {showDiscount ? (
                      <>
                        <Text style={styles.eventHeroPrice}>
                          {formatCurrency(effectiveCost, event.currency)}
                        </Text>
                        <Text style={styles.eventHeroStrike}>
                          {formatCurrency(event.cost, event.currency)}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.eventHeroPrice}>
                        {formatCurrency(effectiveCost, event.currency)}
                      </Text>
                    )}
                    <View style={styles.eventHeroLabelCol}>
                      <Text style={styles.eventHeroLabel}>Per Team</Text>
                    </View>
                    <ChevronRight size={18} color="rgba(255, 255, 255, 0.55)" />
                  </View>

                  {/* Details + Register side by side */}
                  <View style={styles.eventFooter}>
                    <View style={styles.eventMetaCol}>
                      <View style={styles.eventMeta}>
                        <Calendar size={12} color="rgba(255, 255, 255, 0.5)" />
                        <Text style={styles.eventDates}>
                          {formatDateShort(event.startdate)} – {formatDateShort(event.enddate)}
                        </Text>
                      </View>
                      <Text style={styles.eventSpotsText}>
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full'}
                        <Text style={styles.eventSpotsCount}>{`  ${registered}/${maxTeams}`}</Text>
                      </Text>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${fillPct * 100}%` },
                            fillPct >= 1 && styles.progressFillFull,
                          ]}
                        />
                      </View>
                    </View>

                    {tournament.isLive ? (
                      <Button
                        title="View Draw"
                        onPress={() => router.push(`/tournament/${tournamentId}/draw`)}
                        size="sm"
                        style={styles.eventButton}
                      />
                    ) : isRegistered ? (
                      <Button
                        title="Registered"
                        disabled
                        size="sm"
                        variant="outline"
                        style={styles.eventButton}
                      />
                    ) : isRegistrationOpen ? (
                      <Button
                        title="Register"
                        onPress={() =>
                          router.push({
                            pathname: `/event/${event.id}/register`,
                            params: {
                              eventTitle: event.title,
                              eventType: event.eventType,
                              cost: String(effectiveCost),
                              normalCost: String(event.cost),
                              currency: event.currency,
                              tournamentTitle: tournament.title,
                              tournamentId: String(tournamentId),
                              eventDescription: event.description || '',
                            },
                          })
                        }
                        size="sm"
                        style={styles.eventButton}
                      />
                    ) : (
                      <Button
                        title="Closed"
                        disabled
                        size="sm"
                        variant="outline"
                        style={styles.eventButton}
                      />
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  navHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  heroWrapper: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  heroScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
  },
  heroContent: {
    paddingHorizontal: Spacing.screenPadding,
    marginTop: -20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  upcomingBadge: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  upcomingText: {
    color: Colors.textSecondary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  prizeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  prizeText: {
    color: Colors.gold,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: Typography.title1,
    fontFamily: Fonts.heading,
    marginBottom: Spacing.xs,
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
  infoTextAccent: {
    color: Colors.green,
    fontFamily: Fonts.headingSemibold,
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
  drawBannerContainer: {
    paddingHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.md,
  },
  drawBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    overflow: 'hidden',
    backgroundColor: '#141B17',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  drawRing: {
    position: 'absolute',
    top: -65,
    right: -55,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 18,
    borderColor: 'rgba(255, 216, 115, 0.06)',
  },
  drawRingSmall: {
    position: 'absolute',
    top: -45,
    right: -35,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 115, 0.1)',
  },
  drawBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  drawBannerTextCol: {
    flex: 1,
  },
  trophyCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawBannerTitle: {
    color: '#FFFFFF',
    fontSize: Typography.body,
    fontFamily: Fonts.bodyBold,
  },
  drawBannerSubtitle: {
    color: 'rgba(245, 247, 246, 0.65)',
    fontSize: Typography.micro,
    marginTop: 2,
  },
  drawChevronPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 216, 115, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventsSection: {
    paddingHorizontal: Spacing.screenPadding,
    marginTop: Spacing.sm,
  },
  tournamentDiscountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginBottom: Spacing.md,
  },
  tournamentDiscountText: {
    color: Colors.gold,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    flex: 1,
    lineHeight: 18,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  eventCard: {
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    backgroundColor: '#141B17',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  decorRing: {
    position: 'absolute',
    top: -55,
    right: -45,
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 18,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  decorRingSmall: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  eventTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  eventTypeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  eventTypeText: {
    color: Colors.green,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.6,
  },
  eventCaption: {
    color: 'rgba(245, 247, 246, 0.7)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    marginBottom: Spacing.md,
  },
  eventDescription: {
    color: 'rgba(245, 247, 246, 0.55)',
    fontSize: Typography.micro + 1,
    fontFamily: Fonts.body,
    lineHeight: 17,
    marginTop: -8,
    marginBottom: Spacing.md,
  },
  eventHeroStrike: {
    color: 'rgba(245, 247, 246, 0.4)',
    fontSize: 16,
    fontFamily: Fonts.bodySemibold,
    textDecorationLine: 'line-through',
    marginTop: 4,
  },
  eventHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  eventHeroPrice: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 36,
    fontFamily: Fonts.heading,
    letterSpacing: -0.5,
  },
  eventHeroLabelCol: {
    flex: 1,
  },
  eventHeroLabel: {
    color: 'rgba(245, 247, 246, 0.55)',
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.4,
  },
  eventButton: {
    minWidth: 104,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: Spacing.md,
  },
  eventMetaCol: {
    flex: 1,
    gap: 6,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  eventDates: {
    color: 'rgba(245, 247, 246, 0.65)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    flexShrink: 1,
  },
  eventSpotsText: {
    color: 'rgba(245, 247, 246, 0.7)',
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
  },
  eventSpotsCount: {
    color: 'rgba(245, 247, 246, 0.45)',
    fontFamily: Fonts.body,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    maxWidth: 140,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.green,
  },
  progressFillFull: {
    backgroundColor: Colors.gold,
  },
});
