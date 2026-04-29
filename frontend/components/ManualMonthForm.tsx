import React from 'react';
import { View, Text, TextInput, Button, TouchableOpacity } from 'react-native';

interface ManualMonthFormProps {
  manualYear: string;
  setManualYear: (v: string) => void;
  manualMonth: string;
  setManualMonth: (v: string) => void;
  manualCats: { cat: string; amt: string; type: 'income' | 'expense' }[];
  setManualCats: (fn: (prev: { cat: string; amt: string; type: 'income' | 'expense' }[]) => { cat: string; amt: string; type: 'income' | 'expense' }[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ManualMonthForm: React.FC<ManualMonthFormProps> = ({ manualYear, setManualYear, manualMonth, setManualMonth, manualCats, setManualCats, onSave, onCancel }) => (
  <View style={{ backgroundColor: '#f2f2f2', borderRadius: 8, padding: 12, marginHorizontal: 8, marginBottom: 24 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>Nuevo mes histórico</Text>
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        <Text>Año: </Text>
        <TextInput
          value={manualYear}
          onChangeText={setManualYear}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 2, width: 40, marginRight: 6 }}
          maxLength={4}
        />
        <Text>Mes: </Text>
        <TextInput
          value={manualMonth}
          onChangeText={text => setManualMonth(text.padStart(2, '0'))}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 2, width: 28 }}
          maxLength={2}
        />
    </View>
    <Text style={{ marginBottom: 4 }}>Categorías, montos y tipo:</Text>
    {manualCats.map((row, idx) => (
      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <TextInput
          value={row.cat}
          onChangeText={text => setManualCats(cats => cats.map((r, i) => i === idx ? { ...r, cat: text } : r))}
          placeholder="Categoría"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingVertical: 1, paddingHorizontal: 2, width: 60, marginRight: 4, fontSize: 12, height: 24 }}
        />
        <TextInput
          value={row.amt}
          onChangeText={text => setManualCats(cats => cats.map((r, i) => i === idx ? { ...r, amt: text.replace(/[^0-9]/g, '') } : r))}
          placeholder="$"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingVertical: 1, paddingHorizontal: 2, width: 40, marginRight: 4, textAlign: 'right', fontSize: 12, height: 24 }}
        />
        <TouchableOpacity
          style={{ backgroundColor: row.type === 'expense' ? '#ffeaea' : '#fff', borderRadius: 4, padding: 4, marginRight: 4 }}
          onPress={() => setManualCats(cats => cats.map((r, i) => i === idx ? { ...r, type: 'expense' } : r))}
        >
          <Text style={{ color: row.type === 'expense' ? '#c00' : '#888', fontSize: 11 }}>Gasto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ backgroundColor: row.type === 'income' ? '#eaffea' : '#fff', borderRadius: 4, padding: 4, marginRight: 8 }}
          onPress={() => setManualCats(cats => cats.map((r, i) => i === idx ? { ...r, type: 'income' } : r))}
        >
          <Text style={{ color: row.type === 'income' ? '#080' : '#888', fontSize: 11 }}>Ingreso</Text>
        </TouchableOpacity>
        <Button title="-" onPress={() => setManualCats(cats => cats.length > 1 ? cats.filter((_, i) => i !== idx) : cats)} />
      </View>
    ))}
    <Button title="Agregar fila" onPress={() => setManualCats(cats => [...cats, { cat: '', amt: '', type: 'expense' }])} />
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 }}>
      <Button title="Cancelar" onPress={onCancel} />
      <View style={{ width: 4 }} />
      <Button title="Guardar mes" onPress={onSave} />
    </View>
  </View>
);

export default ManualMonthForm;
