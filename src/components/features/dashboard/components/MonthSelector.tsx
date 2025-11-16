import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useThemeColor } from "@/src/hooks/useThemeColor";

export interface MonthOption {
  value: string;
  label: string;
  shortLabel: string;
}

interface MonthSelectorProps {
  months: MonthOption[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthSelector({
  months,
  selectedMonth,
  onMonthChange,
}: MonthSelectorProps) {
  const textColor = useThemeColor({}, "text");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const currentMonthIndex = months.findIndex(
      (month) => month.value === selectedMonth
    );
    if (currentMonthIndex !== -1 && scrollViewRef.current) {
      const reversedIndex = months.length - 1 - currentMonthIndex;
      const buttonWidth = 80 + 32 + 8;
      const scrollPosition = Math.max(0, reversedIndex * buttonWidth - 40);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
      }, 100);
    }
  }, [months, selectedMonth]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthSelector}
      >
        {months
          .slice()
          .reverse()
          .map((month) => (
            <TouchableOpacity
              key={month.value}
              style={[
                styles.monthButton,
                selectedMonth === month.value && styles.monthButtonActive,
              ]}
              onPress={() => onMonthChange(month.value)}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  { color: textColor },
                  selectedMonth === month.value && styles.monthButtonTextActive,
                ]}
              >
                {month.shortLabel}
              </Text>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 20,
  },
  monthSelector: {
    paddingHorizontal: 10,
    gap: 8,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    minWidth: 80,
    alignItems: "center",
  },
  monthButtonActive: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.7,
  },
  monthButtonTextActive: {
    opacity: 1,
    fontWeight: "600",
  },
});

