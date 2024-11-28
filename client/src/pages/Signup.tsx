import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle signup logic
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Registrieren
                    </h2>
                    <p className="text-sm text-gray-600">
                        Erstellen Sie Ihr Konto
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="text-sm font-medium text-gray-700"
                            >
                                Vorname
                            </label>
                            <input
                                type="text"
                                placeholder="Vorname"
                                className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="lastName"
                                className="text-sm font-medium text-gray-700"
                            >
                                Nachname
                            </label>
                            <input
                                type="text"
                                className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none"
                                placeholder="Nachname"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                        >
                            Email Adresse
                        </label>
                        <input
                            type="email"
                            className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-gray-700"
                        >
                            Passwort
                        </label>
                        <input
                            type="password"
                            className="mt-1 w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none"
                            placeholder="Passwort"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 px-4 mt-6 text-sm font-medium rounded-md text-white bg-black hover:scale-105 duration-200"
                    >
                        Registrieren
                    </button>

                    <div className="flex justify-between text-sm pt-2">
                        <span>Bereits registriert?</span>
                        <Link
                            to="/login"
                            className="text-blue-600 hover:underline"
                        >
                            Anmelden
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
