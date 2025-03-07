
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import LoadingSkeleton from './ranking/LoadingSkeleton';
import UserCurrentRank from './ranking/UserCurrentRank';
import RankItem from './ranking/RankItem';
import { useRankingData } from './ranking/useRankingData';

const TopRanking = () => {
  const { topUsers, userRank, loading } = useRankingData();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span>Ranking</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              {topUsers.map((rankUser) => (
                <RankItem
                  key={rankUser.id}
                  id={rankUser.id}
                  name={rankUser.name}
                  totalPoints={rankUser.total_points}
                  rank={rankUser.rank}
                  isCurrentUser={userRank?.id === rankUser.id}
                />
              ))}
            </div>
            
            <UserCurrentRank userRank={userRank} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopRanking;
