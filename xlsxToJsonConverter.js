const xlsx = require('xlsx');
const fs = require('fs');

const readExcelOrCSV = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  return jsonData;
};

const generateJSON = (data) => {
  const questions = [];
  for (let i = 1; i < data.length; i++) {
    const [question, answer1, answer2, answer3, answer4, answer5, defaultTeam] = data[i];
    const answers = [
      { answer: answer1, points: 5 },
      { answer: answer2, points: 4 },
      { answer: answer3, points: 3 },
      { answer: answer4, points: 2 },
      { answer: answer5, points: 1 },
    ];
    questions.push({ question, defaultTeam, answers });
  }

  const teams = [
    { name: "AtlantX", points: 0 },
    { name: "BlackOps", points: 0 },
    { name: "CypherSyndicate", points: 0 },
    { name: "DareDevils", points: 0 },
    { name: "Elysium", points: 0 }
  ];

  const members = [
    "Amjad",
    "Aravinthan",
    "Asiri",
    "Chathuranga",
    "Chinthaka",
    "Damith",
    "Dehemi",
    "Dilina",
    "Dinu",
    "Hasanga",
    "Hasini",
    "Hasitha",
    "Kavison",
    "Kawinda",
    "Kelum",
    "Lathes",
    "Miluckshan",
    "Prasanna",
    "Priyankara",
    "Rajatha",
    "Ravindu",
    "Sahana",
    "Sanjana",
    "Sasanga",
    "Senduran",
    "Shazny",
    "Tharindu",
    "Thuvee",
    "Umanga"
  ];

  return { questions, teams, members };
};

const saveJSONToFile = (data, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`JSON data saved to ${filePath}`);
};

// Main execution
const filePath = 'result.xls'; // Change to 'result.csv' if needed
const jsonData = readExcelOrCSV(filePath);
const generatedJSON = generateJSON(jsonData);
saveJSONToFile(generatedJSON, 'data1.json');
