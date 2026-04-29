import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, ScrollView, Button, View, Text, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import SummaryPanel from './components/SummaryPanel';
import TransactionInput from './components/TransactionInput';
import TransactionList from './components/TransactionList';
import ManualMonthForm from './components/ManualMonthForm';
import YearlySection from './components/YearlySection';


import LoginRegisterScreen from './components/LoginRegisterScreen';
import { authFetch } from './utils/api';

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
    // Declaraciones de estado deben ir primero
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [input, setInput] = useState('');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [allMovements, setAllMovements] = useState<Transaction[]>([]);
    const [manualType, setManualType] = useState<TransactionType | null>(null);
    const [inputError, setInputError] = useState('');
    const [manualMonths, setManualMonths] = useState<{
      year: string;
      month: string;
      categories: { cat: string; amt: number; type: 'income' | 'expense' }[];
    }[]>([]);
    const [showManualMonthForm, setShowManualMonthForm] = useState(false);
    const [manualYear, setManualYear] = useState('2024');
    const [manualMonth, setManualMonth] = useState('01');
    const [manualCats, setManualCats] = useState<{ cat: string; amt: string; type: 'income' | 'expense' }[]>([{ cat: '', amt: '', type: 'expense' }]);

    // Agrupar todos los movimientos (incluyendo históricos)
    const grouped = groupByYearAndMonth(allMovements);
    // Agrupar movimientos manuales
    const manualGrouped: Record<string, Record<string, { cat: string; amt: number; type?: string }[]>> = {};
    manualMonths.forEach(m => {
      if (!manualGrouped[m.year]) manualGrouped[m.year] = {};
      manualGrouped[m.year][m.month] = m.categories.map(c => ({ ...c, type: c.type === 'income' ? 'income' : 'expense' }));
    });
    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    const allYears = Array.from(new Set([...years, ...Object.keys(manualGrouped)])).sort((a, b) => Number(b) - Number(a));

    // Filtrar movimientos del mes actual (automáticos)
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentMonthTxs = (grouped[currentYear] && grouped[currentYear][currentMonth]) ? grouped[currentYear][currentMonth] : [];
    // Filtrar movimientos manuales del mes actual
    const currentManualCats = (manualGrouped[currentYear] && manualGrouped[currentYear][currentMonth]) ? manualGrouped[currentYear][currentMonth] : [];

    // Calcular totales SOLO del mes actual
    // Asegurar que todos los montos sean números válidos
    const safeNumber = (v: any) => {
      const n = Number(v);
      return isNaN(n) ? 0 : n;
    };
    const totalIncome = [
      ...currentMonthTxs.filter(t => t.type === 'income').map(t => safeNumber(t.amount)),
      ...currentManualCats.filter(c => c.type === 'income').map(c => safeNumber(c.amt))
    ].reduce((sum, v) => sum + v, 0);
    const totalExpense = [
      ...currentMonthTxs.filter(t => t.type === 'expense').map(t => safeNumber(t.amount)),
      ...currentManualCats.filter(c => c.type !== 'income').map(c => safeNumber(c.amt))
    ].reduce((sum, v) => sum + v, 0);
    const balance = totalIncome - totalExpense;

    // Obtener movimientos protegidos al autenticar
    const fetchMovements = async () => {
      try {
        const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements?historical=false`);
        if (!res.ok) throw new Error('Error al obtener movimientos');
        const data = await res.json();
        setTransactions(data.map((t: any) => ({
          ...t,
          date: new Date(t.date),
          category: t.category || t.cat || '', // Unifica nombre de propiedad
        })));
      } catch (err) {
        console.warn('Error al obtener movimientos:', err);
      }
    };

    // Trae todos los movimientos (incluyendo históricos) para las tablas
    const fetchAllMovements = async () => {
      try {
        const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements`);
        if (!res.ok) throw new Error('Error al obtener movimientos');
        const data = await res.json();
        setAllMovements(data.map((t: any) => ({
          ...t,
          date: new Date(t.date),
          category: t.category || t.cat || '',
        })));
      } catch (err) {
        console.warn('Error al obtener movimientos:', err);
      }
    };
    useEffect(() => {
      if (!isAuthenticated) return;
      fetchMovements();
      fetchAllMovements();
    }, [isAuthenticated]);

    // Handler para el input y botón "Agregar"
    const handleAddTransaction = async () => {
      const parsed = parseInput(input);
      if (!parsed) {
        setInputError('Formato inválido. Ej: comida 8500');
        return;
      }
      const { category, amount } = parsed;
      const type = manualType ?? detectType(category);
      try {
        // Buscar o crear categoría
        let category_id = null;
        try {
          const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/categories`);
          if (res.ok) {
            const allCats = await res.json();
            const found = allCats.find((c: any) => c.name.toLowerCase() === category.toLowerCase());
            if (found) category_id = found.id;
          }
        } catch {}
        if (!category_id) {
          try {
            const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/categories`, {
              method: 'POST',
              body: JSON.stringify({ name: category })
            });
            if (res.ok) {
              const created = await res.json();
              category_id = created.id;
            }
          } catch {}
        }
        if (!category_id) throw new Error('No se pudo obtener categoría');
        // Guardar movimiento
        const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements`, {
          method: 'POST',
          body: JSON.stringify({
            type,
            category_id,
            amount,
            date: new Date().toISOString(),
          }),
        });
        if (!res.ok) throw new Error('Error al guardar en backend');
        const saved = await res.json();
        const newTx = { ...saved, date: new Date(saved.date), category };
        setTransactions(prev => [newTx, ...prev]);
        setAllMovements(prev => [newTx, ...prev]);
        setInput('');
        setManualType(null);
        setInputError('');
      } catch (err) {
        setInputError('No se pudo guardar en backend');
      }
    };

  // Cerrar mes automáticamente el último día del mes
  const [autoClosed, setAutoClosed] = useState(false);
  useEffect(() => {
    if (!isAuthenticated || autoClosed || allMovements.length === 0) return;
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    if (today.getDate() === lastDay) {
      const yearStr = today.getFullYear().toString();
      const monthStr = (today.getMonth() + 1).toString().padStart(2, '0');
      // Verificar si ya está cerrado
      const alreadyClosed = allMovements.some(
        t => t.date.getFullYear().toString() === yearStr &&
             (t.date.getMonth() + 1).toString().padStart(2, '0') === monthStr &&
             (t as any).is_historical
      );
      if (!alreadyClosed) {
        setAutoClosed(true);
        (async () => {
          try {
            await authFetch(
              `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/months/close`,
              { method: 'POST', body: JSON.stringify({ year: yearStr, month: monthStr }) }
            );
            fetchMovements();
            fetchAllMovements();
          } catch {}
        })();
      }
    }
  }, [isAuthenticated, allMovements]);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) setIsAuthenticated(true);
    };
    checkToken();
  }, []);



  if (!isAuthenticated) {
    return <LoginRegisterScreen onLoginSuccess={async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) setIsAuthenticated(true);
    }} />;
  }

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
          onAdd={handleAddTransaction}
        />
        <View style={{ marginVertical: 18 }}>
          <View style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, textAlign: 'left', letterSpacing: 0.5 }}>Movimientos diarios</Text>
          </View>
          <View style={{ borderRadius: 8, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafbfc', overflow: 'hidden', paddingBottom: 4 }}>
            <TransactionList transactions={transactions} onDataChange={() => { fetchMovements(); fetchAllMovements(); }} />
          </View>
        </View>
        <ScrollView style={{ marginTop: 12 }}>
          {allYears.map(year => (
            <YearlySection key={year} year={year} grouped={grouped} manualGrouped={manualGrouped} onDataChange={() => { fetchMovements(); fetchAllMovements(); }} />
          ))}
          {showManualMonthForm && (
            <ManualMonthForm
              manualYear={manualYear}
              setManualYear={setManualYear}
              manualMonth={manualMonth}
              setManualMonth={setManualMonth}
              manualCats={manualCats}
              setManualCats={setManualCats}
              onSave={async () => {
                if (!manualYear.match(/^\d{4}$/) || !manualMonth.match(/^\d{2}$/)) return;
                const cats = manualCats.filter(r => r.cat && r.amt);
                if (cats.length === 0) return;
                // Persistir cada movimiento en el backend
                for (const row of cats) {
                  // 1. Buscar o crear la categoría
                  let category_id = null;
                  try {
                    // Buscar categoría
                    const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/categories`);
                    if (res.ok) {
                      const allCats = await res.json();
                      const found = allCats.find((c: any) => c.name.toLowerCase() === row.cat.toLowerCase());
                      if (found) category_id = found.id;
                    }
                  } catch {}
                  if (!category_id) {
                    // Crear categoría si no existe
                    try {
                      const res = await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/categories`, {
                        method: 'POST',
                        body: JSON.stringify({ name: row.cat })
                      });
                      if (res.ok) {
                        const created = await res.json();
                        category_id = created.id;
                      }
                    } catch {}
                  }
                  if (!category_id) continue; // Si no se pudo crear ni encontrar, saltea
                  // 2. Guardar movimiento
                  try {
                    await authFetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001'}/movements`, {
                      method: 'POST',
                      body: JSON.stringify({
                        type: row.type,
                        category_id,
                        amount: Number(row.amt),
                        date: `${manualYear}-${manualMonth}-01`,
                      })
                    });
                  } catch {}
                }
                // Refrescar movimientos desde backend sin perder autenticación
                await fetchAllMovements();
                await fetchMovements();
                setShowManualMonthForm(false);
                setManualYear('2024');
                setManualMonth('01');
                setManualCats([{ cat: '', amt: '', type: 'expense' }]);
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
    padding: 6,
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



