// having difficulties with xhr testing, will re-explore later

// import { createGame } from './main'

// const xhrMockObj = {
//     open: jest.fn(),
//     send: jest.fn(),
//     setRequestHeader: jest.fn(),
//     readyState: 4,
//     responseText: JSON.stringify({ gameId: "testId" })
// };


// const oldXMLHttpRequest = window.XMLHttpRequest;
// window.XMLHttpRequest = jest.fn(() => xhrMockObj);

// describe("API integration test suit", function () {
//     test("Should retrieve gameId from server on a post", function (done) {
//         const req = API.createGame();
//         xhrMockObj.onreadystatechange();
//         req.then(data => {
//             expect(data.length).toBe(1);
//             expect(data[0].gameId).toBe("testId");
//         });
//         done();
//     })
// });