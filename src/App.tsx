import React, { useState } from 'react';
import axios from 'axios';

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: 'https://api.prod.jcloudify.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const API_KEY = import.meta.env.VITE_AWS_WAF_API_KEY;
    if (API_KEY) {
      config.headers['Authorization'] = `Bearer ${API_KEY}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      return Promise.reject({ isForbidden: true });
    }
    if (error.response && error.response.status === 405) {
      return Promise.reject({ captchaRequired: true });
    }
    return Promise.reject(error);
  }
);

const App: React.FC = () => {
  const [number, setNumber] = useState<number | null>(null);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (number === null || number < 1 || number > 1000) {
      alert('Please enter a valid number between 1 and 1000.');
      return;
    }

    setOutput('');
    setIsRunning(true);
    setCaptchaRequired(false);

    for (let i = 1; i <= number; i++) {
      if (captchaRequired) {
        await handleCaptcha();
      }

      try {
        await fetchSequence(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error: any) {
        if (error.captchaRequired) {
          setCaptchaRequired(true);
        } else if (error.isForbidden) {
          setOutput((prev) => `${prev}${i}. Forbidden\n`);
        } else {
          console.error(`Error fetching sequence at index ${i}:`, error);
          setOutput((prev) => `${prev}${i}. Error\n`);
        }
      }
    }

    setIsRunning(false);
  };

  const fetchSequence = async (index: number) => {
    try {
      const response = await axiosInstance.get('/whoami', { withCredentials: true });
      setOutput((prev) => `${prev}${index}. ${response.statusText}\n`);
    } catch (error) {
      throw error; 
    }
  };

  const handleCaptcha = async () => {
    return new Promise<void>((resolve) => {
      const captchaWidget = (window as any).AWSWAFIntegration?.loadCaptcha();

      if (!captchaWidget) {
        console.error('AWS CAPTCHA SDK not loaded.');
        resolve();
        return;
      }

      captchaWidget.show({
        onSuccess: () => {
          console.log('CAPTCHA solved successfully!');
          setCaptchaRequired(false);
          resolve();
        },
        onError: (error: any) => {
          console.error('Error solving CAPTCHA:', error);
          resolve();
        },
      });
    });
  };

  return (
    <div style={{ padding: '2em', fontFamily: 'Arial, sans-serif' }}>
      <h1>Forbidden Sequence Generator</h1>
      {!isRunning && (
        <form onSubmit={handleFormSubmit}>
          <label>
            Enter a number (1-1000):
            <input
              type="number"
              value={number ?? ''}
              onChange={(e) => setNumber(Number(e.target.value))}
              min={1}
              max={1000}
              required
              style={{ marginLeft: '0.5em' }}
            />
          </label>
          <button type="submit" style={{ marginLeft: '1em' }}>
            Generate
          </button>
        </form>
      )}
      {captchaRequired && (
        <div style={{ marginTop: '1em', color: 'red' }}>
          <strong>CAPTCHA required. Please resolve it to continue.</strong>
        </div>
      )}
      <pre id="output" style={{ marginTop: '1em', whiteSpace: 'pre-wrap' }}>
        {output}
      </pre>
    </div>
  );
};

export default App;
