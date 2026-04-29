
import React, { useState } from 'react';
import { FlatList, View, Text, StyleSheet, TextInput, Alert, Pressable } from 'react-native';
import { formatPesoAR, updateMovement, deleteMovement } from '../utils/api';

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
  onDataChange?: () => void;
}

const TransactionList: React.FC<Props> = ({ transactions: initialTransactions, onDataChange }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  // Sincronizar cuando el padre cambie las props
  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);
    const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [loading, setLoading] = useState(false);

  const startEdit = (item: Transaction) => {
    setEditingId(item.id);
    setEditCategory(item.category);
    setEditAmount(item.amount.toString());
    setEditType(item.type);
  };

    const saveEdit = async (id: string) => {
    setLoading(true);
    try {
      // Actualizar localmente para feedback inmediato
      setTransactions(prev =>
        prev.map(t =>
          t.id === id
            ? { ...t, category: editCategory, amount: Number(editAmount), type: editType }
            : t
        )
      );
      await updateMovement(id, { category_id: editCategory, amount: Number(editAmount), type: editType });
      setEditingId(null);
    } catch (e) {
      // Revertir y recargar desde backend si falla
      Alert.alert('Error', 'No se pudo editar el movimiento');
      onDataChange?.();
    }
    setLoading(false);
  };

                const handleDelete = async (id: string) => {
    console.log('[TransactionList] handleDelete llamado con id:', id);
    try {
      const result = await deleteMovement(id);
      console.log('[TransactionList] delete exitoso:', result);
      setTransactions(prev => {
        const filtered = prev.filter(t => t.id !== id);
        console.log('[TransactionList] items antes:', prev.length, 'después:', filtered.length);
        return filtered;
      });
      onDataChange?.();
    } catch (e: any) {
      console.error('[TransactionList] error al eliminar:', e.message);
      Alert.alert('Error', 'No se pudo eliminar el movimiento: ' + (e.message || ''));
    }
  };

  return (
    <View>
      <FlatList
        data={transactions || []}
        keyExtractor={item => item.id}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.item, item.type === 'income' ? styles.income : styles.expense, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
            {editingId === item.id ? (
              <>
                <TextInput
                  value={editCategory}
                  onChangeText={setEditCategory}
                  style={{ fontSize: 12, borderBottomWidth: 1, minWidth: 40, marginRight: 4, flex: 2 }}
                  editable={!loading}
                />
                <TextInput
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="numeric"
                  style={{ fontSize: 12, borderBottomWidth: 1, width: 70, textAlign: 'right', marginRight: 8 }}
                  editable={!loading}
                />
                <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                                    <Pressable onPress={() => saveEdit(item.id)} disabled={loading} style={({ pressed }) => [{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: pressed ? '#c0ffc0' : '#e0ffe0', borderRadius: 4, marginRight: 4 }]}>
                    <Text style={{ fontSize: 11, color: '#080', fontWeight: 'bold' }}>Guardar</Text>
                  </Pressable>
                  <Pressable onPress={() => setEditingId(null)} disabled={loading} style={({ pressed }) => [{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: pressed ? '#ffc0c0' : '#ffeaea', borderRadius: 4, marginRight: 4 }]}>
                    <Text style={{ fontSize: 11, color: '#c00', fontWeight: 'bold' }}>Cancelar</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.itemText, { fontWeight: 'bold', fontSize: 12, color: '#333', marginRight: 6, flex: 2 }]}>{item.category}</Text>
                <Text style={[styles.itemText, { fontWeight: 'bold', fontSize: 12, color: item.type === 'income' ? '#080' : '#c00', width: 70, textAlign: 'right', marginRight: 8 }]}> {item.type === 'income' ? '+' : '-'}{formatPesoAR(item.amount)}</Text>
                <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                                    <Pressable onPress={() => startEdit(item)} disabled={loading} style={({ pressed }) => [{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: pressed ? '#c0dfff' : '#e0f0ff', borderRadius: 4, marginRight: 4 }]}>
                    <Text style={{ fontSize: 11, color: '#0074d9', fontWeight: 'bold' }}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(item.id)} disabled={loading} style={({ pressed }) => [{ paddingHorizontal: 6, paddingVertical: 2, backgroundColor: pressed ? '#ffc0c0' : '#ffeaea', borderRadius: 4, marginLeft: 4 }]}>
                    <Text style={{ fontSize: 11, color: '#c00', fontWeight: 'bold' }}>Eliminar</Text>
                  </Pressable>
                </View>
              </>
            )}
            <Text style={[styles.date, { fontSize: 9, marginLeft: 8 }]}>{new Date(item.date).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 10, fontSize: 12 }}>Sin movimientos</Text>}
        contentContainerStyle={{ paddingBottom: 4 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginBottom: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  income: {
    backgroundColor: '#f3fff3',
    borderLeftWidth: 4,
    borderLeftColor: '#7be87b',
  },
  expense: {
    backgroundColor: '#fff5f5',
    borderLeftWidth: 4,
    borderLeftColor: '#ffb3b3',
  },
  itemText: {
    fontSize: 11,
  },
  date: {
    fontSize: 8,
    color: '#888',
    marginLeft: 3,
  },
});

export default TransactionList;
