let currentQuestion  = 0;
let score = 0;
let selected = null;
/*infor bar*/
const timeEL = document.getElementById("time");
const currentEL = document.getElementById("current");
const totalEL = document.getElementById("total");
/*quiz box*/
const questionEL = document.getElementById("question");
const answersEL = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");

totalEL.innerText = questions.length;

function showQuestion(){
    let q = questions[currentQuestion];

    questionEL.innerText = "Câu hỏi " + (currentQuestion + 1) + ": " + q.question;
    answersEL.innerHTML = "";

    q.options.forEach((opt, index) => {
        let div = document.createElement("div");
        div.classList.add("option");
        div.innerHTML = `<input type="radio" name="answer"> ${opt}`;

        div.onclick = () => {
            selected = index;

            document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
            div.classList.add("selected");
        }

        answersEL.appendChild(div)
    });

    currentEL.innerText = currentQuestion + 1;
}

showQuestion();

nextBtn.onclick = () => {
    if(selected === null){
        return;
    } 
    if(selected === questions[currentQuestion].answer){
        score++;
    }

    currentQuestion++;
    selected = null;

    if(currentQuestion < questions.length){
        showQuestion();
    }
    else{
        questionEL.innerText = "Bạn đã hoàn thành bài thi";
        answersEL.innerHTML= `📄 Điểm: <span id="score">${score} / ${currentQuestion}</span>`;
        nextBtn.style.display = "none";
    }
}

/*Đếm thời gian*/
let time = 900; //15 phut

function startTimer() {
    let timer = setInterval(() => {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;

        if (seconds < 10){
            seconds = "0" + seconds;       
        }

        timeEL.innerText = minutes + ":" + seconds;

        time--;

        if(time < 0){
            clearInterval(timer);
        }
    }, 1000);
}
startTimer();

/*Đảo câu trả lời */

function shuffle(arr){
    for(let i = arr.length - 1; i > 0; i--){

        let j = Math.floor(Math.random() * (i + 1));

        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }   
}

shuffle(options);





