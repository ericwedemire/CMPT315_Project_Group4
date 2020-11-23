package main

import (
	"log"
	"net/http"

	"github.com/go-redis/redis"
	"github.com/gorilla/mux"
)

// newSocketConnection connects to a front end websocket to pass game data back
//and forth to. It expects http requests to made using as query in the form of
//games?id=GAMEID. Upon successful connection, the user to prompted that
//connection was successful
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
	log.Println("Attempting new client WebSocket creation for game:", gameID)
	newUser.Connection, err = upgrader.Upgrade(writer, request, nil)
	if err != nil {
		message := "Could not open websocket connection: " + err.Error()
		encodeAndSendError(writer, request, http.StatusBadRequest, message)
		return
	}
	newUser.GameID = gameID

	currentGame.Connections = append(currentGame.Connections, newUser)

	//give current game state to new connection
	newUser.Connection.WriteMessage(1, []byte("Connection Successful"))

	//calling listener in go routine
	log.Println("SUCCESS: created socket:", gameID)
	go listenOnSocket(newUser)
}

// listenOnSocket takes a User struct as an argument and will read messages
//sent from the client connection. Messages are expected to be the key-value
//pair that was altered on card selection
func listenOnSocket(user User) {
	for {
		messageType, message, err := user.Connection.ReadMessage()
		if err != nil || messageType != 1 {
			log.Println("Message:", message, "; not understood by server:", err)
			checkGameStatus(user)
			return
		}
		databaseUpdate(user, string(message))
	}
}

// checkGameStatus will run after a user has closed their browser window,
//ending their connection to a current game session. This function will also
//completely remove the remove a game from the map of active games and the
//database
func checkGameStatus(user User) {
	session := activeGames[user.GameID]

	//locking session mutex
	session.mutex.Lock()

	//close game as last connection is closing
	if len(session.Connections) <= 1 {
		log.Println("Last user left game: " + user.GameID + ". Tearing down game")
		delete := database.Del(ctx, user.GameID)
		if err := delete.Err(); err != nil {
			if err == redis.Nil {
				log.Println("key does not exists")
				return
			}
		}
		deleteFromMap(user.GameID)
		log.Println("Successfully eneded game (" + user.GameID + ")")
	} else {
		for i, element := range session.Connections {
			if element == user {
				l := len(session.Connections)
				session.Connections[l-1], session.Connections[i] = session.Connections[i], session.Connections[l-1]
				session.Connections = session.Connections[:l-1]
				log.Println("Removing user", user, "from game:", user.GameID)
				break
			}
		}
	}
	user.Connection.Close()

	//unlocking session mutex
	session.mutex.Unlock()
}
