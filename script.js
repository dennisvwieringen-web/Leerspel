const cardForm = document.getElementById('card-form');
const photoInput = document.getElementById('photo-input');
const questionInput = document.getElementById('question-input');
const answerInput = document.getElementById('answer-input');
const statusText = document.getElementById('status');
const cardList = document.getElementById('card-list');

const startBtn = document.getElementById('start-btn');
const quizSection = document.getElementById('quiz');
const progressText = document.getElementById('progress');
const scoreText = document.getElementById('score');
const quizImage = document.getElementById('quiz-image');
const quizQuestion = document.getElementById('quiz-question');
const quizAnswer = document.getElementById('quiz-answer');
const checkBtn = document.getElementById('check-btn');
const nextBtn = document.getElementById('next-btn');
const feedback = document.getElementById('feedback');
const correctAnswerText = document.getElementById('correct-answer');

const cards = [];
let order = [];
let currentIndex = 0;
let score = 0;
let checkedCurrent = false;

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

function similarity(a, b) {
  const aa = normalize(a);
  const bb = normalize(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  if (aa.includes(bb) || bb.includes(aa)) return 0.8;
  return 0;
}

function renderCardList() {
  cardList.innerHTML = '';
  cards.forEach((card, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${card.question}`;
    cardList.appendChild(li);
  });
}

cardForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const file = photoInput.files[0];
  const question = questionInput.value.trim();
  const answer = answerInput.value.trim();

  if (!file || !question || !answer) {
    statusText.textContent = 'Vul alle velden in.';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    cards.push({
      imageDataUrl: String(reader.result),
      question,
      answer,
    });
    renderCardList();
    cardForm.reset();
    statusText.textContent = `Kaart opgeslagen. Totaal: ${cards.length}`;
  };
  reader.readAsDataURL(file);
});

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadQuestion() {
  const card = cards[order[currentIndex]];
  progressText.textContent = `Vraag ${currentIndex + 1} van ${order.length}`;
  scoreText.textContent = `Score: ${score}`;
  quizImage.src = card.imageDataUrl;
  quizQuestion.textContent = card.question;
  quizAnswer.value = '';
  feedback.textContent = '';
  feedback.className = 'feedback';
  correctAnswerText.textContent = '';
  nextBtn.disabled = true;
  checkedCurrent = false;
  quizAnswer.focus();
}

startBtn.addEventListener('click', () => {
  if (cards.length === 0) {
    statusText.textContent = 'Voeg eerst minimaal één kaart toe.';
    return;
  }
  order = shuffle(cards.map((_, i) => i));
  currentIndex = 0;
  score = 0;
  quizSection.classList.remove('hidden');
  loadQuestion();
});

checkBtn.addEventListener('click', () => {
  if (checkedCurrent) return;
  const userText = quizAnswer.value;
  const card = cards[order[currentIndex]];
  const match = similarity(userText, card.answer);

  if (match >= 0.8) {
    score += 1;
    feedback.textContent = 'Goed gedaan! ✅';
    feedback.classList.add('ok');
  } else {
    feedback.textContent = 'Niet helemaal. ❌';
    feedback.classList.add('bad');
    correctAnswerText.textContent = `Correct antwoord: ${card.answer}`;
  }

  scoreText.textContent = `Score: ${score}`;
  checkedCurrent = true;
  nextBtn.disabled = false;
});

nextBtn.addEventListener('click', () => {
  if (!checkedCurrent) return;
  currentIndex += 1;

  if (currentIndex >= order.length) {
    progressText.textContent = `Klaar!`;
    quizQuestion.textContent = `Eindscore: ${score}/${order.length}`;
    quizImage.src = '';
    quizImage.alt = '';
    quizAnswer.value = '';
    feedback.textContent = 'Druk op "Start met overhoren" om opnieuw te spelen.';
    feedback.className = 'feedback ok';
    correctAnswerText.textContent = '';
    nextBtn.disabled = true;
    checkedCurrent = false;
    return;
  }

  loadQuestion();
});
