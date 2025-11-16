import { StyleSheet, Text, View } from "react-native";

import { useThemeColor } from "@/src/hooks/useThemeColor";

interface CategoryItem {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CategoryListProps {
  categories: CategoryItem[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const textColor = useThemeColor({}, "text");

  return (
    <View style={styles.categoryList}>
      {categories.map((item) => (
        <View key={item.category} style={styles.categoryItem}>
          <View style={styles.categoryInfo}>
            <View
              style={[
                styles.categoryColor,
                { backgroundColor: item.color },
              ]}
            />
            <Text style={[styles.categoryName, { color: textColor }]}>
              {item.category}
            </Text>
          </View>
          <View style={styles.categoryAmountContainer}>
            <Text style={[styles.categoryAmount, { color: textColor }]}>
              R$ {item.amount.toLocaleString("pt-BR")}
            </Text>
            <Text
              style={[
                styles.categoryPercentage,
                { color: textColor },
              ]}
            >
              {item.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryList: {
    width: "100%",
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  categoryAmountContainer: {
    alignItems: "flex-end",
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: "500",
  },
});

