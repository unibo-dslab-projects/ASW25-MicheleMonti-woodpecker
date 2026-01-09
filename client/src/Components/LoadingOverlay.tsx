interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export default function LoadingOverlay({ isLoading, message = "Loading puzzle..." }: LoadingOverlayProps) {
    if (!isLoading) return null;
    return (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-white text-lg animate-pulse">{message}</div>
        </div>
    );
}