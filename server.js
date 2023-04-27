//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require('lodash');
const port=process.env.PORT || 3000;

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-amaan:Ansari1080@cluster0.sxjxuj7.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to our todolist",
});

const item2 = new Item({
  name: "Hit the + button to add a new Item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an Item",
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find()
    .then((foundItems) => {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems)
          .then(function () {
            console.log("Data inserted"); // Success
          })
          .catch(function (error) {
            console.log(error); // Failure
          });

        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  console.log(listName);

  const item = new Item({
    name: itemName,
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundlist) => {
      // console.log(foundlist);
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const listName=req.body.listName;
  const checkedItem = req.body.checkbox;

  if(listName=="Today"){
    Item.findByIdAndDelete(checkedItem).then((item) => {
      console.log("deleted");
      res.redirect("/");
    });

  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItem}}}).then((foundlist)=>{
      res.redirect("/"+listName);
    });
  }
 
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:customlist", function (req, res) {
  const customlistname =_.capitalize(req.params.customlist);
  List.findOne({ name: customlistname })
    .then((foundlist) => {
      if (!foundlist) {
        const list = new List({
          name: customlistname,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customlistname);
      } else {
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items,
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
});

// mongoose.connection.close()

app.listen(port, function () {
  console.log("Server started on port 3000");
});
