import { useState, useEffect } from "react";
import { DocumentRecord } from "../types";
import { FolderOpen, Download, ShieldCheck, PenTool, Upload } from "lucide-react";
import { motion } from "motion/react";

export function Documents() {
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="p-8 w-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-serif font-semibold text-registry-ink flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-tilled-earth" />
            Document Repository
          </h2>
          <p className="text-registry-ink/60 mt-1">Versioned, tamper-evident document storage with digital signature tracking.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-registry-ink text-white font-medium hover:bg-registry-ink/90 transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="bg-white border border-graticule-teal/30 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-graticule-teal/10 border-b border-graticule-teal/30 text-registry-ink font-semibold">
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Doc ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Version</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 font-mono uppercase tracking-wider text-xs">Checksum (SHA-256)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graticule-teal/20">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-graticule-teal animate-pulse">
                    Loading documents...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-registry-ink/60">
                    No documents found.
                  </td>
                </tr>
              ) : (
                records.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={record.id} 
                    className="hover:bg-graticule-teal/5 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal">{record.id}</td>
                    <td className="px-6 py-4 font-medium text-registry-ink">{record.title}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.type}</td>
                    <td className="px-6 py-4 font-mono text-xs text-registry-ink/80">{record.version}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.uploadedBy}</td>
                    <td className="px-6 py-4 text-registry-ink/80">{record.uploadDate}</td>
                    <td className="px-6 py-4 font-mono text-xs text-graticule-teal" title="Immutable file checksum hash">
                      {record.checksum}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {record.status === 'Verified' ? (
                          <ShieldCheck className="w-4 h-4 text-cultivated-green" />
                        ) : (
                          <PenTool className="w-4 h-4 text-tilled-earth" />
                        )}
                        <span className={`text-xs font-medium ${
                          record.status === 'Verified' ? 'text-cultivated-green' : 'text-tilled-earth'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-graticule-teal hover:text-registry-ink transition-colors p-2 rounded hover:bg-graticule-teal/10" title="Download Document">
                        <Download className="w-4 h-4" />
                      </button>
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
