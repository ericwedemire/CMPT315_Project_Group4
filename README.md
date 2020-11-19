# CMPT315_Project_Group4
/*
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

Configuration---------------------------------*/
HOST = localhost
PORT = 6379

Database---------------------------------*/

We used a Docker based redis database for our implementation. Initially it was spun up on
WSL with the command:
    sudo docker run --name projectDB -p 6379:6379 -d redis