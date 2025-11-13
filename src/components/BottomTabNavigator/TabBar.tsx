import { useThemeColor } from "@/src/hooks/useThemeColor";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { TabItem } from "./TabItem";
import { TabItem as TabItemType } from "./types";

interface TabBarProps {
  tabs: TabItemType[];
  activeTab: string;
}

export function TabBar({ tabs, activeTab }: TabBarProps) {
  const { width } = useWindowDimensions();
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "icon");
  const activeColor = useThemeColor({}, "tint");

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = width / tabs.length;

    const centerPosition = activeIndex * tabWidth + tabWidth / 2;

    const translateX = centerPosition - 17.5;

    return {
      transform: [
        {
          translateX: withSpring(translateX, {
            damping: 20,
            stiffness: 150,
            mass: 0.8,
          }),
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, borderTopColor: borderColor },
      ]}
    >
      <Animated.View
        style={[
          styles.animatedIndicator,
          { backgroundColor: activeColor },
          animatedIndicatorStyle,
        ]}
      />

      {tabs.map((tab) => (
        <TabItem key={tab.id} item={tab} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
  },
  animatedIndicator: {
    position: "absolute",
    top: 0,
    width: 35,
    height: 3,
    borderRadius: 0,
    shadowColor: "#0a7ea4",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
