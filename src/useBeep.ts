import { useCallback, useEffect, useRef } from "react";

type UseBeepReturnType = [
  (frequency?: number, volume?: number) => void,
  () => void
];

export const useBeep = (): UseBeepReturnType => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorRef = useRef<OscillatorNode | null>(null);
  const activeGainNodeRef = useRef<GainNode | null>(null);

  const getAudioContext = (): AudioContext => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    return audioContextRef.current;
  };

  useEffect(() => {
    return () => {
      const asyncCleanup = async () => {
        if (activeOscillatorRef.current) {
          try {
            activeOscillatorRef.current.stop();
          } catch (e) {
            console.error(e);
          }
        }

        if (
          audioContextRef.current &&
          audioContextRef.current.state !== "closed"
        ) {
          await audioContextRef.current.close();
        }
      };

      void asyncCleanup();
    };
  }, []);

  const startBeep = useCallback((frequency = 440, volume = 100) => {
    const audioContext = getAudioContext();

    if (activeOscillatorRef.current) {
      stopBeep();
    }

    const oscillatorNode = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillatorNode.connect(gainNode);
    oscillatorNode.frequency.value = frequency;
    oscillatorNode.type = "square";

    gainNode.connect(audioContext.destination);
    gainNode.gain.value = volume * 0.01;

    activeOscillatorRef.current = oscillatorNode;
    activeGainNodeRef.current = gainNode;

    oscillatorNode.start(audioContext.currentTime);
  }, []);

  const stopBeep = useCallback((): void => {
    if (!activeOscillatorRef.current) {
      return;
    }

    try {
      activeOscillatorRef.current.stop();

      if (activeGainNodeRef.current) {
        activeGainNodeRef.current.disconnect();
      }

      activeOscillatorRef.current = null;
      activeGainNodeRef.current = null;
    } catch (error) {
      console.error("Error stopping beep:", error);
    }
  }, []);

  return [startBeep, stopBeep];
};
