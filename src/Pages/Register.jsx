import React, { useState } from 'react';
import { getDatabase, ref, set, get, child } from 'firebase/database';
import { useFirebase } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [teamName, setTeamName] = useState('');
    const [leaderEmail, setLeaderEmail] = useState('');
    const [leaderName, setLeaderName] = useState('');
    const [members, setMembers] = useState([
        { name: '', email: '' },
        { name: '', email: '' },
        { name: '', email: '' },
    ]);
    const firebase = useFirebase();
    const navigate = useNavigate();

    async function validateTeam() {
        const db = getDatabase();
        const dbRef = ref(db);

        
        const teamsSnapshot = await get(child(dbRef, `teams`));
        if (teamsSnapshot.exists()) {
            const teams = teamsSnapshot.val();
            for (const teamId in teams) {
                const team = teams[teamId];
                if (team.teamName.toLowerCase() === teamName.toLowerCase()) {
                    return { valid: false, message: 'Team name already exists.' };
                }

                // Check for duplicate team members (name and email)
                const allMembers = [team.leaderEmail, ...team.members.map((m) => m.email)];
                const currentEmails = [leaderEmail, ...members.map((m) => m.email)];
                for (const email of currentEmails) {
                    if (allMembers.includes(email)) {
                        return { valid: false, message: `Duplicate email found: ${email}` };
                    }
                }
                const allNames = [team.leaderName, ...team.members.map((m) => m.name)];
                const currentNames = [leaderName, ...members.map((m) => m.name)];
                for (const name of currentNames) {
                    if (allNames.includes(name)) {
                        return { valid: false, message: `Duplicate name found: ${name}` };
                    }
                }
            }
        }
        return { valid: true };
    }

    async function handleCreate(event) {
        event.preventDefault();

        if (!teamName || !leaderName || !leaderEmail) {
            alert('Please fill in all required fields.');
            return;
        }

        const validation = await validateTeam();
        if (!validation.valid) {
            alert(validation.message);
            return;
        }

        const password = teamName;

        try {
            const userCredential = await firebase.signUpUser(leaderEmail, password);
            const user = userCredential.user;

            const teamData = {
                teamName,
                leaderEmail,
                leaderName,
                members,
                uid: user.uid,
                round1: 0,
                round2: 0,
                round3: 0,
                round4: 0,
                overall: 0,
                isQ1: false,
                isQ2: false,
                isQ3: false,
                isQ4: false,
            };

            const db = getDatabase();
            const dbRef = ref(db, `teams/${user.uid}`);
            await set(dbRef, teamData);

            alert('Team Registered Successfully!');
            navigate('/');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#f4f6f8',
                padding: '20px',
            }}
        >
            <div
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                    borderRadius: '10px',
                    backgroundColor: '#fff',
                    padding: '30px',
                }}
            >
                <h3 style={{ textAlign: 'center', fontWeight: '700', color: '#007bff' }}>
                    Register Your Team
                </h3>
                <form onSubmit={handleCreate}>
                    <input
                        type="text"
                        placeholder="Team Name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Leader's Name"
                        value={leaderName}
                        onChange={(e) => setLeaderName(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    />
                    <input
                        type="email"
                        placeholder="Leader's Email"
                        value={leaderEmail}
                        onChange={(e) => setLeaderEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '15px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                        }}
                    />
                    {members.map((member, index) => (
                        <div key={index}>
                            <input
                                type="text"
                                placeholder={`Member ${index + 1} Name`}
                                value={member.name}
                                onChange={(e) =>
                                    setMembers((prev) => {
                                        const newMembers = [...prev];
                                        newMembers[index].name = e.target.value;
                                        return newMembers;
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                }}
                            />
                            <input
                                type="email"
                                placeholder={`Member ${index + 1} Email`}
                                value={member.email}
                                onChange={(e) =>
                                    setMembers((prev) => {
                                        const newMembers = [...prev];
                                        newMembers[index].email = e.target.value;
                                        return newMembers;
                                    })
                                }
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '15px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                }}
                            />
                        </div>
                    ))}
                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '5px',
                            fontSize: '16px',
                            cursor: 'pointer',
                        }}
                    >
                        Register
                    </button>
                </form>
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        fontSize: '14px',
                        color: '#555',
                    }}
                >
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        style={{
                            color: '#007bff',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}
                    >
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
