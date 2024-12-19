import React, { useState } from 'react';

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

    setOutput(''); // Clear previous output
    setIsRunning(true);
    setCaptchaRequired(false);

    for (let i = 1; i <= number; i++) {
      if (captchaRequired) {
        // Pause until CAPTCHA is resolved
        await handleCaptcha();
      }

      await fetchSequence(i);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 second
    }

    setIsRunning(false);
  };

  const fetchSequence = async (index: number) => {
    try {
      const response = await fetch('https://api.prod.jcloudify.com/whoami');

      if (response.status === 403) {
        setCaptchaRequired(true);
        return;
      }

      // Simulate "Forbidden" response for this example
      setOutput(prev => `${prev}${index}. Forbidden\n`);
    } catch (error) {
      console.error(`Error fetching sequence at index ${index}:`, error);
      setOutput(prev => `${prev}${index}. Error\n`);
    }
  };

  const handleCaptcha = async () => {
    setCaptchaRequired(true);
    alert('Please complete the CAPTCHA to continue.');
    // Simulate CAPTCHA resolution for demonstration
    return new Promise<void>(resolve => {
      setTimeout(() => {
        setCaptchaRequired(false);
        resolve();
      }, 5000); // Replace this with real CAPTCHA handling logic
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
              onChange={e => setNumber(Number(e.target.value))}
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
