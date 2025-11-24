import { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;
const chartWidth = screenWidth - 120;

interface PieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface PieChartViewProps {
  data: PieChartData[];
}

export function PieChartView({ data }: PieChartViewProps) {
  const pieChartScale = useSharedValue(0);

  const pieChartAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pieChartScale.value }],
      opacity: pieChartScale.value,
    };
  });

  useEffect(() => {
    if (data.length > 0) {
      pieChartScale.value = withDelay(500, withTiming(1, { duration: 800 }));
    } else {
      pieChartScale.value = 0;
    }
  }, [data, pieChartScale]);

  const dynamicPaddingLeft = (screenWidth - chartWidth) / 2 + 20;

  return (
    <Animated.View style={[styles.pieChartWrapper, pieChartAnimatedStyle]}>
      <PieChart
        data={data}
        width={chartWidth}
        height={180}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft={dynamicPaddingLeft.toString()}
        center={[0, 0]}
        absolute
        hasLegend={false}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pieChartWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "auto",
  },
});

