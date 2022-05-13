const socket = io();

const formUser = document.querySelector("#formUser");
const inputUser = document.querySelector("#inputUser");

const messages = document.querySelector("#messages");
const formMessage = document.querySelector("#formMessage");
const inputMessage = document.querySelector("#inputMessage");
const userContianer = document.querySelector("#userContainer");

// QUIZHISTORIK OCH CHATHISTORIK
const qh = document.querySelector("#ge_quizhistorik");
const ch = document.querySelector("#ge_chathistorik");

function ct(X) {
  console.table(X);
}

ch.addEventListener("click", function () {
  ct("ch");

  fetch("http://localhost:3000/ge_ch")
    .then((resp) => resp.json())
    .then(function (data) {
      ct(data);

      let cm = [];
      for (i in data.haemtat_objekt_fr_db_ch) {
        //qsvar.push(i);
        cm.push(
          "<b>" +
            data.haemtat_objekt_fr_db_ch[i].user +
            ":</b> " +
            data.haemtat_objekt_fr_db_ch[i].message +
            " (" +
            data.haemtat_objekt_fr_db_ch[i].date +
            ")"
        );
      }

      ct(cm);
      document.querySelector("#ch").innerHTML = cm.join("<br />");
    });
});
qh.addEventListener("click", function () {
  fetch("http://localhost:3000/ge_qh")
    .then((resp) => resp.json())
    .then(function (data) {
      ct(data);

      let qsvar = [];
      for (i in data.haemtat_objekt_fr_db_qh) {
        //qsvar.push(i);
        qsvar.push(
          "<b> " +
            data.haemtat_objekt_fr_db_qh[i].fraageindex +
            ":</b> " +
            data.haemtat_objekt_fr_db_qh[i].fraaga +
            " <i><b>" +
            data.haemtat_objekt_fr_db_qh[i].anvaendare +
            ":</b> " +
            data.haemtat_objekt_fr_db_qh[i].anvaendarens_svar +
            "</i>"
        );
      }
      ct(qsvar);
      document.querySelector("#qh").innerHTML = qsvar.join("<br />");
    });
});

//############################################################################
// QUIZ-SVAR (motsvarande som för chat-meddelanden)
let quiz_answer = document.querySelector("#quiz_answer");
let input_quiz_answer = document.querySelector("#input_quiz_answer");

let myUser;

// RÄKNAS UPP, FRÅGA FÖR FRÅGA
let aktuellt_fraageindex = 1;

const fraage_arr = [
  "DUMMY",
  "Vad heter Frankrikes huvudstad?",
  "Vad heter valutan i Finland?",
  "Vad heter Greklands huvudstad?",

  "Vad heter Namibias huvudstad?",
  "Vad heter Portugals huvudstad?",
  "Vad heter ko på franska?",

  "Vad heter Kanadas huvudstad?",
  "Vad heter Australiens huvudstad?",
  "I vilken land är Rom huvudstad?",

  "I vilken land är Tokyo huvudstad?",
  "I vilken land är Oslo huvudstad?",
  "I vilken land är Iriska ett officiellt språk?",
];

let aktuell_fraaga = fraage_arr[aktuellt_fraageindex];

//##############################
// VISA AKTUELL FRÅGA

document.querySelector("#quiz_question").innerHTML =
  aktuellt_fraageindex + ": " + aktuell_fraaga;

//########################################
// Sätt användare
formUser.addEventListener("submit", function (e) {
  e.preventDefault();
  myUser = inputUser.value;
  userContianer.innerHTML =
    "<h3 class='h3'>Välkommen " + myUser + ", här kan du chatta</h3>";
  document.getElementById("user").style.display = "none";
  document.getElementById("skrivnamn").style.display = "none";
  document.getElementById("message").style.display = "inline";
});

//########################################
// Meddelande från användare
formMessage.addEventListener("submit", function (e) {
  e.preventDefault();
  if (inputMessage.value) {
    socket.emit("medd", { user: myUser, message: inputMessage.value });
    inputMessage.value = "";
  }
});

//########################################
// QUIZ-SVAR från användare
quiz_answer.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input_quiz_answer.value) {
    socket.emit("quiz_answer_from_user", {
      anvaendare: myUser,
      fraageindex: aktuellt_fraageindex,
      fraaga: aktuell_fraaga,
      anvaendarens_svar: input_quiz_answer.value,
    });

    // msg.fraageindex, msg.fraaga, msg.anvaendarens_svar

    input_quiz_answer.value = "";

    // VISA NÄSTA FRÅGA
    aktuellt_fraageindex++;

    if (aktuellt_fraageindex + 1 > fraage_arr.length) {
      document.querySelector("#quiz_question").innerHTML =
        "Detta quiz är avslutat";
    } else {
      aktuell_fraaga = fraage_arr[aktuellt_fraageindex];
      document.querySelector("#quiz_question").innerHTML =
        aktuellt_fraageindex + ": " + aktuell_fraaga;
    }
  }
});

//########################################
// Visar nytt meddelande när det kommer genom
// socket.on('newChatMessage'

socket.on("newChatMessage", function (msg) {
  let item = document.createElement("li");
  item.innerHTML = msg;
  messages.appendChild(item);
});

//########################################
// Visar löpande quiz-feedback från serversidan
// socket.on('new_quiz_feedback'

socket.on("new_quiz_feedback", function (msg) {
  let item = document.createElement("li");
  item.innerHTML = msg;
  quiz_feedback.appendChild(item);
});
