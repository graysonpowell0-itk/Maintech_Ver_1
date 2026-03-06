// Notification sound utility using Web Audio API
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound - pleasant notification tone
    oscillator.frequency.value = 800; // Hz - pleasant alert frequency
    oscillator.type = 'sine';
    
    // Volume envelope for smooth sound
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01); // Quick fade in
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3); // Fade out
    
    // Play the beep
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    
    // Second beep for double-tone alert
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      
      oscillator2.frequency.value = 1000; // Slightly higher pitch
      oscillator2.type = 'sine';
      
      const now2 = audioContext.currentTime;
      gainNode2.gain.setValueAtTime(0, now2);
      gainNode2.gain.linearRampToValueAtTime(0.3, now2 + 0.01);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.3);
      
      oscillator2.start(now2);
      oscillator2.stop(now2 + 0.3);
    }, 150);
    
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};
