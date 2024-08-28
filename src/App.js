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
  const [wrongAnswer, setWrongAnswer] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // List of members for suggestions
  const members = jsonData.members

  useEffect(() => {

    let currentQuestion = data.questions[0]
    if (currentQuestion) {
      let teamIdx = jsonData.teams.findIndex(team => team.name === currentQuestion.defaultTeam)
      setCurrentTeamIndex(teamIdx)
    }

    const storedData = localStorage.getItem('gameData');
    if (storedData) {
      setData(JSON.parse(storedData));
      setTrigger(true);
    }
  }, []);

  useEffect(() => {
    if (trigger) {
      localStorage.setItem('gameData', JSON.stringify(data));
    }
  }, [data]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    // Filter suggestions based on input
    if (value.length > 0) {
      const filteredSuggestions = members.filter((member) =>
        member.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setSuggestions([]);
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

        const updatedTeams = data.teams.map((team, index) => {
          if (index === currentTeamIndex) {
            return { ...team, points: team.points + answer.points };
          }
          return team;
        });
        setData({ ...data, teams: updatedTeams });

        setInput("");
        setWrongAnswer(false);

        localStorage.setItem('gameData', JSON.stringify(data));
      }
    } else {
      handleTeamPointsDeduct(currentTeamIndex, pointsToDeduct);
      setWrongAnswer(true);
      setCurrentTeamIndex((prevIndex) => (prevIndex + 1) % data.teams.length);
      setInput("");
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

    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const revealAnswer = (answer) => {
    if (!revealedAnswers.includes(answer)) {
      setRevealedAnswers([...revealedAnswers, answer]);
      localStorage.setItem('gameData', JSON.stringify(data));
    }
  };

  const handleTeamPointsDeduct = (teamIndex, points) => {
    const updatedTeams = data.teams.map((team, index) => {
      if (index === teamIndex) {
        return { ...team, points: Math.max(team.points - points, 0) };
      }
      return team;
    });
    setData({ ...data, teams: updatedTeams });

    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const nextQuestion = () => {
    setRevealedAnswers([]);
    const nextquestion = data.questions[(currentQuestionIndex + 1) % data.questions.length]
    if (nextquestion){
      const defaultTeam = jsonData.teams.findIndex(team => team.name === nextquestion.defaultTeam)
      setCurrentTeamIndex(defaultTeam)
    }
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % data.questions.length);
 
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const prevQuestion = () => {
    setRevealedAnswers([]);

    const prevQuestion = data.questions[(currentQuestionIndex - 1) % data.questions.length]
    if (prevQuestion){
      const defaultTeam = jsonData.teams.findIndex(team => team.name === prevQuestion.defaultTeam)
      setCurrentTeamIndex(defaultTeam)
    }

    setCurrentQuestionIndex((prevIndex) => (prevIndex - 1 + data.questions.length) % data.questions.length);
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const handleTeamChange = (e) => {
    setCurrentTeamIndex(parseInt(e.target.value));
  };

  const revealAllAnswers = () => {
    setRevealedAnswers(data.questions[currentQuestionIndex].answers);
    localStorage.setItem('gameData', JSON.stringify(data));
  };

  return (
    <div className="p-4 flex">
      {data ? (
        <>
          <div className="w-2/3 pr-4">
            <h1 className="text-2xl font-bold mb-4">Team Feud</h1>
  
            <div className="mb-4">
              <h2 className="question-text">{data.questions[currentQuestionIndex].question}</h2>
              <div className="flex items-center relative">
                <input
                  type="text"
                  className="border p-2 mt-4 flex-1"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type an answer..."
                />
                {suggestions.length > 0 && (
                  <ul className="absolute bg-white border mt-12 w-full">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className="p-2 cursor-pointer hover:bg-gray-200"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
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
                    <>
                      <span>
                          Hidden Answer
                      </span>
                      <button
                        onClick={() => revealAnswer(answer)}
                        className="ml-2 bg-blue-500 text-white p-1 rounded"
                      >
                        Reveal
                      </button>
                    </>
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
