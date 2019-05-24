const express = require('express');
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const session = require("express-session")({
    secret : "bspl",
    resave : true,
    saveUninitialized : true,
});
const sharedSession = require("express-socket.io-session");

const path = require("path");
const fs = require("fs");

server.listen(8080);

app.use(session);
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "files")));

io.use(sharedSession(session, {
    autoSave : true
}));

const dataLoc = "./data/";
const videoLoc = "./videos/";

let sID_Videos_Map = new Map();
let sID_dataFile_Map = new Map();
let sID_videoStatus_Map = new Map();

let socketID_sID_Map = new Map();
let sID_socketID_Map = new Map();

function randIndex(list) {
    const i = Math.floor(Math.random() * list.length);
    return i; 
}

function getRandomVideo(sID) {
    let videoList = sID_Videos_Map.get(sID);

    // If undefined, set new Video IDs list
    if (typeof videoList == "undefined") {
        let videoIDs = [11, 12, 20, 21, 36];
        sID_Videos_Map.set(sID, videoIDs);
        videoList = sID_Videos_Map.get(sID);
    }

    const randI = randIndex(videoList)
    const videoID = videoList[randI];
    videoList.splice(randI, 1);

    return videoID;
}

function setDataFile(sID, dataFileName) {;
    const dataFile = fs.createWriteStream(dataLoc + dataFileName, {encoding:"utf-8"})
    dataFile.write("scenetime,engaged,anticipation,anger,disgust,fear,trust,joy,surprise,sad,valence,arousal,dominance\n")
    sID_dataFile_Map.set(sID, dataFile);
}

function getDataFile(sID) {
    const dataFile = sID_dataFile_Map.get(sID);
    return dataFile;
}

app.get('/', (req, res) => {
    if (req.session.subjectID) {
        const sID = req.session.subjectID;
        const videoID = getRandomVideo(sID);
        dataFileName = `${sID}_V${videoID}.csv`;
        setDataFile(sID, dataFileName);

        videoFile = videoLoc + `${videoID}.mp4`;
        res.render("video", {video_file : videoFile});
    } else {
        res.redirect("/assign");
    }
});

app.get("/assign", (req, res) => {
    res.render("assign");
});

app.get("/setID", (req, res, next) => {
    let sID = `S${req.query.id}`;
    req.session.subjectID = sID;
    req.session.save(() => {
        console.log(`# ${sID} started the experiment.`)
        res.redirect('/');
    });
});

// Handle WebSocket events with video.js
io.on("connection", (socket) => {
    const sID = socket.handshake.session.subjectID;
    socketID_sID_Map.set(socket.id, sID);
    sID_socketID_Map.set(sID, socket.id);

    socket.on("videoPlaying", () => {
        const sID = socketID_sID_Map.get(socket.id);
        sID_videoStatus_Map.set(sID, "playing");
    });

    socket.on("videoPaused", (data) => {
        const sID = socketID_sID_Map.get(socket.id);
        const sceneTime = data;
        let videoStatus = sID_videoStatus_Map.get(sID);
        const dataFile = getDataFile(sID);
    
        if (videoStatus == "playing") {
            dataFile.write(`${sceneTime},`);
            sID_videoStatus_Map.set(sID, "paused");
            io.to(socket.id).emit("videoCommand", "startRating");
        }
    });

    socket.on("videoEnded", (data) => {
        const sID = socketID_sID_Map.get(socket.id);
        const endTime = data;
        let videoStatus = sID_videoStatus_Map.get(sID);
        const dataFile = getDataFile(sID);

        if (videoStatus == "playing") {
            dataFile.write(`${endTime},`);
            sID_videoStatus_Map.set(sID, "ended");
            //console.log("# DEBUG: Video is ended.")
        }
    });
});

app.get("/engaged", (req, res) => {
    res.render("engaged");
});

app.get("/engaged_rating", (req, res) => {
    const sID = req.session.subjectID;
    const engagedRating = req.query.engaged;
    const dataFile = getDataFile(sID);

    dataFile.write(`${engagedRating},`);
    res.send("next");
});

app.get("/emotion", (req, res) => {
    res.render("emotion");
});

app.get("/emotion_selected", (req, res) => {
    const sID = req.session.subjectID;
    const selections = req.query.selections;
    const dataFile = getDataFile(sID);
    const totalEmotions = ["Anticipation", "Anger", "Disgust", "Fear", "Trust", "Joy", "Surprise", "Sad"];

    let selectionList = selections.split(",");
    let emotionEncode = [];

    totalEmotions.forEach((emotion) => {
        if (selectionList.indexOf(emotion) !== -1) {
            emotionEncode.push(1);
        } else {
            emotionEncode.push(0);
        }
    });

    let emotionData = emotionEncode.join(",");
    dataFile.write(`${emotionData},`);
    res.send("next");
})

app.get("/vad", (req, res) => {
    res.render("vad");
});

app.get("/vad_rating", (req, res) => {
    const sID = req.session.subjectID;
    const valenceRating = req.query.valence;
    const arousalRating = req.query.arousal;
    const dominanceRating = req.query.dominance;
    const dataFile = getDataFile(sID);

    dataFile.write(`${valenceRating},`);
    dataFile.write(`${arousalRating},`);
    dataFile.write(`${dominanceRating}\n`);

    const socketID = sID_socketID_Map.get(sID);
    const videoStatus = sID_videoStatus_Map.get(sID);

    if (videoStatus == "paused") {
        res.send("close");
        io.to(socketID).emit("videoCommand", "resumeVideo");
    } else if (videoStatus == "ended") {
        //console.log("# DEBUG: Final rating is finished.")
        res.send("finish");
    }
});

app.get("/fixation", (req, res) => {
    const sID = req.session.subjectID;
    const dataFile = getDataFile(sID);
    dataFile.close();
    res.render("fixation");
});

app.get("/end", (req, res) => {
    const sID = req.session.subjectID;
    videoList = sID_Videos_Map.get(sID);
    if (videoList.length > 0) {
        res.redirect('/');
    } else {
        //const dataFile = getDataFile(sID);
        //dataFile.close();
        req.session.destroy(err => {
            console.log(`# ${sID} finished the experiment.`);
            if (err) {
                console.log(err);
            } else {
                res.render("end");
            }
        });
    }
});