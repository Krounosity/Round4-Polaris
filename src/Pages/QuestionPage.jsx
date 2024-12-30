import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFirebase } from '../firebase';
import { getDatabase, ref, onValue, get } from 'firebase/database';
import CodeEditor from '../Components/CodeEditor';

function QuestionPage() {
    const { id } = useParams();
    const [questionData, setQuestionData] = useState(null);
    const [error, setError] = useState(null);
    const [userCode, setUserCode] = useState(`#include<stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`);
    const [evaluationResult, setEvaluationResult] = useState(null);
    const [lightState, setLightState] = useState('green');
    const firebase = useFirebase();

    const fetchQuestionData = async () => {
        try {
            const db = getDatabase(firebase.app);
            const questionRef = ref(db, `Question4/${id}`);
            const snapshot = await get(questionRef);

            if (snapshot.exists()) {
                setQuestionData(snapshot.val());
            } else {
                setError('Question not found');
            }
        } catch (err) {
            setError('Error fetching question data');
            console.error('Error fetching question:', err);
        }
    };

    useEffect(() => {
        fetchQuestionData();

        const db = getDatabase(firebase.app);
        const lightRef = ref(db, 'lightState');
        const unsubscribe = onValue(lightRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                setLightState(data.current);
                if (data.current === 'red') {
                    // Store user code to localStorage
                    const currentCode = localStorage.getItem('userCode') || '';
                    if (currentCode) {
                        localStorage.setItem('storedCode', currentCode);
                    }
                } else if (data.current === 'green') {
                    // Load stored code into userCode
                    const storedCode = localStorage.getItem('storedCode');
                    if (storedCode) {
                        setUserCode(storedCode);
                    }
                }
            }
        });

        return () => unsubscribe();
    }, [id, firebase.app]);

    const handleCodeChange = (newCode) => {
        setUserCode(newCode);
        if (lightState === 'green') {
            localStorage.setItem('userCode', newCode);
        }
    };

    const pageStyle = {
        minHeight: '100vh',
        backgroundColor: lightState === 'red' ? '#d32f2f' : '#e8f5e9',
        transition: 'background-color 0.5s ease',
        padding: '20px',
    };

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: lightState === 'red' ? '#d32f2f' : 'transparent',
        color: 'white',
        display: lightState === 'red' ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '30px',
        fontWeight: 'bold',
        zIndex: 2000,
    };

    if (error) {
        return <div style={pageStyle}>{error}</div>;
    }

    if (!questionData) {
        return <div style={pageStyle}>Loading...</div>;
    }

    return (
        <div style={pageStyle}>
            {/* Full-page red overlay */}
            {lightState === 'red' && <div style={overlayStyle}>🔴 RED LIGHT - STOP CODING!</div>}

            {/* Main content */}
            {lightState !== 'red' && (
                <div style={{
                    marginTop: '60px',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                    <h2 style={{
                        color: lightState === 'red' ? '#d32f2f' : '#2e7d32',
                        transition: 'color 0.5s ease',
                    }}>
                        {questionData.name}
                    </h2>

                    <div style={{
                        padding: '15px',
                        backgroundColor: lightState === 'red' ? '#fff5f5' : '#f5fff5',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        border: `1px solid ${lightState === 'red' ? '#ffcdd2' : '#c8e6c9'}`,
                        transition: 'all 0.5s ease',
                    }}>
                        <p>{questionData.question}</p>
                    </div>

                    <CodeEditor
                        teacherCode={questionData.solution}
                        lightState={lightState}
                        userCode={userCode}
                        onCodeChange={handleCodeChange}
                    />

                    {evaluationResult && (
                        <div style={{
                            marginTop: '20px',
                            padding: '15px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                        }}>
                            <h3>Evaluation Result:</h3>
                            <p>{evaluationResult}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuestionPage;


