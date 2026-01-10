interface ControlButtonProps {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}

interface LoginButtonProps {
    onClick: () => void;
    title?: string;
}

export default function ControlButton({ onClick, title, children }: ControlButtonProps) {
    return (
        <div className="relative">
            <button 
                onClick={onClick}
                className="px-6 py-3 text-black font-bold rounded-xl transition-all duration-200 
                          shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 active:shadow-md
                          border-b-4 border-gray-700 hover:border-gray-800 w-full
                          hover:brightness-110 active:brightness-95 relative z-10"
                style={{ backgroundColor: 'var(--black-cell-color)' }}
                title={title}
            >
                {children}
            </button>
        </div>
    );
}

export function LoginButton({ onClick, title = "Login to save your progress" }: LoginButtonProps) {
    return (
        <button 
            className="text-neutral-300 hover:text-white font-medium transition-colors duration-200
                      text-lg px-4 py-2 rounded-lg hover:bg-white/10 active:bg-white/20
                      border border-white/20 hover:border-white/40 active:border-white/60"
            onClick={onClick}
            title={title}
        >
            Login
        </button>
    );
}