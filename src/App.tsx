import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import mqttLogo from "/mqtt.svg";
import { useMqtt } from "./mqtt/useMqtt";
import "./App.css";

function App() {
  const {
    client,
    isConnected,
    mqttConnect,
    mqttDisconnect,
    mqttSubscribe,
    mqttUnSubscribe,
    mqttPublish,
  } = useMqtt();

  const [toSubscribe, setToSubscribe] = useState<string>("");
  const [subscribed, setSubscribed] = useState<string[]>([]);
  const [toPublish, setToPublish] = useState({ topic: "", message: "" });

  const handleConnect = () => {
    if (isConnected) {
      mqttDisconnect();
    } else {
      mqttConnect();
    }
  };
  const handleSubscribe = () => {
    if (subscribed.includes(toSubscribe)) {
      setToSubscribe("");
      return;
    }
    mqttSubscribe(toSubscribe);
    setSubscribed((curr) => [...curr, toSubscribe]);
    setToSubscribe("");
  };
  const handleUnsubscribe = (t: string) => {
    mqttUnSubscribe(toSubscribe);
    setSubscribed((curr) => curr.filter((item) => item !== t));
  };
  const handlePublish = () => {
    mqttPublish(toPublish.topic, toPublish.message);
    setToPublish({ topic: "", message: "" });
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://mqtt.org/" target="_blank">
          <img src={mqttLogo} className="logo mqtt" alt="MQTT logo" />
        </a>
      </div>
      <h1>Vite + React + MQTT</h1>
      <div className="card">
        <p>MQTT auto connects on init.</p>
        <p className="mqtt">
          Client is{" "}
          {isConnected ? (
            <>
              <span>connected</span> with id{" "}
              <span>{client?.options.clientId}</span>
            </>
          ) : (
            "disconnected"
          )}
        </p>
        <button onClick={handleConnect}>
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      </div>
      <div className="card border grid">
        <div>
          <h2>Subscribe</h2>
          <div className="inputs">
            <label>
              <span>topic</span>
              <input
                type="text"
                name="subscribe-topic"
                value={toSubscribe}
                onChange={(e) => setToSubscribe(e.target.value)}
                placeholder="TEST/TOPIC/1"
              />
            </label>
            <button onClick={handleSubscribe} disabled={toSubscribe === ""}>
              Subscribe
            </button>
          </div>
        </div>
        <div>
          <p>Topics subscribed to:</p>
          {subscribed.length > 0 && (
            <ul>
              {subscribed.map((topic, i) => (
                <li key={`subscribed-${topic}-${i}`}>
                  {topic}{" "}
                  <button onClick={() => handleUnsubscribe(topic)}>
                    Unsubscribe
                  </button>
                </li>
              ))}
            </ul>
          )}
          {subscribed.length > 0 && (
            <p className="help">
              Check the console to see messages published in these topics.
            </p>
          )}
        </div>
      </div>
      <div className="card border">
        <h2>Publish</h2>
        <div className="inputs">
          <label>
            <span>topic</span>
            <input
              type="text"
              value={toPublish.topic}
              name="publish-topic"
              onChange={(e) =>
                setToPublish((curr) => ({
                  ...curr,
                  topic: e.target.value,
                }))
              }
              placeholder="TEST/TOPIC/1"
            />
          </label>
          <label>
            <span>message</span>
            <input
              type="text"
              value={toPublish.message}
              name="publish-message"
              onChange={(e) =>
                setToPublish((curr) => ({
                  ...curr,
                  message: e.target.value,
                }))
              }
              placeholder="Hello world!"
            />
          </label>
          <button
            onClick={handlePublish}
            disabled={toPublish.topic === "" || toPublish.message === ""}
          >
            Publish
          </button>
        </div>
        <p className="help">
          Look for your message in the console (if you are subscribed to the
          topic).
        </p>
      </div>
    </>
  );
}

export default App;
