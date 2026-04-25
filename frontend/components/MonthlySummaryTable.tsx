import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button } from 'react-native';

interface Row {
  cat: string;
  amt: number;
  type: 'income' | 'expense';
}

interface MonthlySummaryTableProps {
  monthName: string;
  year: string;
  rows: Row[];
}

const MonthlySummaryTable: React.FC<MonthlySummaryTableProps> = ({ monthName, year, rows: initialRows }) => {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editCat, setEditCat] = useState('');
  const [editAmt, setEditAmt] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [adding, setAdding] = useState(false);

  const saveEdit = (idx: number) => {
    setRows(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      return { ...row, cat: editCat || row.cat, amt: editAmt ? Number(editAmt) : row.amt };
    }));
    setEditingIdx(null);
    setEditCat('');
    setEditAmt('');
  };

  const handleAddRow = () => {
    if (!editCat || !editAmt) return;
    setRows(prev => [...prev, { cat: editCat, amt: Number(editAmt), type: editType }]);
    setEditCat('');
    setEditAmt('');
    setAdding(false);
  };

  const expenses = rows.filter(r => r.type === 'expense');
  const incomes = rows.filter(r => r.type === 'income');

  return (
    <View style={{ marginBottom: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 8 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</Text>
      <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, overflow: 'hidden' }}>
        {/* Gastos */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#ffeaea', padding: 4 }}>Gastos</Text>
          {expenses.map((row, idx) => (
            <View key={row.cat + idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' }}>
              {editingIdx === idx && row.type === 'expense' ? (
                <>
                  <TextInput
                    value={editCat}
                    onChangeText={setEditCat}
                    autoFocus
                    onBlur={() => saveEdit(idx)}
                    onSubmitEditing={() => saveEdit(idx)}
                    style={{ fontSize: 15, borderBottomWidth: 1, minWidth: 60 }}
                  />
                  <TextInput
                    value={editAmt}
                    onChangeText={setEditAmt}
                    keyboardType="numeric"
                    style={{ fontSize: 15, borderBottomWidth: 1, minWidth: 60, textAlign: 'right' }}
                  />
                  <Button title="Guardar" onPress={() => saveEdit(idx)} />
                </>
              ) : (
                <TouchableOpacity onPress={() => { setEditingIdx(idx); setEditCat(row.cat); setEditAmt(row.amt.toString()); }}>
                  <Text style={{ fontSize: 15 }}>{row.cat}</Text>
                  <Text style={{ fontSize: 15, fontWeight: 'bold' }}>${row.amt.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
        {/* Ingresos */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', textAlign: 'center', backgroundColor: '#eaffea', padding: 4 }}>Ganancias</Text>
          {incomes.map((row, idx) => (
            <View key={row.cat + idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' }}>
              {editingIdx === idx && row.type === 'income' ? (
                <>
                  <TextInput
                    value={editCat}
                    onChangeText={setEditCat}
                    autoFocus
                    onBlur={() => saveEdit(idx)}
                    onSubmitEditing={() => saveEdit(idx)}
                    style={{ fontSize: 15, borderBottomWidth: 1, minWidth: 60 }}
                  />
                  <TextInput
                    value={editAmt}
                    onChangeText={setEditAmt}
                    keyboardType="numeric"
                    style={{ fontSize: 15, borderBottomWidth: 1, minWidth: 60, textAlign: 'right' }}
                  />
                  <Button title="Guardar" onPress={() => saveEdit(idx)} />
                </>
              ) : (
                <TouchableOpacity onPress={() => { setEditingIdx(idx); setEditCat(row.cat); setEditAmt(row.amt.toString()); }}>
                  <Text style={{ fontSize: 15 }}>{row.cat}</Text>
                  <Text style={{ fontSize: 15, fontWeight: 'bold' }}>${row.amt.toLocaleString()}</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </View>
      {/* Agregar nueva fila */}
      {adding ? (
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TextInput
            placeholder="Categoría"
            value={editCat}
            onChangeText={setEditCat}
            style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 4, padding: 4 }}
          />
          <TextInput
            placeholder="Monto"
            value={editAmt}
            onChangeText={setEditAmt}
            keyboardType="numeric"
            style={{ width: 80, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 4, padding: 4, textAlign: 'right' }}
          />
          <Button title="Gasto" onPress={() => { setEditType('expense'); handleAddRow(); }} />
          <Button title="Ingreso" onPress={() => { setEditType('income'); handleAddRow(); }} />
          <Button title="Cancelar" onPress={() => { setAdding(false); setEditCat(''); setEditAmt(''); }} />
        </View>
      ) : (
        <Button title="Agregar fila" onPress={() => setAdding(true)} />
      )}
    </View>
  );
};

export default MonthlySummaryTable;
