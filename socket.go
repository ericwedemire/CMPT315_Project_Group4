package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// newSocketConnection
//
func newSocketConnection(writer http.ResponseWriter, request *http.Request) {
	// grabbing gameID
	vars := mux.Vars(request)
	gameID := vars["gameID"]

	currentGame := activeGames[gameID]
	var newUser User
	var err error

	//creating WebSocket
	log.Println("recieved websocket request")
	newUser.socket, err = upgrader.Upgrade(writer, request, nil)
	if err != nil {
		http.Error(writer, "Could not open websocket connection", http.StatusBadRequest)
	}

	currentGame.Connections = append(currentGame.Connections, newUser)
	newUser.socket.WriteMessage(1, []byte("Connection Successful"))
	go listenOnSocket(newUser.socket)
}

//
//
func listenOnSocket(connection *websocket.Conn) {
	for {
		messageType, p, err := connection.ReadMessage()
		if err != nil {
			log.Println(err)
			return
		}
		if err := connection.WriteMessage(messageType, p); err != nil {
			log.Println(err)
			return
		}
	}

}
