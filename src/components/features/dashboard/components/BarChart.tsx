import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

import { useThemeColor } from "@/src/hooks/useThemeColor";

interface ChartData {
  deposits: number;
  withdrawals: number;
}

interface BarChartProps {
  data: ChartData[];
  labels: string[];
  selectedBar: string | null;
  onBarSelect: (barId: string | null) => void;
}

export function BarChart({
  data,
  labels,
  selectedBar,
  onBarSelect,
}: BarChartProps) {
  const textColor = useThemeColor({}, "text");

  const depositsHeight = useSharedValue(35);
  const withdrawalsHeight = useSharedValue(35);

  const depositsBarStyle = useAnimatedStyle(() => {
    return {
      height: depositsHeight.value,
    };
  });

  const withdrawalsBarStyle = useAnimatedStyle(() => {
    return {
      height: withdrawalsHeight.value,
    };
  });

  useEffect(() => {
    if (data.length > 0) {
      const timeoutId = setTimeout(() => {
        const maxValue = Math.max(
          ...data.map((item) => Math.max(item.deposits, item.withdrawals)),
          1
        );

        const firstData = data[0];

        const newDepositsHeight =
          firstData.deposits === 0
            ? 35
            : Math.max((firstData.deposits / maxValue) * 150 + 35, 35);

        const newWithdrawalsHeight =
          firstData.withdrawals === 0
            ? 35
            : Math.max((firstData.withdrawals / maxValue) * 150 + 35, 35);

        depositsHeight.value = withDelay(
          200,
          withTiming(newDepositsHeight, { duration: 1000 })
        );
        withdrawalsHeight.value = withDelay(
          350,
          withTiming(newWithdrawalsHeight, { duration: 1000 })
        );
      }, 200);

      return () => clearTimeout(timeoutId);
    }
  }, [data, depositsHeight, withdrawalsHeight]);

  return (
    <View style={styles.chartWrapper}>
      <TouchableOpacity
        style={styles.tempChart}
        activeOpacity={1}
        onPress={() => onBarSelect(null)}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.tempBar}>
            <Text style={[styles.tempLabel, { color: textColor }]}>
              {labels[index]}
            </Text>

            <View style={styles.valuesContainer}>
              {selectedBar === `${index}-deposits` && (
                <View>
                  <Text style={[styles.valueDisplay]}>
                    +R$ {item.deposits.toLocaleString("pt-BR")}
                  </Text>
                </View>
              )}
              {selectedBar === `${index}-withdrawals` && (
                <View>
                  <Text style={[styles.valueDisplay]}>
                    -R$ {item.withdrawals.toLocaleString("pt-BR")}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.tempBarContainer}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => {
                  e.stopPropagation();
                  const barId = `${index}-deposits`;
                  onBarSelect(selectedBar === barId ? null : barId);
                }}
              >
                <Animated.View
                  style={[
                    styles.tempBarItem,
                    depositsBarStyle,
                    {
                      backgroundColor:
                        selectedBar === `${index}-deposits`
                          ? "#27a8ff"
                          : "#5cbdff",
                    },
                  ]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => {
                  e.stopPropagation();
                  const barId = `${index}-withdrawals`;
                  onBarSelect(selectedBar === barId ? null : barId);
                }}
              >
                <Animated.View
                  style={[
                    styles.tempBarItem,
                    withdrawalsBarStyle,
                    {
                      backgroundColor:
                        selectedBar === `${index}-withdrawals`
                          ? "#ff7800"
                          : "#f6ac6a",
                    },
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    width: "100%",
  },
  tempChart: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 200,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  tempBar: {
    alignItems: "center",
    minWidth: 80,
    marginHorizontal: 8,
  },
  valuesContainer: {
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  valueDisplay: {
    fontSize: 12,
    color: "#0009",
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tempLabel: {
    fontSize: 12,
    marginBottom: 12,
    fontWeight: "500",
  },
  tempBarContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  tempBarItem: {
    width: 18,
    borderRadius: 3,
    minHeight: 35,
  },
});

