
import React from 'react';
import { Award, Medal, Trophy } from 'lucide-react';

type RankItemProps = {
  id: string;
  name: string;
  totalPoints: number;
  rank: number;
  isCurrentUser?: boolean;
};

export const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <Medal className="h-6 w-6 text-gray-400" />;
    case 3:
      return <Medal className="h-6 w-6 text-amber-700" />;
    default:
      return <Award className="h-6 w-6 text-indigo-500" />;
  }
};

export const getRankClass = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50";
    case 2:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-900/50";
    case 3:
      return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900/50";
    default:
      return "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900/50";
  }
};

const RankItem: React.FC<RankItemProps> = ({
  id,
  name,
  totalPoints,
  rank,
  isCurrentUser = false
}) => {
  return (
    <div 
      className={`flex items-center p-3 rounded-lg border ${getRankClass(rank)} ${isCurrentUser ? 'ring-2 ring-primary ring-offset-1' : ''}`}
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/80 dark:bg-black/20 shrink-0 mr-4">
        {getRankIcon(rank)}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs opacity-70">{totalPoints.toLocaleString()} pontos</p>
      </div>
      <div className="text-xl font-bold">#{rank}</div>
    </div>
  );
};

export default RankItem;
