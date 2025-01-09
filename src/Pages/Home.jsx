import React, { useEffect, useState } from 'react';
import { getDatabase, ref, get, child } from "firebase/database";
import { useFirebase } from '../firebase';
import Card from '../Components/Card';

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
        <div className="min-h-screen bg-gradient-to-b from-[#004d60] to-black text-white font-sans p-5 bg-fixed">
            {/* Log Out Button */}
            <div className="absolute top-4 right-4">
                <button
                    className="px-4 py-2 text-white bg-teal-800 rounded-lg shadow-md hover:bg-teal-800 transition duration-300"
                    onClick={() => firebase.signOutUser()}
                >
                    Log Out
                </button>
            </div>

            {/* Team Name Section */}
            {teamName && (
                <div
                    className="mt-16 text-center p-8 rounded-md max-w-md mx-auto"
                    style={{
                        backgroundColor: "#d2b48c", // Light brown from the uploaded image
                    }}
                >
                    {/* Shapes (Circle, Hollow Triangle, Square) */}
                    <div className="flex justify-center space-x-8 mb-4">
                        {/* Circle */}
                        <div className="w-12 h-12 border-4 border-black rounded-full"></div>

                        {/* Hollow Triangle */}
                        <div className="relative">
                            <div
                                className="w-0 h-0 border-l-[24px] border-r-[24px] border-b-[42px] border-l-transparent border-r-transparent border-b-black"
                            ></div>
                            <div
                                className="absolute top-[4px] left-[4px] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[34px] border-l-transparent border-r-transparent border-b-[#d2b48c]"
                            ></div>
                        </div>

                        {/* Square */}
                        <div className="w-12 h-12 border-4 border-black"></div>
                    </div>
                    <h1 className="text-3xl text-black font-bold">
                        Welcome, Team {teamName}!
                    </h1>
                </div>
            )}

            {error ? (
                <h1 className="text-center text-red-500 text-2xl font-semibold">{error}</h1>
            ) : (
                <>
                    {/* Questions Section */}
                    {/* <h1 className="text-center text-2xl font-semibold mt-12 mb-8 text-white">
                        Questions
                    </h1> */}
                    <div className="flex flex-wrap justify-center mt-10">
                        {questions.map((question, index) => (
                            <Card key={index} name={question.name} id={question.id} isActive={question.isActive} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default Home;
