import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserPlus, Settings, Shuffle, Trash2, Copy, Check, Info, LayoutGrid, List, FileUp, FileDown } from 'lucide-react';
import { cn, shuffleArray, chunk, splitIntoGroups } from '@/src/lib/utils';

type GroupMode = 'count' | 'size';

interface Employee {
  deptCode: string;
  deptName: string;
  empId: string;
  name: string;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [groupValue, setGroupValue] = useState<number>(2);
  const [mode, setMode] = useState<GroupMode>('count');
  const [groups, setGroups] = useState<Employee[][]>([]);
  const [copied, setCopied] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean data from input
  const employees = useMemo(() => {
    return inputText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Split by tab, comma, or multiple spaces
        const parts = line.split(/[\t, ]+/).filter(p => p.length > 0);
        return {
          deptCode: parts[0] || '',
          deptName: parts[1] || '',
          empId: parts[2] || '',
          name: parts[3] || parts[0] || '未具名',
        };
      });
  }, [inputText]);

  const handleGenerate = () => {
    if (employees.length === 0) return;

    let shuffled = shuffleArray<Employee>(employees);
    let result: Employee[][] = [];

    if (mode === 'count') {
      result = splitIntoGroups<Employee>(shuffled, groupValue);
    } else {
      result = chunk<Employee>(shuffled, groupValue);
    }

    setGroups(result);
    setIsGenerated(true);
  };

  const handleCopyAll = () => {
    const text = groups
      .map((group, index) => {
        const header = `第 ${index + 1} 組 (${group.length}人):\n`;
        const members = group.map(emp => `${emp.empId} ${emp.name}`).join('\n');
        return header + members;
      })
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = () => {
    if (groups.length === 0) return;
    
    const csvHeaders = "組別,員工號,姓名";
    const csvRows = groups.flatMap((group, index) => 
      group.map(emp => `第 ${index + 1} 組,${emp.empId},${emp.name}`)
    );
    
    // Add BOM for Excel UTF-8 compatibility
    const content = "\uFEFF" + [csvHeaders, ...csvRows].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `分組結果_${new Date().getTime()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    setInputText('');
    setGroups([]);
    setIsGenerated(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden selection:bg-[#FFD1DC]/50">
      {/* Mesh Background */}
      <div className="mesh-bg">
        <div className="circle w-[500px] h-[500px] bg-[#FFD1DC] -top-40 -left-40" />
        <div className="circle w-[600px] h-[600px] bg-[#E0F7FA] -bottom-40 -right-40" />
        <div className="circle w-[400px] h-[400px] bg-[#F3E5F5] top-1/2 left-1/3" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b-2 border-white/40 bg-white/30 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#FFB7C5] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#FFB7C5]/30">
                <Users size={24} />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-[#5D4037] flex items-center gap-2">
                GroupMaster
                <span className="text-[10px] px-2 py-1 bg-[#FFD1DC] text-white rounded-full font-bold tracking-widest uppercase">Sweet Edition</span>
              </h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-[#8D6E63]">
              <span className="hidden sm:inline font-bold">名單人數: {employees.length}</span>
              <div className="w-px h-4 bg-[#FFD1DC]" />
              <button 
                onClick={handleClear}
                className="hover:text-red-400 transition-colors flex items-center gap-1.5 font-bold"
              >
                <Trash2 size={16} /> 清空
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto w-full px-6 py-8 md:py-12 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Settings Section */}
            <section className="lg:col-span-4 space-y-8">
              <div className="glass-card p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-[#FFF5F7] rounded-2xl border-2 border-white">
                    <Settings size={20} className="text-[#FFB7C5]" />
                  </div>
                  <h2 className="font-black text-xl text-[#5D4037]">分組小祕書</h2>
                </div>

                <div className="space-y-8">
                  {/* Input Names */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-[#8D6E63] uppercase tracking-wide">成員名單 (代號 名稱 工號 姓名)</label>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setInputText("A01 研發部 001 陳小明\nA01 研發部 002 林家豪\nB02 市場部 003 張雅婷\nB02 市場部 004 王志強\nC03 行政部 005 李美玲\nD04 生產部 006 趙子龍\nD04 生產部 007 孫悟空\nE05 業務部 008 周杰倫\nE05 業務部 009 蔡依林\nF06 財會部 010 吳大維")}
                          className="text-xs text-[#BA68C8] hover:text-[#9C27B0] transition-colors font-bold hover:underline"
                        >
                          範例
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-[#4DB6AC] hover:text-[#00897B] transition-colors font-bold flex items-center gap-1 hover:underline"
                        >
                          <FileUp size={12} /> 匯入
                        </button>
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept=".txt,.csv" 
                      className="hidden" 
                    />
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="請輸入名單，格示如：&#10;A01 研發部 001 陳小明"
                      className="glass-input w-full h-64 resize-none transition-all duration-300 font-medium"
                    />
                  </div>

                  {/* Mode Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-[#8D6E63] uppercase tracking-wide">選擇分組方式</label>
                    <div className="grid grid-cols-2 gap-3 p-2 bg-[#FFF5F7] rounded-[1.25rem] border-2 border-white shadow-inner">
                      <button
                        onClick={() => setMode('count')}
                        className={cn(
                          "py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
                          mode === 'count' 
                            ? "bg-white text-[#FFB7C5] shadow-[0_4px_15px_rgba(255,183,197,0.15)] border-2 border-[#FFEDF2]" 
                            : "text-[#D1B3B9] hover:text-[#FFB7C5]"
                        )}
                      >
                        <LayoutGrid size={18} /> 指定組數
                      </button>
                      <button
                        onClick={() => setMode('size')}
                        className={cn(
                          "py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
                          mode === 'size' 
                            ? "bg-white text-[#4DB6AC] shadow-[0_4px_15px_rgba(77,182,172,0.15)] border-2 border-[#E0F2F1]" 
                            : "text-[#D1B3B9] hover:text-[#4DB6AC]"
                        )}
                      >
                        <UserPlus size={18} /> 指定人數
                      </button>
                    </div>
                  </div>

                  {/* Value Input */}
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-[#8D6E63]">
                        {mode === 'count' ? '分成幾組？' : '每組幾人？'}
                      </label>
                      <span className="text-3xl font-black text-[#FFB7C5] drop-shadow-sm">
                        {groupValue}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={employees.length || 10}
                      value={groupValue}
                      onChange={(e) => setGroupValue(parseInt(e.target.value))}
                      className="w-full h-3 bg-[#FFEDF2] rounded-full appearance-none cursor-pointer accent-[#FFB7C5]"
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={employees.length === 0}
                    className="glass-button-primary w-full py-6 flex items-center justify-center gap-3"
                  >
                    <Shuffle size={24} />
                    <span className="text-xl font-black tracking-widest">{isGenerated ? '重新調配' : '立即分組'}</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Results Section */}
            <section className="lg:col-span-8 space-y-10">
              {!isGenerated ? (
                <div className="h-[650px] flex flex-col items-center justify-center glass-card text-center p-12 space-y-8 border-dashed border-4 border-[#FFEDF2] bg-white/20 shadow-none">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-[0_10px_35px_rgba(255,183,197,0.3)]"
                  >
                    <Users size={56} className="text-[#FFD1DC]" />
                  </motion.div>
                  <div>
                    <h3 className="text-[#5D4037] font-black text-3xl mb-4">準備好開始分組了嗎？</h3>
                    <p className="text-[#8D6E63] max-w-[360px] mx-auto leading-relaxed font-medium">在左側填入或是匯入你的名單，<br/>GroupMaster 將為你帶來驚喜！</p>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-10"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 px-4">
                    <div>
                      <h2 className="text-4xl font-black text-[#5D4037] tracking-tight mb-2">分組完成！</h2>
                      <p className="text-[#8D6E63] font-bold text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#FFB7C5]" />
                        我們成功劃分了 {groups.length} 個超讚的小組
                      </p>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button
                        onClick={handleCopyAll}
                        className="glass-button-ghost flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-4 shadow-sm"
                      >
                        {copied ? <Check size={20} className="text-[#4DB6AC]" /> : <Copy size={20} />}
                        <span className="font-black">{copied ? '已複製' : '大口複製'}</span>
                      </button>
                      <button
                        onClick={handleExportFile}
                        className="glass-button-ghost flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-4 bg-[#E0F7FA]/50 border-[#B2EBF2] text-[#0097A7] hover:bg-[#B2EBF2]/40"
                      >
                        <FileDown size={20} />
                        <span className="font-black">儲存名單</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                      {groups.map((group, idx) => (
                        <motion.div
                          key={`group-${idx}`}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.5, delay: idx * 0.08, type: "spring", stiffness: 100 }}
                          className="glass-card group relative p-8 hover:bg-white transition-all duration-500 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(255,183,197,0.25)]"
                        >
                          {/* Group Index Badge */}
                          <div className={cn(
                            "absolute top-0 right-0 w-16 h-16 rounded-bl-[2.5rem] flex items-center justify-center font-black text-white text-2xl transition-all shadow-sm",
                            idx % 3 === 0 ? "bg-[#FFB7C5]" : idx % 3 === 1 ? "bg-[#B2EBF2]" : "bg-[#D1C4E9]"
                          )}>
                            {idx + 1}
                          </div>

                          <div className="flex items-center gap-3 mb-8">
                            <h4 className="font-black text-2xl text-[#5D4037]">第 {idx + 1} 組</h4>
                            <span className="text-xs px-4 py-1.5 bg-[#FFF5F7] text-[#FFB7C5] rounded-full font-black">
                              {group.length} 成員
                            </span>
                          </div>

                          <ul className="space-y-4">
                            {group.map((emp, empIdx) => (
                              <motion.li 
                                key={`${idx}-${empIdx}`}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.1 + empIdx * 0.05 }}
                                className="flex items-center gap-5 py-4 px-6 bg-[#FFF5F7]/30 rounded-2xl border-2 border-white group-hover:bg-white transition-colors shadow-sm"
                              >
                                <div className={cn(
                                  "w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-sm",
                                  idx % 3 === 0 ? "bg-[#FFD1DC]" : idx % 3 === 1 ? "bg-[#E0F7FA]" : "bg-[#F3E5F5]"
                                )}>
                                  {emp.name.charAt(0)}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-black text-[#5D4037] text-lg truncate">
                                    {emp.name}
                                  </span>
                                  <span className="text-xs font-bold text-[#8D6E63] truncate">
                                    {emp.deptCode} {emp.deptName} · {emp.empId}
                                  </span>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto w-full px-6 py-16 border-t-2 border-white/40 text-center text-[#D1B3B9] text-sm font-black uppercase tracking-[0.2em]">
          <p>Spread the sweetness with GroupMaster 🍨 2026</p>
        </footer>
      </div>
    </div>
  );
}
