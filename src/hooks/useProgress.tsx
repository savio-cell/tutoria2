
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export type QuizResult = {
  id: string;
  quiz_name: string;
  score: number;
  total_questions: number;
  time_spent: number;
  created_at: string;
};

export type Essay = {
  id: string;
  title: string;
  content: string;
  word_count: number;
  time_spent: number;
  score: number | null;
  status: 'submitted' | 'evaluated';
  created_at: string;
};

export const useProgress = () => {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [essays, setEssays] = useState<Essay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      setLoading(true);
      try {
        // Fetch quiz results
        const { data: quizData, error: quizError } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (quizError) throw quizError;
        setQuizResults(quizData || []);

        // Fetch essays
        const { data: essayData, error: essayError } = await supabase
          .from('essays')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (essayError) throw essayError;
        
        // Filter valid status values and cast to Essay type
        const validEssays = (essayData || []).map(essay => ({
          ...essay,
          status: essay.status === 'evaluated' ? 'evaluated' : 'submitted'
        } as Essay));
        
        setEssays(validEssays);
      } catch (error) {
        console.error('Error fetching progress:', error);
        toast.error('Erro ao carregar progresso');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const addQuizResult = async (
    quizName: string,
    score: number,
    totalQuestions: number,
    timeSpent: number
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('quiz_results')
        .insert({
          user_id: user.id,
          quiz_name: quizName,
          score,
          total_questions: totalQuestions,
          time_spent: timeSpent
        })
        .select()
        .single();

      if (error) throw error;
      setQuizResults([data, ...quizResults]);
      toast.success('Resultado do quiz salvo com sucesso!');
      return data;
    } catch (error) {
      console.error('Error adding quiz result:', error);
      toast.error('Erro ao salvar resultado do quiz');
      return null;
    }
  };

  const addEssay = async (
    title: string,
    content: string,
    wordCount: number,
    timeSpent: number
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('essays')
        .insert({
          user_id: user.id,
          title,
          content,
          word_count: wordCount,
          time_spent: timeSpent,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Ensure the status is of the correct type
      const typedData = {
        ...data,
        status: data.status === 'evaluated' ? 'evaluated' : 'submitted'
      } as Essay;
      
      setEssays([typedData, ...essays]);
      toast.success('Redação salva com sucesso!');
      return typedData;
    } catch (error) {
      console.error('Error adding essay:', error);
      toast.error('Erro ao salvar redação');
      return null;
    }
  };

  const updateEssayScore = async (essayId: string, score: number) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('essays')
        .update({
          score,
          status: 'evaluated'
        })
        .eq('id', essayId)
        .select()
        .single();

      if (error) throw error;
      
      // Type assertion to ensure correct status type
      const typedData = {
        ...data,
        status: data.status === 'evaluated' ? 'evaluated' : 'submitted'
      } as Essay;
      
      // Update essays array with the updated essay
      setEssays(essays.map(essay => 
        essay.id === essayId ? typedData : essay
      ));
      
      toast.success('Nota da redação atualizada!');
      return typedData;
    } catch (error) {
      console.error('Error updating essay score:', error);
      toast.error('Erro ao atualizar nota da redação');
      return null;
    }
  };

  return {
    quizResults,
    essays,
    loading,
    addQuizResult,
    addEssay,
    updateEssayScore
  };
};
