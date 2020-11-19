/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"fmt"
	"log"
	"net/http"
)

// createGame spins up a new WebSocket for a new game to be created
func createGame(writer http.ResponseWriter, request *http.Request) {
	//connection, err := websocket.Upgrade(writer, request, nill)
	/* this will upgrade an HTTP connection to a WebSocket Connection  */
	var game Game
	go game.subscribe()
}

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
