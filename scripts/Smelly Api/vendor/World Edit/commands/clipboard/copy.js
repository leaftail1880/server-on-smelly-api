import { SA } from "../../../../index.js"
import { WorldEditBuild } from "../../modules/builders/WorldEditBuilder.js";

new SA.Command(
  { type: 'wb',    name: "copy",
    description: "Копирует зону",
    tags: ["commands"],
    type: 'wb'
  },
  (ctx) => {
    const command = WorldEditBuild.copy();
    ctx.reply(command.data.statusMessage);
  }
);
