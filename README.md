# Basic multiplayer game

## Objective

Create a basic multiplayer game where players can join a board of a given size and are able to move between the tiles of the board. Movement shall be represented in real time for all the clients and a basic authentication method shall be in place to avoid players move characters that don't belong to them.

## Tech stack
#### Client
- React + Typescript

#### Server
- Node + Typescript
- Express
- WS
- TypeORM
- SQLite

## Architecture

The game is composed from a client and a server. The client communicates with an API on the server for requesting authentication data (create user and retrieve access token). After the clients has all required credentials, it connects to the websocket on the server for all the game-logic communication. The architecture uses an authoritative server model, where the server decides wether the input of the client is valid or not, and later broadcasts the result of the action to all other clients. Decoupling the API from the Websocket server in two different services is simple since they only communicate through the model.

![BasicArchitecture!](https://i.ibb.co/nqXMB4D/Untitled-Diagram-drawio.png)

## Relevant entities and classes

![Entities!](https://i.ibb.co/X2CNV0s/Basic-Multiplayer-Game-drawio.png)

- Account: Has the basic credentials (username and session token).
- Character: Has only an identifier
- Board: Representation for the board of the game (only lives in memory)
- BoardElement: "Abstract" class that represents a position on the board
- NetworkAction: Defines an action for communication between client and server

## Authenthication model

Each user session internally generates an "username" which is then sent to the backend API to register the user. Upon user registration, the client must request a session token with the recently created username. With the session token the client will be able to use the login action once connected to the websocket server.

## Extending features

- Change map size: Already implemented. Must be configured on server-side. For client side map size change, only css changes are needed.
- Obstacles in map: A new entity derivated from BoardElement shall be created, with its "blockMovement" property on true by default and added to the board upon creation.
- Coins in map: A new entity derivated from BoardElement shall be created. Depending on the behaviour for the coins it could have a "onInteract" or "onStepOn" events. For registering the coin count for each character, a new field must be added to the character entity and store the changes on db upon obtaining coins.

#### 

## How to run

[Here](https://youtu.be/XxAe3sdiesU) you can find a Youtube video to see the project running if you don't want to mount it. Follow the configuration and how to run bellow to test it locally.

### Configuration

There are a couple of parameters that can be configured. For the backend there needs to be two environment variables for the size of the board:
- BOARD_HEIGHT
- BOARD_WIDTH

They need to setup on the docker-compose file when using docker and in the host machine if running locally. Aside from that on the docker-compose file you can also re-map the ports used for mounting the server and the client.

For the frontend on the .env file you need to setup the URLs for both the API and the Websocket server.

### Running in docker

(Recommended) Clone the repository, ensure docker is running and you have configured ports available (3000/8080 by default). Go to the root of the repository and run the following command:

```sh
docker-compose up
```

Once it finish loading, you can enter the game joining localhost:3000 (or any port you've defined).

### Running local

Clone the repository, ensure you hve npm installed and updated. Go to the server folder and run the following commands:
```sh
npm install
npm start
```
Then go to the client folder and run the same commands. Once both are up and running, you can join through localhost:3000 (or any port you've defined).

### Running tests

Unit tests are defined in the backend to validate that all manipulation of Board entity is properly managed. To run the tests enter the folder of the server and run the following command (npm install has to performed already):

```sh
npm test
```

Correct output should look like this:

```sh
/app # npm test

> bmg-server@1.0.0 test
> jest

 PASS  tests/board.test.ts (12.619 s)
  Board movement validation
    ✓ Adding character when board is full (6 ms)
    ✓ Moving character outside the bounds
    ✓ Correct character add/removal

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        13.829 s
Ran all test suites.
```

## Docs

API documentation and websocket messages are stored on the "docs" folder. Use the latest version of Postman to open the docs.

## Known problems

- Some clients might not receive the first event when a new player joins. It is fixed once the player moves and the position is updated.
- If board loses focus, movements are not longer send to the server. Fixed by clicking anywhere on the board to recover focus.