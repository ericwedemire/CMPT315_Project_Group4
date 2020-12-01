/**
 * Shea Odland, Von Castro, Eric Wedemire
 * CMPT315
 * Group Project: Codenames
 */

var socket: WebSocket;

const path = window.location.pathname;
const id = path.split("/")[2]

socket = new WebSocket("ws://localhost:8008/games?id=" + id);

// socket.onopen = function () {
//     const para: HTMLParagraphElement | null = document.querySelector('#socket');
//     if (para) { para.textContent = "Wow"; }
// };

socket.addEventListener('message', function (event) {
    let gameData = JSON.parse(event.data);
    const board: HTMLDivElement | null = document.querySelector('.board');
    if (board) {
        dealCards(gameData);
        assignTurn(gameData);
        attachListeners();
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


function dealCards(gameData: any) {
    // WIP with Shea
    // Bug where some of the positions get injected as card name to fix
    let cards: any[] = [];
    let cardTypes = ["assassin", "civilian", "red", "blue"]
    console.log(gameData)
    for (let [key, value] of Object.entries(gameData)) {
        if (cardTypes.includes(key)) {
            let valueString = value + ""
            let words = valueString.split(" ");
            for (let i = 0; i < words.length; i += 2) {
                let selected = "";
                if (words[i].includes("!")) {
                    selected = "selected"
                }
                let card = { word: words[i], wordCategory: key, position: words[i + 1], status: selected }
                cards.push(card)
            }
        }
    }
    console.log(cards);
    assignWords(cards.sort((a, b) => (Number(a.position) > Number(b.position)) ? 1 : -1));
}

function assignWords(cards: object[]) {
    const tmpl = document.querySelector("#board-template").innerHTML;
    if (tmpl && cards.length != 0) {
        const renderFn = doT.template(tmpl);
        const renderResult = renderFn({ "cards": cards });
        document.querySelector(".board").innerHTML = renderResult;
    }
}

function assignTurn(gameData: any) {
    let turn = document.querySelector(".player-turn");
    if (turn) {
        let turnString = gameData.turn + ""
        turn.innerHTML = turnString[0].toUpperCase() + turnString.slice(1) + "'s turn"
    }
}

/* This function is written with the premise that word cards will be made up of 
 * three classes 'word-card unselected color(blue or red)'. If a word card is 
 * unselected, it will be beige. Once selected, the function does an assassin check, 
 * then changes the unselected class to selected, activating the card's color. 
 */
function checkCard(event: MouseEvent) {
    // TODO
}

function spyMasterView() {
    // WIP with Shea
    console.log("hi")
    let cards = document.querySelectorAll(".wordCard");
    console.log(cards.length)
    cards.forEach(function (card) {
        let cardClasses = card.classList;
        // console.log(cardClasses);
        card.setAttribute("font-weight", "bold");
        if (cardClasses[0] && cardClasses[1] != "assassin") {
            if (cardClasses[2] == "blue" || cardClasses[2] == "red") {
                card.setAttribute("color", cardClasses[2]);
            } else if (cardClasses[2] == "civilian") {
                card.setAttribute("color", "white");
            } else {
                card.setAttribute("background-colour", "black");
            }
        }
    });
}

function playerView() {
    // WIP with Shea
    let cards = document.querySelectorAll(".wordCard");
    cards.forEach(function (card) {
        let cardClasses = card.classList;
        // console.log(cardClasses);
        card.removeAttribute("font-weight");
        card.removeAttribute("background-colour");
        card.removeAttribute("color");
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
    div.className = "wordCard tile{{=index+1}} {{=value['wordCategory']}}";
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
    const spyBtn: HTMLInputElement | null = document.querySelector("#btn-spymaster");
    if (spyBtn) {
        spyBtn.addEventListener("click", spyMasterView);
    }
    const playBtn: HTMLInputElement | null = document.querySelector("#btn-player");
    if (playBtn) {
        playBtn.addEventListener("click", playerView);
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
