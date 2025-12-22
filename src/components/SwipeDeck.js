import React, { useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Animated, PanResponder, Dimensions, StyleSheet, Text } from 'react-native';
import colors from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 200;

function SwipeDeckInner({ items, renderCard, onSwipeRight, onSwipeLeft, onSwipeUp, onLongPress }, ref) {
  const position = useRef(new Animated.ValueXY()).current;
  const [index, setIndex] = useState(0);
  const longPressTimeout = useRef(null);
  const moved = useRef(false);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const scale = position.y.interpolate({ inputRange: [-SCREEN_WIDTH, 0], outputRange: [1.05, 1], extrapolate: 'clamp' });

  const likeOpacity = position.x.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = position.x.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });
  const superOpacity = position.y.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (e, gesture) => Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
    onPanResponderMove: (e, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (e, gesture) => {
      if (gesture.dy < -SWIPE_THRESHOLD) {
        forceSwipe('up');
      } else if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  }), [position, items, index]);

  const forceSwipe = direction => {
    const x = direction === 'right' ? SCREEN_WIDTH : direction === 'left' ? -SCREEN_WIDTH : 0;
    const y = direction === 'up' ? -SCREEN_WIDTH : 0;
    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = direction => {
    const item = items[index];
    direction === 'right' && onSwipeRight && onSwipeRight(item);
    direction === 'left' && onSwipeLeft && onSwipeLeft(item);
    direction === 'up' && onSwipeUp && onSwipeUp(item);
    position.setValue({ x: 0, y: 0 });
    setIndex(prev => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  useImperativeHandle(ref, () => ({
    swipeRight: () => forceSwipe('right'),
    swipeLeft: () => forceSwipe('left'),
    swipeUp: () => forceSwipe('up'),
    reset: () => resetPosition(),
  }));

  const renderCards = () => {
    if (index >= items.length) return <View style={styles.noMore}><Text style={{color: '#999'}}>No more items</Text></View>;
    return items
      .map((item, i) => {
        if (i < index) return null;
        if (i === index) {
          return (
            <Animated.View
              key={i}
              style={[styles.cardTop, { transform: [{ rotate }, { scale }], ...position.getLayout() }]}
              {...panResponder.panHandlers}
            >
              <Animated.View style={[styles.label, styles.like, { opacity: likeOpacity }]}><Text style={styles.labelText}>LIKE</Text></Animated.View>
              <Animated.View style={[styles.label, styles.nope, { opacity: nopeOpacity }]}><Text style={styles.labelText}>NOPE</Text></Animated.View>
              <Animated.View style={[styles.label, styles.super, { opacity: superOpacity }]}><Text style={styles.labelText}>SUPERLIKE</Text></Animated.View>
              {renderCard(item)}
            </Animated.View>
          );
        }
        const depth = i - index;
        const s = 1 - Math.min(0.04 * depth, 0.12);
        return (
          <View key={i} style={[styles.card, { top: 10 * depth, transform: [{ scale: s }] }]}> 
            {renderCard(item)}
          </View>
        );
      })
      .reverse();
  };

  return <View style={styles.container}>{renderCards()}</View>;
}

export default forwardRef(SwipeDeckInner);

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardTop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  label: { position: 'absolute', top: 24, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 3, borderRadius: 8, backgroundColor: '#ffffffcc' },
  like: { left: 24, borderColor: colors.success },
  nope: { right: 24, borderColor: colors.danger },
  super: { alignSelf: 'center', borderColor: colors.primary },
  labelText: { fontSize: 18, fontWeight: '800' },
  noMore: { flex: 1 },
});
