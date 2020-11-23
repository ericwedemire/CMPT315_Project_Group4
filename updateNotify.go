package main

import (
	"encoding/json"
	"log"
	"strconv"
	"strings"

	"github.com/go-redis/redis"
)

// databaseUpdate receives a message from the frontend WebSocket connection in
//form of:
//		{cardType, cardClicked}
//It will use this key,value pair to update the redis database accordingly and
//notify all users who are listening in that game
func databaseUpdate(user User, message string) {

	game := activeGames[user.GameID]

	//mutex lock
	game.mutex.Lock()
	log.Println("Attempting card selection for:", message)

	//split message into [key, value]
	keyValue := strings.Split(message, " ")

	//alter cardValue in database
	alterResult := alterCardState(user.GameID, keyValue)
	if alterResult == "" {
		return
	}

	turn := database.HGet(ctx, user.GameID, "turn").Val()

	//generate GameState object to be passed to user
	var gameState GameState
	gameState.GameID = user.GameID

	//database call to change score & turn and mark card as selected
	pipeline := database.TxPipeline()
	defer pipeline.Close()
	var err error

	// changing score; civilian cards alter no points, and so that case will
	// simply fallthrough to change the turn
	gameState.RedScore, err = strconv.Atoi(database.HGet(ctx, user.GameID, "score:red").Val())
	if err != nil {
		log.Println("FAILURE: red score was not understood:", err)
		return
	}
	gameState.BlueScore, err = strconv.Atoi(database.HGet(ctx, user.GameID, "score:blue").Val())
	if err != nil {
		log.Println("FAILURE: blue score was not understood:", err)
		return
	}
	switch keyValue[0] {
	case "red":
		gameState.RedScore--
		if gameState.RedScore == 0 {
			gameState.GameOver = true
		}
		pipeline.Do(ctx, "HSET", user.GameID, "score:red", gameState.RedScore)

	case "blue":
		gameState.BlueScore--
		if gameState.BlueScore == 0 {
			gameState.GameOver = true
		}
		pipeline.Do(ctx, "HSET", user.GameID, "score:blue", gameState.BlueScore)

	case "assassin":
		gameState.GameOver = true
	}

	// turn change only if card colour did not match turn colour
	if turn != keyValue[0] {
		switch turn {
		case "red":
			turn = "blue"
			gameState.Turn = "blue"
		case "blue":
			turn = "red"
			gameState.Turn = "red"
		}
		pipeline.Do(ctx, "HSET", user.GameID, "turn", turn)
	} else {
		gameState.Turn = keyValue[0]
	}
	log.Println("turned changed to:", turn)

	// mark card as selected in game state
	pipeline.Do(ctx, "HSET", user.GameID, keyValue[0], alterResult)
	gameState.LastSelection = keyValue[1]

	//execute pipelined commands
	pipeline.Exec(ctx)

	//notify players about selection
	notify(user.GameID, gameState)

	//unlock mutex and set lock to available
	game.mutex.Unlock()
	log.Println("SUCCESS: card:", keyValue[0], keyValue[1], "was selected")
}

// notify will be called after a database entry has been updated following a
//slection on a card. This function will then notify all listeners on a game
//that a card has been selected
//
// Messages sent to WebSockets will
func notify(gameID string, status GameState) {
	game := activeGames[gameID]
	outboud, err := json.Marshal(status)
	if err != nil {
		log.Println("Error encoding outbound message:", err)
	}
	for _, user := range game.Connections {
		user.Connection.WriteMessage(1, outboud)
	}
	log.Println("Sent:", string(outboud), "to client connections")
	return
}

// alterCardState will search through a cardType for that entry and mark it as
//chosen by adding a ! to the beginning of the word
func alterCardState(gameID string, keyValue []string) string {
	valuesFromKey := database.HGet(ctx, gameID, keyValue[0])
	if err := valuesFromKey.Err(); err != nil {
		if err == redis.Nil {
			log.Println("key does not exists")
		}
		log.Println("key does not exists")
		return ""
	}

	//update score

	//replace cardValue with !cardValue for database insertion
	return strings.Replace(valuesFromKey.Val(), " "+keyValue[1]+" ", " !"+keyValue[1]+" ", 1)
}
