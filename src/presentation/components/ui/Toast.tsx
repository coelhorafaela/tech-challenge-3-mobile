import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { TOAST_ANIMATION } from '@/src/constants';

interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
  onHide: () => void;
  duration?: number;
}

export default function Toast({ 
  visible, 
  message, 
  type, 
  onHide, 
  duration = 3000 
}: ToastProps) {
  const translateY = useRef(
    new Animated.Value(TOAST_ANIMATION.INITIAL_TRANSLATE_Y)
  ).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: TOAST_ANIMATION.INITIAL_TRANSLATE_Y,
        duration: TOAST_ANIMATION.DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: TOAST_ANIMATION.DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  }, [onHide, opacity, translateY]);

  useEffect(() => {
    if (visible) {
      // Animação de entrada
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: TOAST_ANIMATION.DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: TOAST_ANIMATION.DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide após duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, hideToast, opacity, translateY]);

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: 'checkmark-circle-outline' as const,
          iconColor: '#fff',
        };
      case 'error':
        return {
          backgroundColor: '#F44336',
          icon: 'close-circle-outline' as const,
          iconColor: '#fff',
        };
      case 'info':
        return {
          backgroundColor: '#2196F3',
          icon: 'information-circle-outline' as const,
          iconColor: '#fff',
        };
      default:
        return {
          backgroundColor: '#333',
          icon: 'information-circle-outline' as const,
          iconColor: '#fff',
        };
    }
  };

  const config = getToastConfig();

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        zIndex: 10000,
        elevation: 10,
        transform: [{ translateY }],
        opacity,
      }}
      pointerEvents="box-none"
    >
      <View
        style={[
          styles.toastContainer,
          { backgroundColor: config.backgroundColor }
        ]}
      >
        <Ionicons 
          name={config.icon} 
          size={24} 
          color={config.iconColor} 
        />
        <Text 
          style={[
            styles.toastText,
            { color: config.iconColor }
          ]}
        >
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
  },
});

