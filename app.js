const express = require('express')
const app = express()
app.use(express.json())
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const intialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('DB Connected sucessfully and server is running at port 3000')
    })
  } catch (e) {
    console.log('db err')
  }
}
intialize()
const convOtoCArr = obj => {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
  }
}
const convOtoC = obj => {
  let newObj = []
  for (let i of obj) {
    newObj.push(convOtoCArr(i))
  }
  return newObj
}
app.get('/players/', async (request, response) => {
  const sendGet = `
        SELECT * FROM player_details;
    `
  const arrayOf = await db.all(sendGet)
  response.send(convOtoC(arrayOf))
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const sendGet = `
        SELECT * FROM player_details WHERE player_id = ${playerId};
    `
  const arrayOf = await db.get(sendGet)
  response.send(convOtoCArr(arrayOf))
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const details = request.body
  const {playerName} = details
  const putQuery = ` UPDATE player_details SET player_name = '${playerName}'  WHERE player_id = ${playerId}`
  await db.run(putQuery)
  // console.log(request.body)
  response.send('Player Details Updated')
})
const convOtoCArr2 = obj => {
  return {
    matchId: obj.match_id,
    match: obj.match,
    year: obj.year,
  }
}
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getQuery = `SELECT * FROM match_details WHERE match_id = ${matchId}`
  const dataArray = await db.get(getQuery)
  response.send(convOtoCArr2(dataArray))
})

const convOtoC2 = obj => {
  let newObj = []
  for (let i of obj) {
    newObj.push(convOtoCArr2(i))
  }
  return newObj
}
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const sendGet = `
  SELECT match_details.match_id,match_details.match,match_details.year FROM match_details JOIN player_match_score ON match_details.match_id = player_match_score.match_id  WHERE player_match_score.player_id = ${playerId};
  `
  const arrayResult = await db.all(sendGet)
  response.send(convOtoC2(arrayResult))
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const sendGetQuery = `
    SELECT player_details.player_id,player_details.player_name FROM player_details JOIN player_match_score ON player_details.player_id = player_match_score.player_id WHERE player_match_score.match_id = ${matchId};
  `
  const arrayResult = await db.all(sendGetQuery)
  // response.send(arrayResult)
  response.send(convOtoC(arrayResult))
})

const convOtoCArr4 = obj => {
  return {
    playerId: obj.playerId,
    playerName: obj.playerName,
    totalScore: obj.totalScore,
    totalFours: obj.totalFours,
    totalSixes: obj.totalSixes,
  }
}
const convOtoC4 = obj => {
  let newObj = []
  for (let i of obj) {
    newObj.push(convOtoCArr4(i))
  }
  return newObj
}

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const sendGet = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `
  const getArray = await db.get(sendGet)
  response.send(getArray)
  //response.send(convOtoC4(getArray))
})

module.exports = app
