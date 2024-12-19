import React, { useEffect } from "react";

interface CaptchaComponentProps {
  onSuccess: () => Promise<void>; 
}
declare global {
  interface Window {
    AwsWafCaptcha?: {
      renderCaptcha: (
        container: HTMLElement,
        options: {
          apiKey: string;
          onSuccess: (wafToken: string) => void;
          onError: (error: unknown) => void;
        }
      ) => void;
    };
  }
}

const CaptchaComponent: React.FC<CaptchaComponentProps> = () => {
  useEffect(() => {
    const captchaScript = document.createElement("script");
    captchaScript.src = "https://b82b1763d1c3.ef7ef6cc.eu-west-3.captcha.awswaf.com/b82b1763d1c3/jsapi.js";
    captchaScript.type = "text/javascript";
    captchaScript.defer = true;

    document.head.appendChild(captchaScript);

    return () => {
      document.head.removeChild(captchaScript);
    };
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_WAF_API;

   

    const container = document.getElementById("my-captcha-container");

    if (window.AwsWafCaptcha && container) {
      window.AwsWafCaptcha.renderCaptcha(container, {
        apiKey: apiKey,
        onSuccess: captchaExampleSuccessFunction,
        onError: captchaExampleErrorFunction,
      });
    } else {
      console.error("Captcha SDK not found");
    }
  }, []); 

  const captchaExampleSuccessFunction = (wafToken: string) => {
    console.log("WAF Token:", wafToken);

    fetch("...WAF-protected URL...", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: wafToken }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const captchaExampleErrorFunction = (error: unknown) => {
    console.error("Captcha Error:", error);
  };

  return (
    <div>
      <div id="my-captcha-container" style={{ marginBottom: "20px" }}>
      </div>
    </div>
  );
};

export default CaptchaComponent;
