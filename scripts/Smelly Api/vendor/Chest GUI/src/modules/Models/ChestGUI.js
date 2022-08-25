import {
  Enchantment,
  EnchantmentList,
  Entity,
  EntityQueryOptions,
  InventoryComponentContainer,
  ItemStack,
  MinecraftEnchantmentTypes,
  MinecraftItemTypes,
  Player,
  world,
} from "mojang-minecraft";
import {
  ActionFormData,
  ModalFormData,
  ModalFormResponse,
  MessageFormData,
  MessageFormResponse,
} from "mojang-minecraft-ui";
import {
  light_db,
  OPTIONS,
  po,
  wo,
  WORLDOPTIONS,
} from "../../../../../app/Models/Options.js";
import { SA } from "../../../../../index.js";
import { LeaderboardBuild } from "../../../../Leaderboards/build/LeaderboardBuilder.js";
import { Atp } from "../../../../Portals/index.js";
import {
  Allhrs,
  Allmin,
  Allsec,
  Dayhrs,
  Daymin,
  Daysec,
  Seahrs,
  Seamin,
  Seasec,
} from "../../../../Server/index.js";
import { Wallet } from "../../../../Wallet/money.js";
import { ENTITY_INVENTORY, GUI_ITEM, GUI_ITEM2 } from "../../config.js";
import {
  auxa,
  DEFAULT_STATIC_PAGE_ID,
  DEFAULT_STATIC_PAGE_ID2,
  pls,
  предметы,
} from "../../static_pages.js";
import {
  ChangeAction,
  ChangePAction,
  CloseAction,
  CommandAction,
  GiveAction,
  OpenForm,
  PageAction,
  SetAction,
} from "./ItemActions.js";
import { getItemUid, Page, PAGES } from "./Page.js";

//new WorldOption("js:stats", "включает статистику функций");
export function co(msg) {
  if (wo.Q("js:stats")) SA.Build.chat.broadcast(msg);
}

class DefaultFill {
  /**
   * Fills a entity with desired itmes
   * @param {Entity} entity
   * @param {Page} page page type to fill
   */
  static fill(entity, page) {
    /**
     * @type {InventoryComponentContainer}
     */
    const container = entity.getComponent("minecraft:inventory").container;

    for (let i = 0; i < container.size; i++) {
      const item = page.items[i];
      if (!item || !item.type) {
        container.setItem(i, new ItemStack(MinecraftItemTypes.air));
        continue;
      }
      entity.runCommand(
        `replaceitem entity @s slot.inventory ${i} ${item?.type} ${item?.amount} ${item?.data}`
      );
      /**
       * @type {ItemStack}
       */
      const chestItem = container.getItem(i);
      if (item?.name) chestItem.nameTag = item.name;
      if (item?.lore) chestItem.setLore(item.lore);
      if (item?.components?.enchantments?.length > 0) {
        const MinecraftEnchantments = Object.values(MinecraftEnchantmentTypes);
        /**
         * @type {EnchantmentList}
         */
        const ItemStackEnchantments =
          chestItem.getComponent("enchantments").enchantments;
        for (const ench of item.components.enchantments) {
          ItemStackEnchantments.addEnchantment(
            new Enchantment(
              MinecraftEnchantments.find((type) => type.id == ench.id),
              ench.level
            )
          );
        }
        chestItem.getComponent("enchantments").enchantments =
          ItemStackEnchantments;
      }
      container.setItem(i, chestItem);
    }
  }
}

/**
 * Fills a entity with desired itmes
 * @param {Entity} entity
 * @param {Page} page page type to fill
 */
function ShopFill(entity, page, player) {
  /**
   * @type {InventoryComponentContainer}
   */
  const container = entity.getComponent("minecraft:inventory").container;
  const id = page.id + "::dm::" + player.name;
  let custom_page;
  PAGES[id]
    ? (custom_page = PAGES[id])
    : (custom_page = new Page(id, 54, "shop"));
  for (let i = 0; i < container.size; i++) {
    /**
     * @type {import("./Page").Item}
     */
    let item = custom_page?.items[i] ?? page?.items[i];
    if (!item || !item.type) {
      container.setItem(i, new ItemStack(MinecraftItemTypes.air));
      continue;
    }
    if (item.lore[0] == SA.Lang.lang["shop.lore"]()[0]) {
      const w = new Wallet(player);

      item.lore = SA.Lang.lang["shop.lore"](
        SA.Lang.parse(item.lore, "shop.lore").price,
        w.balance()
      );
    }
    entity.runCommand(
      `replaceitem entity @s slot.inventory ${i} ${item?.type} ${item?.amount} ${item?.data}`
    );
    /**
     * @type {ItemStack}
     */
    const chestItem = container.getItem(i);
    if (item?.name) chestItem.nameTag = item.name;
    if (item?.lore) chestItem.setLore(item.lore);
    if (item?.components?.enchantments?.length > 0) {
      const MinecraftEnchantments = Object.values(MinecraftEnchantmentTypes);
      /**
       * @type {EnchantmentList}
       */
      const ItemStackEnchantments =
        chestItem.getComponent("enchantments").enchantments;
      for (const ench of item.components.enchantments) {
        ItemStackEnchantments.addEnchantment(
          new Enchantment(
            MinecraftEnchantments.find((type) => type.id == ench.id),
            ench.level
          )
        );
      }
      chestItem.getComponent("enchantments").enchantments =
        ItemStackEnchantments;
    }
    container.setItem(i, chestItem);
    custom_page.createItem(
      i,
      item.type,
      item?.amount,
      item?.data,
      item?.action,
      item?.name,
      item?.lore
    );
    if (i == 0) co("crItem: " + item.type);
    //console.warn(iitem + ' ' + item.type)
  }
  co("Real type: " + custom_page.items[0].type);
  return custom_page;
}

//Настройки игрока и новая система - заполнение массивом (модер меню)
class SpecialFill {
  /**
   * Fills a entity with desired itmes
   * @param {Entity} entity
   * @param {Page} page page type to fill
   */
  static fill(entity, page, player) {
    /**
     * @type {InventoryComponentContainer}
     */
    const container = entity.getComponent("minecraft:inventory").container;
    const id = "forplayer:" + player.name;
    let custom_page;
    PAGES[id]
      ? (custom_page = PAGES[id])
      : (custom_page = new Page(id, 54, "spec"));
    for (let i = 0; i < container.size; i++) {
      /**
       * @type {import("./Page").Item}
       */
      let item = custom_page?.items[i] ?? page?.items[i];
      if (!item || !item.type) {
        container.setItem(i, new ItemStack(MinecraftItemTypes.air));
        continue;
      }
      let iitem;
      const opt = SA.Utilities.format.clearColors(item.name);
      if (item.type == "minecraft:white_candle" && po.E(opt)) {
        if (po.E(opt)?.Aitem) {
          iitem = po.E(opt)?.Aitem;
          po.Q(opt, player)
            ? item.components.ItemEnchantTypes.push({
                level: 1,
                id: MinecraftEnchantmentTypes.mending.id,
              })
            : "";
        } else {
          let vid = po.E(opt)?.exp ?? false;
          if (!vid) {
            iitem = `${po.Q(opt, player) ? "lime" : "red"}_candle`;
          } else iitem = `${po.Q(opt, player) ? "yellow" : "red"}_candle`;
        }
        entity.runCommand(
          `replaceitem entity @s slot.inventory ${i} ${iitem} ${item?.amount} ${item?.data}`
        );
      } else
        entity.runCommand(
          `replaceitem entity @s slot.inventory ${i} ${item?.type} ${item?.amount} ${item?.data}`
        );
      /**
       * @type {ItemStack}
       */
      const chestItem = container.getItem(i);
      if (item?.name) chestItem.nameTag = item.name;
      if (item?.lore) chestItem.setLore(item.lore);
      if (item?.components?.enchantments?.length > 0) {
        const MinecraftEnchantments = Object.values(MinecraftEnchantmentTypes);
        /**
         * @type {EnchantmentList}
         */
        const ItemStackEnchantments =
          chestItem.getComponent("enchantments").enchantments;
        for (const ench of item.components.enchantments) {
          ItemStackEnchantments.addEnchantment(
            new Enchantment(
              MinecraftEnchantments.find((type) => type.id == ench.id),
              ench.level
            )
          );
        }
        chestItem.getComponent("enchantments").enchantments =
          ItemStackEnchantments;
      }
      let it;
      iitem ? (it = iitem) : (it = item.type);
      container.setItem(i, chestItem);
      custom_page.createItem(
        i,
        it,
        item?.amount,
        item?.data,
        item?.action,
        item?.name,
        item?.lore
      );
      if (i == 0) co("crItem: " + item.type);
      //console.warn(iitem + ' ' + item.type)
    }
    co("Real type: " + custom_page.items[0].type);
    return custom_page;
  }
  /**
   * Fills a entity with desired itmes
   * @param {Entity} entity
   * @param {Page} page page type to fill
   */
  static FillArray(
    entity,
    page,
    player,
    array,
    arrayType,
    customItem1 = "minecraft:name_tag",
    item1ac = "set",
    customItem2 = "minecraft:name_tag",
    item2ac = "set"
  ) {
    /**
     * @type {InventoryComponentContainer}
     */
    const container = entity.getComponent("minecraft:inventory").container;
    const id = "forrplayer:" + player.name;
    let custom_page;
    PAGES[id]
      ? (custom_page = PAGES[id])
      : (custom_page = new Page(id, 54, "array:" + arrayType));
    for (let i = 0; i < container.size; i++) {
      /**
       * @type {import("./Page").Item}
       */
      let item = custom_page?.items[i] ?? page?.items[i];
      if (i <= 44 && array[i]) {
        const ttype = Number(array[i].split("(::)")[0]);
        item = {};
        item.name = array[i].startsWith("§m§n§m§r")
          ? array[i].split("(::)")[1]
          : "§m§n§m§r" + array[i].split("(::)")[1];
        item.action = ttype == 2 ? item2ac : item1ac;
        item.amount = i + 1;
        item.data = 0;
        item.type = ttype == 2 ? customItem2 : customItem1;
      }
      if (!item || !item.type) {
        container.setItem(i, new ItemStack(MinecraftItemTypes.air));
        continue;
      }
      entity.runCommand(
        `replaceitem entity @s slot.inventory ${i} ${item?.type} ${item?.amount} ${item?.data}`
      );
      /**
       * @type {ItemStack}
       */
      const chestItem = container.getItem(i);
      if (item?.name) chestItem.nameTag = item.name;
      if (item?.lore) chestItem.setLore(item.lore);
      container.setItem(i, chestItem);
      custom_page.createItem(
        i,
        item.type,
        item?.amount,
        item?.data,
        item?.action,
        item?.name,
        item?.lore
      );

      //console.warn(iitem + ' ' + item.type)
    }
    return custom_page;
  }
}
//Меню игроков в админ меню
class PlayerFill {
  /**
   * Fills a entity with desired itmes
   * @param {Entity} entity
   * @param {Page} page page type to fill
   */
  static fill(entity, page, action = "openPlayerMenu") {
    /**
     * @type {InventoryComponentContainer}
     */
    const container = entity.getComponent("minecraft:inventory").container;
    let players = [];
    for (const p of world.getPlayers()) {
      players.push(p.name);
    }
    for (let i = 0; i < container.size; i++) {
      /**
       * @type {import("./Page").Item}
       */
      let item = page?.items[i];
      if (i < players.length) {
        const lvl = SA.Build.entity.getScore(
          SA.Build.entity.fetch(players[i]),
          "perm"
        );
        let color, id;
        if (lvl == 2) (color = "6"), (id = "ender_chest");
        if (lvl == 1) (color = "9"), (id = "barrel");
        if (!color) (color = "f"), (id = "chest");
        item = {};
        item.action = action;
        item.amount = i + 1;
        item.data = 3;
        item.lore = ["", "§r§7Нажми что бы открыть меню"];
        item.name = "§r§" + color + players[i];
        item.n = players[i];
        item.type = "minecraft:" + id;
      }
      if (!item || !item.type) {
        container.setItem(i, new ItemStack(MinecraftItemTypes.air));
        continue;
      }
      entity.runCommand(
        `replaceitem entity @s slot.inventory ${i} ${item?.type} ${item?.amount} ${item?.data}`
      );
      /**
       * @type {ItemStack}
       */
      const chestItem = container.getItem(i);
      if (item?.name) chestItem.name = item.n;
      if (item?.name) chestItem.nameTag = item.name;
      if (item?.lore) chestItem.setLore(item.lore);
      if (item?.components?.enchantments?.length > 0) {
        const MinecraftEnchantments = Object.values(MinecraftEnchantmentTypes);
        /**
         * @type {EnchantmentList}
         */
        const ItemStackEnchantments =
          chestItem.getComponent("enchantments").enchantments;
        for (const ench of item.components.enchantments) {
          ItemStackEnchantments.addEnchantment(
            new Enchantment(
              MinecraftEnchantments.find((type) => type.id == ench.id),
              ench.level
            )
          );
        }
        chestItem.getComponent("enchantments").enchantments =
          ItemStackEnchantments;
      }
      container.setItem(i, chestItem);
      pls.createItem(
        i,
        item.type,
        item?.amount,
        item?.data,
        item?.action,
        item?.name,
        item?.lore
      );
    }
  }
}
//Нерабочая фигня
class Itemss {
  /**
   *
   * @param {Entity} entity
   * @param {Page} page page type to fill
   */
  static fill(entity, itema = null) {
    if (itema) {
      SA.tables.i.add(itema);
      console.warn(itema.id);
    }
    /**
     * @type {InventoryComponentContainer}
     */
    const container = entity.getComponent("minecraft:inventory").container;
    let items = SA.tables.i.items();
    for (let i = 0; i < container.size; i++) {
      let im;
      /**
       * @type {import("./Page").Item}
       */
      let item = предметы.items[i];
      if (i < items.length) {
        im = items[i];
        item = {};
        item.action = "give2";
        item.amount = im.amount;
        item.data = im.amount;
        item.lore = im.getLore();
        item.name = im.nameTag;
        item.type = im.id;
      }
      if (!item || !item.type) {
        container.setItem(i, new ItemStack(MinecraftItemTypes.air));
        continue;
      }
      if (!im) {
        entity.runCommand(
          `replaceitem entity @s slot.inventory ${i} ${item?.type} ${item?.amount} ${item?.data}`
        );
      } else {
        container.setItem(i, im);
        continue;
      }
      /**
       * @type {ItemStack}
       */
      const chestItem = container.getItem(i);
      if (item?.name) chestItem.name = item.name;
      if (item?.lore) chestItem.setLore(item.lore);
      container.setItem(i, chestItem);
      предметы.createItem(
        i,
        item.type,
        item?.amount,
        item?.data,
        item?.action,
        item?.name,
        item?.lore
      );
    }
  }
}

/**
 * @typedef {Object} MappedInventoryItem a inventory that has been saved
 * @property {String} uid a unique id for a itemStack
 * @property {ItemStack} item the item
 */

/**
 * @typedef {Object} SlotChangeReturn What gets return on a slot change
 * @property {Number} slot Slot that changed
 * @property {ItemStack} item the item that was grabbed
 */

/**
 * This is a object showing players chestGUI to entity
 * @type {Object<string, ChestGUI>}
 */
export const CURRENT_GUIS = {};

export const ACTIONS1 = {
  temp: (his, item) => {
    console.warn("lol, temp runned");
  },

  give: (his, item) => GiveAction(his, item),
  lbs: (his, item) => {
    const form = new ModalFormData();
    form.title("§l§fСтиль§r");
    form.textField("Оставь пустым для удаления", "gray | orange | green", "");
    OpenForm(his, his.player, form, (data) => {
      if (data.isCanceled) return;
      const ent = SA.Build.entity
        .getClosetsEntitys(his.player, 10, "f:t", 44, false)
        .find(
          (e) =>
            e.nameTag == item.name.replace("§m§n§m§r", "").replace("§m§n§m§r", "")
        );
      if (!data.formValues[0]) {
        LeaderboardBuild.removeObj(
          SA.Build.entity.getTagStartsWith(ent, "obj:")
        );
        ent.triggerEvent("kill");
        return
      }
      LeaderboardBuild.shangeStyle(
        SA.Build.entity.getTagStartsWith(ent, "obj:"),
        data.formValues[0]
      );
    });
  },
  tag: (his, item) => {
    his.player.removeTag(item.name.cc());
  },
  redo: (his, item) => {
    const form = new ModalFormData();
    form.title("§l§fРедактирование§r");
    form.textField(
      "Оставь пустым для удаления",
      "Имя",
      item.name.replace("§m§n§m§r§m§n§m§r", "")
    );
    OpenForm(his, his.player, form, (d) => {
      /**
       * @type {ModalFormResponse}
       */
      const data = d;
      if (data.isCanceled) return;
      const ent = SA.Build.entity
        .getClosetsEntitys(his.player, 10, "f:t", 44, false)
        .find((e) => e.nameTag.cc() == item.name.cc());
      if (!data.formValues[0]) ent.triggerEvent("kill");
      ent.nameTag = data.formValues[0];
    });
  },

  "spawn:ft": (his, item) => {
    const form = new ModalFormData();
    form.title("§l§fЛетающий текст§r");
    form.textField("Имя", "Оставь пустым для отмены", "§");
    OpenForm(his, his.player, form, (data) => {
      if (data.isCanceled || !data.formValues[0]) return;
      const ent = his.player.dimension.spawnEntity(
        "f:t",
        SA.Build.entity.locationToBlockLocation(his.player.location)
      );
      ent.nameTag = data.formValues[0];
    });
  },
  "spawn:lb": (his, item) => {
    const form = new ModalFormData();
    form.title("§l§fЛидерборд§r");
    form.textField("Таблица счета", "Оставь пустым для отмены", "");
    form.textField("Стиль", "gray | orange | green", "");
    OpenForm(his, his.player, form, (data) => {
      if (data.isCanceled || !data.formValues[0] || !data.formValues[1]) return;
      const l = SA.Build.entity.locationToBlockLocation(his.player.location);
      SA.Build.chat.broadcast(
        LeaderboardBuild.createLeaderboard(
          data.formValues[0],
          l.x,
          l.y,
          l.z,
          his.player.dimension.id,
          data.formValues[1]
        ),
        his.player.name
      );
    });
  },
  close: (his, item) => {
    CloseAction(his);
  },
  set: (his, item, change) => {
    SetAction(his, item, change.slot, change.item);
  },
  change: (his, item, change) => {
    ChangePAction(his, item, change.slot, his.player);
  },
  "sc:clear": (his, item, change) => {
    for (const opt of OPTIONS) {
      his.player.removeTag(opt.name);
    }
    let count = 0;
    for (let item of his.mapInventory) {
      let nei = {
        lore: item.item.getLore(),
        name: item.item.nameTag,
      };
      SetAction(
        his,
        nei,
        count,
        new ItemStack(
          MinecraftItemTypes.redCandle,
          item.item.amount,
          item.item.data
        )
      );
      PAGES[his.page.id].createItem(
        count,
        "minecraft:red_candle",
        item.item.amount,
        item.item.data,
        "change",
        item.item.nameTag,
        item.item.getLore()
      );
      count++;
      if (count >= OPTIONS.length) break;
    }
    SetAction(his, item, change.slot, change.item);
  },
  stats: (his, item) => {
    const form = new ActionFormData();
    form.title("§l§fСтатистика " + his.player.name + "§r");
    form.button("Закрыть");
    form.body(
      `Время всего: ${Allhrs.Eget(his.player)}:${Allmin.Eget(
        his.player
      )}:${Allsec.Eget(his.player)}\nВремя за сеанс: ${Seahrs.Eget(
        his.player
      )}:${Seamin.Eget(his.player)}:${Seasec.Eget(
        his.player
      )}\nВремя за день: ${Dayhrs.Eget(his.player)}:${Daymin.Eget(
        his.player
      )}:${Daysec.Eget(his.player)}${"\n\n\n\n"}`
    );
    OpenForm(his, his.player, form);
  },
};

const STARTACTIONS1 = {
  "": (his, item) => {
    console.warn("lol, empty runned");
  },
  /**
   *
   * @param {ChestGUI} his
   * @param {import("./Page.js").Item} item
   */
  "buy:": (his, item) => {
    const price = Number(item.action.split(":")[1]),
      form = new MessageFormData(),
      w = new Wallet(his.player);
    if (w.balance() < price) {
      SA.Build.chat.broadcast(
        SA.Lang.lang["shop.notenought"](price, w.balance()),
        his.player.name
      );
      his.player.playSound("note.bass");
      his.setPage(his.page.id);
      return;
    }
    form.title("§l§fПокупка§r");
    form.body(
      `  §7Вы уверены, что хотите купить §f${item.type.split(":")[1]} х${
        item.amount
      } §7за§6 ${price}?\n  §7Ваш баланс сейчас: §6${w.balance()}§7, после покупки на нем станет: §f${
        w.balance() - price
      }`
    );
    form.button1("Купить");
    form.button2("§cОтмена§r");
    OpenForm(his, his.player, form, (d) => {
      /**
       * @type {MessageFormResponse}
       */
      const data = d;
      if (data.isCanceled || data.selection == 0) return;
      if (w.balance() < price) {
        SA.Build.chat.broadcast(
          SA.Lang.lang["shop.notenought"](price, w.balance()),
          his.player.name
        );
        his.player.playSound("note.bass");
        return;
      }
      GiveAction(his, item);
      w.add(-price);
      SA.Build.chat.broadcast(
        SA.Lang.lang["shop.suc"](
          item.type.split(":")[1],
          item.amount,
          price,
          w.balance()
        ),
        his.player.name
      );
      his.player.playSound("random.levelup");
    });
  },
  "page:": (his, item) => PageAction(his, item),
  "Atp:": (his, item, change) => {
    SetAction(his, item, change.slot, change.item);
    his.killa().then((e) => Atp(his.player, item.action.split(":")[1]));
  },
};

export class ChestGUI {
  /**
   * Finds and returns a slot change in a inventory
   * @param {Array<MappedInventoryItem>} oldInv
   * @param {Array<MappedInventoryItem>} newInv
   * @returns {SlotChangeReturn | null}
   */
  static getSlotChange(oldInv, newInv) {
    if (oldInv.length != newInv.length) return null;
    for (let i = 0; i < oldInv.length; i++) {
      if (
        oldInv[i].uid != newInv[i].uid &&
        oldInv[i].item?.id == newInv[i].item?.id &&
        oldInv[i].item?.nameTag == newInv[i].item?.nameTag &&
        oldInv[i].item?.data == newInv[i].item?.data //&&
        //oldInv[i].item.getLore() == newInv[i].item.getLore()
      ) {
        oldInv[i].item.amount = oldInv[i].item.amount - newInv[i].item.amount;
        return { slot: i, item: oldInv[i].item, ex: true };
      }

      if (oldInv[i].uid != newInv[i].uid)
        return { slot: i, item: oldInv[i].item };
    }
    return null;
  }

  /**
   * Creates a new chestGUI and assigns it to a player
   * @param {Player} player the player this chestGUI is asigned to
   * @param {Entity} entity entity to use if undefined will create one
   */
  constructor(
    player,
    entity = null,
    GUIitem = null,
    GUIid = null,
    GUIpage = null
  ) {
    co("§bnew §9ChestGUI§f() {");
    this.player = player;
    this.entity = entity;
    this.previousMap = null;
    this.id = GUIid ?? "id";
    this.p = GUIpage ?? DEFAULT_STATIC_PAGE_ID;
    /**
     * @type {Page}
     */
    this.page = null;
    if (!this.entity) this.summon();

    this.events = {
      tick: world.events.tick.subscribe(() => {
        try {
          if (this.entity.getComponent("minecraft:health").current <= 0)
            return this.kill();
        } catch (error) {
          this.kill();
        }
        if (GUIitem && GUIitem != "other") {
          if (SA.Models.entity.getHeldItem(this.player)?.id != GUIitem)
            return this.kill();
        } else if (
          GUIitem != "other" &&
          SA.Models.entity.getHeldItem(this.player)?.id != GUI_ITEM
        )
          return this.kill();

        try {
          this.entity.teleport(
            this.player.location,
            this.player.dimension,
            0,
            0
          );
        } catch (error) {}

        if (!this.player.hasTag(`has_container_open`)) return;
        if (!this.previousMap) return;
        const change = ChestGUI.getSlotChange(
          this.previousMap,
          this.mapInventory
        );
        if (change == null) return;
        this.onSlotChange(change, change.ex ? change.item.amount : '');
      }),
      playerLeave: world.events.playerLeave.subscribe(({ playerName }) => {
        if (playerName != this.player.name) return;
        this.kill();
      }),
    };

    CURRENT_GUIS[this.player.name] = this;
    co("}");
  }

  /**
   * This spawns a chest GUI entity and sets the this.entity
   */
  summon() {
    co("§9summon§f() {");
    SA.Models.world
      .getEntitys(ENTITY_INVENTORY)
      ?.find((e) => e.getTags().includes(`${this.id}:${this.player.name}`))
      ?.triggerEvent("despawn");
    let e = world.events.entityCreate.subscribe((data) => {
      if (data.entity.id == ENTITY_INVENTORY) {
        this.entity = data.entity;
        this.entity.addTag(`id:${this.player.name}`);
        this.entity.addTag(`gui`);
        this.setPage(this.p);
      }
      world.events.entityCreate.unsubscribe(e);
    });
    this.player.triggerEvent("smelly:spawn_inventory");
    co("}");
  }

  /**
   * Reloads this chect GUI
   */
  reload() {
    this.entity.triggerEvent("despawn");
    this.summon();
  }

  /**
   * Kills this chestGUI and removes all events
   */
  kill(data = null) {
    co("§ckill§f()§r");
    if (data) console.warn(data);
    let suc = false;
    try {
      for (const key in this.events) {
        world.events[key].unsubscribe(this.events[key]);
      }
      delete CURRENT_GUIS[this.player.name];
      delete PAGES["forplayer:" + this.player.name];
      delete PAGES["forrplayer:" + this.player.name];
      const k  = Object.keys(PAGES).find(e=>e.endsWith("::dm::" + this.player.name));
      if (k) 
      delete PAGES[k];
      try {
        this.entity.triggerEvent("despawn");
        suc = true;
      } catch (e) {}
    } catch (error) {
      console.warn(error + error.stack);
    }
    return suc;
  }
  /**
   * Kills this chestGUI and removes all events
   */
  async killa() {
    let suc = false;
    try {
      for (const key in this.events) {
        world.events[key].unsubscribe(this.events[key]);
      }
      delete CURRENT_GUIS[this.player.name];
      if (CURRENT_GUIS[this.player.name]) console.warn("wtf is going on");
      delete PAGES["forplayer:" + this.player.name];
      delete PAGES["forrplayer:" + this.player.name];
      try {
        this.entity.triggerEvent("despawn");
        suc = true;
      } catch (e) {}
    } catch (error) {
      console.warn(error + error.stack);
    }
    await SA.Utilities.time.sleep(10);
    return suc;
  }
  /**
   * Sets a container to specific page
   * @param {Number | String} page page of const PAGES
   */
  setPage(id) {
    /**
     * @type {Page}
     */
    let page = PAGES[id];

    if (!page || page.items.length < 1) {
      return console.warn("Страницы " + id + " нет");
    }
    if (page.fillType == "default") {
      DefaultFill.fill(this.entity, page);
    }
    if (page.fillType == "spec") {
      page = SpecialFill.fill(this.entity, page, this.player);
    }
    if (page.fillType == "shop") {
      page = ShopFill(this.entity, page, this.player);
    }
    if (page.fillType.startsWith("array:")) {
      if (page.fillType.split(":")[1] == "tags")
        page = SpecialFill.FillArray(
          this.entity,
          page,
          this.player,
          this.player
            .getTags()
            .filter((e) => !po.E(e))
            .map((e) => "1(::)" + e),
          "tags",
          null,
          "tag"
        );
      if (page.fillType.split(":")[1] == "text")
        page = SpecialFill.FillArray(
          this.entity,
          page,
          this.player,
          SA.Build.entity
            .getClosetsEntitys(this.player, 10, "f:t", 44, false)
            .map((e) =>
              e.hasTag("lb") ? "2(::)" + e.nameTag : "1(::)" + e.nameTag
            ),
          "text",
          "minecraft:writable_book",
          "redo",
          "minecraft:gold_block",
          "set"
        );
      if (page.fillType.split(":")[1] == "lbs")
        page = SpecialFill.FillArray(
          this.entity,
          page,
          this.player,
          SA.Build.entity
            .getClosetsEntitys(this.player, 10, "f:t", 44, false)
            .filter((e) => e.hasTag("lb"))
            .map((e) => "1(::)" + e.nameTag),
          "text",
          "minecraft:gold_block",
          "lbs"
        );
    }
    this.page = page;
    this.previousMap = this.mapInventory;
    this.entity.nameTag = `size:${page.size}` ?? "size:27";
    // entity.triggerEvent(`size:${page.size}`);
    co("}");
  }

  /**
   * Gets a entitys inventory but with mapped data
   * @returns {Array<MappedInventoryItem>}
   */
  get mapInventory() {
    let container = this.entity.getComponent("inventory").container;
    let inventory = [];

    for (let i = 0; i < container.size; i++) {
      let currentItem = container.getItem(i);

      inventory.push({
        uid: getItemUid(currentItem),
        item: currentItem,
      });
    }

    this.previousMap = inventory;
    return inventory;
  }

  /**
   * This runs when a slot gets changed in the chest inventory
   * @param {SlotChangeReturn} change slot that was changed
   */
  onSlotChange(change, ex) {
    /**
     * The guiItem that was changed
     * @type {import("./Page.js").Item}
     */
    const item = this.page.items[change.slot];
    if (!item) {
      // item was added to page
      /**
       * @type {InventoryComponentContainer}
       */
      this.setPage(
        this.page.id == "lich"
          ? PAGES["forplayer:" + this.player] ?? this.page.id
          : this.page.id
      );
    } else {
      co("On page item id: " + item.type);
      // item was taken from this page
      try {
        // console.warn(`itemStack: ${change.item.id}`);
        // change.item.nameTag = "boiiiiii";
        this.player.runCommand(
          `clear @s ${item.type} ${item.data} ${ex ? ex : item.amount}`
        );
      } catch (error) {
        // the item couldnt be cleared that means
        // they now have a item witch is really BAD
        const q = new EntityQueryOptions();
        (q.type = "minecraft:item"), (q.location = this.player.location);
        q.maxDistance = 2;
        [...this.player.dimension.getEntities(q)].forEach((e) => e.kill());
      }

      // Действия

      let act = (his, item) =>
          SA.Build.chat.broadcast(
            "§c[ChestGUI] §fUnknown action: §r" + item.action
          ),
        ks = Object.keys(STARTACTIONS1),
        res;
      //const res = ks.find((e) => item.action.startsWith(e));
      for (const e of ks) {
        const q = item.action.startsWith(e);
        if (!q) continue;
        res = e;
      }
      if (ACTIONS1[item.action]) act = ACTIONS1[item.action];
      if (res) act = STARTACTIONS1[res];
      act(this, item, change);
    }

    this.previousMap = this.mapInventory;
    co("}");
  }

  /**
   * Runs a item action when its grabbed out of a container
   * @param {string} item item that was grabbed
   * @param {number} slot slot the item was grabbed from
   * @param {ItemStack} itemStack the itemStack that was grabbed
   */
  /*runItemAction(item, slot, itemStack) {

  }*/
}

/**
 * This is a object showing players chestGUI to entity
 * @type {Object<string, ChestGUI2>}
 */
export const CURRENT_GUIS2 = {};

export class ChestGUI2 {
  /**
   * Finds and returns a slot change in a inventory
   * @param {Array<MappedInventoryItem>} oldInv
   * @param {Array<MappedInventoryItem>} newInv
   * @returns {SlotChangeReturn | null}
   */
  static getSlotChange(oldInv, newInv) {
    if (oldInv.length != newInv.length) return null;
    for (let i = 0; i < oldInv.length; i++) {
      if (oldInv[i].uid != newInv[i].uid)
        return { slot: i, item: oldInv[i].item };
    }
    return null;
  }

  /**
   * Creates a new chestGUI and assigns it to a player
   * @param {Player} player the player this chestGUI is asigned to
   * @param {Entity} entity entity to use if undefined will create one
   */
  constructor(player, entity = null) {
    this.player = player;
    this.entity = entity;
    this.previousMap = null;
    /**
     * @type {Page}
     */
    this.page = null;
    if (!this.entity) this.summon();

    this.events = {
      tick: world.events.tick.subscribe(() => {
        try {
          if (this.entity.getComponent("minecraft:health").current <= 0)
            return this.kill();
        } catch (error) {
          this.kill();
        }
        if (SA.Models.entity.getHeldItem(this.player)?.id != GUI_ITEM2)
          return this.kill();

        this.entity.teleport(this.player.location, this.player.dimension, 0, 0);

        if (!this.player.hasTag(`has_container_open`)) return;
        if (!this.previousMap) return;
        const change = ChestGUI2.getSlotChange(
          this.previousMap,
          this.mapInventory
        );
        if (change == null) return;
        this.onSlotChange(change);
      }),
      playerLeave: world.events.playerLeave.subscribe(({ playerName }) => {
        if (playerName != this.player.name) return;
        this.kill();
      }),
    };

    CURRENT_GUIS2[this.player.name] = this;
  }

  /**
   * This spawns a chest GUI entity and sets the this.entity
   */
  summon() {
    SA.Models.world
      .getEntitys(ENTITY_INVENTORY)
      ?.find((e) => e.getTags().includes(`id2:${this.player.name}`))
      ?.triggerEvent("despawn");
    let e = world.events.entityCreate.subscribe((data) => {
      if (data.entity.id == ENTITY_INVENTORY) {
        this.entity = data.entity;
        this.entity.addTag(`id2:${this.player.name}`);
        this.entity.addTag(`gui`);
        this.setPage(DEFAULT_STATIC_PAGE_ID2);
      }
      world.events.entityCreate.unsubscribe(e);
    });
    this.player.triggerEvent("smelly:spawn_inventory");
  }

  /**
   * Reloads this chect GUI
   */
  reload() {
    this.entity.triggerEvent("despawn");
    this.summon();
  }

  /**
   * Kills this chestGUI and removes all events
   */
  kill() {
    try {
      this.entity.triggerEvent("despawn");
      for (const key in this.events) {
        world.events[key].unsubscribe(this.events[key]);
      }
      delete CURRENT_GUIS2[this.player.name];
    } catch (error) {
      console.warn(error + error.stack);
    }
  }

  /**
   * Sets a container to specific page
   * @param {Number | String} page page number its the index of const PAGES
   * @param {String} extras stuff that needs to be passed into this page
   */
  setPage(id, extras = null) {
    /**
     * @type {Page}
     */
    const page = PAGES[id];
    if (!page) SA.Build.chat.broadcast(`Страницы ${id} нет`);
    if (page.fillType == "default") {
      DefaultFill.fill(this.entity, page);
    }

    if (page.fillType == "players") {
      PlayerFill.fill(this.entity, page);
    }
    if (page.fillType == "items") {
      Itemss.fill(this.entity, extras);
    }
    this.page = page;
    this.previousMap = this.mapInventory;
    this.entity.nameTag = `size:${page.size}` ?? "size:27";
    // entity.triggerEvent(`size:${page.size}`);
  }

  /**
   * Gets a entitys inventory but with mapped data
   * @returns {Array<MappedInventoryItem>}
   */
  get mapInventory() {
    let container = this.entity.getComponent("inventory").container;
    let inventory = [];

    for (let i = 0; i < container.size; i++) {
      let currentItem = container.getItem(i);

      inventory.push({
        uid: getItemUid(currentItem),
        item: currentItem,
      });
    }

    this.previousMap = inventory;
    return inventory;
  }

  /**
   * This runs when a slot gets changed in the chest inventory
   * @param {SlotChangeReturn} change slot that was changed
   */
  onSlotChange(change) {
    /**
     * The guiItem that was changed
     * @type {import("./Page.js").Item}
     */
    const item = this.page.items[change.slot];
    if (!item) {
      // item was added to page
      //console.warn('added')
      this.setPage(this.page.id, item);
    } else {
      //console.warn(item.action)
      // item was taken from this page
      try {
        // console.warn(`itemStack: ${change.item.id}`);
        // change.item.nameTag = "boiiiiii";
        this.player.runCommand(
          `clear @s ${item.type} ${item.data} ${item.amount}`
        );
      } catch (error) {
        // the item couldnt be cleared that means
        // they now have a item witch is really BAD
        const q = new EntityQueryOptions();
        (q.type = "minecraft:item"), (q.location = this.player.location);
        q.maxDistance = 2;
        [...this.player.dimension.getEntities(q)].forEach((e) => e.kill());
      }
      this.runItemAction(item, change.slot, change.item);
    }

    this.previousMap = this.mapInventory;
  }

  /**
   * Runs a item action when its grabbed out of a container
   * @param {string} item item that was grabbed
   * @param {number} slot slot the item was grabbed from
   * @param {ItemStack} itemStack the itemStack that was grabbed
   */
  runItemAction(item, slot, itemStack) {
    if (item.action == "give") {
      console.warn("give");
      GiveAction(this, item);
    } else if (item.action.startsWith("page:")) {
      PageAction(this, item);
    } else if (item.action == "give2") {
      console.warn("give2");
      const form = new ActionFormData();
      form.button("Удалить");
      form.button("Оставить");
      form.body("Удалить предмет из базы данных после сбора?");
      form.title("Ответь");
      OpenForm(this, this.player, form, (res) => {
        if (!res.isCanceled) {
          console.warn(res.formValues[0]);
        }
      });
    } else if (item.action.startsWith("command:")) {
      CommandAction(this, item);
    } else if (item.action == "close") {
      CloseAction(this);
    } else if (item.action == "open") {
      const form = new ModalFormData();
      form.title("§l§f" + SA.Utilities.format.clearColors(item.name) + "§r");
      form.textField(
        "Введи значение:",
        "значение",
        wo.Q(SA.Utilities.format.clearColors(item.name))
          ? wo.Q(SA.Utilities.format.clearColors(item.name))
          : undefined
      );
      OpenForm(this, this.player, form, (res) => {
        if (!res.isCanceled) {
          wo.set(SA.Utilities.format.clearColors(item.name), res.formValues[0]);
          SA.Build.chat.broadcast(res.formValues[0]);
        }
      });
    } else if (item.action == "openPlayerMenu") {
      const form = new ModalFormData();
      form.title("§l§f" + SA.Utilities.format.clearColors(item.name) + "§r");
      //form.textField('Введи значение:', 'значение', wo.Q(SA.Utilities.format.clearColors(item.name)) ? wo.Q(SA.Utilities.format.clearColors(item.name)) : undefined)
      form.dropdown(
        "Уровень разрешений:",
        [
          "Участник",
          "§9Модер§r (команды, OP)",
          "§6Админ§r (команды, OP, настройки)",
        ],
        SA.Build.entity.getScore(
          SA.Build.entity.fetch(SA.Utilities.format.clearColors(item.name)),
          "perm"
        )
      );
      OpenForm(this, this.player, form, (res) => {
        if (!res.isCanceled) {
          switch (res.formValues[0]) {
            case 0:
              /**
               * @type {Array<String>}
               */
              let list1 = wo.Q("perm:владельцы").split(", ");
              let list2 = wo.Q("perm:модеры").split(", ");
              let list11 = [];
              let list22 = [];
              list1.forEach((e) => {
                if (e != SA.Utilities.format.clearColors(item.name))
                  list11.push(e);
              });
              list2.forEach((e) => {
                if (e != SA.Utilities.format.clearColors(item.name))
                  list22.push(e);
              });
              wo.set("perm:владельцы", list11.join(", "));
              wo.set("perm:модеры", list22.join(", "));
              SA.Build.chat.broadcast(
                `► ${SA.Utilities.format.clearColors(
                  item.name
                )} теперь обычный игрок`
              );
              break;
            case 1:
              let ist1 = wo.Q("perm:владельцы").split(", ");
              let ist2 = wo.Q("perm:модеры").split(", ");
              ist2.push(SA.Utilities.format.clearColors(item.name));
              let ist11 = [];
              ist1.forEach((e) => {
                if (e != SA.Utilities.format.clearColors(item.name))
                  ist11.push(e);
              });
              wo.set("perm:владельцы", ist11.join(", "));
              wo.set("perm:модеры", ist2.join(", "));
              SA.Build.chat.broadcast(
                `§9►§f ${SA.Utilities.format.clearColors(
                  item.name
                )} назначен §9Модером`
              );
              break;
            case 2:
              let st1 = wo.Q("perm:владельцы").split(", ");

              st1.push(SA.Utilities.format.clearColors(item.name));

              let st2 = wo.Q("perm:модеры").split(", ");

              let st22 = [];

              st2.forEach((e) => {
                if (e != SA.Utilities.format.clearColors(item.name))
                  st22.push(e);
              });

              wo.set("perm:владельцы", st1.join(", "));

              wo.set("perm:модеры", st22.join(", "));

              SA.Build.chat.broadcast(
                `§6►§f ${SA.Utilities.format.clearColors(
                  item.name
                )} назначен §6Админом`
              );
              break;
          }
        }
        SA.Build.chat.broadcast(res.formValues);
      });
    } else if (item.action == "set") {
      SetAction(this, item, slot, itemStack);
    } else if (item.action.startsWith("change")) {
      ChangeAction(this, item, slot);
    } else if (item.action.startsWith("sc:")) {
      let a = item.action.split(":")[1];
      if (a == "clear") {
        light_db.reset();
        let count = 0;
        for (let item of this.mapInventory) {
          if (wo.E(SA.Utilities.format.clearColors(item.item.nameTag)).text) {
            count++;
            if (count >= WORLDOPTIONS.length) break;
            continue;
          }
          let nei = {
            lore: item.item.getLore(),
            name: item.item.nameTag,
          };
          SetAction(
            this,
            nei,
            count,
            new ItemStack(
              MinecraftItemTypes.redCandle,
              item.item.amount,
              item.item.data
            )
          );
          auxa.createItem(
            count,
            "minecraft:red_candle",
            item.item.amount,
            item.item.data,
            "change",
            item.item.nameTag,
            item.item.getLore()
          );
          count++;
          if (count >= WORLDOPTIONS.length) break;
        }
      }
      if (a == "clear0") light_db.reset0();
      SetAction(this, item, slot, itemStack);
    }
  }
}
