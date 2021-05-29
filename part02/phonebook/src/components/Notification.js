const Notification = ({ text, type }) => (
  <div id="notification" className={type}>
    {text}
  </div>
);

export default Notification;