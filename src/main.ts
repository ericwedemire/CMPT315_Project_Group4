/**
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

// WIP
function createGame() {
    console.log("Game Created");
    let idInput = <HTMLInputElement>document.querySelector("#game-id");
    let gameId = idInput.value;
    const req = new XMLHttpRequest();
    req.open("POST", "api/v1/game");
    req.setRequestHeader("Content-type", "application/json");
    req.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status == 200) {
            let data = JSON.parse(req.responseText);
            console.log(data.gameId);
            // TODO: handle data and redirect to game
        }
    };
    // TODO: Add payload and and socket channel to json
    req.send(JSON.stringify({ gameId: gameId }));
}

function attachListener() {
    const goBtn: HTMLInputElement | null = document.querySelector("#btn-go");
    if (goBtn) {
        goBtn.addEventListener("click", createGame)
    }
}

attachListener();

