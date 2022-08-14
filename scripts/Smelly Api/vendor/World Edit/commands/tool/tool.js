//import { Items, ItemStack } from "mojang-minecraft";
import {SA} from "../../../../index.js"

new SA.Command(
  { type: 'wb',    name: "tool",
    description: "Gives a tool item in your inventory",
    tags: ["commands"],
  },
  (ctx) => {
    ctx.sender.runCommand('give @s we:tool')
  }
);
