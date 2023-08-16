const questionsEndpoint = "../../api/quiz/questions";
const questionsCheckEndpoint = "../../api/quiz/questions/check";

let questionsData = [];

const questionContainer = document.getElementById("question-container");
const quizContainer = document.getElementById("quiz-container");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const optionCheckboxes = document.querySelectorAll(".option-checkbox");
const optionTexts = document.querySelectorAll(".option-text");
const scoreContainer = document.getElementById("score-container");
const scoreElement = document.getElementById("score");
const questionCounter = document.getElementById("question-counter");
const currentQuestionElement = document.getElementById("current-question");
const totalQuestionsElement = document.getElementById("total-questions");

function shuffleArray(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

let currentQuestionIndex = 0;
let score = 0;

function getQuestionText(idx) {
  return questionsData[idx].question;
}
function getQuestionOptions(idx) {
  return questionsData[idx].options;
}
function getQuestionCorrectAnswers(idx) {
  return questionsData[idx].correctAnswers;
}

async function issueGetRequest() {
  const questionsUrl = questionsEndpoint;
  questionsData = await Promise.all(
    [questionsUrl].map((url) =>
      fetch(url, { headers: formatHeaders() }).then((r) => {
        return r.json().then((json) => {
          return {
            json,
            status: r.status,
          };
        });
      })
    )
  );
  questionsData = questionsData[0];
  if (questionsData.status !== 200) {
    quizContainer.innerHTML = "<strong>⛔ Please log in and return to this page ⛔</strong>";
  } else {
    questionsData = questionsData.json;
    showQuestion();
  }
}

async function issueCheckAnswerRequest(selectedAnswers) {
  const data = {
    questionText: getQuestionText(currentQuestionIndex),
    selectedAnswers,
  };
  fetch(questionsCheckEndpoint, {
    method: "POST",
    body: data,
    headers: {
      Authorization: getBearerToken(),
    },
  });
}

function showQuestion() {
  const currentQuestionText = getQuestionText(currentQuestionIndex);
  questionText.textContent = currentQuestionText;

  const shuffledOptions = shuffleArray([...getQuestionOptions(currentQuestionIndex)]);

  for (let i = 0; i < optionTexts.length; i++) {
    optionTexts[i].textContent = shuffledOptions[i];
    optionCheckboxes[i].checked = false;
  }

  currentQuestionElement.textContent = currentQuestionIndex + 1;
  totalQuestionsElement.textContent = questionsData.length;
}

async function checkAnswer() {
  const selectedAnswers = [];
  for (let i = 0; i < optionCheckboxes.length; i++) {
    if (optionCheckboxes[i].checked) {
      selectedAnswers.push(optionTexts[i].textContent);
    }
  }
  const data = {
    questionText: getQuestionText(currentQuestionIndex),
    selectedAnswers,
  };
  fetch(questionsCheckEndpoint, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: getBearerToken(),
    },
  }).then((response) => {
    response.json().then((json) => {
      const isCorrect = json["isCorrect"] ?? false;
      if (isCorrect) {
        score++;
        scoreElement.textContent = score;
      }

      currentQuestionIndex++;
      if (currentQuestionIndex < questionsData.length) {
        showQuestion();
      } else {
        displayFinalScore(score);
      }
    });
  });
}

function displayFinalScore(score) {
  questionContainer.innerHTML = `<strong>Congratulations! You've completed the quiz. Your score: ${score} points!</strong><br><br>`;
  if (score === questionsData.length) {
    questionContainer.innerHTML += `Congratulations!<br>You got a perfect score!<br>You're a true expert in this field!🏆🥇`;
  } else if (score >= questionsData.length * 0.8) {
    questionContainer.innerHTML += `Great job!<br>You scored excellently on the quiz.<br>Your knowledge is impressive!🥈`;
  } else if (score >= questionsData.length * 0.5) {
    questionContainer.innerHTML += `Well done!<br>You've got a good score on the quiz.<br>Keep up the good work!🥉`;
  } else if (score >= questionsData.length * 0.3) {
    questionContainer.innerHTML += `Nice effort!<br>Your score shows a decent understanding of the topic.<br>Keep learning!👏`;
  } else if (score === 0) {
    questionContainer.innerHTML += `Good start!<br>There's room for improvement.<br>Keep studying and practicing for better results next time!📚`;
  }
}

function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

issueGetRequest();