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
        const totals = txs.reduce((acc: Record<string, number>, tx: any) => {
          acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
          return acc;
        }, {});
        const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-AR', { month: 'long' });
        return (
          <MonthlySummaryTable
            key={'auto-' + month}
            monthName={monthName}
            year={year}
            totals={totals}
          />
        );
      })}
      {/* Meses manuales */}
      {manualGrouped[year] && Object.keys(manualGrouped[year]).sort((a, b) => Number(b) - Number(a)).map(month => {
        const cats = manualGrouped[year][month];
        const totals = cats.reduce((acc: Record<string, number>, curr: any) => {
          acc[curr.cat] = (acc[curr.cat] || 0) + curr.amt;
          return acc;
        }, {});
        const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('es-AR', { month: 'long' });
        return (
          <MonthlySummaryTable
            key={'manual-' + month}
            monthName={monthName}
            year={year}
            totals={totals}
          />
        );
      })}
    </View>
  );
};

export default YearlySection;
