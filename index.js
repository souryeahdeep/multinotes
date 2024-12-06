import express from "express"; //importing express modules which helps to run the node.js easily
import bodyParser from "body-parser"; //Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
import pg from "pg"; //including postgresql
// import { items} from "./constants/index.js";

const app = express(); //connecting express
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "mul_to_do",
  password: "sourya3110",
  port: 5432,
});

db.connect(); //connecting database

let users = [];
let items = [];
let items1 = [];
let currentUserId = 1;
let currentUser = "";
let currentTask = "";

app.use(bodyParser.urlencoded({ extended: true })); //
app.use(express.static("public"));
async function getUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;

  return (
    users.find((user) => user.name == currentUser),
    users.find((user) => user.id == currentUserId)
  );
}

//Home Page : The Stored Notes will be shown
app.get("/", async (req, res) => {
  await getUser();

  try {
    const result = await db.query(
      "SELECT * FROM items WHERE user_id=$1 ORDER BY id ASC",
      [currentUserId]
    );
    items = result.rows;
    const result1 = await db.query("SELECT * FROM users WHERE id=$1", [
      currentUserId,
    ]);
    items1 = result1.rows;
    let title = items1[0].name;
    
    res.render("index.ejs", {
      listTitle: title,
      listItems: items,
      users: users,
    });
  } catch (err) {
    console.log(err.message);
  }
});

//Also in the homepage but helps to insert a new note
app.post("/add", async (req, res) => {
  const item = req.body.newItem;

  try {
    await db.query("INSERT INTO items (task, user_id) VALUES ($1,$2)", [
      item,
      currentUserId,
    ]);
  } catch (err) {
    console.log(err.message);
  }
  res.redirect("/");
});

//Helps to edit a already created note
app.post("/edit", async (req, res) => {
  const id = req.body.updatedItemId;
  const up = req.body.updatedItemTitle;

  try {
    await db.query("UPDATE items SET task = ($1)  WHERE id = ($2);", [up, id]);
  } catch (err) {
    console.log(err.message);
  }

  res.redirect("/");
});

app.post("/user", async (req, res) => {
  if (req.body.add) {
    res.render("new.ejs");
  } else {
    currentUserId = req.body.user;

    currentUser = req.body.userName;

    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const name = req.body.name;

  try {
    const result = await db.query("INSERT INTO users (name) VALUES ($1)", [
      name,
    ]);
    const id = result.rows[0].id;
    currentUserId = id;
  } catch (err) {
    console.log(err.message);
  }

  res.redirect("/");
});
//Helps to delete a note
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;

  try {
    await db.query("DELETE FROM items WHERE id = $1;", [id]);
  } catch (err) {
    console.log(err.message);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
