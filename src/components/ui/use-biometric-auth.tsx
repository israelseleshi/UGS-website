import { useState, useEffect, useCallback } from 'react';

// TypeScript declarations for Web APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Biometric authentication types
export interface BiometricCapabilities {
  fingerprint: boolean;
  faceId: boolean;
  voiceRecognition: boolean;
  gestureAuth: boolean;
}

export interface BiometricAuthResult {
  success: boolean;
  method: 'fingerprint' | 'faceId' | 'voice' | 'gesture' | null;
  error?: string;
}

// Voice recognition patterns for navigation
const VOICE_COMMANDS = {
  'open menu': 'openMenu',
  'close menu': 'closeMenu',
  'go home': 'navigateHome',
  'sign in': 'signIn',
  'get started': 'getStarted',
  'services': 'navigateServices',
  'about': 'navigateAbout',
  'contact': 'navigateContact'
} as const;

export const useBiometricAuth = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    fingerprint: false,
    faceId: false,
    voiceRecognition: false,
    gestureAuth: false
  });
  
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any | null>(null);

  // Check biometric capabilities on mount
  useEffect(() => {
    const checkCapabilities = async () => {
      const caps: BiometricCapabilities = {
        fingerprint: false,
        faceId: false,
        voiceRecognition: false,
        gestureAuth: true // Always available as fallback
      };

      // Check for Web Authentication API (WebAuthn)
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        try {
          const available = await (navigator.credentials as any).get({
            publicKey: {
              challenge: new Uint8Array(32),
              allowCredentials: [],
              userVerification: 'preferred'
            }
          }).catch(() => false);
          
          caps.fingerprint = !!available;
        } catch (error) {
          console.log('Fingerprint not available');
        }
      }

      // Check for Face ID (iOS Safari specific)
      if ('TouchID' in window || 'FaceID' in window) {
        caps.faceId = true;
      }

      // Check for Speech Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        caps.voiceRecognition = true;
        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-US';
        setRecognition(recognitionInstance);
      }

      setCapabilities(caps);
    };

    checkCapabilities();
  }, []);

  // Fingerprint authentication
  const authenticateFingerprint = useCallback(async (): Promise<BiometricAuthResult> => {
    if (!capabilities.fingerprint) {
      return { success: false, method: null, error: 'Fingerprint not available' };
    }

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'UGS Website' },
          user: {
            id: new Uint8Array(16),
            name: 'user@ugs.com',
            displayName: 'UGS User'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          }
        }
      } as any);

      return { success: !!credential, method: 'fingerprint' };
    } catch (error) {
      return { success: false, method: null, error: 'Fingerprint authentication failed' };
    }
  }, [capabilities.fingerprint]);

  // Face ID authentication (iOS specific)
  const authenticateFaceId = useCallback(async (): Promise<BiometricAuthResult> => {
    if (!capabilities.faceId) {
      return { success: false, method: null, error: 'Face ID not available' };
    }

    try {
      // iOS Face ID implementation would go here
      // For now, simulate the authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, method: 'faceId' };
    } catch (error) {
      return { success: false, method: null, error: 'Face ID authentication failed' };
    }
  }, [capabilities.faceId]);

  // Voice command recognition
  const startVoiceRecognition = useCallback((onCommand: (command: string) => void) => {
    if (!recognition || !capabilities.voiceRecognition) {
      return false;
    }

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      const command = VOICE_COMMANDS[transcript as keyof typeof VOICE_COMMANDS];
      
      if (command) {
        onCommand(command);
      }
      
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    return true;
  }, [recognition, capabilities.voiceRecognition]);

  const stopVoiceRecognition = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  // Gesture authentication (custom gesture patterns)
  const authenticateGesture = useCallback(async (gesturePattern: string): Promise<BiometricAuthResult> => {
    // Simple gesture patterns for demo
    const validPatterns = ['circle', 'zigzag', 'triangle', 'swipe-up-down'];
    
    if (validPatterns.includes(gesturePattern)) {
      return { success: true, method: 'gesture' };
    }
    
    return { success: false, method: null, error: 'Invalid gesture pattern' };
  }, []);

  // Quick action triggers
  const triggerQuickAction = useCallback(async (action: string) => {
    const authResult = await authenticateFingerprint();
    
    if (authResult.success) {
      // Haptic feedback for successful authentication
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
      
      return { success: true, action };
    }
    
    return { success: false, error: 'Authentication required' };
  }, [authenticateFingerprint]);

  return {
    capabilities,
    isListening,
    authenticateFingerprint,
    authenticateFaceId,
    authenticateGesture,
    startVoiceRecognition,
    stopVoiceRecognition,
    triggerQuickAction
  };
};

export default useBiometricAuth;
