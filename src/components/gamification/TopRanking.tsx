
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Award, Medal, Trophy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

type RankingUser = {
  id: string;
  name: string;
  total_points: number;
  rank: number;
};

const TopRanking = () => {
  const [topUsers, setTopUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<RankingUser | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRankingData();
  }, [user]);

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      
      // Fetch quiz points by user
      const { data: quizPoints, error: quizError } = await supabase
        .from('quiz_results')
        .select('user_id, score');
      
      if (quizError) throw quizError;
      
      // Fetch essay points by user
      const { data: essayPoints, error: essayError } = await supabase
        .from('essays')
        .select('user_id, score')
        .filter('status', 'eq', 'evaluated')
        .not('score', 'is', null);
      
      if (essayError) throw essayError;
      
      // Fetch user info for names
      const { data: userInfo, error: userError } = await supabase
        .from('user_info')
        .select('id, full_name, email');
      
      if (userError) throw userError;
      
      // Calculate total points per user
      const pointsByUser: Record<string, number> = {};
      
      // Add quiz points
      quizPoints?.forEach(item => {
        const userId = item.user_id;
        const score = Number(item.score || 0);
        
        if (!pointsByUser[userId]) {
          pointsByUser[userId] = 0;
        }
        
        pointsByUser[userId] += score;
      });
      
      // Add essay points
      essayPoints?.forEach(item => {
        const userId = item.user_id;
        const score = Number(item.score || 0);
        
        if (!pointsByUser[userId]) {
          pointsByUser[userId] = 0;
        }
        
        pointsByUser[userId] += score;
      });
      
      // Create ranking array with user info
      const ranking: RankingUser[] = Object.entries(pointsByUser).map(([userId, points]) => {
        const userInfoItem = userInfo?.find(u => u.id === userId);
        const displayName = userInfoItem?.full_name || 
                           (userInfoItem?.email ? userInfoItem.email.split('@')[0] : 'Usuário');
        
        return {
          id: userId,
          name: displayName,
          total_points: points,
          rank: 0 // Will be set after sorting
        };
      });
      
      // Sort by points (highest first) and assign ranks
      ranking.sort((a, b) => b.total_points - a.total_points);
      
      // Assign ranks
      ranking.forEach((user, index) => {
        user.rank = index + 1;
      });
      
      // Get top 3 users
      const top3 = ranking.slice(0, 3);
      setTopUsers(top3);
      
      // Find current user's rank
      if (user) {
        const currentUserRank = ranking.find(r => r.id === user.id);
        setUserRank(currentUserRank || null);
      }
      
    } catch (error) {
      console.error('Error fetching ranking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
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

  const getRankClass = (rank: number) => {
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
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-6">
              {topUsers.map((rankUser) => (
                <div 
                  key={rankUser.id} 
                  className={`flex items-center p-3 rounded-lg border ${getRankClass(rankUser.rank)} ${user && rankUser.id === user.id ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/80 dark:bg-black/20 shrink-0 mr-4">
                    {getRankIcon(rankUser.rank)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{rankUser.name}</p>
                    <p className="text-xs opacity-70">{rankUser.total_points.toLocaleString()} pontos</p>
                  </div>
                  <div className="text-xl font-bold">#{rankUser.rank}</div>
                </div>
              ))}
            </div>
            
            {userRank && userRank.rank > 3 && (
              <div>
                <div className="text-xs uppercase font-semibold mb-2 text-muted-foreground">Seu Ranking</div>
                <div className={`flex items-center p-3 rounded-lg border ${getRankClass(userRank.rank)} ring-2 ring-primary ring-offset-1`}>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white/80 dark:bg-black/20 shrink-0 mr-4">
                    {getRankIcon(userRank.rank)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{userRank.name}</p>
                    <p className="text-xs opacity-70">{userRank.total_points.toLocaleString()} pontos</p>
                  </div>
                  <div className="text-xl font-bold">#{userRank.rank}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopRanking;
