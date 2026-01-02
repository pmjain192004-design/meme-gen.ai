import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { TRENDING_TEMPLATES, INITIAL_PROMPTS } from './constants';
import { geminiService } from './services/geminiService';
import MemeCanvas from './components/MemeCanvas';
import { MemeCaptionPair } from './types';

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [magicCaptions, setMagicCaptions] = useState<MemeCaptionPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setImage(readerEvent.target?.result as string);
        resetMeme();
      };
      reader.readAsDataURL(file);
    }
  };

  const selectTemplate = (url: string) => {
    setImage(url);
    resetMeme();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetMeme = () => {
    setMagicCaptions([]);
    setTopText('');
    setBottomText('');
  };

  const handleMagicCaption = async () => {
    if (!image) return;
    setIsLoading(true);
    setLoadingText("MemeGenie is channeling pure humor...");
    try {
      const suggestions = await geminiService.generateMagicCaptions(image);
      setMagicCaptions(suggestions);
    } catch (error) {
      console.error(error);
      alert("The Genie's funny bone is broken. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAIEdit = async () => {
    if (!image || !editPrompt) return;
    setIsLoading(true);
    setLoadingText(`Manifesting: ${editPrompt}...`);
    try {
      const editedImage = await geminiService.editImage(image, editPrompt);
      if (editedImage) {
        setImage(editedImage);
        setEditPrompt('');
      }
    } catch (error) {
      console.error(error);
      alert("The cosmic energy failed. Try a different edit.");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadMeme = async () => {
    if (!canvasRef.current || !image) return;
    
    setIsLoading(true);
    setLoadingText("Exporting the laughter...");
    
    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `memegenie-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error("Download failed", error);
      alert("Could not render the image. Try another template.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyCaptionPair = (pair: MemeCaptionPair) => {
    setTopText(pair.top);
    setBottomText(pair.bottom);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white p-2.5 rounded-xl shadow-lg shadow-purple-200">
            <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight hidden sm:block">
            MemeGenie <span className="bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">AI</span>
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-xl transition-all border border-purple-100"
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            <span className="hidden md:inline">Upload Original</span>
            <span className="md:hidden">Upload</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileUpload}
          />
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Library */}
        <aside className="lg:col-span-3 order-3 lg:order-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <i className="fa-solid fa-fire text-orange-500"></i>
              Meme Templates
            </h3>
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {TRENDING_TEMPLATES.map((tpl) => (
                <button 
                  key={tpl.id}
                  onClick={() => selectTemplate(tpl.url)}
                  className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all duration-300 shadow-sm hover:shadow-purple-100"
                >
                  <img src={tpl.url} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3 text-center">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">{tpl.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: Stage */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-8">
          <MemeCanvas 
            containerRef={canvasRef} 
            image={image || ''} 
            topText={topText} 
            bottomText={bottomText} 
            onUploadClick={() => fileInputRef.current?.click()}
          />

          {image && (
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleMagicCaption}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:shadow-xl hover:shadow-purple-200 disabled:opacity-50 text-white font-black rounded-2xl transition-all transform active:scale-95 uppercase tracking-wider text-lg"
                >
                  <i className="fa-solid fa-wand-sparkles text-xl animate-pulse"></i>
                  Magic Generate Meme
                </button>
                <button 
                  onClick={resetMeme}
                  className="px-6 py-6 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 font-bold rounded-2xl transition-all"
                  title="Clear Text"
                >
                  <i className="fa-solid fa-eraser text-xl"></i>
                </button>
              </div>
              <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                One click. Infinite humor. AI does the hard work.
              </p>
            </div>
          )}

          {/* AI Tools */}
          {image && (
            <div className="bg-purple-900/5 p-8 rounded-3xl border border-purple-100 space-y-6">
               <h3 className="text-sm font-black text-purple-900/40 uppercase tracking-[0.2em] flex items-center gap-2">
                <i className="fa-solid fa-paintbrush text-purple-500"></i>
                Advanced Image Styling
              </h3>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Transform the base image (e.g. 'Cyberpunk style')..."
                  className="flex-1 px-5 py-4 bg-white/60 border border-purple-100 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                />
                <button 
                  onClick={handleAIEdit}
                  disabled={!editPrompt || isLoading}
                  className="bg-purple-600 text-white px-8 rounded-2xl font-black hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-100"
                >
                  Apply
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {INITIAL_PROMPTS.map(p => (
                  <button 
                    key={p} 
                    onClick={() => setEditPrompt(p)}
                    className="text-[10px] font-bold bg-white text-purple-600 px-4 py-2 rounded-full border border-purple-50 hover:border-purple-200 hover:shadow-sm transition-all uppercase tracking-wider"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Results & Output */}
        <aside className="lg:col-span-3 order-2 lg:order-3">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 h-full sticky top-24">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <i className="fa-solid fa-comment-dots text-fuchsia-500"></i>
              Magic Suggestions
            </h3>
            
            <div className="space-y-4 min-h-[300px]">
              {magicCaptions.length > 0 ? (
                magicCaptions.map((pair, i) => (
                  <button 
                    key={i}
                    onClick={() => applyCaptionPair(pair)}
                    className={`w-full text-left p-5 border-2 transition-all group animate-in slide-in-from-right duration-300 rounded-2xl ${
                      topText === pair.top && bottomText === pair.bottom 
                      ? 'bg-purple-600 border-purple-600 text-white ring-4 ring-purple-100' 
                      : 'bg-slate-50 border-slate-100 hover:border-purple-600 hover:bg-purple-50'
                    }`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="space-y-2">
                      <p className={`text-[10px] uppercase font-black tracking-widest ${topText === pair.top ? 'text-purple-200' : 'text-slate-400'}`}>Top</p>
                      <p className={`text-sm font-bold leading-tight line-clamp-2 ${topText === pair.top ? 'text-white' : 'text-slate-700'}`}>
                        {pair.top || '(Blank)'}
                      </p>
                      <div className={`border-t ${topText === pair.top ? 'border-white/20' : 'border-slate-200'} pt-2`}>
                        <p className={`text-[10px] uppercase font-black tracking-widest ${topText === pair.top ? 'text-purple-200' : 'text-slate-400'}`}>Bottom</p>
                        <p className={`text-sm font-bold leading-tight line-clamp-2 ${topText === pair.top ? 'text-white' : 'text-slate-700'}`}>
                          {pair.bottom || '(Blank)'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <i className="fa-solid fa-brain text-3xl"></i>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">
                    {image ? "Click 'Magic Generate' to see options" : "Select an image to unlock AI ideas"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
               <button 
                onClick={downloadMeme}
                disabled={!image || isLoading}
                className="w-full py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-100 disabled:opacity-50 transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                <i className="fa-solid fa-file-export"></i>
                Save to Device
              </button>
            </div>
          </div>
        </aside>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-white p-6 text-center animate-in fade-in duration-300">
          <div className="relative mb-10">
            <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <i className="fa-solid fa-hat-wizard absolute inset-0 flex items-center justify-center text-3xl text-purple-400 animate-bounce"></i>
          </div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">Consulting the Ancients...</h2>
          <p className="text-purple-200/60 font-medium uppercase tracking-[0.2em] text-sm">{loadingText}</p>
        </div>
      )}

      <footer className="py-12 px-6 border-t border-slate-100 text-center bg-white">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
          Genie Studio v3.0 • Fully Automated Humor
        </p>
      </footer>
    </div>
  );
};

export default App;