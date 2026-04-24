import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface MonthlySummaryTableProps {
  monthName: string;
  year: string;
  totals: Record<string, number>;
}

const MonthlySummaryTable: React.FC<MonthlySummaryTableProps> = ({ monthName, year, totals }) => {
  const [rows, setRows] = useState(Object.entries(totals));
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editCat, setEditCat] = useState('');
  const [editAmt, setEditAmt] = useState('');
  const [editField, setEditField] = useState<'cat' | 'amt' | null>(null);

  const saveEdit = (idx: number) => {
    setRows(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      return [editField === 'cat' ? editCat : row[0], editField === 'amt' ? Number(editAmt) : row[1]];
    }));
    setEditingIdx(null);
    setEditCat('');
    setEditAmt('');
    setEditField(null);
  };

  return (
    <View style={{ marginBottom: 16, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 8 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{monthName.charAt(0).toUpperCase() + monthName.slice(1)} {year}</Text>
      <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, overflow: 'hidden' }}>
        {rows.map(([cat, amt], idx) => (
          <View key={cat + idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' }}>
            {editingIdx === idx && editField === 'cat' ? (
              <TextInput
                value={editCat}
                onChangeText={setEditCat}
                autoFocus
                onBlur={() => saveEdit(idx)}
                onSubmitEditing={() => saveEdit(idx)}
                style={{ fontSize: 15, borderBottomWidth: 1, minWidth: 60 }}
              />
            ) : (
              <TouchableOpacity onPress={() => { setEditingIdx(idx); setEditCat(cat); setEditField('cat'); }}>
                <Text style={{ fontSize: 15 }}>{cat}</Text>
              </TouchableOpacity>
            )}
            {editingIdx === idx && editField === 'amt' ? (
              <TextInput
                value={editAmt}
                onChangeText={setEditAmt}
                autoFocus
                keyboardType="numeric"
                onBlur={() => saveEdit(idx)}
                onSubmitEditing={() => saveEdit(idx)}
                style={{ fontSize: 15, borderBottomWidth: 1, minWidth: 60, textAlign: 'right' }}
              />
            ) : (
              <TouchableOpacity onPress={() => { setEditingIdx(idx); setEditAmt(amt.toString()); setEditField('amt'); }}>
                <Text style={{ fontSize: 15, fontWeight: 'bold' }}>${amt.toLocaleString()}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default MonthlySummaryTable;
