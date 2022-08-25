import {
  DynamicPropertiesDefinition,
  EntityTypes,
  world,
} from "mojang-minecraft";
import { Command } from "./app/Contracts/Commands/Command.js";
import { Group } from "./app/Contracts/Permission/Group.js";
import { Permission } from "./app/Contracts/Permission/Permission.js";
import { e } from "./app/Exceptions/Events.js";
import { Return } from "./app/Exceptions/Return.js";
import { EntityBuild } from "./app/Models/Entity.js";
import { Request } from "./app/Models/Request.js";
import { WorldBuild } from "./app/Models/World.js";
import { Chat } from "./app/Providers/Chat.js";
import * as form from "./app/Providers/Form.js";
import * as format from "./app/Utilities/formatter.js";
import * as scheduling from "./app/Utilities/scheduling.js";
import * as configuration from "./config/index.js";
import * as tables from "./database/tables.js";
import { DynamicPropertysDatabase } from "./database/types/DynamicPropertys.js";
import { ItemDatabase } from "./database/types/Item.js";
import { ScoreboardDatabase } from "./database/types/Scoreboard.js";
import { emoji } from "./lang/emoji.js";
import { parse } from "./lang/parser.js";
import { profanity } from "./lang/profanirty.js";
import { text } from "./lang/text.js";

/**
 * Smelly API
 * @license MIT
 * @author Smell of curry
 * @version 3.0.0
 * --------------------------------------------------------------------------
 * This is the main export file it exports all modules and moduleses
 * of Smelly API please do not try to change or configure any line in this file
 * Because it could end up breaking smelly api and its connected plugins
 * --------------------------------------------------------------------------
 */
export class SA {
  static loadtime = 20;
  static prefix = configuration.commands.PREFIX;
  static version = configuration.app.VERSION;
  static config = configuration;
  static tables = tables;
  static Command = Command;
  static Permission = Permission;
  static Group = Group;
  static Lang = {
    lang: text,
    emoji: emoji,
    profanity: profanity,
    parse: parse,
  };
  static Exceptions = {
    return: Return,
    E: e,
  };
  static Models = {
    entity: EntityBuild,
    request: Request,
    world: WorldBuild,
  };
  static Build = {
    entity: EntityBuild,
    request: Request,
    world: WorldBuild,
    chat: new Chat(),
    form: form,
  };
  static Providers = {
    chat: new Chat(),
    form: form,
  };
  static Utilities = {
    time: scheduling,
    format: format,
    storage: {
      item: ItemDatabase,
      scoreboard: ScoreboardDatabase,
      dynamic: DynamicPropertysDatabase,
    },
  };

  /**
   * Gets the ping of the server
   * @returns {Promise<number>}
   */
  static async getPing() {
    let currentPing = 0;
    let e = world.events.tick.subscribe(({ deltaTime }) => {
      currentPing = 1 / deltaTime;
      world.events.tick.unsubscribe(e);
    });
    return currentPing;
  }

  /**
   * Gets ths current tick of the server
   * @returns {Promise<number>}
   */
  static async getTick() {
    let tick = 0;
    let e = world.events.tick.subscribe(({ currentTick }) => {
      tick = currentTick;
      world.events.tick.unsubscribe(e);
    });
    return tick;
  }
}

world.events.worldInitialize.subscribe(({ propertyRegistry }) => {
  try {
    let q = new DynamicPropertiesDefinition();
    q.defineString("objective", 16);
    propertyRegistry.registerEntityTypeDynamicProperties(
      q,
      EntityTypes.get("mcbehub:floating_text")
    );
  } catch (error) {}
  SA.Build.chat.broadcast("§9┌ §fLoading...");
  for (const p of world.getPlayers())
    p.runCommand("playsound beacon.deactivate @s ~~~ 10 1.5");
  let a = world.events.beforeChat.subscribe((data) => {
    data.cancel = true;
    SA.Build.chat.broadcast("§9├ §cWait.");
  });
  /**
   * Loads Plugins
   */
  import("./vendor/autoload.js").then(() => {
    // SA.Build.chat.broadcast("§9├ §f"+plgs.join(', '));
    SA.Build.chat.broadcast("§9└ §fDone.");
    for (const p of world.getPlayers())
      p.runCommand("playsound beacon.activate @s ~~~ 10 1.3");
    world.events.beforeChat.unsubscribe(a);
  });
});

try {
  world.events.beforeWatchdogTerminate.subscribe((data) => {
    data.cancel = true;
    SA.Build.chat.broadcast("емае скрипт крашнулся");
  });
} catch (error) {}
