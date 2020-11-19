/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"log"
	"net/http"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

// constants for DB connection
const (
	DBHOST = "localhost"
	DBPORT = "6379"
)

// constants for web hosting
const (
	WEBHOST = "localhost"
	WEBPORT = "8008"
)

// FULLHOST const for ease of use when using full URI path
const FULLHOST = WEBHOST + ":" + WEBPORT

//package-private access to database connection
var database *redis.Client

// main spins up the mux router, database connection, defines the handler
// fucntions, logging middleware, and finally the server
func main() {
	//using gorilla mux
	router := mux.NewRouter()

	//database connection with const values
	database = dbConnect()
	//close DB on panic
	defer database.Close()

	//API Handlers ------------------------------------------------------------
	// Creates new game by setting up websocket
	router.HandleFunc("/api/v1/games", createGame).
		Methods(http.MethodPost)

	// Subcribes new player to game WebSocket
	router.HandleFunc("/api/v1/games", newSocketConnection).
		Queries("gameID", "{gameID:[0-9]+}").
		Methods(http.MethodPost)

	// Default
	router.HandleFunc("/api/v1/", defaultHandle)
	//-------------------------------------------------------------------------

	//Non-API Handlers --------------------------------------------------------
	router.HandleFunc("/socket", newSocketConnection).
		Methods(http.MethodGet)

	router.PathPrefix("/").Handler(http.FileServer(http.Dir("./dist/")))
	//-------------------------------------------------------------------------

	//start server and setting logging flags
	log.SetFlags(log.Lshortfile | log.Ldate | log.Ltime)
	log.Fatal(http.ListenAndServe(FULLHOST, loggingMiddleware(router)))
}

//defaultHandle will handle any API request not made to a valid endpoint by
// throwing a HTTP 400 code
func defaultHandle(writer http.ResponseWriter, request *http.Request) {
	log.Println("Not valid route")
	http.Error(writer, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
}
