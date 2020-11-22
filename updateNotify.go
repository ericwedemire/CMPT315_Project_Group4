package main

import (
	"log"
	"strings"

	"github.com/go-redis/redis"
)

// databaseUpdate receives a message from the frontend WebSocket connection in
//form of:
//		{cardType, cardClicked}
//It will use this key,value pair to update the redis database accordingly and
//notify all users who are listening in that game
func databaseUpdate(user User, message string) {

	//mutex lock on each game
	game := activeGames[user.GameID]
	game.mutex.Lock()

	//split message into [key, value]
	keyValue := strings.Split(message, " ")

	//alter cardValue in database
	alterResult := alterCardState(user.GameID, keyValue)
	if alterResult == "" {
		return
	}
	database.HSet(ctx, user.GameID, keyValue[0], alterResult)

	//notify players about selection
	notify(keyValue[1], user.GameID)
	//unlock mutex
	game.mutex.Unlock()
}

// notify will be called after a database entry has been updated following a
//slection on a card. This function will then notify all listeners on a game
//that a card has been selected
func notify(selectedCard string, gameID string) {
	game := activeGames[gameID]
	for _, user := range game.Connections {
		user.Connection.WriteMessage(1, []byte(selectedCard))
	}
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
	//replace cardValue with !cardValue for database insertion
	return strings.Replace(valuesFromKey.Val(), " "+keyValue[1]+" ", " !"+keyValue[1]+" ", 1)
}
