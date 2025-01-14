import React, { useState } from 'react';
import { useFirebase } from '../firebase';
import { useNavigate } from 'react-router-dom';
import logimg from '../images/file.png'

function Login() {
    const [teamName, setTeamName] = useState('');
    const [leaderEmail, setLeaderEmail] = useState('');
    const firebase = useFirebase();
    const navigate = useNavigate();

    async function handleLogin(event) {
        event.preventDefault();
        try {
            const userCredential = await firebase.signInUser(leaderEmail, teamName);
            const user = userCredential.user;

            const teamData = await firebase.getTeamByUID(user.uid);
            if (teamData.teamName === teamName) {
                alert('Login Successful!');
                navigate('/');
            } else {
                throw new Error('Team Name does not match records!');
            }
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    return (
        <div
        className='flex flex-col bg-gradient-to-b from-cyan-950 via-40%  via-black to-black  justify-center items-center relative 
         min-h-screen '
    >
    <img src={logimg} alt="team-login" className="w-[50%] sm:w-[40%] md:w-[30%] lg:w-[20%]  absolute  object-contain mb-[14rem]    " />
        <div
           className="w-[50%] sm:w-[40%]  md:w-[30%] lg:w-[20%] shadow-lg rounded-lg  p-6 mt-[12rem] z-10 bg-black "
           >
            <h3 
            className="text-center font-bold text-teal-500 text-xl mb-6">
           
                Team Login
            </h3>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                    className="w-full p-2 mb-4 border border-teal-700 rounded-md bg-black text-white placeholder-gray-400 focus:outline-none   focus:border-teal-500 hover:border-teal-500"

                    />
                <input
                    type="email"
                    placeholder="Leader's Email"
                    value={leaderEmail}
                    onChange={(e) => setLeaderEmail(e.target.value)}
                    required
                    className="w-full p-2 mb-4 border border-teal-700 rounded-md bg-black text-white placeholder-gray-400 focus:outline-none   focus:border-teal-500 hover:border-teal-500"
                   
                />
                <button
                    type="submit"
                    className="w-full p-2 bg-teal-700 text-white rounded-md mt-4 text-lg hover:bg-teal-400 transition font-semibold">
                    Login
                </button>
            </form>
                    
        </div>
    </div>
    );
}
export default Login;