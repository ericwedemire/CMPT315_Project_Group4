/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

package main

import "github.com/gorilla/websocket"

// User struct will
type User struct {
	gameSession *Game

	// The websocket connection.
	socket *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte
}

// Game maintains the set of active clients and broadcasts messages to the
// clients.
type Game struct {
	GameID             string
	Connections        []*websocket.Conn
	DatabaseConnection *websocket.Conn
}
