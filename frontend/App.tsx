import React, { useState } from 'react';
import { StyleSheet, ScrollView, Button } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import SummaryPanel from './components/SummaryPanel';
import TransactionInput from './components/TransactionInput';
import TransactionList from './components/TransactionList';
import ManualMonthForm from './components/ManualMonthForm';
import YearlySection from './components/YearlySection';

type TransactionType = 'income' | 'expense';
interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: Date;
}

const incomeKeywords = ['sueldo', 'pago', 'venta', 'ingreso', 'cobro', 'salario', 'bonus'];
const expenseKeywords = ['comida', 'super', 'alquiler', 'gasto', 'transporte', 'luz', 'agua', 'internet', 'ropa', 'salida'];

function detectType(text: string): TransactionType {
  const lower = text.toLowerCase();
  if (incomeKeywords.some(k => lower.includes(k))) return 'income';
  if (expenseKeywords.some(k => lower.includes(k))) return 'expense';
  return 'expense';
}

function parseInput(input: string): { category: string; amount: number } | null {
  const match = input.match(/(.+?)\s*(\d+[.,]?\d*)$/);
  if (!match) return null;
  const category = match[1].trim();
  const amount = parseFloat(match[2].replace(',', '.'));
  if (!category || isNaN(amount)) return null;
  return { category, amount };
}

function groupByYearAndMonth(transactions: Transaction[]) {
  const grouped: Record<string, Record<string, Transaction[]>> = {};
  transactions.forEach(tx => {
    const year = tx.date.getFullYear().toString();
    const month = (tx.date.getMonth() + 1).toString().padStart(2, '0');
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    grouped[year][month].push(tx);
  });
  return grouped;
}

// ...existing code...

export default function App() {
  const [input, setInput] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [manualType, setManualType] = useState<TransactionType | null>(null);
  const [inputError, setInputError] = useState('');
  const [manualMonths, setManualMonths] = useState<{
    year: string;
    month: string;
    categories: { cat: string; amt: number }[];
  }[]>([]);
    const [showManualMonthForm, setShowManualMonthForm] = useState(false);
    const [manualYear, setManualYear] = useState('2024');
    const [manualMonth, setManualMonth] = useState('01');
    const [manualCats, setManualCats] = useState<{ cat: string; amt: string }[]>([{ cat: '', amt: '' }]);

  const addTransaction = () => {
    const parsed = parseInput(input);
    if (!parsed) {
      setInputError('Formato inválido. Ejemplo: comida 8500');
      return;
    }
    setInputError('');
    const { category, amount } = parsed;
    const autoType = detectType(category);
    const type = manualType || autoType;
    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      type,
      category,
      amount,
      date: new Date(),
    };
    setTransactions([newTransaction, ...transactions]);
    setInput('');
    setManualType(null);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const grouped = groupByYearAndMonth(transactions);
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
  const manualGrouped: Record<string, Record<string, { cat: string; amt: number }[]>> = {};
  manualMonths.forEach(m => {
    if (!manualGrouped[m.year]) manualGrouped[m.year] = {};
    manualGrouped[m.year][m.month] = m.categories;
  });
  const allYears = Array.from(new Set([...years, ...Object.keys(manualGrouped)])).sort((a, b) => Number(b) - Number(a));

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <SummaryPanel totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
        <TransactionInput
          input={input}
          setInput={text => {
            setInput(text);
            if (inputError) setInputError('');
          }}
          manualType={manualType}
          setManualType={setManualType}
          inputError={inputError}
          onAdd={addTransaction}
        />
        <TransactionList transactions={transactions} />
        <ScrollView style={{ marginTop: 24 }}>
          {allYears.map(year => (
            <YearlySection key={year} year={year} grouped={grouped} manualGrouped={manualGrouped} />
          ))}
          {showManualMonthForm && (
            <ManualMonthForm
              manualYear={manualYear}
              setManualYear={setManualYear}
              manualMonth={manualMonth}
              setManualMonth={setManualMonth}
              manualCats={manualCats}
              setManualCats={setManualCats}
              onSave={() => {
                if (!manualYear.match(/^\d{4}$/) || !manualMonth.match(/^\d{2}$/)) return;
                const cats = manualCats.filter(r => r.cat && r.amt);
                if (cats.length === 0) return;
                setManualMonths(prev => [
                  ...prev,
                  {
                    year: manualYear,
                    month: manualMonth,
                    categories: cats.map(r => ({ cat: r.cat, amt: Number(r.amt) })),
                  },
                ]);
                setShowManualMonthForm(false);
                setManualYear('2024');
                setManualMonth('01');
                setManualCats([{ cat: '', amt: '' }]);
              }}
              onCancel={() => setShowManualMonthForm(false)}
            />
          )}
          <Button title={showManualMonthForm ? 'Cancelar' : 'Agregar mes histórico'} onPress={() => setShowManualMonthForm(v => !v)} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
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
  errorText: {
    color: '#c62828',
    marginBottom: 8,
    textAlign: 'center',
  },
});



