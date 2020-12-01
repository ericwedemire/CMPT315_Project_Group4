/**
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

var socket: WebSocket;

function socketReturn() {
    var webSocket;
    webSocket = initWS();

    function initWS() {
        socket = new WebSocket("ws://localhost:8008/games?id=newGame")

        socket.onopen = function () {
            const para: HTMLParagraphElement | null = document.querySelector('#socket');
            if (para) { para.textContent = "Wow"; }
        };

        socket.addEventListener('message', function (event) {

            console.log('SERVER MESSAGE:', event.data);
            window.location.assign('/game.html')

        });
        return socket;
    }
}

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
    console.log(jsonBody)
    console.log(myInit)
    fetch(apiCall)
        .then(response => {
            console.log(response);
            if (response.status === 400) {
                console.log("NAME EXISTS")
            }
        });
    // socketReturn(gameId)
}


function dealCards(id: string) {
    // Get game cards with game ID

    const req = new XMLHttpRequest();
    req.open("GET", "games?id=monday");
    req.setRequestHeader("Content-type", "application/json");
    req.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status == 200) {
            let data = JSON.parse(req.responseText);
            let words = data.words; // object containing words for red, blue, neutral, assassin
            console.log(words);
            let shuffledCards = shuffleCards(words);
            assignWords(shuffledCards);
        }
    }
    req.send();
}


function shuffleCards(words: any): any[] {
    // Create array of cards with words object
    // The array contains card objects made up of the word and it's type
    let cards: any[] = [];
    for (let wordCategory of words) {
        for (let word of wordCategory) {
            let card = { word: word, type: wordCategory, status: "unselected" };
            cards.push(card);
        }
    }
    console.log("Unshuffled cards =", cards);
    shuffle(cards);
    console.log("Shuffled cards =", cards)
    return cards;
}

// Fisher-Yates array shuffle
// https://github.com/coolaj86/knuth-shuffle

function shuffle(cards: any[]) {
    let currentIndex = cards.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random()) * currentIndex;
        currentIndex -= 1;

        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }

    return cards;
}

function assignWords(cards: string[]) {
    // uses doT template
    // Assign the word of a card to the inner HTML
    // Assign the type of a card to the class of the card div
    const tmpl = document.querySelector("#game_board_template").innerHTML;
    if (tmpl && cards.length != 0) {
        const renderFn = doT.template(tmpl);
        const renderResult = renderFn({ "cards": cards });
        document.querySelector(".board").innerHTML = renderResult;
    }
}

/* This function is written with the premise that word cards will be made up of 
 * three classes 'word-card unselected color(blue or red)'. If a word card is 
 * unselected, it will be beige. Once selected, the function does an assassin check, 
 * then changes the unselected class to selected, activating the card's color. 
 */
function checkCard(event: MouseEvent) {

    let card = <HTMLDivElement>event.target;
    let word = card.classList;
    let query: HTMLDivElement | null = document.querySelector("#gameTurn");
    let gameTurn = "";
    if (query) {
        // let's just say the innerHTML can either be "blue" or "red"
        gameTurn = query.innerHTML;
        // card cannot have been already picked
        if (!word.contains("selected")) {
            // flag that card has been picked
            // <div class="wordCard"> => <div class="wordCard selected">
            word.add("selected");
            if (word.contains("assassin")) {
                // TODO: end game
            } else if (!word.contains(gameTurn)) {
                // switch turn if wrong card chosen
                if (gameTurn == "red") {
                    query.innerHTML = "blue";
                } else {
                    query.innerHTML = "red";
                }
            }
        }
    }
    return 0;
}

function spyMasterView() {
    // TODO: Remove "End player turn" button?
    let cards = document.querySelectorAll(".wordCards");
    cards.forEach(function (card) {
        let cardClasses = card.classList;
        console.log(cardClasses);
        card.setAttribute("font-weight", "bold");
        if (cardClasses[1] && cardClasses[1] != "assassin") {
            if (cardClasses[1] != "assassin") {
                card.setAttribute("color", cardClasses[1]);
            } else {
                card.setAttribute("color", "white");
                card.setAttribute("background-colour", "black");
            }
        }
    });
}

function playerView() {
    // TODO: Reactivate "End player turn" button?
    let cards = document.querySelectorAll(".wordCards");
    cards.forEach(function (card) {
        let cardClasses = card.classList;
        console.log(cardClasses);
        card.removeAttribute("font-weight");
        card.setAttribute("background-colour", "grey");
        if (cardClasses.contains("assassin")) {
            card.setAttribute("color", "black");
        }
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

// create element for player-turn-template
// <script type="text/x-dot-template" id = "player-turn-template" >
//     <div>{{=it.turn }}'s turn</div>
// < /script>

function createTurnTemplate(turnTemplate: HTMLScriptElement) {
    let div = document.createElement("div");
    div.textContent = "{{=it.turn}}'s";
    turnTemplate.appendChild(div);
}

// create element for board-template
// <script type="text/x-dot-template" id = "board-template" >
//     {{ ~it.cards: value: index }}
//     <div class="{{=value["wordCategory"]}}" "tile{{=index+1}}" > {{=value["word"] }}</div>
//     { { ~} }
// </script>

function createBoardTemplate(boardTemplate: HTMLScriptElement): string {

    let div = document.createElement("div");
    div.className = '"{{=value["wordCategory"]}}" "tile{{=index+1}}"';
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
    const spyBtn: HTMLInputElement | null = document.querySelector("#spyBtn");
    if (spyBtn) {
        spyBtn.addEventListener("click", spyMasterView);
    }
    const playBtn: HTMLInputElement | null = document.querySelector("#playBtn");
    if (playBtn) {
        playBtn.addEventListener("click", playerView);
    }
    const para: HTMLParagraphElement | null = document.querySelector('#socket');
    if (para) { para.textContent = "Things will be okay..."; }

    const linkTemp: HTMLScriptElement | null = document.querySelector("#link-container-template");
    if (linkTemp) { createLinkTemplate(linkTemp) }

    const turnTemp: HTMLScriptElement | null = document.querySelector("#player-turn-template");
    if (turnTemp) { createTurnTemplate(turnTemp) }

    const boardTemp: HTMLScriptElement | null = document.querySelector("#board-template");
    if (boardTemp) {
        let gameId = createBoardTemplate(boardTemp);
        dealCards(gameId);
    }
}

attachListeners();
