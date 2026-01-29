
import React, { useState, useRef, useEffect } from 'react';
import { CategoryType, WeeklyAnalysis, MovementArticle } from './types';
import { analyzeWeeklyImage, generateMovementArticle } from './services/geminiService';
import { ChevronLeft, Sparkles, Trophy, Upload, Image as ImageIcon, Loader2, Copy, Check, Calendar, MapPin, Users, FileText, Send, Facebook, Edit3 } from 'lucide-react';

type ViewState = 'MAIN' | 'WEEKLY' | 'MOVEMENTS';

const TypewriterCredit: React.FC = () => {
  const fullText = "Võ Đức Toàn - Liên đội trường Tiểu học Giồng Trôm";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setIndex(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setIndex(0);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none select-none flex items-center justify-center whitespace-nowrap"
      style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '16px', fontWeight: 'bold' }}
    >
      <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 bg-clip-text text-transparent drop-shadow-sm">
        {fullText.split('').map((char, i) => (
          <span 
            key={i} 
            style={{ 
              visibility: i < index ? 'visible' : 'hidden',
              display: 'inline-block'
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('MAIN');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WeeklyAnalysis | null>(null);
  const [movementResult, setMovementResult] = useState<MovementArticle | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Fix: Added missing 'const' and consolidated declaration to prevent duplicate in scope
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [movName, setMovName] = useState('');
  const [movDate, setMovDate] = useState('');
  const [movLocation, setMovLocation] = useState('Sân trường của trường tiểu học Giồng Trôm');
  const [movParticipants, setMovParticipants] = useState('');
  const [movContent, setMovContent] = useState('');

  const resetStates = () => {
    setAnalysisResult(null);
    setMovementResult(null);
    setPreviewImage(null);
    setCopied(false);
    setMovName('');
    setMovDate('');
    setMovLocation('Sân trường của trường tiểu học Giồng Trôm');
    setMovParticipants('');
    setMovContent('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setAnalyzing(true);
        setCopied(false);
        try {
          const result = await analyzeWeeklyImage(base64);
          setAnalysisResult(result);
        } catch (error) {
          console.error("Analysis failed", error);
        } finally {
          setAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateMovement = async () => {
    if (!movName || !movDate || !movContent) {
      alert("Vui lòng nhập đầy đủ Tên phong trào, Ngày và Nội dung!");
      return;
    }
    setAnalyzing(true);
    setCopied(false);
    try {
      const result = await generateMovementArticle({
        name: movName,
        date: movDate,
        location: movLocation,
        participants: movParticipants,
        content: movContent
      });
      setMovementResult(result);
    } catch (error) {
      console.error("Movement generation failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const updateWeeklyResult = (field: keyof WeeklyAnalysis, value: string) => {
    if (analysisResult) {
      setAnalysisResult({ ...analysisResult, [field]: value });
    }
  };

  const updateMovementResult = (field: keyof MovementArticle, value: string) => {
    if (movementResult) {
      setMovementResult({ ...movementResult, [field]: value });
    }
  };

  const handleCopy = (type: 'WEEKLY' | 'MOVEMENT') => {
    let textToCopy = '';
    if (type === 'WEEKLY' && analysisResult) {
      textToCopy = `✨ PHONG TRÀO: “Mỗi tuần một câu chuyện đẹp, một cuốn sách hay, một tấm gương sáng” 🌟🌟✨\n\n📅 Tuần ${analysisResult.week} (${analysisResult.date}), Liên đội tiếp tục tổ chức buổi sinh hoạt đầu tuần with nội dung:\n\n📘 Câu chuyện: “${analysisResult.topic}” 🧒 Người trình bày: Em ${analysisResult.presenter}\n\n⛰️ Bài học rút ra: ${analysisResult.lesson}\n\n👏 ${analysisResult.feedback}\n\n🌈 ${analysisResult.spread}\n\n❤️🌟✨ LIÊN ĐỘI TIỂU HỌC GIỒNG TRÔM – CÙNG RÈN LUYỆN, CÙNG TRƯỞNG THÀNH! ❤️✨🌟`;
    } else if (type === 'MOVEMENT' && movementResult) {
      textToCopy = `✨ PHONG TRÀO: “${movementResult.name}” 🌟🌟✨\n\n📅 ${movementResult.introduction}\n\n📝 ${movementResult.detailedContent}\n\n💡 ${movementResult.significance}\n\n❤️🌟✨ LIÊN ĐỘI TIỂU HỌC GIỒNG TRÔM – CÙNG RÈN LUYỆN, CÙNG TRƯỞNG THÀNH! ❤️✨🌟`;
    }

    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const renderMainMenu = () => (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-24 px-4">
      <style>{`
        @keyframes sweep-reverse {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .title-sweep-reverse {
          background: linear-gradient(90deg, #991b1b 0%, #991b1b 45%, #ffffff 50%, #991b1b 55%, #991b1b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sweep-reverse 8s linear infinite;
          line-height: 1.8;
          padding: 0.8rem 0;
          text-align: center;
          width: 100%;
          white-space: nowrap;
        }
      `}</style>
      
      <h1 
        className="text-2xl md:text-4xl lg:text-5xl font-black mb-16 uppercase title-sweep-reverse drop-shadow-sm"
        style={{ fontFamily: '"Times New Roman", Times, serif' }}
      >
        VIẾT BÀI ĐĂNG FANPAGE
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <button
          onClick={() => { setView('WEEKLY'); resetStates(); }}
          className="group relative p-12 bg-blue-500/90 hover:bg-blue-600 text-white rounded-3xl shadow-[0_12px_0_rgba(30,58,138,0.3)] hover:shadow-[0_6px_0_rgba(30,58,138,0.3)] hover:translate-y-[6px] active:shadow-none active:translate-y-[12px] transition-all duration-150 flex flex-col items-center gap-6 text-2xl font-black text-center border-4 border-blue-300/40"
        >
          <div className="bg-yellow-400/20 p-5 rounded-full shadow-inner group-hover:scale-110 transition-transform ring-4 ring-yellow-300/30">
            <Sparkles className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.9)]" />
          </div>
          Mỗi tuần 1 câu chuyện đẹp, một cuốn sách hay, một tấm gương sáng
        </button>

        <button
          onClick={() => { setView('MOVEMENTS'); resetStates(); }}
          className="group relative p-12 bg-emerald-500/90 hover:bg-emerald-600 text-white rounded-3xl shadow-[0_12px_0_rgba(6,78,59,0.3)] hover:shadow-[0_6px_0_rgba(6,78,59,0.3)] hover:translate-y-[6px] active:shadow-none active:translate-y-[12px] transition-all duration-150 flex flex-col items-center gap-6 text-2xl font-black text-center border-4 border-emerald-300/40"
        >
          <div className="bg-orange-400/20 p-5 rounded-full shadow-inner group-hover:scale-110 transition-transform ring-4 ring-orange-300/30">
            <Trophy className="w-16 h-16 text-orange-300 drop-shadow-[0_0_15px_rgba(251,146,60,0.9)]" />
          </div>
          Các phong trào khác của Liên đội
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f2f0e6] text-slate-800 pb-32 relative">
      <TypewriterCredit />
      <style>{`
        @keyframes sweep-reverse {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .title-sweep-reverse-weekly {
          background: linear-gradient(90deg, #991b1b 0%, #991b1b 45%, #ffffff 50%, #991b1b 55%, #991b1b 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: sweep-reverse 8s linear infinite;
          line-height: 1.8;
          padding: 0.6rem 0;
          text-align: center;
          white-space: nowrap;
        }
        [contenteditable]:hover {
          background: rgba(0,0,0,0.03);
          outline: 1px dashed rgba(0,0,0,0.1);
          cursor: text;
        }
        [contenteditable]:focus {
          background: rgba(0,0,0,0.05);
          outline: 2px solid #eab308;
        }
      `}</style>

      {view === 'MAIN' ? (
        renderMainMenu()
      ) : (
        <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
          <div className="flex flex-col items-start gap-2 mb-4">
             <button 
                onClick={() => { setView('MAIN'); resetStates(); }}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold transition-all text-xs bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 hover:bg-white active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Quay lại
              </button>
              
              <h1 
                className={`${
                  view === 'WEEKLY' 
                    ? 'text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl' 
                    : 'text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl'
                } font-black uppercase title-sweep-reverse-weekly w-full`}
                style={{ fontFamily: '"Times New Roman", Times, serif' }}
              >
                {view === 'WEEKLY' ? 'MỖI TUẦN MỘT CÂU CHUYỆN ĐẸP, MỘT CUỐN SÁCH HAY, MỘT TẤM GƯƠNG SÁNG' : 'CÁC PHONG TRÀO HOẠT ĐỘNG KHÁC CỦA LIÊN ĐỘI'}
              </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* CỘT TRÁI: NHẬP LIỆU */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-slate-200/50 min-h-[500px]">
              {view === 'WEEKLY' ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-4 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all min-h-[420px]"
                >
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-md" />
                  ) : (
                    <>
                      <div className="bg-slate-100 p-6 rounded-full text-slate-400">
                        <ImageIcon className="w-16 h-16" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-600">Nhấn để chọn ảnh hoặc kéo thả</p>
                        <p className="text-slate-400">Hỗ trợ định dạng JPG, PNG</p>
                      </div>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><Trophy className="w-4 h-4 text-emerald-600" /> Tên phong trào</label>
                    <input 
                      type="text" value={movName} onChange={e => setMovName(e.target.value)}
                      placeholder="Ví dụ: Đại hội Liên đội, Kế hoạch nhỏ..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all shadow-sm bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-600" /> Ngày tháng năm tổ chức</label>
                    <input 
                      type="text" value={movDate} onChange={e => setMovDate(e.target.value)}
                      placeholder="Ví dụ: 25/10/2025"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all shadow-sm bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" /> Địa điểm tổ chức</label>
                    <input 
                      type="text" value={movLocation} onChange={e => setMovLocation(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all bg-slate-50 shadow-sm text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-600" /> Số lượng tham gia</label>
                    <input 
                      type="text" value={movParticipants} onChange={e => setMovParticipants(e.target.value)}
                      placeholder="Ví dụ: 500 Đội viên"
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all shadow-sm bg-white text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-600" /> Nội dung phong trào</label>
                    <textarea 
                      rows={5} value={movContent} onChange={e => setMovContent(e.target.value)}
                      placeholder="Mô tả tóm tắt nội dung các hoạt động..."
                      className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none transition-all resize-none shadow-sm bg-white text-sm"
                    />
                  </div>
                  <button 
                    onClick={handleGenerateMovement}
                    disabled={analyzing}
                    className="w-full p-4 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50 transition-all active:scale-[0.98]"
                  >
                    {analyzing ? <Loader2 className="animate-spin" /> : <><Send className="w-5 h-5" /> Viết bài tự động</>}
                  </button>
                </div>
              )}
              
              {analyzing && view === 'WEEKLY' && (
                <div className="mt-6 p-4 bg-blue-50/50 rounded-xl flex items-center justify-center gap-3 text-blue-700 font-bold border border-blue-100">
                  <Loader2 className="animate-spin" /> Đang phân tích nội dung hình ảnh...
                </div>
              )}
            </div>

            {/* CỘT PHẢI: KẾT QUẢ */}
            <div className="bg-[#1c1c1a] p-8 rounded-3xl shadow-2xl min-h-[600px] text-slate-100 font-sans overflow-hidden relative flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400"></div>
              
              <div className="flex-grow">
                {(view === 'WEEKLY' && analysisResult) ? (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-yellow-400 leading-snug">
                        ✨ PHONG TRÀO: “Mỗi tuần một câu chuyện đẹp, một cuốn sách hay, một tấm gương sáng” 🌟🌟✨
                      </p>
                      <Edit3 className="w-4 h-4 text-white/20" />
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">📅</span>
                      <span>
                        Tuần <span contentEditable onBlur={(e) => updateWeeklyResult('week', e.currentTarget.innerText)} className="border-b border-white/20 px-1 focus:bg-white/10 outline-none">{analysisResult.week}</span> 
                        (<span contentEditable onBlur={(e) => updateWeeklyResult('date', e.currentTarget.innerText)} className="border-b border-white/20 px-1 focus:bg-white/10 outline-none">{analysisResult.date}</span>), 
                        Liên đội tiếp tục tổ chức buổi sinh hoạt đầu tuần with nội dung:
                      </span>
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">📘</span>
                      <span>Câu chuyện: <span className="font-bold">“<span contentEditable onBlur={(e) => updateWeeklyResult('topic', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{analysisResult.topic}</span>”</span> 🧒 Người trình bày: Em <span className="font-bold focus:bg-white/10 outline-none" contentEditable onBlur={(e) => updateWeeklyResult('presenter', e.currentTarget.innerText)}>{analysisResult.presenter}</span></span>
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">⛰️</span>
                      <span>Bài học rút ra: <span contentEditable onBlur={(e) => updateWeeklyResult('lesson', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{analysisResult.lesson}</span></span>
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">👏</span>
                      <span contentEditable onBlur={(e) => updateWeeklyResult('feedback', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{analysisResult.feedback}</span>
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">🌈</span>
                      <span contentEditable onBlur={(e) => updateWeeklyResult('spread', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{analysisResult.spread}</span>
                    </div>

                    <div className="pt-6 border-t border-white/10 text-center">
                      <p className="text-sm font-bold tracking-wide text-slate-400">
                        ❤️🌟✨ LIÊN ĐỘI TIỂU HỌC GIỒNG TRÔM – CÙNG RÈN LUYỆN, CÙNG TRƯỞNG THÀNH! ❤️✨🌟
                      </p>
                    </div>
                  </div>
                ) : (view === 'MOVEMENTS' && movementResult) ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold text-yellow-400 leading-snug">
                        ✨ PHONG TRÀO: “<span contentEditable onBlur={(e) => updateMovementResult('name', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{movementResult.name.toUpperCase()}</span>” 🌟🌟✨
                      </p>
                      <Edit3 className="w-4 h-4 text-white/20" />
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">📅</span>
                      <span contentEditable onBlur={(e) => updateMovementResult('introduction', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{movementResult.introduction}</span>
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">📝</span>
                      <span contentEditable onBlur={(e) => updateMovementResult('detailedContent', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{movementResult.detailedContent}</span>
                    </div>

                    <div className="flex items-start gap-3 leading-relaxed">
                      <span className="text-xl leading-none">💡</span>
                      <span contentEditable onBlur={(e) => updateMovementResult('significance', e.currentTarget.innerText)} className="focus:bg-white/10 outline-none">{movementResult.significance}</span>
                    </div>

                    <div className="pt-6 border-t border-white/10 text-center">
                      <p className="text-sm font-bold tracking-wide text-slate-400">
                        ❤️🌟✨ LIÊN ĐỘI TIỂU HỌC GIỒNG TRÔM – CÙNG RÈN LUYỆN, CÙNG TRƯỞNG THÀNH! ❤️✨🌟
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center gap-4 py-20">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center">
                      {view === 'WEEKLY' ? <Sparkles className="w-8 h-8 opacity-20" /> : <FileText className="w-8 h-8 opacity-20" />}
                    </div>
                    <p className="text-xl font-medium">Kết quả xem trước sẽ hiện ở đây<br/><span className="text-sm opacity-60">{view === 'WEEKLY' ? 'Vui lòng tải ảnh lên để bắt đầu' : 'Vui lòng nhập thông tin và bấm Viết bài'}</span></p>
                    <p className="text-xs opacity-40 mt-2 italic">(Bạn có thể chỉnh sửa trực tiếp nội dung sau khi hiện ra kết quả)</p>
                  </div>
                )}
              </div>

              {((view === 'WEEKLY' && analysisResult) || (view === 'MOVEMENTS' && movementResult)) && (
                <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
                  <button
                    onClick={() => handleCopy(view === 'WEEKLY' ? 'WEEKLY' : 'MOVEMENT')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                      copied 
                        ? 'bg-emerald-500 text-white scale-95 shadow-emerald-900/20' 
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-900/20 active:translate-y-[2px]'
                    }`}
                  >
                    {copied ? (
                      <><Check className="w-5 h-5" /> Đã sao chép!</>
                    ) : (
                      <><Copy className="w-5 h-5" /> Sao chép bài viết</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER: FANPAGE MENU */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <a 
          href="https://www.facebook.com/profile.php?id=61550660505610" 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center gap-2 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-slate-200 hover:scale-105 hover:bg-white transition-all active:scale-95 group"
        >
          <div className="bg-blue-600 p-1.5 rounded-full text-white shadow-lg group-hover:rotate-12 transition-transform shadow-blue-900/20">
            <Facebook className="w-4 h-4" fill="currentColor" />
          </div>
          <span className="text-slate-800 font-bold tracking-tight text-sm">Fanpage Liên đội</span>
        </a>
      </div>
    </div>
  );
};

export default App;
