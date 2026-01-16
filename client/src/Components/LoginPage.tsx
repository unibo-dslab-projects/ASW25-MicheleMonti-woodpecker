export default function LoginPage({ onBack }: { onBack: () => void }) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would handle login logic here
        console.log("Login form submitted");
        // For now, just go back to the board
        onBack();
    };

    return (
        <div className="min-h-screen bg-black-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                <button 
                    onClick={onBack}
                    className="mb-6 text-neutral-300 hover:text-white font-medium transition-colors duration-200
                              flex items-center gap-2 hover:gap-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Puzzle
                </button>
                
                <div 
                    className="rounded-2xl p-8 shadow-2xl border-2 border-white/10"
                    style={{ backgroundColor: 'var(--white-cell-color)' }}
                >
                    <h1 className="text-3xl font-bold text-neutral-800 text-center mb-8">Login</h1>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="block text-neutral-700 font-medium mb-2">Username</label>
                            <input
                                type="text"
                                id="username"
                                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/20 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your username"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-neutral-700 font-medium mb-2">Password</label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 rounded-lg bg-white/90 border border-white/20 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full px-6 py-4 text-black font-bold rounded-xl transition-all duration-200 
                                      shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] active:shadow-md
                                      border-b-4 border-gray-700 hover:border-gray-800
                                      hover:brightness-110 active:brightness-95"
                            style={{ backgroundColor: 'var(--black-cell-color)' }}
                        >
                            Confirm
                        </button>
                    </form>
                    
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-neutral-600 text-center text-sm">
                            This is a demo login page. No actual login functionality is implemented.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}