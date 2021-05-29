const People = ({ records, handleRemove }) => records
  .map(record => (
    <div key={record.id}>
      {record.name} {record.number} <button onClick={() => handleRemove(record.id)}>Delete</button>
    </div>
  ));

export default People;