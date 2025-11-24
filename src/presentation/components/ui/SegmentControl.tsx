import { Text as RNText, TouchableOpacity, View } from "react-native";

interface SegmentOption {
  key: string;
  label: string;
}

interface SegmentControlProps {
  options: SegmentOption[];
  activeKey: string;
  onOptionChange: (key: string) => void;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
  inactiveTextColor?: string;
}

export function SegmentControl({
  options,
  activeKey,
  onOptionChange,
  activeColor = "#294FC1",
  inactiveColor = "#f3f4f6",
  textColor = "white",
  inactiveTextColor = "#6b7280",
}: SegmentControlProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: inactiveColor,
        borderRadius: 16,
        padding: 4,
      }}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={{
            flex: 1,
            height: 44,
            paddingHorizontal: 16,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              activeKey === option.key ? activeColor : "transparent",
          }}
          onPress={() => onOptionChange(option.key)}
        >
          <RNText
            style={{
              textAlign: "center",
              fontSize: 14,
              fontWeight: "500",
              lineHeight: 16,
              color: activeKey === option.key ? textColor : inactiveTextColor,
            }}
          >
            {option.label}
          </RNText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

