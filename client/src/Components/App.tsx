import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Board from "./Board";
import SharedRoom from "./SharedRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Board />} />
        <Route path="/room/:roomId" element={<SharedRoom />} />
      </Routes>
    </BrowserRouter>
  );
}