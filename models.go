/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import (
	"sync"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/websocket"
)

// User struct will
type User struct {
	GameID     string          `json:"gameId"`
	Connection *websocket.Conn `json:"connection,omitempty"`
}

// Game maintains the set of active clients and broadcasts messages to the
// clients.
type Game struct {
	GameID      string `json:"gameId"`
	Connections []User `json:"connections,omitempty"`
	mutex       sync.Mutex
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
