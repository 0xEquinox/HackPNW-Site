const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

const dbName = "hackpnw";

export default async function handler(request, response) {
  if (request.method !== "GET")
    return response.status(405).send("Method not allowed");

  const teamCode = request.query.code;

  if (teamCode == null || !/^\d{4}-\d{4}$/.test(teamCode)) {
    return response.status(200).json({ valid: false });
  }

  await client.connect();
  const db = client.db(dbName);
  const teamCollection = db.collection("teams");
  const registrationsCollection = db.collection("registrations");

  const res = await teamCollection.findOne({ code: teamCode });
  if (res == null) {
    return response
      .status(200)
      .json({ valid: false, reason: "Team code does not exist" });
  }

  const teamId = teamCollection.findOne({ code: teamCode })._id;
  console.log(teamId);
  if (
    (await registrationsCollection.find({ teamId: teamId }).toArray()).length >=
    4
  ) {
    return response.status(200).json({ valid: false, reason: "Team is full" });
  }

  response.status(200).json({ valid: true, reason: "" });
}
