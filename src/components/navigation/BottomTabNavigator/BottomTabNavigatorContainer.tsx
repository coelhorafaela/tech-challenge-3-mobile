import { useState } from 'react';

import { BottomTabNavigator } from './index';
import type { TabItem } from './types';

const DEFAULT_TABS: Omit<TabItem, 'isActive' | 'onPress'>[] = [
  {
    id: 'home',
    label: 'Início',
    icon: 'home',
  },
  {
    id: 'statement',
    label: 'Extrato',
    icon: 'document-text',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'analytics',
  },
];

export function BottomTabNavigatorContainer() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <BottomTabNavigator
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={DEFAULT_TABS}
    />
  );
}

