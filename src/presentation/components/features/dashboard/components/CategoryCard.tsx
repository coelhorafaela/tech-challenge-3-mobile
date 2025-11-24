import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useThemeColor } from "@/src/hooks";

import { CategoryList } from "./CategoryList";
import { PieChartView } from "./PieChartView";

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface PieChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface CategoryCardProps {
  title: string;
  loading: boolean;
  error: string | null;
  categoryData: CategoryItem[];
  pieChartData: PieChartData[];
  onRetry: () => void;
}

export function CategoryCard({
  title,
  loading,
  error,
  categoryData,
  pieChartData,
  onRetry,
}: CategoryCardProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.card}>
      <Text style={[styles.categoryCardTitle, { color: textColor }]}>
        {title}
      </Text>
      <View style={styles.categoryContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColor} />
            <Text style={[styles.loadingText, { color: textColor }]}>
              Carregando categorias...
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
        ) : categoryData.length > 0 ? (
          <View style={styles.categoryContent}>
            <PieChartView data={pieChartData} />
            <CategoryList categories={categoryData} />
          </View>
        ) : (
          <View style={styles.chartPlaceholder}>
            <Text style={[styles.placeholderText, { color: textColor }]}>
              Nenhum gasto encontrado para este mês
            </Text>
          </View>
        )}
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
  categoryCardTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  categoryContainer: {
    alignItems: "center",
  },
  categoryContent: {
    width: "100%",
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

