/**
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */
var socket: WebSocket;

const path = window.location.pathname;
const id = path.split("/")[2]

socket = new WebSocket("ws://localhost:8008/games?id=" + id);

socket.addEventListener('message', function (event) {
    let gameData = JSON.parse(event.data);
    const board: HTMLDivElement | null = document.querySelector('.board');
    if (board) {
        dealCards(gameData);
        attachListeners();
        updateView(gameData);
        updateScoreboard(gameData);
        assignTurn(gameData);
        checkGameState(gameData);
    }
});

function createGame() {
    let idInput = <HTMLInputElement>document.querySelector("#game-id");
    let gameId = idInput.value;
    const createGameBody: string = gameId;
    const jsonBody: string = JSON.stringify({ "gameID": createGameBody });
    const myInit: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: jsonBody,
    };

    const apiCall = new Request("http://localhost:8008/api/v1/games", myInit);
    fetch(apiCall)
        .then(response => {
            if (response.status === 400) {
                console.log("NAME EXISTS")
            } window.location.assign('/games/' + gameId);
        });
}

function nextGame() {

}

function skipTurn() {
    // bug: scoreboard becomes undefined
    socket.send('SKIP');
}

function dealCards(gameData: any) {

    let cards: any[] = [];
    let cardTypes = ["assassin", "civilian", "red", "blue"]
    console.log(gameData);
    for (let [key, value] of Object.entries(gameData)) {
        if (cardTypes.includes(key)) {
            let valueString = value + ""
            let words = valueString.split(" ");
            for (let i = 0; i < words.length; i += 2) {
                let selected = "";
                if (words[i].includes("!")) {
                    // remove exclamation point
                    words[i] = words[i].slice(1);
                    selected = "selected"
                }
                let card = { word: words[i], wordCategory: key, position: words[i + 1], status: selected }
                cards.push(card)
            }
        }
    }
    assignWords(cards.sort((a, b) => (Number(a.position) > Number(b.position)) ? 1 : -1));
}

function assignWords(cards: object[]) {
    const tmpl = document.querySelector("#board-template").innerHTML;
    if (tmpl && cards.length != 0) {
        const renderFn = doT.template(tmpl);
        const renderResult = renderFn({ "cards": cards });
        document.querySelector(".board").innerHTML = renderResult;
        let wordCards = document.querySelectorAll(".wordCard");
        wordCards.forEach(function (wordCard) {
            let element = <HTMLElement>wordCard;
            if (element.classList[3] == "selected") {
                alterCardStyle(element);
            }
        });
    }
}

function checkGameState(gameData: any) {
    // check if game has ended
    if (gameData.gameOver) {
        // remove listener on skip button
        let skipButton = document.querySelector("#btn-skip-turn");
        skipButton.removeEventListener("click", skipTurn);

        // remove listeners on cards
        let wordCards = document.querySelectorAll(".wordCard.tile");
        wordCards.forEach(function (wordCard) {
            let element = <HTMLDivElement>wordCard;
            element.removeEventListener("click", checkCard);
        });
        // check if blue won
        if (gameData.blueScore <= 0) {
            document.querySelector(".player-turn").innerHTML = "Victory for Blue!";
        }
        // check if red won
        else if (gameData.redScore <= 0) {
            document.querySelector(".player-turn").innerHTML = "Victory for Red!";
        }

        // assassin probably clicked
        else {
            let winner = document.querySelector(".player-turn").innerHTML.slice(0, -7);
            document.querySelector(".player-turn").innerHTML = "Victory for " + winner + "!";
        }
    }
}

function assignTurn(gameData: any) {
    let turn = document.querySelector(".player-turn")
    if (turn) {
        let turnString = gameData.turn + ""
        turn.innerHTML = turnString[0].toUpperCase() + turnString.slice(1) + "'s turn"
    }
}

function updateScoreboard(gameData: any) {
    // bug: scoreboard is undefined until a card selection event is triggered
    document.querySelector(".red-scoreboard").innerHTML = gameData.redScore;
    document.querySelector(".blue-scoreboard").innerHTML = gameData.blueScore;
}

/* This function is written with the premise that word cards will be made up of 
 * three classes 'word-card unselected color(blue or red)'. If a word card is 
 * unselected, it will be beige. Once selected, the function does an assassin check, 
 * then changes the unselected class to selected, activating the card's color. 
 */
function checkCard(event: MouseEvent) {
    // Grab div clicked
    let card = event.currentTarget as HTMLElement;

    // Format card to "cardType cardWord" so the API can understand and respond appropriately
    let cardType = card.classList[2];
    let cardWord = card.innerHTML;
    let cardSelection = cardType + " " + cardWord;
    console.log(cardSelection);
    // Send the card selected to the backend to be marked selected
    socket.send(cardSelection);
}

function updateView(gameData: any) {
    let lastSelection = gameData.lastSelection;
    let wordCards = document.querySelectorAll(".wordCard");
    wordCards.forEach(function (wordCard) {
        let element = <HTMLElement>wordCard;
        if (element.innerHTML == lastSelection) {
            alterCardStyle(element);
        }
    });

}

function spyMasterView() {
    // WIP with Shea
    let cards: NodeListOf<HTMLElement> = document.querySelectorAll(".wordCard");
    cards.forEach(function (card) {
        let cardClasses = card.classList;
        card.setAttribute("font-weight", "bold");
        if (cardClasses[0] && cardClasses[1] != "assassin") {
            if (cardClasses[2] == "blue" || cardClasses[2] == "red") {
                card.style.backgroundColor = cardClasses[2];
            } else if (cardClasses[2] == "civilian") {
                card.style.color = "black";
                card.style.backgroundColor = "yellow";
            } else {
                card.style.backgroundColor = "black";
            }
        }
    });
}

function playerView() {
    // WIP with Shea
    let cards: NodeListOf<HTMLElement> = document.querySelectorAll(".wordCard");
    cards.forEach(function (card) {
        let cardClasses = card.classList;
        // need to check for selected cards
        card.style.backgroundColor = "teal";
        card.style.color = "white";
    });
}

// create element for link-container-template
// <script type="text/x-dot-template" id = "link-container-template" >
//     <div>Share this link with your friends: <a href="" class="link" > {{=it.link }}</a></div >
// </script>

function createLinkTemplate(linkTemplate: HTMLScriptElement) {
    let a = document.createElement("a");
    a.className = "link";
    a.textContent = "{{=it.link}}";

    let div = document.createElement("div");
    div.textContent = "Share this link with your friends";
    div.appendChild(a);

    linkTemplate.appendChild(div);
}

// create element for board-template
// <script type="text/x-dot-template" id = "board-template" >
//     {{ ~it.cards: value: index }}
//     <div class="{{=value["wordCategory"]}}" "tile{{=index+1}}" > {{=value["word"] }}</div>
//     { { ~} }
// </script>

function createBoardTemplate(boardTemplate: HTMLScriptElement): string {

    let div = document.createElement("div");
    div.className = "wordCard tile {{=value['wordCategory']}} {{=value['status']}}";
    div.id = "tile{{=index+1}}"
    div.textContent = '{{=value["word"]}}';
    boardTemplate.insertAdjacentText('afterbegin', '{{~it.cards:value:index}}');
    boardTemplate.appendChild(div);
    boardTemplate.insertAdjacentText('beforeend', '{{~}}');

    let gameBody = document.querySelector("body");
    if (gameBody) {
        let gameId = gameBody.id;
        return gameId;
    }
    return "";
}

function alterCardStyle(element: HTMLElement) {
    switch (element.classList[2]) {
        case "blue":
            element.style.backgroundColor = "blue";
            break;
        case "red":
            element.style.backgroundColor = "red";
            break;
        case "assassin":
            element.style.backgroundColor = "black";
            break;
        case "civilian":
            element.style.backgroundColor = "yellow";
            element.style.color = "black";
            break;
        default:
            return;
    }
}


function attachListeners() {
    const goBtn: HTMLInputElement | null = document.querySelector("#btn-go");
    if (goBtn) {
        goBtn.addEventListener("click", createGame);
    };
    let wordCards = document.querySelectorAll(".wordCard");
    wordCards.forEach(function (wordCard) {
        let element = <HTMLDivElement>wordCard;
        element.addEventListener("click", checkCard);
    });
    const spyBtn: HTMLInputElement | null = document.querySelector("#btn-spymaster");
    if (spyBtn) {
        spyBtn.addEventListener("click", spyMasterView);
    }
    const playBtn: HTMLInputElement | null = document.querySelector("#btn-player");
    if (playBtn) {
        playBtn.addEventListener("click", playerView);
    }
    const nxtBtn: HTMLInputElement | null = document.querySelector("#btn-next-game");
    if (nxtBtn) {
        nxtBtn.addEventListener("click", nextGame);
    }

    const skipBtn: HTMLInputElement | null = document.querySelector("#btn-skip-turn");
    if (skipBtn) {
        skipBtn.addEventListener("click", skipTurn);
    }
    const linkTemp: HTMLScriptElement | null = document.querySelector("#link-container-template");
    if (linkTemp) { createLinkTemplate(linkTemp) }

    const boardTemp: HTMLScriptElement | null = document.querySelector("#board-template");
    if (boardTemp) {
        let gameId = createBoardTemplate(boardTemp);
        dealCards(gameId);
    }
}

attachListeners();
