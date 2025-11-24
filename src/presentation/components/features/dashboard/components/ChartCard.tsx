import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useThemeColor } from "@/src/hooks";

import { BarChart } from "./BarChart";

interface ChartData {
  deposits: number;
  withdrawals: number;
}

interface ChartCardProps {
  title: string;
  loading: boolean;
  error: string | null;
  chartData: ChartData[];
  labels: string[];
  onRetry: () => void;
}

export function ChartCard({
  title,
  loading,
  error,
  chartData,
  labels,
  onRetry,
}: ChartCardProps) {
  const textColor = useThemeColor({}, "text");
  const [selectedBar, setSelectedBar] = useState<string | null>(null);

  return (
    <View style={styles.card}>
      <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.chartContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Carregando transações...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: "#ff6b6b" }]}>
              {error}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={[styles.retryButtonText, { color: textColor }]}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        ) : chartData.length > 0 ? (
          <BarChart
            data={chartData}
            labels={labels}
            selectedBar={selectedBar}
            onBarSelect={setSelectedBar}
          />
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={[styles.placeholderText, { color: textColor }]}>
              Nenhuma transação encontrada para este mês
            </Text>
          </View>
        )}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#27a8ff" }]}
            />
            <Text style={[styles.legendText, { color: textColor }]}>
              Entrada
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: "#ff7800" }]}
            />
            <Text style={[styles.legendText, { color: textColor }]}>
              Saída
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 70,
    textAlign: "center",
  },
  chartContainer: {
    alignItems: "center",
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    borderStyle: "dashed",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "500",
  },
  placeholderText: {
    fontSize: 14,
    opacity: 0.6,
  },
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.8,
  },
  errorContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

