import React from 'react';
import { View, Text } from 'react-native';
import MonthlySummaryTable from './MonthlySummaryTable';

interface YearlySectionProps {
  year: string;
  grouped: Record<string, any>;
  manualGrouped: Record<string, any>;
}

const YearlySection: React.FC<YearlySectionProps> = ({ year, grouped, manualGrouped }) => {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8, backgroundColor: '#eee', padding: 6, borderRadius: 6 }}>{year}</Text>
      {/* Meses automáticos */}
      {grouped[year] && Object.keys(grouped[year]).sort((a, b) => Number(b) - Number(a)).map(month => {
        const txs = grouped[year][month];
        const rows = txs.map((tx: any) => ({ cat: tx.category, amt: tx.amount, type: tx.type }));
        const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-AR', { month: 'long' });
        return (
          <MonthlySummaryTable
            key={'auto-' + month}
            monthName={monthName}
            year={year}
            rows={rows}
          />
        );
      })}
      {/* Meses manuales */}
      {manualGrouped[year] && Object.keys(manualGrouped[year]).sort((a, b) => Number(b) - Number(a)).map(month => {
        const cats = manualGrouped[year][month];
        const rows = cats.map((curr: any) => ({ cat: curr.cat, amt: curr.amt, type: curr.type || 'expense' }));
        const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-AR', { month: 'long' });
        return (
          <MonthlySummaryTable
            key={'manual-' + month}
            monthName={monthName}
            year={year}
            rows={rows}
          />
        );
      })}
    </View>
  );
};

export default YearlySection;
