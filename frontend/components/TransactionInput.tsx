import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

type TransactionType = 'income' | 'expense';

interface Props {
  input: string;
  setInput: (v: string) => void;
  manualType: TransactionType | null;
  setManualType: (v: TransactionType | null) => void;
  inputError: string;
  onAdd: () => void;
}

const TransactionInput: React.FC<Props> = ({ input, setInput, manualType, setManualType, inputError, onAdd }) => (
  <>
    <View style={styles.inputRow}>
      <TextInput
        style={styles.input}
        placeholder="Ej: comida 8500 o sueldo 300000"
        value={input}
        onChangeText={text => {
          setInput(text);
        }}
        onSubmitEditing={onAdd}
        returnKeyType="done"
      />
      <Button title="Agregar" onPress={onAdd} accessibilityLabel="Agregar movimiento" />
    </View>
    <View style={styles.toggleWrapperCompact}>
      <Text
        style={[
          styles.toggleButtonCompact,
          manualType === null && styles.toggleSelectedCompact,
        ]}
        onPress={() => setManualType(null)}
      >Auto</Text>
      <Text
        style={[
          styles.toggleButtonCompact,
          manualType === 'expense' && styles.toggleSelectedCompact,
        ]}
        onPress={() => setManualType('expense')}
      >Gasto</Text>
      <Text
        style={[
          styles.toggleButtonCompact,
          manualType === 'income' && styles.toggleSelectedCompact,
        ]}
        onPress={() => setManualType('income')}
      >Ingreso</Text>
    </View>
    {inputError ? <Text style={styles.errorText}>{inputError}</Text> : null}
  </>
);

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    fontSize: 16,
  },
  toggleWrapperCompact: {
    flexDirection: 'row',
    backgroundColor: '#eee',
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  toggleButtonCompact: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: 'transparent',
    marginHorizontal: 1,
  },
  toggleSelectedCompact: {
    backgroundColor: '#1976d2',
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#c62828',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default TransactionInput;
