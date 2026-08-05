'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Clock, 
  Sparkles, 
  Activity,
  Ticket,
  BellRing,
  Play,
  Sliders,
  Check
} from 'lucide-react';
import { ItemFila } from '@/lib/db';

interface PainelTvRecepcaoProps {
  fila: ItemFila[];
}

export const PainelTvRecepcao: React.FC<PainelTvRecepcaoProps> = ({ fila }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.88);
  const [speechPitch, setSpeechPitch] = useState<number>(1.05);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastCalledIdRef = useRef<string | null>(null);

  // A senha atual sendo chamada no momento (status EM_ATENDIMENTO)
  const senhaEmAtendimento = fila.find(i => i.status === 'EM_ATENDIMENTO');
  const ultimasChamadas = fila
    .filter(i => i.status === 'EM_ATENDIMENTO' || i.status === 'CONCLUIDO')
    .slice(-4)
    .reverse();

  // Carregar todas as vozes do navegador
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Filtra preferencialmente vozes em português, mas lista todas se necessário
        const ptVoices = voices.filter(v => v.lang.includes('pt') || v.lang.includes('BR'));
        const finalVoices = ptVoices.length > 0 ? ptVoices : voices;
        setAvailableVoices(finalVoices);

        if (finalVoices.length > 0 && !selectedVoiceURI) {
          // Escolhe uma voz padrão em português
          const defaultVoice = finalVoices.find(v => 
            v.name.includes('Google') || v.name.includes('Luciana') || v.name.includes('Francisca') || v.name.includes('Natural')
          ) || finalVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Sinal Sonoro Chime Hospitalar
  const playHospitalChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      
      // Nota 1 (C5 - 523.25Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.8);

      // Nota 2 (E5 - 659.25Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.25);
      gain2.gain.setValueAtTime(0.25, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.2);
    } catch (e) {
      console.log('Web Audio Chime Error:', e);
    }
  };

  // Função para testar voz com frase demonstrativa
  const handleTestVoice = (customPhrase?: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      playHospitalChime();

      setTimeout(() => {
        const frase = customPhrase || "Atenção. Senha... N-001. Paciente... Luiz Fernando Sidral. Por favor, dirija-se ao... Consultório 1.";
        const utterance = new SpeechSynthesisUtterance(frase);
        utterance.lang = 'pt-BR';
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

        const voiceObj = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
        if (voiceObj) {
          utterance.voice = voiceObj;
        }

        window.speechSynthesis.speak(utterance);
      }, 600);
    }
  };

  // Efeito ao chamar nova senha
  useEffect(() => {
    if (senhaEmAtendimento && senhaEmAtendimento.id !== lastCalledIdRef.current) {
      lastCalledIdRef.current = senhaEmAtendimento.id;

      if (voiceEnabled) {
        const partesSenha = senhaEmAtendimento.senha.split('-');
        const senhaFalada = partesSenha.length > 1 
          ? `${partesSenha[0]}, ${parseInt(partesSenha[1], 10)}` 
          : senhaEmAtendimento.senha;

        const fraseChamada = `Atenção. Senha... ${senhaFalada}. Paciente... ${senhaEmAtendimento.paciente_nome}. Por favor, dirija-se ao... ${senhaEmAtendimento.consultorio || 'Consultório 1'}.`;
        
        handleTestVoice(fraseChamada);
      }
    }
  }, [senhaEmAtendimento, voiceEnabled]);

  // Handler para Tela Cheia (Fullscreen API)
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`min-h-[85vh] flex flex-col justify-between p-6 sm:p-10 rounded-3xl transition-all relative overflow-hidden bg-gradient-to-br from-[#030612] via-[#070c1e] to-[#040817] text-white border border-sky-500/30 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-10 bg-[#030612]' : ''
      }`}
    >
      
      {/* LUZES E GLOW DE FUNDO DA TV */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[140px] pointer-events-none" />

      {/* CABEÇALHO DO TELÃO DE RECEPÇÃO */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 rounded-2xl gradient-bg flex items-center justify-center shadow-2xl shadow-sky-500/30">
            <Activity className="h-8 w-8 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-black tracking-wider gradient-text">MEDSY</span>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">PAINEL DE CHAMADA DE PACIENTES</p>
          </div>
        </div>

        {/* CONTROLES DE VOZ E TELA CHEIA */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* BOTÃO TESTAR VOZ SELECIONADA */}
          <button
            onClick={() => handleTestVoice()}
            className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold"
            title="Ouvir Teste de Voz"
          >
            <Play className="h-3.5 w-3.5 text-sky-400 fill-sky-400" />
            <span>Ouvir Voz</span>
          </button>

          {/* PAINEL DE AJUSTE DE VOZES */}
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className={`flex items-center space-x-1.5 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              showVoiceSettings ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-purple-400" />
            <span>Selecionar Voz</span>
          </button>

          {/* TOGGLE VOZ SINTETIZADA */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              voiceEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Ativar/Desativar Anúncio de Voz"
          >
            {voiceEnabled ? <Volume2 className="h-4 w-4 text-emerald-400 animate-bounce" /> : <VolumeX className="h-4 w-4" />}
            <span>{voiceEnabled ? 'Voz Sonora Ativa 🔊' : 'Voz Muta 🔇'}</span>
          </button>

          {/* TOGGLE TELA CHEIA (FULLSCREEN) */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl gradient-bg text-white font-bold text-xs shadow-xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            <span>{isFullscreen ? 'Sair da Tela Cheia' : 'Projetar em Tela Cheia 📺'}</span>
          </button>

        </div>
      </div>

      {/* SELETOR DE VOZES E SLIDERS DE CADÊNCIA (MODAL/CARD EXPANSÍVEL) */}
      {showVoiceSettings && (
        <div className="relative z-20 glass-card rounded-2xl p-5 border border-purple-500/30 space-y-4 my-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-purple-300 flex items-center space-x-2">
              <Sliders className="h-4 w-4" />
              <span>Configurações & Seleção de Voz Sintetizada</span>
            </h4>
            <span className="text-[10px] text-slate-400">{availableVoices.length} voz(es) em Português instalada(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* DROPDOWN DE VOZES */}
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Selecione a Voz do Sistema:</label>
              <select
                value={selectedVoiceURI}
                onChange={(e) => {
                  setSelectedVoiceURI(e.target.value);
                  setTimeout(() => handleTestVoice(), 100);
                }}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              >
                {availableVoices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* SLIDER DE VELOCIDADE */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                <span>Velocidade da Fala:</span>
                <span className="text-sky-400 font-mono">{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.2"
                step="0.05"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-sky-400"
              />
            </div>

            {/* SLIDER DE TOM DE VOZ */}
            <div>
              <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                <span>Tom de Voz (Pitch):</span>
                <span className="text-purple-400 font-mono">{speechPitch}</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="w-full accent-purple-400"
              />
            </div>

          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => handleTestVoice()}
              className="px-4 py-2 rounded-xl gradient-bg text-white font-bold text-xs flex items-center space-x-1.5 shadow-md"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Testar Esta Voz Agora</span>
            </button>
          </div>
        </div>
      )}

      {/* ÁREA CENTRAL PRINCIPAL: EXIBIÇÃO DA SENHA E NOME */}
      <div className="relative z-10 my-8 flex-1 flex flex-col justify-center items-center text-center space-y-6">
        
        <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-sm font-extrabold shadow-lg">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <span>SENHA EM CHAMADA NO MOMENTO</span>
        </div>

        {senhaEmAtendimento ? (
          <div className="space-y-6 max-w-4xl w-full animate-in zoom-in-95 duration-500">
            
            {/* NÚMERO DA SENHA EM TAMANHO GIGANTE */}
            <div className="flex items-center justify-center space-x-4">
              <span className="text-7xl sm:text-9xl font-black gradient-text tracking-widest drop-shadow-[0_10px_30px_rgba(56,189,248,0.3)]">
                {senhaEmAtendimento.senha}
              </span>
              <span className={`px-5 py-2 rounded-2xl text-sm font-black tracking-wider uppercase border ${
                senhaEmAtendimento.tipo === 'PREFERENCIAL'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              }`}>
                {senhaEmAtendimento.tipo}
              </span>
            </div>

            {/* NOME DO PACIENTE E CONSULTÓRIO */}
            <div className="glass-card rounded-3xl p-8 border border-sky-500/30 shadow-2xl bg-slate-900/80 space-y-3">
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wide">
                {senhaEmAtendimento.paciente_nome}
              </h1>
              
              <div className="pt-2 text-xl sm:text-2xl font-bold text-sky-400 flex items-center justify-center space-x-3">
                <span>Dirija-se ao</span>
                <span className="px-4 py-1 rounded-xl bg-sky-500/20 text-white border border-sky-500/40 font-black">
                  {senhaEmAtendimento.consultorio || 'Consultório 1'}
                </span>
                <span>com {senhaEmAtendimento.medico_nome || 'Dr. Médico'}</span>
              </div>
            </div>

          </div>
        ) : (
          <div className="py-16 space-y-4">
            <Ticket className="h-16 w-16 text-slate-600 mx-auto animate-pulse" />
            <h2 className="text-4xl font-extrabold text-slate-400">AGUARDANDO PRÓXIMA CHAMADA...</h2>
            <p className="text-sm text-slate-500">O anúncio sonoro e visual será acionado assim que o médico chamar o paciente.</p>
          </div>
        )}

      </div>

      {/* RODAPÉ DO TELÃO: ÚLTIMAS SENHAS CHAMADAS */}
      <div className="relative z-10 border-t border-slate-800/80 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
            <Clock className="h-4 w-4 text-sky-400" />
            <span>Últimas Senhas Chamadas</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">Atualização em Tempo Real</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ultimasChamadas.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-black text-sky-400">{item.senha}</span>
                <p className="text-xs font-bold text-slate-200 truncate max-w-[140px] mt-0.5">{item.paciente_nome}</p>
              </div>
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                {item.consultorio || 'Sala 1'}
              </span>
            </div>
          ))}

          {ultimasChamadas.length === 0 && (
            <div className="col-span-full py-2 text-center text-xs text-slate-600">Nenhum histórico anterior.</div>
          )}
        </div>
      </div>

    </div>
  );
};
