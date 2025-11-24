import { useThemeColor } from '@/src/hooks';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TabItem as TabItemType } from '../types';

interface TabItemProps {
  item: TabItemType;
}

export function TabItem({ item }: TabItemProps) {
  const { isActive, label, icon, onPress } = item;
  const activeColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'tabIconDefault');

  return (
    <TouchableOpacity
      style={[styles.tabItem, isActive && {}]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons 
          name={icon as any} 
          size={24} 
          color={isActive ? activeColor : inactiveColor} 
        />
      </View>
      <Text
        style={[
          styles.label,
          { color: isActive ? activeColor : inactiveColor }
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,  
    paddingBottom: 8,
    paddingHorizontal: 4,
    minHeight: 60,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

