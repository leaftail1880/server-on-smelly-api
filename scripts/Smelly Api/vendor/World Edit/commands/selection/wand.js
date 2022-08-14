import {SA} from "../../../../index.js"
//import { WorldEditBuild } from "../../modules/builders/WorldEditBuilder.js";

new SA.Command(
  { type: 'wb',    name: "wand",
    description: "Выдет топор",
    tags: ["commands"],
  },
  (ctx) => {
    ctx.sender.runCommand(`give @s we:wand`);
  }
);
