import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types';

const PRIORITY_COLORS: Record<Priority, string> = {
  1: '#B71C1C', // critical - deep red
  2: '#E65100', // critical - deep orange
  3: '#F9A825', // amber
  4: '#558B2F', // green
  5: '#2E7D32', // deep green
};

interface Props {
  priority: Priority;
  selected?: boolean;
  small?: boolean;
}

export default function PriorityBadge({ priority, selected, small }: Props) {
  const color = PRIORITY_COLORS[priority];
  const isCritical = priority <= 2;

  return (
    <View
      style={[
        styles.badge,
        small && styles.badgeSmall,
        {
          backgroundColor: selected ? color : '#EEEEEE',
          borderColor: color,
        },
        isCritical && selected && styles.criticalGlow,
      ]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {priority}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  badgeSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 0,
  },
  criticalGlow: {
    shadowColor: '#B71C1C',
    shadowOpacity: 0.9,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 5,
  },
  text: {
    fontWeight: '700',
    color: '#333333',
  },
  textSelected: {
    color: '#FFFFFF',
  },
});