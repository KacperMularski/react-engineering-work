const admin = require("firebase-admin");
const serviceAccount = require("./adminSDKKey.json");

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseurl: "https://auto-work-mate-75670-default-rtdb.firebaseio.com",
  });
}

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore(admin.apps[0]);

const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json()); // Dla obsługi JSON payload
app.use(cors());

app.post("/createUser", async (req, res) => {
  try {
    const { email, password, name, surname, role } = req.body;

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await db.collection("users").doc(userRecord.uid).set({
      email,
      role,
      name,
      surname,
      blocked: false,
    });
    res.status(200).send({ message: "Użytkownik utworzony pomyślnie" });
  } catch (error) {
    if (error.code === "auth/email-already-exists") {
      return res
        .status(400)
        .send({ error: "Podany adres email jest już w użyciu" });
    }

    return res.status(500).send({ error: "Wystąpił błąd serwera" });
  }
});

const port = 5000;
app.listen(port, () => {
  console.log(`API serwer na porcie ${port}`);
});
