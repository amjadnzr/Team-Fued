import React, { useState, useEffect } from 'react';
import jsonData from './data.json';
import './App.css';
import Timer from './Timer';

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
  const [resetTimer, setResetTimer] = useState(false);
  

  const members = jsonData.members;

  useEffect(() => {
    let currentQuestion = data.questions[0];
    if (currentQuestion) {
      let teamIdx = jsonData.teams.findIndex(
        (team) => team.name === currentQuestion.defaultTeam
      );
      setCurrentTeamIndex(teamIdx);
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

    if (value.length > 0) {
      const filteredSuggestions = members.filter((member) =>
        member.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleTimeUp = (currentTeamIndexToChange) => {
    setCurrentTeamIndex(currentTeamIndexToChange);
    setResetTimer(true);  // Reset the timer for the next team
  };

  const handleCorrectAnswer = () => {
    // Reset the timer if the answer is correct
    setResetTimer(true);
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
        handleCorrectAnswer()
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
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % data.questions.length);

    localStorage.setItem('gameData', JSON.stringify(data));
  };

  const prevQuestion = () => {
    setRevealedAnswers([]);
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
                  onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
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
                <div className="ml-[10px]">
                 <Timer 
                    initialTime={10} 
                    onTimeUp={handleTimeUp} 
                    key={resetTimer ? currentTeamIndex : undefined} 
                    currentTeamIndex={currentTeamIndex}
                 />
                 </div>
              </div>
             
              
            </div>
            <div className="mb-4 text-red-500">
              {wrongAnswer && (
                    <>
                    Wrong Answer! The next team gets a chance.
                    </>
              )}
            </div>

            <div className="mb-4">
              {data.questions[currentQuestionIndex].answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 ${revealedAnswers.includes(answer) ? 'bg-green-100' : 'hidden-answer'}`}
                >
                  {revealedAnswers.includes(answer) ? (
                    <div className="flex justify-between">
                      <span>{answer.answer}</span>
                      <span>{answer.points}</span>
                    </div>
                  ) : (
                    <span className="flex justify-between">
                      <span>*********</span>
                      <button onClick={() => revealAnswer(answer)}>Reveal</button>
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-between mb-4">
              <button className="bg-gray-300 p-2" onClick={prevQuestion}>
                Previous Question
              </button>
              <button className="bg-gray-300 p-2" onClick={nextQuestion}>
                Next Question
              </button>
              <button className="bg-red-500 text-white p-2" onClick={revealAllAnswers}>
                Reveal All Answers
              </button>
            </div>

            <div className="flex items-center mb-4">
              <label className="mr-2">Team's Points:</label>
              <input
                type="number"
                className="border p-2 mr-2"
                value={pointsToAdd}
                onChange={handlePointsToAddChange}
                placeholder="Points to add"
              />
              <button
                className="bg-green-500 text-white p-2"
                onClick={() => handleTeamPointsUpdate(currentTeamIndex, pointsToAdd)}
              >
                Add Points
              </button>
              <input
                type="number"
                className="border p-2 mx-2"
                value={pointsToDeduct}
                onChange={handlePointsToDeductChange}
                placeholder="Points to deduct"
              />
              <button
                className="bg-red-500 text-white p-2"
                onClick={() => handleTeamPointsDeduct(currentTeamIndex, pointsToDeduct)}
              >
                Deduct Points
              </button>
            </div>
          </div>

          <div className="w-1/3">
            <h2 className="text-xl font-bold mb-4">Teams</h2>
            <div>
              {data.teams.map((team, index) => (
                <div
                  key={index}
                  className={`p-4 mb-4 ${index === currentTeamIndex ? 'bg-blue-200' : 'bg-white'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{team.name}</span>
                    <span>Points: {team.points}</span>
                  </div>
                  <button
                    className="bg-gray-300 p-2 mt-2"
                    onClick={() => setCurrentTeamIndex(index)}
                  >
                    Select {team.name}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="mr-2">Set Active Team:</label>
              <select
                className="border p-2"
                value={currentTeamIndex}
                onChange={handleTeamChange}
              >
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
        <div>Loading...</div>
      )}
    </div>
  );
}

export default App;
