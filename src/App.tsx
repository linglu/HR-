/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Trophy, 
  LayoutGrid, 
  Upload, 
  PlusCircle, 
  Trash2, 
  Shuffle, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Constants ---
const MOCK_NAMES = [
  "张伟", "王芳", "李静", "王秀英", "李强", "李军", "张静", "李桂英", "王勇", "张强",
  "陈静", "刘洋", "王刚", "张勇", "王磊", "李娜", "张磊", "王杰", "张军", "张杰",
  "李静", "王芳" // Intentional duplicates
];

// --- Types ---
type Tab = 'source' | 'draw' | 'group';

interface PrizeWinner {
  id: string;
  name: string;
  timestamp: Date;
}

// --- Components ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('source');
  const [rawText, setRawText] = useState('');
  const [names, setNames] = useState<string[]>([]);
  
  // Prize Draw State
  const [drawHistory, setDrawHistory] = useState<PrizeWinner[]>([]);
  const [allowRepeat, setAllowRepeat] = useState(false);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rollingName, setRollingName] = useState<string | null>(null);

  // Grouping State
  const [groupSize, setGroupSize] = useState(4);
  const [groups, setGroups] = useState<string[][]>([]);

  // Derived State
  const duplicateNames = useMemo(() => {
    const counts: Record<string, number> = {};
    names.forEach(n => counts[n] = (counts[n] || 0) + 1);
    return Object.keys(counts).filter(n => counts[n] > 1);
  }, [names]);

  const availableNames = useMemo(() => {
    // Unique confirmed names for drawing/grouping logic
    const uniqueNames = Array.from(new Set(names));
    if (allowRepeat) return uniqueNames;
    const winners = drawHistory.map(w => w.name);
    return uniqueNames.filter(n => !winners.includes(n));
  }, [names, drawHistory, allowRepeat]);

  // --- Handlers ---

  const handleProcessNames = (textToProcess?: string) => {
    const sourceText = textToProcess !== undefined ? textToProcess : rawText;
    const list = sourceText
      .split(/[\n,;]/)
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setNames(list); // Carry duplicates for processing/review
  };

  const loadMockData = () => {
    const mockText = MOCK_NAMES.join('\n');
    setRawText(mockText);
    handleProcessNames(mockText);
  };

  const removeDuplicates = () => {
    setNames(Array.from(new Set(names)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  const handleDraw = () => {
    if (availableNames.length === 0 || isDrawing) return;
    
    setIsDrawing(true);
    setLastWinner(null);
    
    // Rolling animation
    const interval = setInterval(() => {
      const tempIndex = Math.floor(Math.random() * availableNames.length);
      setRollingName(availableNames[tempIndex]);
    }, 80);

    // Final result after 2 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsDrawing(false);
      setRollingName(null);
      
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      const winner = availableNames[randomIndex];
      
      setLastWinner(winner);
      setDrawHistory(prev => [
        { id: Math.random().toString(36).substr(2, 9), name: winner, timestamp: new Date() },
        ...prev
      ]);
    }, 2000);
  };

  const handleGroup = () => {
    if (names.length === 0) return;
    
    const shuffled = [...names].sort(() => Math.random() - 0.5);
    const result: string[][] = [];
    
    for (let i = 0; i < shuffled.length; i += groupSize) {
      result.push(shuffled.slice(i, i + groupSize));
    }
    
    setGroups(result);
  };

  const resetAll = () => {
    setNames([]);
    setRawText('');
    setDrawHistory([]);
    setGroups([]);
    setLastWinner(null);
    setActiveTab('source');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#1A1A1A] font-sans selection:bg-[#E2E2E2]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-bottom border-[#DDDDDC]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">HR Pro Toolkit</h1>
          </div>
          
          <nav className="flex gap-1 bg-[#EEEEEB] p-1 rounded-xl">
            {[
              { id: 'source', label: '名单来源', icon: Upload },
              { id: 'draw', label: '奖品抽签', icon: Trophy },
              { id: 'group', label: '自动分组', icon: LayoutGrid },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`
                  flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${activeTab === tab.id 
                    ? 'bg-white shadow-sm text-black' 
                    : 'text-[#666665] hover:text-black hover:bg-white/50'}
                `}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <button 
            onClick={resetAll}
            className="text-xs font-semibold text-[#888887] hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={12} />
            全部重置
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {activeTab === 'source' && (
            <motion.div
              key="source"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center md:text-left space-y-2 mb-8">
                <h2 className="text-3xl font-bold tracking-tight">设定员工名单</h2>
                <p className="text-[#666665]">上传 CSV 文件或直接贴上姓名作为所有功能的来源</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Side: Input */}
                <div className="bg-white rounded-2xl border border-[#DDDDDC] p-8 shadow-sm space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#888887]">上传文件</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-[#DDDDDC] group-hover:border-black rounded-xl p-8 transition-colors flex flex-col items-center gap-3">
                        <div className="p-3 bg-[#F5F5F3] rounded-full text-[#666665] group-hover:bg-black group-hover:text-white transition-colors">
                          <Upload size={24} />
                        </div>
                        <div className="text-sm text-center">
                          <span className="font-semibold">点击上传</span> 或拖拽 CSV/TXT 文件
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#DDDDDC]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-[#888887] font-bold">或者贴上姓名</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#888887]">输入文本</label>
                      <button 
                        onClick={loadMockData}
                        className="text-[10px] font-bold text-black border border-black/10 px-2 py-0.5 rounded hover:bg-black hover:text-white transition-all"
                      >
                        使用模拟名单
                      </button>
                    </div>
                    <textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      placeholder="例如: 张三, 李四, 王五 (每行一个或逗号分隔)"
                      className="w-full h-48 p-4 bg-[#F5F5F3] border border-[#DDDDDC] rounded-xl focus:outline-none focus:ring-1 focus:ring-black transition-all resize-none font-mono text-sm"
                    />
                  </div>

                  <button
                    onClick={handleProcessNames}
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={20} />
                    确认名单
                  </button>
                </div>

                {/* Right Side: Preview */}
                <div className="space-y-6">
                  {names.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-[#DDDDDC] p-8 shadow-sm flex flex-col min-h-[400px]">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#F5F5F3]">
                        <h3 className="font-bold flex items-center gap-2 text-lg">
                          <CheckCircle2 size={20} className="text-green-500" />
                          已导入名单 ({names.length})
                        </h3>
                        <div className="flex gap-3">
                          {duplicateNames.length > 0 && (
                            <button 
                              onClick={removeDuplicates}
                              className="text-xs font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              移除 {duplicateNames.length} 处重复
                            </button>
                          )}
                          <button 
                            onClick={() => setNames([])}
                            className="text-xs text-[#888887] hover:text-red-500 transition-colors"
                          >
                            清空
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar content-start">
                        {names.map((name, i) => {
                          const isDuplicate = duplicateNames.includes(name);
                          return (
                            <motion.span 
                              key={i} 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.01 }}
                              className={`
                                px-4 py-2 border rounded-xl text-sm font-medium transition-colors relative group
                                ${isDuplicate 
                                  ? 'bg-red-50 border-red-200 text-red-700 hover:border-red-400' 
                                  : 'bg-[#F5F5F3] border-[#DDDDDC] hover:border-black'}
                              `}
                            >
                              {name}
                              {isDuplicate && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </motion.span>
                          );
                        })}
                      </div>

                      <div className="mt-auto pt-8 flex gap-4">
                        <button
                          onClick={() => setActiveTab('draw')}
                          className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/5"
                        >
                          <Trophy size={16} />
                          开始抽奖
                        </button>
                        <button
                          onClick={() => setActiveTab('group')}
                          className="flex-1 bg-[#F5F5F3] text-black py-3 rounded-xl font-bold text-sm hover:bg-[#EEEEEB] transition-all flex items-center justify-center gap-2"
                        >
                          <LayoutGrid size={16} />
                          开始分组
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/50 border-2 border-dashed border-[#DDDDDC] rounded-2xl h-[500px] flex flex-col items-center justify-center gap-4 text-center p-8">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#DDDDDC] shadow-sm">
                        <Users size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-[#666665]">尚未导入名单</p>
                        <p className="text-sm text-[#888887]">在左侧输入姓名或上传文件后<br/>点击“确认名单”即可在此查看</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'draw' && (
            <motion.div
              key="draw"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white rounded-[2rem] border border-[#DDDDDC] p-12 shadow-sm text-center space-y-10 min-h-[400px] flex flex-col justify-center items-center">
                  {names.length === 0 ? (
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-[#F5F5F3] rounded-full flex items-center justify-center text-[#888887]">
                        <AlertCircle size={32} />
                      </div>
                      <h3 className="text-xl font-semibold">请先设定名单</h3>
                      <button 
                        onClick={() => setActiveTab('source')}
                        className="bg-black text-white px-6 py-2 rounded-full text-sm font-bold"
                      >
                        去设定
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#888887]">幸运大奖抽取</h2>
                        <div className="h-24 flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            {isDrawing ? (
                              <motion.div
                                key={rollingName || 'rolling'}
                                initial={{ opacity: 0.5, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-6xl lg:text-8xl font-black tracking-tighter text-[#666665]"
                              >
                                {rollingName}
                              </motion.div>
                            ) : lastWinner ? (
                              <motion.div
                                key={lastWinner}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="text-6xl lg:text-8xl font-black tracking-tighter"
                              >
                                {lastWinner}
                              </motion.div>
                            ) : (
                              <div className="text-[#DDDDDC] text-6xl font-black italic">READY?</div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-2">
                          <button
                            onClick={handleDraw}
                            disabled={availableNames.length === 0 || isDrawing}
                            className={`
                              group relative w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-90
                              ${availableNames.length === 0 || isDrawing ? 'bg-[#F5F5F3] text-[#DDDDDC]' : 'bg-black text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'}
                            `}
                          >
                            <Shuffle size={32} className={availableNames.length === 0 || isDrawing ? '' : 'group-hover:rotate-180 transition-transform duration-500'} />
                          </button>
                          <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isDrawing ? 'text-black animate-pulse' : 'text-[#888887]'}`}>
                            {isDrawing ? '正在抽取...' : '开始抽奖'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-8">
                          <label className="flex items-center gap-2 cursor-pointer group">
                             <div 
                              className={`w-10 h-5 rounded-full p-1 transition-colors ${allowRepeat ? 'bg-black' : 'bg-[#DDDDDC]'}`}
                              onClick={() => setAllowRepeat(!allowRepeat)}
                            >
                              <div className={`bg-white w-3 h-3 rounded-full transition-transform ${allowRepeat ? 'translate-x-5' : ''}`} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#888887] group-hover:text-black">允许重复中奖</span>
                          </label>
                          <div className="text-xs font-bold uppercase tracking-wider text-[#888887]">
                            剩余抽奖池: <span className="text-black">{availableNames.length}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white rounded-2xl border border-[#DDDDDC] flex flex-col h-full shadow-sm max-h-[600px]">
                  <div className="p-4 border-bottom border-[#DDDDDC] flex items-center justify-between">
                    <h3 className="font-bold text-sm uppercase tracking-wider">抽奖轨迹</h3>
                    <span className="text-[10px] bg-[#F5F5F3] px-2 py-0.5 rounded-full font-bold">{drawHistory.length} 次</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {drawHistory.length === 0 && (
                      <div className="h-32 flex items-center justify-center text-xs text-[#888887] italic">尚未产生中奖者</div>
                    )}
                    {drawHistory.map((winner, idx) => (
                      <motion.div
                        key={winner.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-[#F5F5F3] rounded-xl border border-[#DDDDDC]"
                      >
                        <div>
                          <p className="font-bold text-sm">{winner.name}</p>
                          <p className="text-[10px] text-[#888887] font-mono">{winner.timestamp.toLocaleTimeString()}</p>
                        </div>
                        <div className="text-lg font-bold text-black/10">#{drawHistory.length - idx}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row items-end gap-6 bg-white p-8 rounded-2xl border border-[#DDDDDC] shadow-sm">
                <div className="flex-1 space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#888887]">每组人次</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="2"
                      max={Math.max(2, names.length)}
                      value={groupSize}
                      onChange={(e) => setGroupSize(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-[#F5F5F3] rounded-lg appearance-none cursor-pointer accent-black"
                    />
                    <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-bold">
                      {groupSize}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleGroup}
                  disabled={names.length === 0}
                  className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-[#F5F5F3] disabled:text-[#DDDDDC] flex items-center gap-2"
                >
                  <Shuffle size={18} />
                  随机分组
                </button>
              </div>

              {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groups.map((group, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-2xl border border-[#DDDDDC] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="bg-[#1A1A1A] p-3 flex justify-between items-center">
                        <span className="text-xs font-bold text-white uppercase tracking-widest">第 {idx + 1} 组</span>
                        <span className="text-[10px] text-white/50">{group.length} 人</span>
                      </div>
                      <div className="p-4 space-y-2">
                        {group.map((person, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F5F5F3] transition-colors group">
                            <div className="w-6 h-6 rounded-full bg-[#EEEEEB] flex items-center justify-center text-[10px] font-bold text-[#888887] group-hover:bg-black group-hover:text-white transition-colors">
                              {pIdx + 1}
                            </div>
                            <span className="text-sm font-medium">{person}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 border-2 border-dashed border-[#DDDDDC] rounded-3xl h-64 flex flex-col items-center justify-center gap-4">
                   <div className="p-4 bg-white rounded-full shadow-sm text-[#DDDDDC]">
                      <LayoutGrid size={48} />
                   </div>
                   <p className="text-sm font-bold text-[#888887] uppercase tracking-widest">点击上方按钮开始分组</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #DDDDDC;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #888887;
        }
      `}</style>
    </div>
  );
}
