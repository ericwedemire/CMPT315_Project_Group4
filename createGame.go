/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-redis/redis/v8"
)

// createGame will generate a Game struct to store all subsequent connections
//to the game. createGame will always check if a game of the same name exists
//before allowing creation
func createGame(writer http.ResponseWriter, request *http.Request) {
	var err error
	var newGame Game

	// grabbing gameID
	err = json.NewDecoder(request.Body).Decode(&newGame)
	if err != nil {
		message := "Failure to decode client JSON: " + err.Error()
		encodeAndSendError(writer, request, http.StatusBadRequest, message)
		return
	}
	log.Println("Attempting game creation for ID:", newGame.GameID)

	//set game name for new game and add it to map of all active games
	if activeGames[newGame.GameID] == nil {
		activeGames[newGame.GameID] = &newGame
	} else {
		message := "FAILURE: Game ID: " + newGame.GameID + " already exists"
		encodeAndSendError(writer, request, http.StatusBadRequest, message)
		return
	}
	// generate words and place them into database object -----------------------------------------------------------------
	//generateRandomCards()
	vals := map[string]interface{}{
		"score:red":  "9",
		"score:blue": "9",
		"turn":       "red",
		"red":        "africa !agent !air alien amazon",
		"blue":       "angel antarctica apple arm back",
		"assassin":   "band",
		"civilian":   "tree plant iron",
	}

	database.HSet(ctx, "newGame", vals)

	get := database.HGetAll(ctx, "newGame")
	if err := get.Err(); err != nil {
		if err == redis.Nil {
			log.Println("key does not exists")
		}
		panic(err)
	}
	// generate words and place them into database object -----------------------------------------------------------------
	log.Println("SUCCESS: created game:", newGame.GameID)
}
