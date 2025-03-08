
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
  topUsers: RankingUser[];
};

const UserCurrentRank: React.FC<UserCurrentRankProps> = ({ userRank, topUsers }) => {
  // Não mostrar se o usuário estiver no top 3
  if (!userRank || topUsers.some(user => user.id === userRank.id)) {
    return null;
  }
  
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
