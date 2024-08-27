import React, { useState, useEffect } from 'react';
import jsonData from './data.json';
import './App.css';

function App() {
  const [data, setData] = useState(jsonData);
  const [trigger, setTrigger] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState([]);
  const [input, setInput] = useState("");
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [pointsToDeduct, setPointsToDeduct] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(false); // State to track wrong answer

  useEffect(() => {
    // Load data from local storage if it exists
    const storedData = localStorage.getItem('gameData');
  
    if (storedData) {
      setData(JSON.parse(storedData));
      setTrigger(true)
    }
  }, []);

  useEffect(() => {
    // Save data to local storage whenever it changes
    if (trigger) {
    localStorage.setItem('gameData', JSON.stringify(data));
    }
  }, [data]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handlePointsToAddChange = (e) => {
    setPointsToAdd(Number(e.target.value));
  };

  const handlePointsToDeductChange = (e) => {
    setPointsToDeduct(Number(e.target.value));
  };

  const handleAnswerSubmit = () => {
    const currentQuestion = data.questions[currentQuestionIndex];
    const answer = currentQuestion.answers.find(
      (a) => a.answer.toLowerCase() === input.toLowerCase()
    );
    if (answer) {
      if (!revealedAnswers.includes(answer)) {
        setRevealedAnswers([...revealedAnswers, answer]);

        // Update points for the current team
        const updatedTeams = data.teams.map((team, index) => {
          if (index === currentTeamIndex) {
            return { ...team, points: team.points + answer.points };
          }
          return team;
        });
        setData({ ...data, teams: updatedTeams });

        setInput("");
        setWrongAnswer(false); // Reset wrong answer flag

        // Update local storage after submitting an answer
        localStorage.setItem('gameData', JSON.stringify(data));
      }
    } else {
      // Deduct points for the current team and change to next team
      handleTeamPointsDeduct(currentTeamIndex, pointsToDeduct);
      setWrongAnswer(true); // Set wrong answer flag
      setCurrentTeamIndex((prevIndex) => (prevIndex + 1) % data.teams.length);
      setInput("");

      // Update local storage after a wrong answer
      localStorage.setItem('gameData', JSON.stringify(data));
    }
  };

  const handleTeamPointsUpdate = (teamIndex, points) => {
    const updatedTeams = data.teams.map((team, index) => {
      if (index === teamIndex) {
        return { ...team, points: team.points + points };
      }
      return team;
    });
    setData({ ...data, teams: updatedTeams });

    // Update local storage after adding points
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const handleTeamPointsDeduct = (teamIndex, points) => {
    const updatedTeams = data.teams.map((team, index) => {
      if (index === teamIndex) {
        return { ...team, points: Math.max(team.points - points, 0) }; // Prevent negative points
      }
      return team;
    });
    setData({ ...data, teams: updatedTeams });

    // Update local storage after deducting points
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const nextQuestion = () => {
    setRevealedAnswers([]);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % data.questions.length);

    // Update local storage after changing the question
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const prevQuestion = () => {
    setRevealedAnswers([]);
    setCurrentQuestionIndex((prevIndex) => (prevIndex - 1 + data.questions.length) % data.questions.length);

    // Update local storage after changing the question
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const handleTeamChange = (e) => {
    setCurrentTeamIndex(parseInt(e.target.value));
  };

  const revealAllAnswers = () => {
    setRevealedAnswers(data.questions[currentQuestionIndex].answers);

    // Update local storage after revealing all answers
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  return (
  
    <div className="p-4 flex">
      {data != {} ? (
        <>
          {/* Question Section */}
          <div className="w-2/3 pr-4">
            <h1 className="text-2xl font-bold mb-4">Team Feud</h1>
  
            <div className="mb-4">
              <h2 className="question-text">{data.questions[currentQuestionIndex].question}</h2>
              <div className="flex items-center">
                <input
                  type="text"
                  className="border p-2 mt-4 flex-1"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type an answer..."
                />
                <button
                  onClick={handleAnswerSubmit}
                  className="ml-2 bg-blue-500 text-white p-2 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
  
            {wrongAnswer && (
              <div className="mb-4 text-red-500">
                Wrong Answer! The next team gets a chance.
              </div>
            )}
  
            <div className="mb-4">
              {data.questions[currentQuestionIndex].answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 ${revealedAnswers.includes(answer) ? 'bg-green-100' : 'hidden-answer'}`}
                >
                  {revealedAnswers.includes(answer) ? (
                    <div>
                      <span>{answer.answer}</span>
                      <span className="ml-4">{answer.points} points</span>
                    </div>
                  ) : (
                    <span>Hidden Answer</span>
                  )}
                </div>
              ))}
            </div>
  
            <div className="mb-4">
              <button
                onClick={prevQuestion}
                className="bg-gray-500 text-white p-2 rounded mr-2"
              >
                Previous Question
              </button>
              <button
                onClick={nextQuestion}
                className="bg-purple-500 text-white p-2 rounded mr-2"
              >
                Next Question
              </button>
  
              <button
                onClick={revealAllAnswers}
                className="bg-yellow-500 text-white p-2 rounded"
              >
                Reveal All Answers
              </button>
            </div>
          </div>
  
          {/* Team Points Section */}
          <div className="w-1/3 pl-4">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <label className="mr-2">Points to Add:</label>
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={handlePointsToAddChange}
                  className="border p-2 flex-1"
                />
              </div>
              <div className="flex items-center">
                <label className="mr-2">Points to Deduct:</label>
                <input
                  type="number"
                  value={pointsToDeduct}
                  onChange={handlePointsToDeductChange}
                  className="border p-2 flex-1"
                />
              </div>
            </div>
  
            <div className="mb-4">
              {data.teams.map((team, index) => (
                <div key={index} className={`mb-2 p-2 border rounded ${index === currentTeamIndex ? 'bg-yellow-100' : ''}`}>
                  <span className="font-bold">{team.name}:</span>
                  <span className="ml-2">{team.points} points</span>
                  <button
                    onClick={() => handleTeamPointsUpdate(index, pointsToAdd)}
                    className="ml-2 bg-green-500 text-white p-1 rounded"
                  >
                    Add Points
                  </button>
                  <button
                    onClick={() => handleTeamPointsDeduct(index, pointsToDeduct)}
                    className="ml-2 bg-red-500 text-white p-1 rounded"
                  >
                    Deduct Points
                  </button>
                </div>
              ))}
            </div>
  
            <div className="mb-4">
              <label className="mr-2">Select Current Team:</label>
              <select value={currentTeamIndex} onChange={handleTeamChange} className="border p-2">
                {data.teams.map((team, index) => (
                  <option key={index} value={index}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      ) : (
        <div className="p-4">Loading...</div>
      )}
    </div>
  );
}

export default App;



