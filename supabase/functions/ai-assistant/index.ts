
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, type, userData } = await req.json();
    
    console.log(`Processing ${type} request with prompt: ${prompt.substring(0, 50)}...`);
    
    let systemPrompt = "You are a helpful assistant for an educational platform called Educa. ";
    
    // Customize system prompt based on request type
    switch (type) {
      case 'chat':
        systemPrompt += "You help students with questions about the platform and provide personalized academic advice based on their data. Be friendly, helpful, and educational.";
        if (userData) {
          systemPrompt += `\n\nUser Data: ${JSON.stringify(userData)}`;
        }
        break;
      case 'quiz':
        systemPrompt += "You generate educational quiz questions based on a given topic. Include the question, multiple choice options, and the correct answer with explanation.";
        break;
      case 'essay':
        systemPrompt += "You generate essay topics with supporting materials for educational purposes.";
        break;
      case 'essay-analysis':
        systemPrompt += "You analyze student essays based on five key competencies: language conventions, comprehension of the topic, argumentation, logical structure, and proposed solution. Provide a score from 0-200 for each competency and detailed feedback.";
        break;
      default:
        systemPrompt += "Provide helpful, educational information to students.";
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("Response received from OpenAI");
    
    if (data.error) {
      console.error("OpenAI API error:", data.error);
      throw new Error(data.error.message);
    }

    const aiResponse = data.choices[0].message.content;

    // Format response based on request type
    let formattedResponse;
    switch (type) {
      case 'essay-analysis':
        try {
          // Attempt to parse the AI response into structured feedback
          formattedResponse = parseEssayAnalysis(aiResponse);
        } catch (error) {
          console.error("Error parsing essay analysis:", error);
          formattedResponse = { 
            rawResponse: aiResponse,
            error: "Failed to parse structured analysis" 
          };
        }
        break;
      case 'quiz':
        try {
          // Attempt to parse the AI response into structured quiz questions
          formattedResponse = parseQuizQuestions(aiResponse);
        } catch (error) {
          console.error("Error parsing quiz questions:", error);
          formattedResponse = { 
            rawResponse: aiResponse,
            error: "Failed to parse structured quiz" 
          };
        }
        break;
      default:
        formattedResponse = { response: aiResponse };
    }

    return new Response(JSON.stringify(formattedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to parse essay analysis from AI response
function parseEssayAnalysis(aiResponse) {
  // This is a simple parser - in production you might want more robust parsing
  // or structure the AI prompt to return JSON directly
  try {
    const competencies = [];
    const scoreRegex = /(\d+)\/200/g;
    const scores = [...aiResponse.matchAll(scoreRegex)].map(match => parseInt(match[1]));
    
    // Extract the general feedback (assuming it's at the end)
    const generalFeedbackMatch = aiResponse.match(/Comentário Geral[:\s]+([\s\S]+)$/i) ||
                               aiResponse.match(/General Feedback[:\s]+([\s\S]+)$/i);
    
    const generalFeedback = generalFeedbackMatch ? generalFeedbackMatch[1].trim() : "";
    
    // Competency names
    const competencyNames = [
      'Domínio da norma culta',
      'Compreensão da proposta',
      'Capacidade de argumentação',
      'Construção lógica',
      'Proposta de intervenção'
    ];
    
    // Create competency objects
    for (let i = 0; i < 5 && i < scores.length; i++) {
      const score = scores[i];
      let status = 'medium';
      if (score >= 160) status = 'good';
      if (score < 120) status = 'bad';
      
      competencies.push({
        name: competencyNames[i],
        score: score,
        maxScore: 200,
        feedback: extractFeedbackForCompetency(aiResponse, competencyNames[i]),
        status: status
      });
    }
    
    // Calculate total score
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    
    return {
      score: totalScore,
      maxScore: 1000,
      competencies: competencies,
      generalFeedback: generalFeedback
    };
  } catch (error) {
    console.error("Error parsing essay analysis:", error);
    return {
      score: 0,
      maxScore: 1000,
      competencies: [],
      generalFeedback: aiResponse,
      parsingError: true
    };
  }
}

// Helper function to extract feedback for a specific competency
function extractFeedbackForCompetency(aiResponse, competencyName) {
  const regex = new RegExp(`${competencyName}[:\\s]+([^\\n]+)`, 'i');
  const match = aiResponse.match(regex);
  return match ? match[1].trim() : "Sem feedback específico.";
}

// Helper function to parse quiz questions from AI response
function parseQuizQuestions(aiResponse) {
  try {
    // Simple parser for quiz questions
    // In production, you'd want to structure the AI prompt to return JSON
    
    // Split by numbered questions (e.g., "1.", "2.", etc.)
    const questionBlocks = aiResponse.split(/\d+\.\s+/).filter(block => block.trim().length > 0);
    
    const questions = questionBlocks.map(block => {
      const lines = block.split('\n').filter(line => line.trim().length > 0);
      
      // First line is the question
      const question = lines[0].trim();
      
      // Find options (usually marked with A., B., C., D. or similar)
      const optionRegex = /^[A-D]\.\s+(.+)$/;
      const options = [];
      let correctAnswer = '';
      let explanation = '';
      
      // Look for the correct answer and explanation
      const correctAnswerRegex = /Resposta correta:?\s+([A-D])|Correct answer:?\s+([A-D])/i;
      const explanationRegex = /Explicação:?\s+(.+)|Explanation:?\s+(.+)/i;
      
      for (const line of lines) {
        const optionMatch = line.match(optionRegex);
        if (optionMatch) {
          options.push(optionMatch[1]);
          continue;
        }
        
        const correctMatch = line.match(correctAnswerRegex);
        if (correctMatch) {
          correctAnswer = correctMatch[1] || correctMatch[2];
          // Convert letter to the actual answer text
          if (correctAnswer && correctAnswer.length === 1) {
            const index = correctAnswer.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (index >= 0 && index < options.length) {
              correctAnswer = options[index];
            }
          }
          continue;
        }
        
        const explanationMatch = line.match(explanationRegex);
        if (explanationMatch) {
          explanation = explanationMatch[1] || explanationMatch[2];
          continue;
        }
        
        // If we haven't identified the line yet and we're past the options,
        // it might be part of the explanation
        if (options.length > 0 && !explanation) {
          explanation += line + ' ';
        }
      }
      
      return {
        question,
        options,
        correctAnswer,
        explanation: explanation.trim()
      };
    });
    
    return { questions };
  } catch (error) {
    console.error("Error parsing quiz questions:", error);
    return {
      rawResponse: aiResponse,
      error: "Failed to parse structured quiz"
    };
  }
}
