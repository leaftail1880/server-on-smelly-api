
# Chest GUI Template

A template made so simpily that you can create a page/chest screen, as easy as writting a few letters.
Check out this incredidably made chest GUI and its easy to write framework.
## Documentation

## Editing the `static_pages.js`
The `static_pages.js` is the file that stores all static pages in the chest gui.
This is a simple file that stores screens, items, and slot ids in 1 file.

#### Creating a Page:
This code will create a page with the id of `smelly:page1` this is very
important because this is what links the pages
```js
new Page(`smelly:page2`, 54, "default")
  .createItem(40, "minecraft:barrier", 1, 0, "close", "Close GUI");
```

To make pages link to each other create another page and use the `page`
action to link them:
```js
new Page(`home`, 54, "default")
  .createItem(40, "minecraft:stick", 1, 0, "page:smelly:page2", "Go back home");
```
This code line shows some stuff that might be confusing but as you can see im 
creating a item at slot `40`, that item is the id `"minecraft:stick"` it has `1` item 
in its stack and a data value of `0`, When this item is grabbed it runs the item
action `"page:smelly:page2"` witch means when it is grabbed it will switch the current
chest GUI page to `"smelly:page2"`, This id is found when creating the page above

## Support

For support, join the discord: https://discord.gg/3GvfCDdTqY

