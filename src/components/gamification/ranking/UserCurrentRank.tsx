
import React from 'react';
import RankItem from './RankItem';
import { Progress } from '@/components/ui/progress';

type RankingUser = {
  id: string;
  name: string;
  total_points: number;
  rank: number;
};

type UserCurrentRankProps = {
  userRank: RankingUser | null;
  topUsers: RankingUser[];
};

const UserCurrentRank: React.FC<UserCurrentRankProps> = ({ userRank, topUsers }) => {
  // Don't show if the user is in the top 3
  if (!userRank || topUsers.some(user => user.id === userRank.id)) {
    return null;
  }
  
  // Calculate progress towards top 3
  const lowestTopUserPoints = topUsers.length > 0 ? topUsers[topUsers.length - 1].total_points : 0;
  const userPoints = userRank.total_points;
  const pointsNeeded = Math.max(1, lowestTopUserPoints - userPoints);
  const progressPercentage = Math.min(90, (userPoints / lowestTopUserPoints) * 100);
  
  return (
    <div className="mt-6 space-y-4">
      <div className="text-xs uppercase font-semibold mb-2 text-muted-foreground">Seu Ranking</div>
      <RankItem
        id={userRank.id}
        name={userRank.name}
        totalPoints={userRank.total_points}
        rank={userRank.rank}
        isCurrentUser={true}
      />
      
      <div className="mt-2 space-y-2">
        <div className="flex justify-between text-xs">
          <span>Pontos para o top 3: {pointsNeeded}</span>
          <span>{userPoints} / {lowestTopUserPoints}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
};

export default UserCurrentRank;
