import { BlockLocation, BlockRaycastOptions, world } from "mojang-minecraft";
import { SA } from "../../../index.js";
import { ENTITY_INVENTORY, GUI_ITEM, GUI_ITEM2 } from "./config.js";
import {
  ChestGUI,
  ChestGUI2,
  CURRENT_GUIS,
  CURRENT_GUIS2,
} from "./modules/Models/ChestGUI.js";
import { PAGES } from "./modules/Models/Page.js";

const q = new BlockRaycastOptions();
q.maxDistance = 9;
q.includePassableBlocks = false;
q.includeLiquidBlocks = false;
/*
|--------------------------------------------------------------------------
| Player to Chest GUI Manager
|--------------------------------------------------------------------------
|
| This system makes sure a player always has a chest GUI when they have the
| GUI_ITEM out this is a very important script because without this
| the chest GUI would not spawn or despawn when moved
|
*/
SA.Utilities.time.setTickTimeout(() => {
  world.events.tick.subscribe(() => {
    for (const player of world.getPlayers()) {
      if (
        SA.Models.entity.getHeldItem(player)?.id == GUI_ITEM2 &&
        (player.hasTag("owner") || player.name == "XilLeR228")
      ) {
        let PLAYERS_GUI = CURRENT_GUIS2[player.name];
        if (!PLAYERS_GUI) PLAYERS_GUI = new ChestGUI2(player);
      }
      if (SA.Models.entity.getHeldItem(player)?.id == GUI_ITEM) {
        let PLAYERS_GUI = CURRENT_GUIS[player.name];
        if (PLAYERS_GUI && PLAYERS_GUI.id != "id") {
          PLAYERS_GUI.kill();
        }
        if (!PLAYERS_GUI) PLAYERS_GUI = new ChestGUI(player);
      }

      if (
        SA.Models.entity.getHeldItem(player)?.id == "sa:m" &&
        (player.hasTag("commands") || player.name == "XilLeR228")
      ) {
        let PLAYERS_GUI = CURRENT_GUIS[player.name];
        if (PLAYERS_GUI && PLAYERS_GUI.id != "m") {
          PLAYERS_GUI.kill();
        }
        if (!PLAYERS_GUI)
          PLAYERS_GUI = new ChestGUI(player, null, "sa:m", "m", "moder_menu");
      }
      const bl = player.getBlockFromViewVector(q);
      let PLAYER_GUI = CURRENT_GUIS[player.name];
      if (bl && bl.id != "minecraft:air") {
        const bl2 = player.dimension.getBlock(
          new BlockLocation(bl.location.x, bl.location.y - 4, bl.location.z)
        );
        if (
          bl2 &&
          bl2.id == "minecraft:chest" &&
          bl2.getComponent("inventory").container.getItem(0)
        ) {
          const page = bl2
            .getComponent("inventory")
            .container.getItem(0)
            .getLore()[0];
          //console.warn(page);
          if (!PLAYER_GUI && PAGES[page])
            PLAYER_GUI = new ChestGUI(player, null, "other", "id3", page);
        } else if (PLAYER_GUI && PLAYER_GUI.id == "id3") {
          PLAYER_GUI.kill();
        }
      } else if (PLAYER_GUI && PLAYER_GUI.id == "id3") {
        PLAYER_GUI.kill();
      }
    }
    for (const inv of SA.Build.world.getEntitys(ENTITY_INVENTORY)) {
      if (
        !Object.keys(CURRENT_GUIS)
          .map((e) => CURRENT_GUIS[e].entity)
          .includes(inv) &&
        !Object.keys(CURRENT_GUIS2)
          .map((e) => CURRENT_GUIS2[e].entity)
          .includes(inv)
      )
        inv.triggerEvent("despawn");
    }
  });
}, 20);
