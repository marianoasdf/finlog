import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

type TransactionType = 'income' | 'expense';
interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: Date;
}

interface Props {
  transactions: Transaction[];
}

const TransactionList: React.FC<Props> = ({ transactions }) => (
  <FlatList
    data={transactions}
    keyExtractor={item => item.id}
    style={styles.list}
    renderItem={({ item }) => (
      <View style={[styles.item, item.type === 'income' ? styles.income : styles.expense]}>
        <Text style={styles.itemText}>{item.category}</Text>
        <Text style={styles.itemText}>{item.type === 'income' ? '+' : '-'}${item.amount.toLocaleString()}</Text>
        <Text style={styles.date}>{item.date.toLocaleString()}</Text>
      </View>
    )}
    ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>Sin movimientos</Text>}
  />
);

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  income: {
    backgroundColor: '#e0ffe0',
  },
  expense: {
    backgroundColor: '#ffe0e0',
  },
  itemText: {
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
});

export default TransactionList;
