import { useEffect, useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { useMutation, useQuery } from "../convex/_generated/react";
import "./App.css";
import Game from "./Game";
import GameRound from "./GameRound";
import { useSessionMutation, useSessionQuery } from "./hooks/sessionsClient";
import useSingleFlight from "./hooks/useSingleFlight";

const ConvexIdLength = 22;

function App() {
  const hostGame = useSessionMutation("game:create");
  const [gameId, setGameId] = useState(() => {
    if (typeof window === "undefined") return null;
    const id = window.location.hash.substring(1);
    if (!id || id.length !== 22) return null;
    return new Id("games", id);
  });
  const name = useSessionQuery("users:getName");
  const setName = useSingleFlight(useSessionMutation("users:setName"));
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (gameId) window.location.hash = gameId.id;
  }, [gameId]);
  const [gameCode, setGameCode] = useState("");
  const joinGame = useSessionMutation("game:join");
  const publicRoundId = useQuery("publicGame:get");

  return (
    <>
      <header>
        {typeof name === "string" && (
          <input
            name="name"
            defaultValue={name}
            type="text"
            onChange={(e) => setName(e.target.value)}
            placeholder="Type Name"
          />
        )}
        <h1>Whose Prompt is it Anyways? by Convex</h1>
      </header>
      {!gameId && (
        <>
          <section>
            <button
              onClick={async () => {
                setGameId(await hostGame());
              }}
            >
              Host Game
            </button>
          </section>
          <section>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setGameId(await joinGame(gameCode));
              }}
            >
              <input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.substring(0, 4))}
              />
              <button type="submit">Join Game</button>
            </form>
          </section>
        </>
      )}
      <section>
        {gameId ? (
          <Game gameId={gameId} done={(nextGameId) => setGameId(nextGameId)} />
        ) : (
          <>
            <h2>Public Game</h2>
            {publicRoundId ? (
              <GameRound roundId={publicRoundId} />
            ) : (
              <article aria-busy="true"></article>
            )}
          </>
        )}
      </section>
    </>
  );
}

export default App;
