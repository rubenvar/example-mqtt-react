import mqtt from "mqtt";
import React from "react";

// tipo del contexto
type MqttContextType = {
  client: mqtt.MqttClient | null;
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  mqttConnect: () => void;
};

// contenido por defecto del contexto
const defaultContext: MqttContextType = {
  client: null,
  isConnected: false,
  setIsConnected: () => {},
  mqttConnect: () => {},
};

// el contexto
const MqttContext = React.createContext<MqttContextType>(defaultContext);

// exportamos un custom hook
// eslint-disable-next-line react-refresh/only-export-components
export function useMqttContext() {
  return React.useContext(MqttContext);
}

// función auxiliar (no la mejor forma de crear ids únicos)
const getClientId = () => `test_client_${Math.random().toString(16).slice(3)}`;

// vamos con el provider
export function MqttProvider({ children }: React.PropsWithChildren) {
  const [client, setClient] = React.useState<MqttContextType["client"]>(
    defaultContext.client
  );
  const [isConnected, setIsConnected] = React.useState(
    defaultContext.isConnected
  );

  // función para conectar
  const mqttConnect = React.useCallback(() => {
    const mqttClient = mqtt.connect(import.meta.env.VITE_BACKEND_MQTT, {
      protocolVersion: 5,
      // ... otras opciones que quieras añadir
      clientId: getClientId(),
    });
    setClient(mqttClient);
  }, []);

  // observar eventos
  React.useEffect(() => {
    if (client) {
      // cuando se conecta
      client.on("connect", () => {
        if (client.connected) setIsConnected(true);
      });
      // cuando hay error
      client.on("error", (err) => {
        console.error(err);
        client.end();

        setIsConnected(false);
      });
      // cuando se reconecta
      client.on("reconnect", () => {
        if (client.connected) setIsConnected(true);
      });
      // cuando se desconecta
      client.on("close", () => {
        setIsConnected(false);
      });
      // cuando se recibe un packet de desconexión desde el broker
      client.on("disconnect", () => {
        setIsConnected(false);
      });
      // cuando se recibe un mensaje
      client.on("message", (topic: string, message: Buffer) => {
        try {
          // parsear el mensaje (Buffer)
          const parsed = JSON.parse(message.toString());

          // hacer algo con el mensaje
          if (parsed) {
            console.log(topic, parsed);
          }
        } catch (error) {
          if (error instanceof Error) throw error;
        }
      });
    }

    // cleanup
    return () => {
      if (client) {
        client.endAsync();
        setIsConnected(false);
      }
    };
  }, [client]);

  // auto conectar al inicializar el contexto
  React.useEffect(() => {
    if (!client && !isConnected) mqttConnect();
  }, [client, isConnected, mqttConnect]);

  const contextValue = React.useMemo(
    () => ({
      client,
      isConnected,
      setIsConnected,
      mqttConnect,
    }),
    [client, isConnected, mqttConnect]
  );

  return (
    <MqttContext.Provider value={contextValue}>{children}</MqttContext.Provider>
  );
}
