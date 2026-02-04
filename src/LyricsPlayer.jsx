import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { songs } from './data';
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { BiSkipNextCircle, BiSkipPreviousCircle, BiReset } from "react-icons/bi";
import { TiThMenu } from "react-icons/ti";

const LyricsPlayer = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [lyrics, setLyrics] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const audioRef = useRef(null);

  const currentSong = songs[currentSongIndex];
  
  // Ajuste responsivo de altura de línea
  const [lineHeight, setLineHeight] = useState(100);

  useEffect(() => {
    const handleResize = () => {
      setLineHeight(window.innerWidth < 768 ? 70 : 100);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const parseLRC = (text) => {
    const lines = text.split('\n');
    const parsed = [];
    const lrcRegex = /\[(\d+):(\d+\.\d+)\](.*)/;

    lines.forEach(line => {
      const match = lrcRegex.exec(line);
      if (match) {
        const totalSeconds = parseInt(match[1]) * 60 + parseFloat(match[2]);
        const textContent = match[3].trim();
        if (textContent) parsed.push({ time: totalSeconds, text: textContent });
      }
    });
    return parsed;
  };

  useEffect(() => {
    fetch(currentSong.lrc)
      .then(res => res.text())
      .then(data => {
        setLyrics(parseLRC(data));
        setActiveIndex(0);
        setProgress(0);
        if (isPlaying) {
          // Pequeño delay para asegurar que el source cargó
          setTimeout(() => audioRef.current?.play(), 100);
        }
      })
      .catch(err => console.error("Error cargando LRC:", err));
  }, [currentSongIndex]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const { currentTime, duration } = audioRef.current;
    setProgress((currentTime / duration) * 100);

    const index = lyrics.findLastIndex((l) => currentTime >= l.time);
    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  const togglePlay = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const selectSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setIsSidebarOpen(false);
    if (audioRef.current) audioRef.current.load();
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans relative">
      
      {/* BOTÓN MENÚ */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-40 bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all text-xl md:text-2xl"
      >
        <TiThMenu />
      </button>

      <main className="flex-1 flex flex-col items-center justify-between py-8 md:justify-center">
        
        {/* ÁREA DE LETRAS */}
        <div className="relative h-[45vh] md:h-[500px] w-full max-w-5xl overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 w-full h-24 md:h-40 bg-gradient-to-b from-black via-black/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 w-full h-24 md:h-40 bg-gradient-to-t from-black via-black/90 to-transparent z-10 pointer-events-none" />

          <motion.div 
            animate={{ y: -(activeIndex * lineHeight) + (window.innerWidth < 768 ? 140 : 200) }}
            transition={{ type: "spring", damping: 30, stiffness: 60 }}
            className="flex flex-col items-center w-full"
          >
            {lyrics.map((line, index) => (
              <motion.div
                key={index}
                animate={{
                  opacity: activeIndex === index ? 1 : 0.05,
                  scale: activeIndex === index ? 1.05 : 0.9,
                  filter: activeIndex === index ? "blur(0px)" : "blur(4px)",
                }}
                className="flex items-center justify-center text-3xl md:text-5xl lg:text-6xl font-serif italic text-center px-6 leading-tight"
                style={{ height: `${lineHeight}px` }}
              >
                {line.text}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CONTROLES */}
        <div className="w-full max-w-[90%] md:max-w-sm px-4 z-30">
          <audio ref={audioRef} src={currentSong.src} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />
          
          <div className="bg-[#121212] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="text-center mb-4 md:mb-6">
              <h3 className="font-bold text-lg md:text-xl truncate">{currentSong.title}</h3>
              <p className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">{currentSong.artist}</p>
            </div>

            <div className="w-full h-[2px] bg-white/10 rounded-full mb-6 md:mb-8 overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${currentSong.color}`}
                animate={{ width: `${progress}%` }} 
                transition={{ type: "tween", ease: "linear" }}
              />
            </div>

            <div className="flex items-center justify-center gap-4 md:gap-6">
              <button 
                onClick={() => selectSong((currentSongIndex - 1 + songs.length) % songs.length)} 
                className="text-2xl md:text-3xl text-gray-500 hover:text-white transition-colors"
              >
                <BiSkipPreviousCircle />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="w-14 h-14 md:w-16 md:h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
              >
                <span className="text-2xl md:text-3xl">
                  {isPlaying ? <CiPause1 /> : <CiPlay1 />}
                </span>
              </button>

              <button 
                onClick={() => selectSong((currentSongIndex + 1) % songs.length)} 
                className="text-2xl md:text-3xl text-gray-500 hover:text-white transition-colors"
              >
                <BiSkipNextCircle />
              </button>

              <button 
                onClick={() => audioRef.current.currentTime = 0} 
                className="text-xl md:text-2xl text-gray-500 hover:text-white transition-colors ml-2"
              >
                <BiReset />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SIDEBAR DERECHA */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.aside 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 h-full w-[280px] md:w-[350px] bg-[#0a0a0a] border-l border-white/10 z-50 p-6 md:p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 md:mb-10">
                <h2 className="text-sm md:text-lg font-bold tracking-tighter uppercase text-gray-400">Biblioteca para mi noviecita</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-xl md:text-2xl">✕</button>
              </div>
              
              <div className="space-y-3 md:space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {songs.map((song, index) => (
                  <button
                    key={song.id}
                    onClick={() => selectSong(index)}
                    className={`w-full text-left p-4 rounded-xl md:rounded-2xl transition-all ${
                      currentSongIndex === index 
                      ? `bg-white text-black scale-[1.02] shadow-xl` 
                      : 'hover:bg-white/5 opacity-60'
                    }`}
                  >
                    <p className="font-bold text-sm md:text-base truncate">{song.title}</p>
                    <p className="text-[10px] uppercase opacity-70">{song.artist}</p>
                  </button>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LyricsPlayer;