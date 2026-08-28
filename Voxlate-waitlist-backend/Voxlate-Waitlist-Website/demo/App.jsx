import React, { useState, useRef } from 'react';

// Common languages supported by both Groq's models and Fish Audio's multi-lingual TTS
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' }

];

export default function App() {
  const [email, setEmail] = useState('');
  const [targetLang, setTargetLang] = useState('hi'); // Default to Hindi
  const [status, setStatus] = useState('Idle');
  const [isRecording, setIsRecording] = useState(false);
  const [receivedAudioUrl, setReceivedAudioUrl] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    if (!email) {
      alert("Please enter an email first!");
      return;
    }
    
    audioChunksRef.current = [];
    setReceivedAudioUrl(null);
    setStatus('Recording...');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setStatus('Microphone error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      
      setTimeout(sendAudioToServer, 100);
    }
  };

  const sendAudioToServer = () => {
    setStatus('Connecting to server...');
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws';
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setStatus('Authenticating...');
      ws.send(`email: ${email}`);
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        if (event.data === 'permitted') {
          setStatus(`Translating to ${SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name}...`);
          
          const fullAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const buffer = await fullAudioBlob.arrayBuffer();
          
          ws.send(buffer);
          // Dynamically send the selected language code from the dropdown
          ws.send(`lang: ${targetLang}`);
        } 
        else if (event.data === 'denied') {
          setStatus('Limit exceeded (Max 3 requests).');
          ws.close();
        }
        else if (event.data === 'error') {
          setStatus('Server processing error.');
        }
      } 
      else if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
        setStatus('Translation complete!');
        const blob = event.data instanceof Blob ? event.data : new Blob([event.data], { type: 'audio/wav' });
        setReceivedAudioUrl(URL.createObjectURL(blob));
      }
    };

    ws.onclose = () => {
      if (status.includes('Translating')) {
         setStatus('Connection closed by server.');
      }
    };
  };

  return (
    <div style={styles.container}>
      <h2>Voxlate Demo Portal</h2>
      
      <input 
        type="email" 
        placeholder="Enter your email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <div style={styles.selectionRow}>
        <label htmlFor="languageSelect" style={styles.label}>Translate to: </label>
        <select 
          id="languageSelect"
          value={targetLang} 
          onChange={(e) => setTargetLang(e.target.value)}
          style={styles.select}
          disabled={isRecording || status.includes('Connecting')}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.status}>
        Status: <strong>{status}</strong>
      </div>

      <div style={styles.controls}>
        {!isRecording ? (
          <button onClick={startRecording} style={styles.btnRecord} disabled={status.includes('Connecting')}>
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={styles.btnStop}>
            Stop & Translate
          </button>
        )}
      </div>

      {receivedAudioUrl && (
        <div style={styles.audioContainer}>
          <h3>Translated Audio:</h3>
          <audio controls src={receivedAudioUrl} autoPlay />
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '450px', margin: '40px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center' },
  input: { padding: '10px', width: '80%', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ccc' },
  selectionRow: { marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  label: { fontWeight: 'bold' },
  select: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  status: { marginBottom: '20px' },
  controls: { margin: '20px 0' },
  btnRecord: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnStop: { padding: '10px 20px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  audioContainer: { marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee' }
};