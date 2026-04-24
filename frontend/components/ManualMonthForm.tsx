import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

interface ManualMonthFormProps {
  manualYear: string;
  setManualYear: (v: string) => void;
  manualMonth: string;
  setManualMonth: (v: string) => void;
  manualCats: { cat: string; amt: string }[];
  setManualCats: (fn: (prev: { cat: string; amt: string }[]) => { cat: string; amt: string }[]) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ManualMonthForm: React.FC<ManualMonthFormProps> = ({ manualYear, setManualYear, manualMonth, setManualMonth, manualCats, setManualCats, onSave, onCancel }) => (
  <View style={{ backgroundColor: '#f2f2f2', borderRadius: 8, padding: 12, marginHorizontal: 8, marginBottom: 24 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Nuevo mes histórico</Text>
    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
      <Text>Año: </Text>
      <TextInput
        value={manualYear}
        onChangeText={setManualYear}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 60, marginRight: 12 }}
        maxLength={4}
      />
      <Text>Mes: </Text>
      <TextInput
        value={manualMonth}
        onChangeText={text => setManualMonth(text.padStart(2, '0'))}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 40 }}
        maxLength={2}
      />
    </View>
    <Text style={{ marginBottom: 4 }}>Categorías y montos:</Text>
    {manualCats.map((row, idx) => (
      <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <TextInput
          value={row.cat}
          onChangeText={text => setManualCats(cats => cats.map((r, i) => i === idx ? { ...r, cat: text } : r))}
          placeholder="Categoría"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 100, marginRight: 8 }}
        />
        <TextInput
          value={row.amt}
          onChangeText={text => setManualCats(cats => cats.map((r, i) => i === idx ? { ...r, amt: text.replace(/[^0-9]/g, '') } : r))}
          placeholder="$"
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 80, marginRight: 8, textAlign: 'right' }}
        />
        <Button title="-" onPress={() => setManualCats(cats => cats.length > 1 ? cats.filter((_, i) => i !== idx) : cats)} />
      </View>
    ))}
    <Button title="Agregar fila" onPress={() => setManualCats(cats => [...cats, { cat: '', amt: '' }])} />
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
      <Button title="Cancelar" onPress={onCancel} />
      <View style={{ width: 8 }} />
      <Button title="Guardar mes" onPress={onSave} />
    </View>
  </View>
);

export default ManualMonthForm;
