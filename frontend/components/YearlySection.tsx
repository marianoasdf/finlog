import React from 'react';
import { View, Text } from 'react-native';
import MonthlySummaryTable from './MonthlySummaryTable';

interface YearlySectionProps {
  year: string;
  grouped: Record<string, any>;
  manualGrouped: Record<string, any>;
  onDataChange?: () => void;
}

const YearlySection: React.FC<YearlySectionProps> = ({ year, grouped, manualGrouped, onDataChange }) => {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');

  // Unificar meses automáticos y manuales
  const allMonths = Array.from(new Set([
    ...(grouped[year] ? Object.keys(grouped[year]) : []),
    ...(manualGrouped[year] ? Object.keys(manualGrouped[year]) : [])
  ])).sort((a, b) => Number(b) - Number(a));

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, backgroundColor: '#eee', padding: 6, borderRadius: 6 }}>{year}</Text>
      {allMonths.map(month => {
        // Obtener todos los movimientos del mes
        const txs = grouped[year] && grouped[year][month]
          ? grouped[year][month].map((tx: any) => ({ cat: tx.category, amt: tx.amount, type: tx.type, id: tx.id }))
          : [];
        const cats = manualGrouped[year] && manualGrouped[year][month]
          ? manualGrouped[year][month].map((curr: any) => ({ cat: curr.cat, amt: curr.amt, type: curr.type || 'expense', id: curr.id }))
          : [];
        // Agrupar por categoría + tipo, sumando montos (convertir a número)
        const allRows = [...txs, ...cats];
        const groupedRows: Record<string, { cat: string; amt: number; type: 'income' | 'expense'; id?: string }> = {};
        for (const row of allRows) {
          const key = `${row.cat}|${row.type}`;
          const amt = Number(row.amt) || 0;
          if (groupedRows[key]) {
            groupedRows[key].amt += amt;
          } else {
            groupedRows[key] = { ...row, amt };
          }
        }
        const rows = Object.values(groupedRows);
        const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-AR', { month: 'long' });
        const isCurrentMonth = year === currentYear && month === currentMonth;
        return (
          <MonthlySummaryTable
            key={month}
            monthName={monthName}
            year={year}
            rows={rows}
            editable={!isCurrentMonth}
            onDataChange={onDataChange}
          />
        );
      })}
    </View>
  );
};

export default YearlySection;
