package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

// newSocketConnection
//
func newSocketConnection(writer http.ResponseWriter, request *http.Request) {
	log.Println("recieved websocket request")
	connection, err := websocket.Upgrade(writer, request, writer.Header(), 1024, 1024)
	if err != nil {
		http.Error(writer, "Could not open websocket connection", http.StatusBadRequest)
	}
	var newUser User
	newUser.socket = connection
}
