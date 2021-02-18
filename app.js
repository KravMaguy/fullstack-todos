const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/fullStackTodos", {
  useNewUrlParser: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "item1",
});
const item2 = new Item({
  name: "item2",
});
const item3 = new Item({
  name: "item3",
});

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  // console.log(Item, "item");
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          return console.log("err in inserting the items :", err);
        }
        return console.log("successfully inserted items");
      });
    }
    res.render("list", { listTitle: "Main List", newListItems: foundItems });
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName, 'the listName')
  const item = new Item({
    name: itemName,
  });
  if (listName === "Main List") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      console.log('foundList in the listnAme: ', listName)
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  let itemId = req.body.checkbox;
  Item.findByIdAndRemove(itemId, function (err, data) {
    if (err) {
      console.log(err, "the err msg reached");
    }
    console.log(data, "data successfully deleted");
    res.redirect("/");
  });
});

app.get("/:anyListName", function (req, res) {
  const anyListName = req.params.anyListName;
  List.findOne({ name: anyListName }, function (err, returnedList) {
    if (!err) {
      if (!returnedList) {
        console.log("list does not yet exist");
        const list = new List({
          name: anyListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + anyListName);
      } else {
        console.log("exists");
        // console.log(returnedList, "the returnedList");
        res.render("list", {
          listTitle: returnedList.name,
          newListItems: returnedList.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});