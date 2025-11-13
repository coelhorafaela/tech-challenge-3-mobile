export interface TabItem {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

export interface BottomTabNavigatorProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Omit<TabItem, 'isActive' | 'onPress'>[];
}
