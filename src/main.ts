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
    req.open("POST", "api/v1/games");
    req.setRequestHeader("Content-type", "application/json");
    req.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status == 200) {
            let data = JSON.parse(req.responseText);
            console.log(data);
            // TODO: Redirect to game and/or handle data
        }
    };
    // TODO: Add payload and and socket channel to json?
    req.send(JSON.stringify({ gameId: gameId }));
}

function dealCards() {
    // Get game cards with game ID
    const req = new XMLHttpRequest();
    req.open("GET", "api/v1/games/id");
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


function shuffleCards(words): any[] {
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
    const tmpl = document.querySelector("#card_table_template").innerHTML;
    if (cards.length != 0) {
        const renderFn = doT.template(tmpl);
        const renderResult = renderFn({ "cards": cards });
        document.querySelector("#card_table").innerHTML = renderResult;
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
        if (word.contains("unselected")) {
            // flag that card has been picked
            word.replace("unselected", "selected");
            if (word.contains("assassin")) {
                // end game
            } else if (!word.contains(gameTurn)) {
                // terrible but temporary
                if (gameTurn == "red") {
                    query.innerHTML = "blue"
                } else {
                    query.innerHTML = "red"
                }
            }
        }
    }
    return 0;
}


function attachListeners() {
    const goBtn: HTMLInputElement | null = document.querySelector("#btn-go");
    if (goBtn) {
        goBtn.addEventListener("click", createGame)
    }
    let wordCards = document.querySelectorAll(".wordCard");
    wordCards.forEach(function (wordCard) {
        let element = <HTMLDivElement>wordCard;
        element.addEventListener("click", checkCard);
    })
}

attachListeners();

