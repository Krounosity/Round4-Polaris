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
                    const currentCode = localStorage.getItem('userCode') || '';
                    if (currentCode) {
                        localStorage.setItem('storedCode', currentCode);
                    }
                } else if (data.current === 'green') {
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

    if (error) {
        return <div className={`min-h-screen ${lightState === 'red' ? 'bg-red-700' : 'bg-black'} transition-colors duration-500 p-5 text-white`}>{error}</div>;
    }

    if (!questionData) {
        return <div className={`min-h-screen ${lightState === 'red' ? 'bg-red-700' : 'bg-black'} transition-colors duration-500 p-5 text-white`}>Loading...</div>;
    }

    return (
        <div className={`min-h-screen ${lightState === 'red' ? 'bg-red-700' : 'bg-black'} transition-colors duration-500 p-5 text-white`}>
            {lightState === 'red' && (
                <div className="fixed inset-0 bg-red-700 text-white flex justify-center items-center text-2xl font-bold z-50">
                    🔴 RED LIGHT - STOP CODING!
                </div>
            )}

            {lightState !== 'red' && (
                <div className="mt-10 p-5 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingLeft: '30px', paddingRight: '30px' }}>
                    <h2 className={`text-2xl mb-2 font-bold ${lightState === 'red' ? 'text-red-700' : 'text-black'} transition-colors duration-500`}>
                        {questionData.name}
                    </h2>

                    <div className="p-4 text-black rounded-md mb-5 border bg-[#ff82a9] border-black">
                        <p>{questionData.question}</p>
                    </div>

                    <CodeEditor
                        teacherCode={questionData.solution}
                        lightState={lightState}
                        userCode={userCode}
                        onCodeChange={handleCodeChange}
                    />

                    {evaluationResult && (
                        <div className="mt-5 p-4 bg-gray-100 rounded-md text-black">
                            <h3 className="font-bold">Evaluation Result:</h3>
                            <p>{evaluationResult}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuestionPage;

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { useFirebase } from '../firebase';
// import { getDatabase, ref, onValue, get } from 'firebase/database';
// import CodeEditor from '../Components/CodeEditor';

// function QuestionPage() {
//     const { id } = useParams();
//     const [questionData, setQuestionData] = useState(null);
//     const [error, setError] = useState(null);
//     const [userCode, setUserCode] = useState(`#include<stdio.h>\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`);
//     const [evaluationResult, setEvaluationResult] = useState(null);
//     const [lightState, setLightState] = useState('green');
//     const firebase = useFirebase();

//     const fetchQuestionData = async () => {
//         try {
//             const db = getDatabase(firebase.app);
//             const questionRef = ref(db, `Question4/${id}`);
//             const snapshot = await get(questionRef);

//             if (snapshot.exists()) {
//                 setQuestionData(snapshot.val());
//             } else {
//                 setError('Question not found');
//             }
//         } catch (err) {
//             setError('Error fetching question data');
//             console.error('Error fetching question:', err);
//         }
//     };

//     useEffect(() => {
//         fetchQuestionData();

//         const db = getDatabase(firebase.app);
//         const lightRef = ref(db, 'lightState');
//         const unsubscribe = onValue(lightRef, (snapshot) => {
//             const data = snapshot.val();
//             if (data) {
//                 setLightState(data.current);
//                 if (data.current === 'red') {
//                     const currentCode = localStorage.getItem('userCode') || '';
//                     if (currentCode) {
//                         localStorage.setItem('storedCode', currentCode);
//                     }
//                 } else if (data.current === 'green') {
//                     const storedCode = localStorage.getItem('storedCode');
//                     if (storedCode) {
//                         setUserCode(storedCode);
//                     }
//                 }
//             }
//         });

//         return () => unsubscribe();
//     }, [id, firebase.app]);

//     const handleCodeChange = (newCode) => {
//         setUserCode(newCode);
//         if (lightState === 'green') {
//             localStorage.setItem('userCode', newCode);
//         }
//     };

//     if (error) {
//         return <div className={`min-h-screen ${lightState === 'red' ? 'bg-red-700' : 'bg-black'} transition-colors duration-500 p-5 text-white`}>{error}</div>;
//     }

//     if (!questionData) {
//         return <div className={`min-h-screen ${lightState === 'red' ? 'bg-red-700' : 'bg-black'} transition-colors duration-500 p-5 text-white`}>Loading...</div>;
//     }

//     return (
//         <div className={`min-h-screen ${lightState === 'red' ? 'bg-red-700' : 'bg-black'} transition-colors duration-500 p-5 text-white`}>
//             {lightState === 'red' && (
//                 <div className="fixed inset-0 bg-red-700 text-white flex justify-center items-center text-2xl font-bold z-50">
//                     🔴 RED LIGHT - STOP CODING!
//                 </div>
//             )}

//             {lightState !== 'red' && (
//                 <div className="mt-10 p-5 rounded-lg shadow-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
//                     <h2 className={`text-2xl mb-2 font-bold ${lightState === 'red' ? 'text-red-700' : 'text-black'} transition-colors duration-500`}>
//                         {questionData.name}
//                     </h2>

//                     <div className="p-4 text-black rounded-md mb-5 border bg-[#d2b48c] border-black">
//                         <img
//                             src={questionData.imageUrl}  // assuming the backend sends an image URL as 'imageUrl'
//                             alt="Question"
//                             className="max-w-full max-h-[400px] object-contain"
//                         />
//                     </div>

//                     <CodeEditor
//                         teacherCode={questionData.solution}
//                         lightState={lightState}
//                         userCode={userCode}
//                         onCodeChange={handleCodeChange}
//                     />

//                     {evaluationResult && (
//                         <div className="mt-5 p-4 bg-gray-100 rounded-md text-black">
//                             <h3 className="font-bold">Evaluation Result:</h3>
//                             <p>{evaluationResult}</p>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default QuestionPage;
