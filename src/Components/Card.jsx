import React from "react";
import { useNavigate } from "react-router-dom";

function Card({ name, id, isActive }) {
    const navigate = useNavigate();

    const handleViewClick = () => {
        if (isActive) {
            navigate(`/question/${id}`);
        } else {
            alert("This question is not public yet. Please wait for the admin to make it active.");
        }
    };

    return (
        <div className="relative w-64 p-4 mx-auto my-4 text-center text-white border-4 border-dashed rounded-lg shadow-lg font-sans bg-white/10 backdrop-blur overflow-hidden">
            {/* Glowing Border Effect */}
            <div className="absolute inset-0 rounded-lg border-[2px] border-transparent pointer-events-none before:absolute before:inset-0 before:border-[2px] before:rounded-lg before:border-white before:opacity-50 before:blur-md"></div>
            <div className="absolute inset-0 rounded-lg border-[2px] border-transparent pointer-events-none after:absolute after:inset-0 after:border-[2px] after:rounded-lg after:border-white/30 after:animate-pulse"></div>
            
            <h3 className="mb-3 text-lg">{name}</h3>
            <button
                className="px-4 py-2 text-sm bg-teal-800 border-none rounded shadow-lg cursor-pointer transition-transform duration-200 hover:bg-blue-800 hover:scale-105"
                onClick={handleViewClick}
            >
                View
            </button>
        </div>
    );
}

export default Card;
