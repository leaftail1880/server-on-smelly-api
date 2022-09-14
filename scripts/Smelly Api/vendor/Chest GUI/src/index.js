import {
  BlockLocation,
  BlockRaycastOptions,
  world,
  Player,
} from "mojang-minecraft";
import { SA } from "../../../index.js";
import { ENTITY_INVENTORY, GUI_ITEM, GUI_ITEM2 } from "./config.js";
import { ChestGUI, CURRENT_GUIS } from "./modules/Models/ChestGUI.js";
import { PAGES } from "./modules/Models/Page.js";
import {
  DEFAULT_STATIC_PAGE_ID,
  DEFAULT_STATIC_PAGE_ID2,
} from "./static_pages.js";

const guis = {};

/**
 *
 * @param {function(Player)} permission
 * @param {*} item
 * @param {*} id
 * @param {*} startPage
 */
function identyGui(
  item,
  permission = () => true,
  id = "id",
  startPage = DEFAULT_STATIC_PAGE_ID
) {
  guis[item] = {
    permission,
    item,
    id,
    startPage,
  };
}

/*

identyGui(
  (player) => ,
  i,
  id,
  page
);

 */

identyGui(GUI_ITEM);

identyGui(
  "sa:m",
  (player) => player.hasTag("commands") || player.name == "XilLeR228",
  
  "m",
  "moder_menu"
);

identyGui(
  GUI_ITEM2,
  (player) => player.hasTag("owner") || player.name === "XilLeR228",
  "wo",
  DEFAULT_STATIC_PAGE_ID2
);

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
      const heldItem = SA.Models.entity.getHeldItem(player)?.id;
      let activeGui = CURRENT_GUIS[player.name];

      if (heldItem && guis[heldItem]) {
        // Gui exist
        const gui = guis[heldItem];
        if (activeGui && activeGui?.id !== gui?.id) {
          activeGui.killa().then(() => {
            if (gui.permission(player))
              activeGui = new ChestGUI(
                player,
                null,
                gui.item,
                gui.id,
                gui.page
              );
          });
          return;
        }

        if (!activeGui && gui.permission(player))
          activeGui = new ChestGUI(player, null, gui.item, gui.id, gui.page);
        return;
      } else if (activeGui && activeGui?.id !== "chest") {
        // if Gui exist and player dont hold gui item, we need to kill gui
        activeGui.kill();
        return;
      }

      const bl = player.getBlockFromViewVector(q);
      if (bl?.id && bl?.id === "minecraft:air") {
        const bl2 = player.dimension.getBlock(bl.location.offset(0, -4, 0)); //
        if (
          bl2?.id &&
          bl2.id === "minecraft:chest" &&
          bl2.getComponent("inventory")?.container?.getItem(0)
        ) {
          const page = bl2
            .getComponent("inventory")
            .container.getItem(0)
            .getLore()[0];
          //console.warn(page);
          if (!activeGui && PAGES[page])
            activeGui = new ChestGUI(player, null, "other", "chest", page);
        } else if (activeGui && activeGui.id === "chest") {
          activeGui.kill();
        }
      } else if (activeGui && activeGui.id === "chest") {
        activeGui.kill();
      }
    }
    for (const inv of SA.Build.world.getEntitys(ENTITY_INVENTORY)) {
      if (
        !Object.keys(CURRENT_GUIS)
          .map((e) => CURRENT_GUIS[e].entity)
          .includes(inv) &&
        !Object.keys(CURRENT_GUIS)
          .map((e) => CURRENT_GUIS[e].entity)
          .includes(inv)
      )
        inv.triggerEvent("despawn");
    }
  });
}, 20);
