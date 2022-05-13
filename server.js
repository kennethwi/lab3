const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const port = 3000;

const mongo = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017";
let db;

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) {
      console.error(err);
      return;
    }
    db = client.db("nodesocket");

    chatmeddelanden_db = db.collection("chatmeddelanden_db");
    fraagesvar_db = db.collection("fraagesvar_db");
  }
);

app.use(express.static("public"));

// ########################################
// DENNA ANVÄNDS - hämtar chat-meddelanden från db
app.get("/chatmeddelanden_db", (req, res) => {
  chatmeddelanden_db.find().toArray((err, items) => {
    if (err) throw err;
    console.table(chatmeddelanden_db);
    res.json({ chatmeddelanden_db: items });
  });
});

// ########################################
// DENNA ANVÄNDS - hämtar frågesvar från db
app.get("/fraagesvar_db", (req, res) => {
  fraagesvar_db.find().toArray((err, items) => {
    if (err) throw err;
    console.table(fraagesvar_db);
    res.json({ fraagesvar_db: items });
  });
});

io.on("connection", (socket) => {
  console.log(`A client with id ${socket.id} connected to the chat!`);

  socket.on("chatMessage", (msg) => {
    console.log("Meddelanden: " + msg.message);

    var tid = ge_tid();

    io.emit("newChatMessage", tid + " " + msg.user + ": " + msg.message);

    chatmeddelanden_db.insertOne(
      {
        user: msg.user,
        message: msg.message,
        date: tid,
      },
      (err, result) => {
        if (err) throw err;
        console.log(result);
      }
    );
  });

  //################################
  // ANVÄNDAREN SVARAR PÅ QUIZ-FRÅGA
  //
  socket.on("quiz_answer_from_user", (msg) => {
    console.table(msg);

    fraagesvar_db.insertOne(
      {
        anvaendare: msg.anvaendare,
        fraageindex: msg.fraageindex,
        fraaga: msg.fraaga,
        anvaendarens_svar: msg.anvaendarens_svar,
        date: ge_tid(),
      },
      (err, result) => {
        if (err) throw err;
        console.log(result);
      }
    );

    if (
      msg.fraageindex +
        "|" +
        msg.fraaga.toLowerCase() +
        "|" +
        msg.anvaendarens_svar.toLowerCase() in
      facit_obj
    ) {
      console.log(msg.anvaendare + " svarade rätt: " + msg.anvaendarens_svar);

      io.emit(
        "new_quiz_feedback",
        "<span class='korrekt_svar'>" +
          msg.anvaendare +
          " svarade rätt på fråga " +
          msg.fraageindex +
          "</span>"
      );
    } else {
      console.log(msg.anvaendare + " svarade fel: " + msg.anvaendarens_svar);

      io.emit(
        "new_quiz_feedback",
        "<span class='fel_svar'>" +
          msg.anvaendare +
          " svarade fel på fråga " +
          msg.fraageindex +
          "</span>"
      );
    }

    //msg.fraageindex, msg.fraaga, msg.anvaendarens_svar

    // io.emit("newChatMessage", msg.user + 0 + " : " + 0 + msg.message);
    // let today = new Date();
    // let date =
    //   today.getFullYear() +
    //   "-" +
    //   (today.getMonth() + 1) +
    //   "-" +
    //   today.getDate();
    // let time =
    //   today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    // let dateTime = date + " " + time;
    // messages.insertOne(
    //   {
    //     user: msg.user,
    //     message: msg.message,
    //     date: dateTime,
    //   },
    //   (err, result) => {
    //     if (err) throw err;
    //     console.log(result);
    //   }
    // );
  });

  socket.on("disconnect", () => {
    console.log(`Client ${socket.id} disconnected!`);
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});

const facit_obj = {
  "1|vad heter frankrikes huvudstad?|paris": 1,
  "2|vad heter valutan i finland?|euro": 1,
  "3|vad heter greklands huvudstad?|aten": 1,

  "4|vad heter namibias huvudstad?|windhoek": 1,
  "5|vad heter portugals huvudstad?|lissabon": 1,
  "6|vad heter ko på franska?|vache": 1,

  "7|vad heter kanadas huvudstad?|ottawa": 1,
  "8|vad heter australiens huvudstad?|canberra": 1,
  "9|i vilken land är rom huvudstad?|italien": 1,

  "10|i vilken land är tokyo huvudstad?|japan": 1,
  "11|i vilken land är oslo huvudstad?|norge": 1,
  "12|i vilken land är iriska ett officiellt språk?|irland": 1,
};

function ge_tid() {
  //https://www.delftstack.com/howto/node.js/formatting-dates-in-nodejs/#format-a-date-object-using-the-yyyy-mm-dd-hhmmss-function
  const d_t = new Date();

  let year = d_t.getFullYear();
  let month = ("0" + (d_t.getMonth() + 1)).slice(-2);
  let day = ("0" + d_t.getDate()).slice(-2);
  let hour = d_t.getHours();
  let minute = d_t.getMinutes();
  let seconds = d_t.getSeconds();

  return d_t;
}

// ################################
// POST TILL MONGODB
app.post("/mongodb_post_qa", (req, res) => {
  // VAD SKA SPARAS?
  // Så mycket som möjligt för varje svar

  fraagesvar_db.insertOne(
    {
      id: i,
      filmtitel: ft,
      foerfattare: rf,
      datum: rd,
      rubrik: rr,
      recensionstext: rtxt,
      betyg: b,
    },
    (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json({ ok: true });
    }
  );
});

// ################################
// POST TILL MONGODB
app.post("/mongodb_post_messages", (req, res) => {
  // VAD SKA SPARAS?
  // Alla chat-meddelanden

  // let i = req.body.id
  // let ft = req.body.filmtitel
  // let rr = req.body.recensionsrubrik
  // let rf = req.body.recensionsfoerfattare
  // let rd = req.body.recensionsdatum
  // let rtxt = req.body.recensionstext
  // let b = req.body.recensionsbetyg

  chatmeddelanden_db.insertOne(
    {
      id: i,
      filmtitel: ft,
      foerfattare: rf,
      datum: rd,
      rubrik: rr,
      recensionstext: rtxt,
      betyg: b,
    },
    (err, result) => {
      if (err) throw err;
      console.log(result);
      res.json({ ok: true });
    }
  );
});

// #############################################
// MONGODB GET CH
//
app.get("/ge_ch", (req, res) => {
  chatmeddelanden_db.find().toArray((err, items) => {
    if (err) throw err;
    res.json({ haemtat_objekt_fr_db_ch: items });
  });
});

// #############################################
// MONGODB GET QH
//
app.get("/ge_qh", (req, res) => {
  fraagesvar_db.find().toArray((err, items) => {
    if (err) throw err;
    res.json({ haemtat_objekt_fr_db_qh: items });
  });
});
