import React, { useState } from "react";

const Title = ({ text }) => <h1>{text}</h1>;
const Button = ({ handleClick, text }) => <button onClick={handleClick}>{text}</button>;

const Statistic = ({ text, value }) => (
  <tr>
    <th>{text}</th>
    <td>{value}</td>
  </tr>
);

const Statistics = ({ goodReviews, neutralReviews, badReviews }) => {
  const totalReviews = goodReviews + neutralReviews + badReviews;

  return totalReviews
    ? (
      <>
        <Title text="Statistics" />
        <table>
          <tbody>
            <Statistic text="Good" value={goodReviews} />
            <Statistic text="Neutral" value={neutralReviews} />
            <Statistic text="Bad" value={badReviews} />
            <Statistic text="All" value={totalReviews} />
            <Statistic text="Average" value={(goodReviews - badReviews) / totalReviews} />
            <Statistic text="Positive" value={`${(goodReviews / totalReviews) * 100}%`} />
          </tbody>
        </table>
      </>
      )
    : <div>No feedback given</div>
};

const App = () => {
  const [ neutralReviews, setNeutralReviews ] = useState(0);
  const [ goodReviews, setGoodReviews ] = useState(0);
  const [ badReviews, setBadReviews ] = useState(0);

  return (
    <>
      <Title text="Give Feedback"/>
      <div>
        <Button text="Good" handleClick={() => setGoodReviews(goodReviews + 1)} />
        <Button text="Neutral" handleClick={() => setNeutralReviews(neutralReviews + 1)} />
        <Button text="Bad" handleClick={() => setBadReviews(badReviews + 1)} />
      </div>
      <Statistics goodReviews={goodReviews} neutralReviews={neutralReviews} badReviews={badReviews} />
    </>
  );
}

export default App;
