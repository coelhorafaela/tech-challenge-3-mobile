import { useThemeColor } from "@/src/hooks/useThemeColor";
import { useYearlyTransactions } from "@/src/hooks/useTransactions";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { CategoryCard } from "./components/CategoryCard";
import { ChartCard } from "./components/ChartCard";
import { MonthSelector, type MonthOption } from "./components/MonthSelector";

export function Dashboard() {
  const textColor = useThemeColor({}, "text");
  const currentYear = new Date().getFullYear();

  const generateLast12Months = (): MonthOption[] => {
    const months: MonthOption[] = [];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`,
        label: date.toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
        shortLabel: date.toLocaleDateString("pt-BR", {
          month: "short",
          year: "numeric",
        }),
      });
    }

    return months;
  };

  const [availableMonths] = useState<MonthOption[]>(() =>
    generateLast12Months()
  );
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const {
    loading,
    error,
    refetch,
    processYearlyDataForChart,
    processMonthlyCategoryData,
  } = useYearlyTransactions(currentYear);
  const { chartData, labels } = processYearlyDataForChart(selectedMonth);
  const categoryData = processMonthlyCategoryData(selectedMonth);

  const pieChartData = categoryData.map((item) => ({
    name: "",
    population: item.amount,
    color: item.color,
    legendFontColor: textColor || "#000",
    legendFontSize: 12,
  }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>
          Análise mensal
        </Text>

        <MonthSelector
          months={availableMonths}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </View>
      <View style={styles.chartsContainer}>
        <ChartCard
          title="Entradas e saídas"
          loading={loading}
          error={error}
          chartData={chartData}
          labels={labels}
          onRetry={refetch}
        />

        <CategoryCard
          title="Gastos por categoria"
          loading={loading}
          error={error}
          categoryData={categoryData}
          pieChartData={pieChartData}
          onRetry={refetch}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  chartsContainer: {
    gap: 15,
    marginBottom: 20,
  },
});
