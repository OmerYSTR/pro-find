import { useState, useEffect } from "react";

export default function LoadingScreen() {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev === "..." ? "." : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
            <h1 className="text-white text-5xl font-bold">Loading{dots}</h1>
        </div>
    );
}