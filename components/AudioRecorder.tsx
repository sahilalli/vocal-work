import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Check, RefreshCcw, Play, Volume2 } from 'lucide-react';
import { Button } from './UI';

interface AudioRecorderProps {
  onComplete: () => void;
  script: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onComplete, script }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMediaStream(stream);
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyserNode = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserNode);
      analyserNode.fftSize = 256;
      setAnalyser(analyserNode);

      setIsRecording(true);
      setElapsed(0);
      setIsFinished(false);

      intervalRef.current = window.setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      
      drawVisualizer(analyserNode);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to complete this task.");
    }
  };

  const drawVisualizer = (analyserNode: AnalyserNode) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording && !analyserNode) return; // Stop drawing if stopped
      
      requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#f9fafb'; // match bg-gray-50
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Gradient color
        ctx.fillStyle = `rgb(${barHeight + 100}, 99, 235)`; // Indigo-ish
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const stopRecording = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
    setIsFinished(true);
  };

  const reset = () => {
    setIsFinished(false);
    setElapsed(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 text-gray-100 p-6 rounded-xl text-lg leading-relaxed font-serif shadow-inner">
        "{script}"
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-full h-32 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
          {!isRecording && !isFinished && <div className="text-gray-400 flex flex-col items-center"><Mic className="mb-2" /> Ready to Record</div>}
          <canvas ref={canvasRef} width={600} height={128} className={`w-full h-full absolute top-0 left-0 ${!isRecording ? 'hidden' : 'block'}`} />
          {isFinished && <div className="text-indigo-600 flex flex-col items-center"><Check className="mb-2 w-8 h-8" /> Recording Captured</div>}
        </div>

        <div className="text-3xl font-mono font-bold text-gray-700">
          00:{elapsed < 10 ? `0${elapsed}` : elapsed}
        </div>

        <div className="flex space-x-4">
          {!isRecording && !isFinished && (
            <Button onClick={startRecording} className="w-32 rounded-full h-12">
              <Mic className="w-4 h-4 mr-2" /> Record
            </Button>
          )}
          
          {isRecording && (
            <Button onClick={stopRecording} variant="danger" className="w-32 rounded-full h-12 animate-pulse">
              <Square className="w-4 h-4 mr-2" /> Stop
            </Button>
          )}

          {isFinished && (
            <>
               <Button onClick={reset} variant="secondary" className="rounded-full">
                <RefreshCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
              <Button onClick={onComplete} variant="success" className="rounded-full">
                <Check className="w-4 h-4 mr-2" /> Submit Work
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
