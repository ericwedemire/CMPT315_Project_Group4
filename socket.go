package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// newSocketConnection
//
func newSocketConnection(writer http.ResponseWriter, request *http.Request) {
	var newUser User
	var err error

	// grabbing gameID
	vars := mux.Vars(request)
	gameID := vars["gameID"]

	currentGame := activeGames[gameID]
	if currentGame == nil {
		message := "No current game called: " + gameID + " exists"
		encodeAndSendError(writer, request, http.StatusBadRequest, message)
		return
	}

	//creating WebSocket
	log.Println("received websocket request")
	newUser.Connection, err = upgrader.Upgrade(writer, request, nil)
	if err != nil {
		message := "Could not open websocket connection: " + err.Error()
		encodeAndSendError(writer, request, http.StatusBadRequest, message)
		return
	}
	newUser.GameID = gameID

	currentGame.Connections = append(currentGame.Connections, newUser)
	newUser.Connection.WriteMessage(1, []byte("Connection Successful"))
	go listenOnSocket(newUser)
}

//
//
func listenOnSocket(user User) {
	for {
		messageType, message, err := user.Connection.ReadMessage()
		if err != nil || messageType != 1 {
			log.Println("Message:", message, "; not understood by server:", err)
			return
		}
		databaseUpdate(user, string(message))

	}
}
