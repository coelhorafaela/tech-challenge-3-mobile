import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { DisplayCard } from '../utils/cardUtils';

interface CardCarouselProps {
  cards: DisplayCard[];
  activeIndex: number;
  cardWidth: number;
  onScroll: (event: any) => void;
}

export function CardCarousel({
  cards,
  activeIndex,
  cardWidth,
  onScroll,
}: CardCarouselProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={16}
        pagingEnabled
        decelerationRate="fast"
      >
        {cards.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.card,
              {
                width: cardWidth,
                marginRight: index < cards.length - 1 ? 40 : 0,
              },
            ]}
          >
            <View style={styles.cardBackground} />
            <View style={styles.cardOverlay} />

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.helperLabel}>{item.helperLabel}</Text>
                <View style={styles.brandContainer}>
                  <Text style={styles.brandLabel}>{item.brandLabel}</Text>
                  <Text style={styles.typeLabel}>{item.typeLabel}</Text>
                </View>
              </View>

              <View style={styles.chipContainer}>
                <View style={styles.chip}>
                  <View style={styles.chipInner} />
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.maskedNumber}>{item.maskedNumber}</Text>
                <Text style={styles.brandName}>{item.brandLabel.toUpperCase()}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.indicators}>
        {cards.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.indicator,
              index === activeIndex && styles.indicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    height: 200,
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#294FC1',
    transform: [{ rotate: '45deg' }],
    width: '200%',
    height: '200%',
    marginLeft: '-50%',
    marginTop: '-50%',
  },
  cardContent: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  helperLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  brandContainer: {
    alignItems: 'flex-end',
  },
  brandLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  typeLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
  },
  chipContainer: {
    alignItems: 'flex-start',
  },
  chip: {
    width: 40,
    height: 30,
    backgroundColor: '#9ca3af',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: 32,
    height: 24,
    backgroundColor: '#6b7280',
    borderRadius: 2,
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  maskedNumber: {
    fontSize: 14,
    color: 'white',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  indicatorActive: {
    backgroundColor: '#294FC1',
  },
});

