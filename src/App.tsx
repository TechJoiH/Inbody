import React, { useState, useRef } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart, BarChart, Bar
} from 'recharts';
import { Activity, TrendingDown, TrendingUp, Scale, Percent, Award, Calendar, Upload, Loader2, Trash2 } from 'lucide-react';
import { inbodyData as initialData, InBodyData } from './data';
import { extractInBodyData } from './lib/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm p-4 border border-slate-200 shadow-xl rounded-xl">
        <p className="font-semibold text-slate-800 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-medium text-slate-900">{entry.value}{entry.unit}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'charts' | 'table'>('charts');
  const [isUploading, setIsUploading] = useState(false);
  const [data, setData] = useState<InBodyData[]>(() => {
    const saved = localStorage.getItem('inbodyData');
    if (saved) {
      try { 
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialData;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = error => reject(error);
      });

      const newData = await extractInBodyData(fileBase64, file.type);
      
      let hasUpdated = false;
      let updatedData = data.map(d => {
        // Update if the date matches exactly
        if (d.date === newData.date) {
          hasUpdated = true;
          return { ...d, ...newData };
        }
        return d;
      });

      if (!hasUpdated) {
        updatedData.push(newData as InBodyData);
      }
      
      // Sort chronologically
      updatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setData(updatedData);
      localStorage.setItem('inbodyData', JSON.stringify(updatedData));
      alert(`${hasUpdated ? "更新了" : "添加了"} ${newData.date} 的数据！`);
    } catch (error) {
      console.error(error);
      alert("提取失败：" + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClearData = () => {
    if (window.confirm("确定要恢复默认数据吗？您的所有上传数据将被清除。")) {
      setData(initialData);
      localStorage.removeItem('inbodyData');
    }
  };
  
  const latestData = data[data.length - 1];
  const firstData = data[0];

  const calculateChange = (current: number, previous: number) => {
    if (current === undefined || previous === undefined) return { value: '-', isPositive: false, isZero: true, raw: 0 };
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      isPositive: diff > 0,
      isZero: diff === 0,
      raw: diff
    };
  };

  // Safe destructure for cases where data might be empty
  const weightChange = latestData && firstData ? calculateChange(latestData.weight, firstData.weight) : undefined;
  const muscleChange = latestData && firstData ? calculateChange(latestData.muscle, firstData.muscle) : undefined;
  const fatChange = latestData && firstData ? calculateChange(latestData.fat, firstData.fat) : undefined;
  const scoreChange = latestData && firstData ? calculateChange(latestData.score, firstData.score) : undefined;

  const StatCard = ({ title, value, unit, change, icon: Icon, colorClass, goodDirection }: any) => {
    const isGood = change?.isZero ? null : (change?.isPositive === goodDirection);
    
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl", colorClass)}>
            <Icon className="w-6 h-6" />
          </div>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full",
              change.isZero ? "bg-slate-100 text-slate-600" :
              isGood ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
            )}>
              {change.isZero ? null : change.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{change.isZero ? '无变化' : `${change.value}${unit}`}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <h3 className="text-3xl font-bold text-slate-900">{value ?? '-'}</h3>
            <span className="text-slate-500 font-medium">{unit}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">InBody 数据追踪</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('charts')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === 'charts' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                图表视图
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  activeTab === 'table' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                )}
              >
                数据表格
              </button>
            </div>
            
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                accept="image/*,application/pdf"
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span className="hidden sm:inline">{isUploading ? '解析中...' : '上传新报告'}</span>
              </button>
              
              <button
                onClick={handleClearData}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip-trigger"
                title="清除所有上传数据并恢复默认"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(!data || data.length === 0) ? (
           <div className="text-center py-20">
             <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
               <Activity className="w-10 h-10 text-slate-300" />
             </div>
             <h2 className="text-lg font-medium text-slate-900">暂无数据</h2>
             <p className="text-slate-500 mt-1">请点击右上角的按钮上传您的 InBody 测试报告图片或 PDF。</p>
           </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="体重" 
                value={latestData.weight} 
                unit="kg" 
                change={weightChange} 
                icon={Scale}
                colorClass="bg-blue-50 text-blue-600"
                goodDirection={false}
              />
              <StatCard 
                title="骨骼肌" 
                value={latestData.muscle} 
                unit="kg" 
                change={muscleChange} 
                icon={Activity}
                colorClass="bg-emerald-50 text-emerald-600"
                goodDirection={true}
              />
              <StatCard 
                title="体脂肪" 
                value={latestData.fat} 
                unit="kg" 
                change={fatChange} 
                icon={Percent}
                colorClass="bg-amber-50 text-amber-600"
                goodDirection={false}
              />
              <StatCard 
                title="InBody 评分" 
                value={latestData.score} 
                unit="分" 
                change={scoreChange} 
                icon={Award}
                colorClass="bg-purple-50 text-purple-600"
                goodDirection={true}
              />
            </div>

            {activeTab === 'charts' ? (
              <div className="space-y-6">
                {/* Main Composition Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-bold text-slate-900">身体成分变化趋势</h2>
                    <p className="text-sm text-slate-500">体重、骨骼肌和体脂肪的历史走势</p>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          yAxisId="left"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          domain={['dataMin - 2', 'dataMax + 2']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="weight" 
                          name="体重" 
                          stroke="#3b82f6" 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          unit="kg"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="muscle" 
                          name="骨骼肌" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          unit="kg"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="fat" 
                          name="体脂肪" 
                          stroke="#f59e0b" 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                          unit="kg"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Body Fat Percentage Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">体脂率变化</h2>
                      <p className="text-sm text-slate-500">体脂百分比走势</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorFatPercent" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="fatPercent" name="体脂率" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorFatPercent)" unit="%" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* InBody Score Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">InBody 评分</h2>
                      <p className="text-sm text-slate-500">综合健康评分走势</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 2', 'dataMax + 2']} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="score" name="评分" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" unit="分" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* BMI Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">BMI 变化</h2>
                      <p className="text-sm text-slate-500">身体质量指数走势</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 1', 'dataMax + 1']} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="bmi" name="BMI" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} unit="" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Visceral Fat Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">内脏脂肪等级</h2>
                      <p className="text-sm text-slate-500">内脏脂肪水平变化</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 10]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="visceralFat" name="内脏脂肪" fill="#ef4444" radius={[4, 4, 0, 0]} unit="级" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* BMR Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">基础代谢率 (BMR)</h2>
                      <p className="text-sm text-slate-500">静息状态下消耗的热量</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBmr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 50', 'dataMax + 50']} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="bmr" name="基础代谢" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorBmr)" unit=" kcal" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* SMI Chart */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">SMI 骨骼肌质量指数</h2>
                      <p className="text-sm text-slate-500">四肢骨骼肌量除以身高的平方</p>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 0.2', 'dataMax + 0.2']} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="smi" name="SMI" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} unit=" kg/m²" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap sticky left-0 bg-slate-50 shadow-[1px_0_0_0_#e2e8f0] z-10">测试日期</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">体重 (kg)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">骨骼肌 (kg)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">体脂肪 (kg)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">BMI</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">体脂率 (%)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">InBody评分</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">内脏脂肪(级)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">基础代谢(kcal)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">身体总水分(L)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">蛋白质 (kg)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">无机盐 (kg)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">腰臀比</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">去脂体重(kg)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">肥胖度 (%)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">SMI (kg/m²)</th>
                        <th className="py-4 px-4 font-semibold text-slate-700 text-sm whitespace-nowrap">建议热量(kcal)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...data].reverse().map((d, index) => (
                        <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900 flex items-center gap-2 sticky left-0 bg-white shadow-[1px_0_0_0_#e2e8f0] z-10 group-hover:bg-slate-50/50">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {d.date}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.weight?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.muscle?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.fat?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.bmi?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.fatPercent?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm font-medium text-indigo-600">{d.score ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.visceralFat ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.bmr ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.tbw?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.protein?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.minerals?.toFixed(2) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.whr?.toFixed(2) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.ffm?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.obesityDegree ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.smi?.toFixed(1) ?? '-'}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{d.calorieIntake ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}