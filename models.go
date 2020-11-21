/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

// User struct will
type User struct {
	GameID     string          `json:"gameID"`
	Connection *websocket.Conn `json:"connection,omitempty"`
}

// Game maintains the set of active clients and broadcasts messages to the
// clients.
type Game struct {
	GameID             string          `json:"gameID"`
	Connections        []User          `json:"connections,omitempty"`
	DatabaseConnection *websocket.Conn `json:"dbConnection,omitempty"`
}

// activeGames keeps a record of all active game sessions
var activeGames map[string]*Game = make(map[string]*Game)

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

//
var upgrader = websocket.Upgrader{}
