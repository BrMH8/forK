import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { songs } from './data';
import { CiPause1, CiPlay1 } from "react-icons/ci";
import { BiSkipNextCircle, BiSkipPreviousCircle, BiReset } from "react-icons/bi";
import { TiThMenu } from "react-icons/ti";
import NewTag from './NewTag';

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
        className="absolute top-6 right-6 md:top-10 md:right-10 z-40 bg-gradient-to-br from-pink-500/20 to-purple-600/20 p-3 rounded-full hover:from-pink-500/40 hover:to-purple-600/40 transition-all text-xl md:text-2xl text-pink-400 hover:text-pink-300 border border-pink-500/30"
      >
        <TiThMenu />
      </button>

      <main className="flex-1 flex flex-col items-center justify-between py-8 md:justify-center bg-gradient-to-br from-purple-900/30 via-black to-pink-900/30 relative overflow-hidden">
        {/* Efecto de fondo animado */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
        </div>
        
        {/* ÁREA DE LETRAS */}
        <div className="relative h-[45vh] md:h-[500px] w-full max-w-5xl overflow-hidden flex flex-col items-center z-10 bg-transparent">
          <div className="absolute top-0 w-full h-24 md:h-40 z-10 pointer-events-none" />
          <div className="absolute bottom-0 w-full h-24 md:h-40 z-10 pointer-events-none" />

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
                  textShadow: activeIndex === index ? "0 0 30px rgba(219, 39, 119, 0.8), 0 0 60px rgba(168, 85, 247, 0.6)" : "0 0 0px rgba(219, 39, 119, 0)",
                }}
                transition={{ type: "spring", damping: 25, stiffness: 80 }}
                className="flex items-center justify-center text-3xl md:text-5xl lg:text-6xl font-serif italic text-center px-6 leading-tight bg-gradient-to-r from-pink-400 via-purple-300 to-pink-400 bg-clip-text text-transparent"
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
          
          <div className="bg-gradient-to-br from-[#1a0a2e] via-[#121212] to-[#2d1b3d] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-pink-500/20 shadow-2xl shadow-pink-500/10">
            <div className="text-center mb-4 md:mb-6">
              <h3 className="font-bold text-lg md:text-xl truncate bg-gradient-to-r from-pink-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{currentSong.title}</h3>
              <p className="text-[10px] md:text-xs text-pink-400/70 uppercase tracking-widest mt-2">{currentSong.artist}</p>
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
                className="text-2xl md:text-3xl text-pink-400 hover:text-pink-300 hover:drop-shadow-lg transition-all duration-300 active:scale-95"
              >
                <BiSkipPreviousCircle />
              </button>
              
              <button 
                onClick={togglePlay} 
                className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg shadow-pink-500/50 hover:shadow-pink-500/80"
              >
                <span className="text-2xl md:text-3xl">
                  {isPlaying ? <CiPause1 /> : <CiPlay1 />}
                </span>
              </button>

              <button 
                onClick={() => selectSong((currentSongIndex + 1) % songs.length)} 
                className="text-2xl md:text-3xl text-pink-400 hover:text-pink-300 hover:drop-shadow-lg transition-all duration-300 active:scale-95"
              >
                <BiSkipNextCircle />
              </button>

              <button 
                onClick={() => audioRef.current.currentTime = 0} 
                className="text-xl md:text-2xl text-pink-400 hover:text-pink-300 hover:drop-shadow-lg transition-all duration-300 active:scale-95 ml-2"
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
              className="fixed right-0 top-0 h-full w-[280px] md:w-[350px] bg-gradient-to-b from-purple-900/30 via-[#0a0a0a] to-pink-900/20 border-l border-pink-500/20 z-50 p-6 md:p-8 flex flex-col shadow-2xl shadow-pink-500/10"
            >
              <div className="flex justify-between items-center mb-8 md:mb-10">
                <h2 className="text-sm md:text-lg font-bold tracking-tighter uppercase bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Biblioteca para mi noviecita</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="text-xl md:text-2xl text-pink-400 hover:text-pink-300">✕</button>
              </div>
              
              <div className="space-y-3 md:space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {songs.map((song, index) => (
                  <button
                    key={song.id}
                    onClick={() => selectSong(index)}
                    className={`w-full text-left p-4 rounded-xl md:rounded-2xl transition-all ${
                      currentSongIndex === index 
                      ? `bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-[1.02] shadow-xl shadow-pink-500/50` 
                      : 'hover:bg-white/5 hover:border hover:border-pink-500/30 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-sm md:text-base truncate text-white group-hover:text-pink-300">{song.title}</p>
                        <p className="text-[10px] uppercase opacity-70 text-pink-300/60">{song.artist}</p>
                      </div>
                      {/* Etiqueta 'New' para canciones nuevas */}
                      {song.id === 3 && <NewTag />} {/* Cambia la condición según las nuevas canciones */}
                    </div>
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