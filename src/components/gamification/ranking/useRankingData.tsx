
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type RankingUser = {
  id: string;
  name: string;
  total_points: number;
  rank: number;
};

export const useRankingData = () => {
  const [topUsers, setTopUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<RankingUser | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRankingData();
    
    // Set up real-time subscription for quiz_results
    const quizChannel = supabase
      .channel('public:quiz_results')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_results'
      }, () => {
        fetchRankingData();
      })
      .subscribe();
      
    // Set up real-time subscription for essays
    const essayChannel = supabase
      .channel('public:essays')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'essays'
      }, () => {
        fetchRankingData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(quizChannel);
      supabase.removeChannel(essayChannel);
    };
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
      
      // Get top users - always get top 3 regardless of current user
      const topThreeUsers = ranking.slice(0, 3);
      setTopUsers(topThreeUsers);
      
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

  return {
    topUsers,
    userRank,
    loading,
    fetchRankingData
  };
};
