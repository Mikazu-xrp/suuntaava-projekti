// MQTT + MongoDB: toimiva yhteys Shiftr.io:n kautta

const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');

// --- MQTT-asetukset ---
const broker = 'mqtts://automaatio.cloud.shiftr.io';
const options = {
  username: 'automaatio',
  password: 'Z0od2PZF65jbtcXu'
};
const mq = mqtt.connect(broker, options);

mq.on('connect', () => {
  console.log('✅ Yhdistetty MQTT-brokeriin');
  mq.subscribe('automaatio/#');
});

mq.on('error', (err) => {
  console.error('❌ MQTT-yhteysvirhe:', err.message);
});

// --- MongoDB-yhteys ---
const uri = 'mongodb+srv://mika:mika@sensoridata.ekd8bsd.mongodb.net/?retryWrites=true&w=majority&appName=sensoridata';
const client = new MongoClient(uri);
const myDB = client.db("sensoridata2");
const myColl = myDB.collection("sensoridata2");

// --- MQTT-viestin käsittely ---
mq.on('message', async (topic, message) => {
  try {
    const obj = JSON.parse(message.toString());
    console.log(`📩 Viesti vastaanotettu:`, obj);

    await client.connect();
    await myColl.insertOne(obj);
    console.log('✅ Data tallennettu MongoDB:hen');
  } catch (err) {
    console.error('❌ Virhe viestin tai tallennuksen aikana:', err.message);
  }
});
