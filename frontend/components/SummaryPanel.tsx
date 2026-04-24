import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const SummaryPanel: React.FC<Props> = ({ totalIncome, totalExpense, balance }) => (
  <View style={styles.summary}>
    <Text style={styles.summaryText}>Ganado: ${totalIncome.toLocaleString()}</Text>
    <Text style={styles.summaryText}>Gastado: ${totalExpense.toLocaleString()}</Text>
    <Text style={[styles.summaryText, { fontWeight: 'bold' }]}>Balance: ${balance.toLocaleString()}</Text>
  </View>
);

const styles = StyleSheet.create({
  summary: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 18,
    marginBottom: 4,
  },
});

export default SummaryPanel;
