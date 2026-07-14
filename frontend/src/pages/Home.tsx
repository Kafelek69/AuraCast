import React from 'react';
import { Link } from 'react-router-dom';

const liveStreams = [
  { id: 'devninja', name: 'DevNinja', title: 'Budujemy AuraCast - Backend i WebSockety 🚀', game: 'Programowanie', viewers: '1,204', color: 'bg-blue-600' },
  { id: 'globalelite', name: 'GlobalElite', title: 'Wbijamy 3000 ELO na Faceit | Półfinały', game: 'Counter-Strike 2', viewers: '8,432', color: 'bg-purple-500' },
  { id: 'craftkreator', name: 'CraftKreator', title: 'Budujemy ogromne miasto z widzami!', game: 'Minecraft', viewers: '432', color: 'bg-orange-500' },
  { id: 'techmaniak', name: 'TechManiak', title: 'Składamy nowego PC - RTX na pokładzie', game: 'Technologia', viewers: '890', color: 'bg-emerald-500' },
];

const Home: React.FC = () => {
  return (
    <div className="p-8 w-full overflow-y-auto bg-[#0f0f13]">
      <h1 className="text-3xl font-bold mb-8 text-white">Polecane transmisje <span className="text-blue-500">na żywo</span></h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {liveStreams.map((stream) => (
          <Link key={stream.id} to={`/${stream.id}`} className="group cursor-pointer">
            <div className="w-full aspect-video bg-[#18181b] rounded-xl relative overflow-hidden transition-transform group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(59,130,246,0.1)] border border-gray-800 group-hover:border-blue-500/50 duration-300">
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-lg">NA ŻYWO</div>
              <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded">{stream.viewers} widzów</div>
            </div>
            
            <div className="flex gap-3 mt-3">
              <div className={`w-10 h-10 ${stream.color} rounded-full shrink-0 shadow-lg border-2 border-[#0f0f13]`}></div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-gray-100 group-hover:text-blue-400 truncate transition-colors">{stream.title}</h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">{stream.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stream.game}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;