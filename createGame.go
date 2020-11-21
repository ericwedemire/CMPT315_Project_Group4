/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-redis/redis"
)

// createGame spins up a new WebSocket for a new game to be created
func createGame(writer http.ResponseWriter, request *http.Request) {
	// grabbing gameID
	var err error
	var newGame Game

	err = json.NewDecoder(request.Body).Decode(&newGame)
	if err != nil {
		http.Error(writer, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		log.Println("Failure to decode client JSON:", err)
		return
	}
	log.Println("Creating game with ID:", newGame.GameID)

	//set game name for new game and add it to map of all active games
	activeGames[newGame.GameID] = &newGame

	// generate words and place them into database object -----------------------------------------------------------------
	vals := map[string]interface{}{
		"score":     "1-9",
		"turn":      "red",
		"redW":      "africa !agent !air alien amazon",
		"blueW":     "angel antarctica apple arm back",
		"assassinW": "band",
		"civilianW": "tree plant iron",
	}

	database.HSet(ctx, "newGame", vals)

	get := database.HGetAll(ctx, "newGame")
	if err := get.Err(); err != nil {
		if err == redis.Nil {
			fmt.Println("key does not exists")
		}
		panic(err)
	}
	// generate words and place them into database object -----------------------------------------------------------------

	//subscribe to database connection
	log.Println("Successfully created game:", newGame.GameID)
	go newGame.subscribe()
}

//
//
func (game *Game) subscribe() {
	log.Println("starting subscriber for " + game.GameID)
	subscriber := database.Subscribe(ctx, game.GameID)
	for {
		dbMessage, err := subscriber.ReceiveMessage(ctx)
		if err != nil {
			panic(err)
		}

		fmt.Println(dbMessage.Channel, dbMessage.Payload)
	}
}
