
import React from 'react';
import RankItem from './RankItem';

type RankingUser = {
  id: string;
  name: string;
  total_points: number;
  rank: number;
};

type UserCurrentRankProps = {
  userRank: RankingUser | null;
};

const UserCurrentRank: React.FC<UserCurrentRankProps> = ({ userRank }) => {
  if (!userRank || userRank.rank <= 3) return null;
  
  return (
    <div>
      <div className="text-xs uppercase font-semibold mb-2 text-muted-foreground">Seu Ranking</div>
      <RankItem
        id={userRank.id}
        name={userRank.name}
        totalPoints={userRank.total_points}
        rank={userRank.rank}
        isCurrentUser={true}
      />
    </div>
  );
};

export default UserCurrentRank;
