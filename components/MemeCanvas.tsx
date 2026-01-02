import React from 'react';

interface MemeCanvasProps {
  image: string;
  topText: string;
  bottomText: string;
  containerRef: React.RefObject<HTMLDivElement>;
  onUploadClick: () => void;
}

const MemeCanvas: React.FC<MemeCanvasProps> = ({ image, topText, bottomText, containerRef, onUploadClick }) => {
  return (
    <div 
      ref={containerRef}
      className="relative w-full min-h-[400px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mx-auto flex items-center justify-center group border-4 border-white/10"
    >
      {image ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={image} 
            alt="Meme base" 
            crossOrigin="anonymous"
            className="max-w-full max-h-[70vh] object-contain"
          />
          
          {/* Top Text Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 text-center pointer-events-none">
            <h2 className="meme-font text-white text-3xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] break-words uppercase">
              {topText}
            </h2>
          </div>

          {/* Bottom Text Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center pointer-events-none">
            <h2 className="meme-font text-white text-3xl md:text-5xl lg:text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,1)] break-words uppercase">
              {bottomText}
            </h2>
          </div>
        </div>
      ) : (
        <button 
          onClick={onUploadClick}
          className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-6 group hover:bg-slate-800 transition-colors p-8"
        >
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
            <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-white">Upload Your Image</h3>
            <p className="text-slate-400 max-w-[200px]">Drag and drop or click to browse files from your device</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default MemeCanvas;