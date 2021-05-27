import React, { useState } from "react";

const Title = ({ text }) => <h1>{text}</h1>;
const Text = ({ text }) => <div>{text}</div>;
const Button = ({ text, handleClick }) => <button onClick={handleClick}>{text}</button>;

function App() {
  const anecdotes = [
    'If it hurts, do it more often',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.'
  ];

  const [ selectedIndex, setIndex ] = useState(0);
  const [ votes, setVotes ] = useState(Array.from({ length: anecdotes.length }).fill(0));

  const randomAnecdoteIndex = () => setIndex(Math.floor(Math.random() * anecdotes.length));
  const addVote = () => {
    const newVotes = [ ...votes ];
    newVotes[selectedIndex] += 1;

    setVotes(newVotes);
  };

  const topIndex = votes.indexOf(Math.max(...votes));

  return (
    <>
      <Title text="Anecdote of the day" />
      <Text text={anecdotes[selectedIndex]} />
      <Text text={`Has ${votes[selectedIndex]} votes`} />
      <Button text="Vote" handleClick={addVote} />
      <Button text="Next Anecdote" handleClick={randomAnecdoteIndex} />

      <Title text="Anecdote with most votes" />
      <Text text={anecdotes[topIndex]} />
      <Text text={`Has ${votes[topIndex]} votes`} />
    </>
  );
}

export default App;
