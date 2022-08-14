import { world } from "mojang-minecraft";
import { wo } from "../../app/Models/Options.js";
import { po } from "../../app/Models/Options.js";
import { SA } from "../../index.js";
import { configuration } from "./config.js";
SA.Utilities.time.setTickTimeout(() => {
  world.events.beforeChat.subscribe((data) => {
    if (data.message.startsWith(SA.prefix)) return;
    try {
      const cooldown =
        data.sender
          .getTags()
          .find((tag) => tag.startsWith("cooldown:"))
          ?.substring(9) ?? null;
      if (cooldown && cooldown > Date.now())
        return (
          (data.cancel = true),
          SA.Build.chat.broadcast(
            `§c► Подожди §b${Math.ceil((cooldown - Date.now()) / 1000)}сек§c!§r`,
            data.sender.name
          )
        );
      data.sender.removeTag(`cooldown:${cooldown}`);
      const c = wo.Q("chat:Cooldown")
        ? wo.Q("chat:Cooldown")
        : configuration.chatCooldown;
      data.sender.addTag(`cooldown:${Date.now() + c * 1000}`);
      data.cancel = true;
      let p;
      const pn = SA.Build.entity.getScore(data.sender, "perm") ?? 0;
      if (pn == 2) {
        p = "§l§6Админ §r";
      } else if (pn == 1) {
        p = "§l§9Модер §r";
      } else p = "";
      if (wo.Q("chat:ranks:disable")) p = "";
      const r = wo.Q("chat:range");
      SA.Build.chat.debug(
        [
          `tellraw @a[r=${r ? r : configuration.range},name=!"${
            data.sender.name
          }"] {"rawtext":[{"text":"${p}§7${data.sender.name}§r: ${
            data.message
          }"}]}`,

          `tellraw @a[rm=${r ? r + 1 : configuration.range + 1},name=!"${
            data.sender.name
          }"]  {"rawtext":[{"text":"${p}§8${data.sender.name}§7: ${
            data.message
          }"}]}`,
          `playsound note.hat @a[tag=!"chat:sound:msgl:disable"]`,
          !po.Q("chat:highlightMessages", data.sender)
            ? `tellraw "${data.sender.name}" {"rawtext":[{"text":"${p}§7${data.sender.name}§r: ${data.message.replace(/["]/g, '\\"')}"}]}`
            : `tellraw "${data.sender.name}" {"rawtext":[{"text":"§6§lЯ§r: §f${data.message.replace(/["]/g, '\\"')}"}]}`,
        ],
        data.sender
      );
    } catch (error) {
      return (
        (data.cancel = true),
        SA.Build.chat.broadcast(
          `§4[chat][Error] §f${data.sender}: ${data.message}`
        ),
        console.warn(`${error}, ${error.stack}`)
      );
    }
  });
}, SA.loadtime);
