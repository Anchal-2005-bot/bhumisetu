import { useState, useEffect } from "react";
import { CompensationRecord } from "../types";
import { HandCoins, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export function Compensation() {
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compensation")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setIsLoading(false);
      });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Disbursed": return <CheckCircle2 className="w-4 h-4 text-cultivated-green" />;
      case "Processing DBT": return <Clock className="w-4 h-4 text-tilled-earth" />;
      default: return <AlertCircle className="w-4 h-4 text-alluvium-red" />;
    }
  };

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <HandCoins className="w-8 h-8 text-tilled-earth" />
            Compensation & Disbursement
          </h2>
          <p className="text-registry-ink/60 mt-1">Track statutory assessed compensation including 100% solatium margin.</p>
        </div>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Ref ID</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">ULPIN</th>
                <th className="px-6 py-4">Beneficiary</th>
                <th className="px-6 py-4 text-right">Market Value</th>
                <th className="px-6 py-4 text-right">Solatium (100%)</th>
                <th className="px-6 py-4 text-right">Total Assessed</th>
                <th className="px-6 py-4 text-right">Disbursed (PFMS)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading compensation records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-registry-ink/60">
                    No compensation records found.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={record.id} 
                    className="hover:bg-graticule-teal/5 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.id}</td>
                    <td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.ulpin}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink">{record.ownerName}</td>
                    <td className="px-6 py-4 text-right text-registry-ink/80">{formatCurrency(record.marketValue)}</td>
                    <td className="px-6 py-4 text-right text-tilled-earth font-medium">+{formatCurrency(record.solatium)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-registry-ink">{formatCurrency(record.totalAssessed)}</td>
                    <td className="px-6 py-4 text-right font-medium text-cultivated-green">{formatCurrency(record.amountDisbursed)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`font-medium ${
                          record.status === 'Disbursed' ? 'text-cultivated-green' :
                          record.status === 'Processing DBT' ? 'text-tilled-earth' :
                          'text-alluvium-red'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
