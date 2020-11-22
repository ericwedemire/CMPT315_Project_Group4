/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

// main spins up the mux router, database connection, defines the handler
// functions, logging middleware, and finally the server
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

	// Default
	router.HandleFunc("/api/v1/", defaultHandle)
	//-------------------------------------------------------------------------

	//Non-API Handlers --------------------------------------------------------
	router.HandleFunc("/games", newSocketConnection).
		Queries("id", "{gameID:[a-zA-Z0-9]+}").
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
