import {SA} from "../../../../index.js"
import { SelectionBuild } from "../../modules/builders/SelectionBuilder.js";
import { WorldEditBuild } from "../../modules/builders/WorldEditBuilder.js";

const expand = new SA.Command(
  { type: 'wb',    name: "expand",
    description: "Expand the selection area",
    tags: ["commands"],
  },
  (ctx) => {
    const amount = parseInt(ctx.args[0]);
    if (!amount || isNaN(amount)) return ctx.invalidArg(amount);
    SelectionBuild.expand(amount);
    ctx.reply(
      `§9► §rВыделенная зона поднята на ${amount} блоков, теперь она с ${WorldEditBuild.pos1.x} ${WorldEditBuild.pos1.y} ${WorldEditBuild.pos1.z} по ${WorldEditBuild.pos2.x} ${WorldEditBuild.pos2.y} ${WorldEditBuild.pos2.z}`
    );
  }
);

expand.addSubCommand(
  {
    name: "vert",
    description: "Vertically expand the selection to world limits.",
  },
  (ctx) => {
    const amount = parseInt(ctx.args[0]);
    if (!amount || isNaN(amount)) return ctx.invalidArg(amount);
    SelectionBuild.expandVert(amount);
    ctx.reply(
      `§9► §rВыделенная зона поднята на ${amount} блоков вверх, теперь она с${WorldEditBuild.pos1.x} ${WorldEditBuild.pos1.y} ${WorldEditBuild.pos1.z} по ${WorldEditBuild.pos2.x} ${WorldEditBuild.pos2.y} ${WorldEditBuild.pos2.z}`
    );
  }
);
