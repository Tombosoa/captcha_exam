import React, { useState } from "react";
import axios from "axios";

const api = axios.create({
    baseURL: "https://api.prod.jcloudify.com", 
});

api.interceptors.request.use(
    (config) => {
        console.log("Request sent with config:", config);
        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("Response received:", response);
        return response;
    },
    (error) => {
        console.error("Response error:", error);
        return Promise.reject(error);
    }
);

const App: React.FC = () => {
    const [number, setNumber] = useState<number | "">("");
    const [output, setOutput] = useState<string>("");
    const [isRunning, setIsRunning] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (typeof number === "string" || number < 1 || number > 1000) {
            alert("Please enter a number between 1 and 1000.");
            return;
        }

        setIsRunning(true);
        setOutput("");

        for (let i = 1; i <= number; i++) {
            try {
                const response = await api.get("/whoami"); 
                if (response.status === 200) {
                    setOutput((prev) => prev + `${i}. Forbidden\n`);
                } else {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    setOutput((prev) => prev + `${i}. Forbidden\n`);
                }
            } catch (error) {
                setOutput((prev) => prev + `${i}. Error: ${error instanceof Error ? error.message : "Unknown error"}\n`);
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        setOutput((prev) => prev + "Sequence complete!");
        setIsRunning(false);
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", margin: "2em" }}>
            <h1>Generate Forbidden Sequence</h1>
            {!isRunning && (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="numberInput">Enter a number (1-1000):</label>
                    <input
                        type="number"
                        id="numberInput"
                        value={number}
                        onChange={(e) => setNumber(e.target.value === "" ? "" : parseInt(e.target.value))}
                        min="1"
                        max="1000"
                        required
                    />
                    <button type="submit">Submit</button>
                </form>
            )}
            <pre
                style={{
                    marginTop: "1em",
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    background: "#f9f9f9",
                    padding: "1em",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                }}
            >
                {output}
            </pre>
        </div>
    );
};

export default App;
