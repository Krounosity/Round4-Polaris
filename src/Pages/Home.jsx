import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, child } from "firebase/database";
import { useFirebase } from '../firebase';
import Card from '../Components/Card';
import bg from '../Components/Images/background.jpg';

function Home() {
    const firebase = useFirebase();
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [teamName, setTeamName] = useState('');

    useEffect(() => {
        async function fetchQuestions() {
            try {
                const db = getDatabase();
                const dbRef = ref(db);
                const snapshot = await get(child(dbRef, "Question4"));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const questionList = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
                    setQuestions(questionList);
                } else {
                    setError("No questions available.");
                }
            } catch (err) {
                setError("Failed to fetch questions");
                console.error("Error fetching questions:", err);
            }
        }

        async function fetchTeamName() {
            try {
                if (firebase.user) {
                    const db = getDatabase();
                    const dbRef = ref(db, `teams/${firebase.user.uid}`);
                    const snapshot = await get(dbRef);
                    if (snapshot.exists()) {
                        const teamData = snapshot.val();
                        setTeamName(teamData.teamName);
                    } else {
                        console.error("Team name not found.");
                    }
                }
            } catch (err) {
                console.error("Error fetching team name:", err);
            }
        }

        fetchQuestions();
        fetchTeamName();
    }, [firebase]);

    return (
        <div
            className="min-h-screen text-white font-sans p-5 bg-fixed"
            style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute top-4 right-4">
                <button
                    className="px-4 py-2 text-white bg-[#E5205E] rounded-lg shadow-md hover:opacity-80 transition duration-300"
                    onClick={() => firebase.signOutUser()}
                >
                    Log Out
                </button>
            </div>

            {teamName && (
                <div
                    className="mt-6 text-center p-8 rounded-md max-w-md mx-auto"
                >
                    <h1 className="text-3xl text-white font-bold">
                        Welcome, Team {teamName}.
                    </h1>
                </div>
            )}

            {error ? (
                <h1 className="text-center text-red-500 text-2xl font-semibold">{error}</h1>
            ) : (
                <>
                    <div className="flex justify-center mt-10">
                        <div className="w-1/2 flex flex-col items-end pr-4">
                            {questions.slice(0, Math.ceil(questions.length / 2)).map((question, index) => (
                                <Card key={index} name={question.name} id={question.id} isActive={question.isActive} />
                            ))}
                        </div>
                        <div className="w-1/2 flex flex-col items-start pl-4">
                            {questions.slice(Math.ceil(questions.length / 2)).map((question, index) => (
                                <Card key={index} name={question.name} id={question.id} isActive={question.isActive} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;
