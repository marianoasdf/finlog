import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, Alert, StyleSheet } from 'react-native';
import { formatPesoAR, updateMovement, getOrCreateCategoryId, createMovement, deleteMovement } from '../utils/api';

interface Row {
  cat: string;
  amt: number;
  type: 'income' | 'expense';
  id?: string;
}

interface MonthlySummaryTableProps {
  monthName: string;
  year: string;
  rows: Row[];
  editable?: boolean;
  onDataChange?: () => void;
}

const MonthlySummaryTable: React.FC<MonthlySummaryTableProps> = ({ monthName, year, rows, editable, onDataChange }) => {
    const handleDelete = async (id: string) => {
      try {
        await deleteMovement(id);
        onDataChange?.();
      } catch {
        Alert.alert('Error', 'No se pudo eliminar el movimiento');
      }
    };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState('');
  const [editAmt, setEditAmt] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [adding, setAdding] = useState(false);

  React.useEffect(() => {
    if (editingId === null) return;
    const found = rows.find(r => r.id === editingId);
    if (!found) {
      setEditingId(null);
      setEditCat('');
      setEditAmt('');
    }
  }, [rows, editingId]);

  const saveEdit = async (idOrIdx: string | number) => {
    let row: Row | undefined;
    if (typeof idOrIdx === 'string') {
      row = rows.find(r => r.id === idOrIdx);
    } else {
      row = rows[idOrIdx];
    }
    if (!row) return;
    const newCat = editCat || row.cat;
    const newAmt = editAmt ? Number(editAmt) : row.amt;

    try {
      const category_id = await getOrCreateCategoryId(newCat);

      if (row && row.id) {
        await updateMovement(row.id, { amount: newAmt, category_id });
      } else {
        await createMovement({
          type: row.type,
          category_id,
          amount: newAmt,
          date: new Date().toISOString(),
        });
      }

      onDataChange?.();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el movimiento');
    }

    setEditingId(null);
    setEditCat('');
    setEditAmt('');
  };

  const handleAddRow = async () => {
    if (!editCat || !editAmt) return;

    try {
      const category_id = await getOrCreateCategoryId(editCat);
      await createMovement({
        type: editType,
        category_id,
        amount: Number(editAmt),
        date: new Date().toISOString(),
      });

      onDataChange?.();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el movimiento');
    }

    setEditCat('');
    setEditAmt('');
    setAdding(false);
  };

  // Generar una clave única para cada fila (usar id si existe, si no, usar cat+amt+type)
  const getRowKey = (row: Row, idx: number) => row.id || `${row.cat}-${row.amt}-${row.type}-${idx}`;

  const expenses = rows.filter(r => r.type === 'expense');
  const incomes = rows.filter(r => r.type === 'income');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}
      </Text>

      <View style={styles.table}>
        {/* GASTOS */}
        <View style={styles.column}>
          <Text style={[styles.header, styles.expenseHeader]}>Gastos</Text>

          {expenses.map((row, idx) => {
            const rowKey = getRowKey(row, idx);
            return (
              <View key={rowKey} style={styles.row}>
                {editingId === row.id ? (
                  <View style={styles.rowContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <TextInput
                        value={editCat}
                        onChangeText={setEditCat}
                        autoFocus
                        onSubmitEditing={() => saveEdit(row.id || idx)}
                        style={[styles.inputCat, { flex: 1 }]}
                      />
                      <TextInput
                        value={editAmt}
                        onChangeText={setEditAmt}
                        keyboardType="numeric"
                        onSubmitEditing={() => saveEdit(row.id || idx)}
                        style={[styles.inputAmt, { width: 90, textAlign: 'right', marginLeft: 0 }]}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                      <TouchableOpacity onPress={() => saveEdit(row.id || idx)} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingId(null); setEditCat(''); setEditAmt(''); }} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.rowContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={[styles.expenseText, { flex: 1 }]}>{row.cat}</Text>
                      <Text style={[styles.expenseText, { width: 90, textAlign: 'right' }]}>{formatPesoAR(row.amt)}</Text>
                    </View>
                                        {row.id && editable && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                        <TouchableOpacity onPress={() => {
                          setEditingId(row.id || null);
                          setEditCat(row.cat);
                          setEditAmt(String(row.amt));
                        }} style={styles.editBtn}>
                          <Text style={styles.editBtnText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(row.id!)} style={styles.deleteBtn}>
                          <Text style={styles.deleteBtnText}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* INGRESOS */}
        <View style={styles.column}>
          <Text style={[styles.header, styles.incomeHeader]}>Ingresos</Text>

          {incomes.map((row, idx) => {
            const rowKey = getRowKey(row, idx);
            return (
              <View key={rowKey} style={styles.row}>
                {editingId === row.id ? (
                  <View style={styles.rowContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <TextInput
                        value={editCat}
                        onChangeText={setEditCat}
                        autoFocus
                        onSubmitEditing={() => saveEdit(row.id || idx)}
                        style={[styles.inputCat, { flex: 1 }]}
                      />
                      <TextInput
                        value={editAmt}
                        onChangeText={setEditAmt}
                        keyboardType="numeric"
                        onSubmitEditing={() => saveEdit(row.id || idx)}
                        style={[styles.inputAmt, { width: 90, textAlign: 'right', marginLeft: 0 }]}
                      />
                    </View>
                    <View style={{ flexDirection: 'row', marginLeft: 8 }}>
                      <TouchableOpacity onPress={() => saveEdit(row.id || idx)} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingId(null); setEditCat(''); setEditAmt(''); }} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.rowContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Text style={[styles.incomeText, { flex: 1 }]}>{row.cat}</Text>
                      <Text style={[styles.incomeText, { width: 90, textAlign: 'right' }]}>{formatPesoAR(row.amt)}</Text>
                    </View>
                                        {row.id && editable && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                        <TouchableOpacity onPress={() => {
                          setEditingId(row.id || null);
                          setEditCat(row.cat);
                          setEditAmt(String(row.amt));
                        }} style={styles.editBtn}>
                          <Text style={styles.editBtnText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(row.id!)} style={styles.deleteBtn}>
                          <Text style={styles.deleteBtnText}>Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

            {/* AGREGAR - solo si editable */}
      {editable && adding ? (
        <View style={styles.addRow}>
          <TextInput placeholder="Categoría" value={editCat} onChangeText={setEditCat} style={styles.addInput} />
          <TextInput placeholder="Monto" value={editAmt} onChangeText={setEditAmt} keyboardType="numeric" style={styles.addInput} />
          <Button title="Gasto" onPress={() => { setEditType('expense'); handleAddRow(); }} />
          <Button title="Ingreso" onPress={() => { setEditType('income'); handleAddRow(); }} />
        </View>
            ) : editable && (
        <Button title="Agregar fila" onPress={() => setAdding(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, backgroundColor: '#fff', borderRadius: 8 },
  title: { textAlign: 'center', fontWeight: 'bold' },
  table: { flexDirection: 'row' },
  column: { flex: 1 },
  header: { textAlign: 'center', padding: 4, fontWeight: 'bold' },
  expenseHeader: { backgroundColor: '#ffeaea' },
  incomeHeader: { backgroundColor: '#eaffea' },
  row: { paddingVertical: 0, paddingHorizontal: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f3f3f3' },
  rowContent: { flexDirection: 'row', justifyContent: 'space-between' },
  expenseText: { color: '#c00' },
  incomeText: { color: '#080' },
  inputCat: { flex: 1, borderBottomWidth: 1 },
  inputAmt: { width: 70, borderBottomWidth: 1, textAlign: 'right' },
  saveBtn: { padding: 4, backgroundColor: '#e0ffe0', borderRadius: 4 },
  saveBtnText: { color: '#080' },
  editBtn: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#e0f0ff', borderRadius: 4, marginRight: 4 },
  editBtnText: { fontSize: 11, color: '#0074d9', fontWeight: 'bold' },
  deleteBtn: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#ffeaea', borderRadius: 4, marginLeft: 4 },
  deleteBtnText: { fontSize: 11, color: '#c00', fontWeight: 'bold' },
  addRow: { flexDirection: 'row', marginTop: 10 },
  addInput: { flex: 1, borderWidth: 1, marginRight: 4, padding: 4 },
  cancelBtn: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#ffeaea', borderRadius: 4, marginLeft: 4 },
  cancelBtnText: { fontSize: 11, color: '#c00', fontWeight: 'bold' }
});

export default MonthlySummaryTable;