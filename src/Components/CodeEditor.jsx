import React, { useRef, useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { useNavigate } from "react-router-dom";
import { getDatabase, ref, set, update } from "firebase/database";
import { useFirebase } from "../firebase";
import { get } from "firebase/database";

const CodeEditor = ({ lightState, userCode, onCodeChange, teacherCode }) => {
  const [output, setOutput] = useState("");
  const [evaluationResult, setEvaluationResult] = useState("");
  const navigate = useNavigate();
  const firebase = useFirebase();
  const initialBoilerplate = `#include<stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`;
  const codeRef = useRef(userCode || initialBoilerplate);

  useEffect(() => {
    if (userCode) {
      codeRef.current = userCode;
    }
  }, [userCode]);

  const handleRunCode = async () => {
    if (lightState === "red") {
      setOutput("Cannot run code during red light!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeRef.current }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleSubmitCode = async () => {
    if (lightState === "red") {
      setEvaluationResult("Cannot submit code during red light!");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/evaluate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teacher_code: teacherCode,
          student_code: codeRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setEvaluationResult(result.result);

      const scoreMatch = result.result.match(/Score:\s(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;

      const db = getDatabase();
      if (firebase.user) {
        const userScoreRef = ref(db, "scores/" + firebase.user.uid);
        await set(userScoreRef, {
          score: score,
          timestamp: new Date().toISOString(),
        });

        const teamRef = ref(db, "teams/" + firebase.user.uid);
        const teamSnapshot = await get(teamRef);

        if (teamSnapshot.exists()) {
          const teamData = teamSnapshot.val();
          const round4 = teamData.round4 || 0;
          const overall = teamData.overall || 0;

          await update(teamRef, {
            round4: round4 + score,
            overall: overall + score,
          });

          setTimeout(() => {
            alert(`Your score is: ${score}`);
            navigate("/");
          }, 5000);
        } else {
          console.error("Team data not found.");
        }
      }
    } catch (error) {
      setEvaluationResult(`Error: ${error.message}`);
      console.error("Error updating Firebase:", error);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "10px", boxSizing: "border-box" }}>
      <div style={{ flex: "1", overflow: "hidden" }}>
        <CodeMirror
          value={codeRef.current}
          height="100%"
          theme={oneDark}
          extensions={[cpp()]}
          onChange={(value) => {
            codeRef.current = value;
            if (onCodeChange) {
              onCodeChange(value);
            }
          }}
          style={{
            height: "100vh",
            width: "100%",
            fontSize: "18px",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleRunCode}
        >
          Run Code
        </button>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleSubmitCode}
        >
          Submit Code
        </button>
      </div>
      {output && (
        <div style={{ marginTop: "20px", color: "#333", fontSize: "16px" }}>
          <strong>Output:</strong>
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {output || "No output"}
          </pre>
        </div>
      )}
      {evaluationResult && (
        <div style={{ marginTop: "10px", color: "#333", fontSize: "16px" }}>
          <strong>Evaluation Result:</strong>
          <pre
            style={{
              backgroundColor: "#f5f5f5",
              padding: "10px",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {evaluationResult || "No evaluation result"}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
