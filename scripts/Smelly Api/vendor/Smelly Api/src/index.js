import { EntityType, world } from "mojang-minecraft";
//import { COMMAND_PATHS } from "../../../app/Contracts/Commands/Command.js";
import { SA } from "../../../index.js";
import "./help.js";

// new SA.Command(
//   {
//     name: "name",
//     description: "Устанавливает позицию 2 (использовать)",
//   })
//   .addOption('name', 'string')
//   .executes((ctx, {name}) => {
//     ctx.reply('renamed')
//     const ent = SA.Build.entity.getClosetsEntitys(ctx.sender, 30)
//     ctx.reply(ent[0].nameTag)
//     ent[0].nameTag = name
//   }
// );

// new SA.Command(
//   {
//     name: "version",
//     description: "Get Current Version",
//     aliases: ["v"],
//     permissions: ["SA.command.version"],
//   },
//   (ctx) => {
//     ctx.reply(`Current Smelly API Version: ${SA.version}`);
//   }
// );

// new SA.Command(
//   {
//     name: "test",
//     description: "Test command",
//   },
//   (ctx) => {
//     try {
//       console.warn("Smelly API is workin and configured properly!");
//       ctx.reply(`Smelly API is workin and configured properly!`);
//     } catch (error) {
//       console.warn(error + error.stack);
//     }
//   }
// );

new SA.Command(
  {
    name: "ping",
    description: "Returns the current TPS of the servers ping",
    type: "test",
  },
  (ctx) => {
    let pingTick = world.events.tick.subscribe(({ deltaTime }) => {
      ctx.reply(`Pong! Current DeltaTime: ${deltaTime}`);
      world.events.tick.unsubscribe(pingTick);
    });
  }
);