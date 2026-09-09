import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Award, Flame, MessageSquare, Sparkles, TrendingUp, Users } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

export interface FeedItem {
  id: string;
  type: 'highlight' | 'announcement' | 'tip' | 'leaderboard';
  title: string;
  description: string;
  tag: string;
  timeAgo: string;
  likes: number;
  comments: number;
  actionRoute?: string;
}

export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: 'f1',
    type: 'highlight',
    title: 'Hyderabad Super Smash Open: Finals Scheduled on Centrecourt',
    description: 'Men’s Doubles Final between Team Sharma/Verma and Nair/Reddy will take place this Sunday at 5:00 PM with live broadcast scoring on SmashLive.',
    tag: 'TOURNAMENT NEWS',
    timeAgo: '2h ago',
    likes: 48,
    comments: 12,
    actionRoute: '/tournament/1',
  },
  {
    id: 'f2',
    type: 'announcement',
    title: 'New BWF Synthetic Courts Opened at SmashZone Arena',
    description: 'SmashZone Gachibowli has upgraded 4 courts with Yonex professional cushioning and anti-glare 1000-lux LED tournament lighting. Slots are now open for booking.',
    tag: 'ARENA DROP',
    timeAgo: '5h ago',
    likes: 92,
    comments: 24,
    actionRoute: '/arena/1',
  },
  {
    id: 'f3',
    type: 'tip',
    title: 'Match Preparation: Doubles Rotation Masterclass',
    description: 'Learn attacking front-to-back vs defensive side-by-side transition rules used by top seeded players in the Telangana State Open.',
    tag: 'TACTICS',
    timeAgo: '1d ago',
    likes: 64,
    comments: 9,
  },
  {
    id: 'f4',
    type: 'announcement',
    title: 'Pickleball Masters Championship registrations closing soon',
    description: 'Only 4 team slots remain for the Men’s and Mixed Open draws. Book your spot before the deadline passes.',
    tag: 'REGISTRATION ALERT',
    timeAgo: '1d ago',
    likes: 31,
    comments: 6,
    actionRoute: '/tournament/2',
  },
];

interface RecentFeedProps {
  items?: FeedItem[];
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const RecentFeed: React.FC<RecentFeedProps> = ({
  items = MOCK_FEED_ITEMS,
  onLoadMore,
  isLoadingMore = false,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <Flame size={18} color={Colors.green} />
          <Text style={styles.sectionTitle}>COMMUNITY & HIGHLIGHTS</Text>
        </View>
      </View>

      <View style={styles.feedList}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => item.actionRoute && router.push(item.actionRoute as any)}
            style={styles.feedCard}
            activeOpacity={0.88}
          >
            <View style={styles.cardTopRow}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{item.tag}</Text>
              </View>
              <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
            </View>

            <Text style={styles.titleText}>{item.title}</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>

            <View style={styles.cardFooter}>
              <View style={styles.socialStats}>
                <View style={styles.statItem}>
                  <Sparkles size={13} color={Colors.textTertiary} />
                  <Text style={styles.statText}>{item.likes} highlights</Text>
                </View>
                <View style={styles.statItem}>
                  <MessageSquare size={13} color={Colors.textTertiary} />
                  <Text style={styles.statText}>{item.comments} comments</Text>
                </View>
              </View>

              {item.actionRoute && (
                <Text style={styles.viewMoreText}>View details →</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.huge,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
  },
  feedList: {
    gap: Spacing.md,
  },
  feedCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  tagBadge: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  tagText: {
    color: Colors.green,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
  timeAgoText: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.bodyBold,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  descriptionText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  socialStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
  },
  viewMoreText: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
});
