import { BlockLocation } from "mojang-minecraft";
import {SA} from "../../../../index.js"
import { Shape } from "../../modules/builders/ShapeBuilder.js";
//import { WorldEditBuild } from "../../modules/builders/WorldEditBuilder.js";
import { SHAPES } from "../../modules/definitions/shapes.js";

new SA.Command(
  { type: 'wb',    name: "pyramid",
    description: "Generate a pyramid",
    tags: ["commands"],
  },
  (ctx) => {
    const blocks = ctx.args[0]?.split(",");
    const size = parseInt(ctx.args[1]);
    if (!blocks) return ctx.invalidArg(blocks);
    if (!size) return ctx.invalidArg(size);
    const location = new BlockLocation(
        ctx.sender.location.x,
        ctx.sender.location.y,
        ctx.sender.location.z,
    )
    new Shape(SHAPES.square_pyramid, location, blocks, size);
    ctx.reply(
      `Generated a Pyramid at ${location.x} ${location.y}${location.z}`
    );
  }
);
