
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatPesoAR } from '../utils/api';

interface Props {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const SummaryPanel: React.FC<Props> = ({ totalIncome, totalExpense, balance }) => (
  <View style={styles.summary}>
    <Text style={styles.summaryText}>Ganado: {formatPesoAR(totalIncome)}</Text>
    <Text style={styles.summaryText}>Gastado: {formatPesoAR(totalExpense)}</Text>
    <Text style={[styles.summaryText, { fontWeight: 'bold' }]}>Balance: $ {formatPesoAR(balance)}</Text>
  </View>
);

const styles = StyleSheet.create({
  summary: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 2,
  },
});

export default SummaryPanel;
