import { BottomTabNavigator } from "@/src/components/navigation";
import { useState } from "react";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    {
      id: "home",
      label: "Início",
      icon: "home",
    },
    {
      id: "statement",
      label: "Extrato",
      icon: "document-text",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "analytics",
    },
  ];

  return (
    <BottomTabNavigator
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={tabs}
    />
  );
}

