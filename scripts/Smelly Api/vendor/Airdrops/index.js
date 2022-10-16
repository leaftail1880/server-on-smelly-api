import {
  Enchantment,
  EnchantmentList,
  Items,
  ItemStack,
  ItemType,
  MinecraftEnchantmentTypes,
  MinecraftItemTypes,
  world,
  BlockLocation,
  Location,
  MinecraftEffectTypes,
} from "mojang-minecraft";
import { EntityQueryOptions } from "../../app/Models/EntityQueryOptions.js";
import { SA } from "../../index.js";

export function rd(max, min = 0, msg) {
  if (max == min || max < min) return max;

  const rd = Math.round(min + Math.random() * (max - min));
  if (msg) SA.Build.chat.broadcast(msg + "\nmax: " + max + " min: " + min + " rd: " + rd);
  return rd;
}

export class airdrope {
  /**
   *
   * @param {Number} posx
   * @param {Number} posz
   * @param {Number} loot_tier
   * @returns
   */
  constructor(posx, posz, loot_tier = 0) {
    if (loot_tier > 3 || loot_tier < 0)
      return new Error("[airdrop] Тир большой");
    this.x = posx;
    this.z = posz;
    /**
     * @type {Array<ItemStack>}
     */
    this.loot = this.getTable(loot_tier);
    this.summon();
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  spread(arr) {
    for (let i = 0; i <= arr.length; i++) {
      if (
        arr[i]?.amount > 3 &&
        arr.filter((e) => e == "air").length >
          arr.filter((e) => e != "air").length
      ) {
        let c = arr.filter((e) => e == "air").length,
          cc = 0,
          j;
        for (const [ii, el] of arr.entries()) {
          if (el != "air") continue;
          if (c > cc && Math.round(Math.random())) continue;
          j = ii;
          break;
        }
        const mi = rd(arr[i].amount, 1);
        arr[j] = {};
        Object.assign(arr[j], arr[i]);
        const am = arr[i].amount;
        arr[i].amount = am - mi;
        arr[j].amount = arr[j].amount - arr[i].amount;
      }
    }
  }
  getTable(t) {
    /**
     * @type {Array<ItemStack>}
     */
    let array = SA.tables.drops.get("drop:" + rd(t, 1));
    if (!array) throw new Error(t);
    for (let o = 0; o <= 26 - array.length; o++) {
      array.push("air");
    }
    this.shuffle(array);
    this.spread(array);
    this.spread(array);
    this.spread(array);
    this.spread(array);
    return array;
  }
  summon() {
    let y,
      x,
      z,
      C = 0;
    while (!y && C < 30) {
      C++;
      x = rd(this.x + 10, this.x - 10);
      z = rd(this.z + 10, this.z - 10);
      let ac = 0;
      for (let v = 62; v <= 320; v++) {
        const b = world
          .getDimension("overworld")
          .getBlock(new BlockLocation(x, v, z));
        if (b.id == "minecraft:air") {
          ac++;
          if (ac < 100) continue;
          y = v;
          break;
        }
      }
    }
    const ent = world
      .getDimension("overworld")
      .spawnEntity("minecraft:chest_minecart", new Location(x, y, z));
    const inv = SA.Build.entity.getI(ent);
    for (let i = 0; i < inv.size; i++) {
      const n = this.loot[i];
      if (!n || n == "air") continue;
      const count = rd(n.amount, Number(n.lore[0]));
      if (count == 0) continue;
      let it = new ItemStack(Items.get(n.id), count, n.data);
      if (n.lore[1]) {
        /**
         * @type {EnchantmentList}
         */
        let ench = it.getComponent("enchantments").enchantments;
        let enc = 0,
          lvl = 0;
        for (let e of this.shuffle(Object.values(MinecraftEnchantmentTypes))) {
          lvl = Number(n.lore[2]);
          if (lvl > e.maxLevel) lvl = e.maxLevel;
          if (ench.canAddEnchantment(new Enchantment(e, Number(lvl)))) {
            if (enc >= n.lore[4]) break;
            if (enc >= n.lore[3]) {
              if (Math.round(Math.random())) {
                const l = rd(lvl, Number(n.lore[1]));
                if (l < 1) continue;
                ench.addEnchantment(new Enchantment(e, l));
              }
            } else {
              const l = rd(lvl, Number(n.lore[1]));
              if (l < 1) continue;
              ench.addEnchantment(new Enchantment(e, l));
            }
            enc++;
          }
        }
        it.getComponent("enchantments").enchantments = ench;
      }
      inv.setItem(i, it);
    }
    const chicken = world
      .getDimension("overworld")
      .spawnEntity("minecraft:chicken<drop>", new Location(x, y + 3, z));
    chicken.addEffect(MinecraftEffectTypes.slowFalling, 500, 2, false);
    chicken.addEffect(MinecraftEffectTypes.resistance, 500, 255, false);
    const date = Date.now();
    chicken.addTag("держит_эирдроп_номер:" + date);
    chicken.addTag("держит");
    ent.addTag("держится_за_номер:" + date);
    ent.addTag("держится");
  }
}
const q = new EntityQueryOptions();
q.tags = ["держит"];
q.type = "minecraft:chicken";
const qq = new EntityQueryOptions();
qq.maxDistance = 20;

SA.Utilities.time.setTickInterval(() => {
  for (const ent of world.getDimension("overworld").getEntities(q)) {
    if (!SA.Build.entity.getTagStartsWith(ent, "держит_эирдроп_номер:"))
      return ent.removeTag("держит");
    qq.location = ent.location;
    qq.tags = [
      "держится_за_номер:" +
        SA.Build.entity.getTagStartsWith(ent, "держит_эирдроп_номер:"),
    ];
    const cl = ent.dimension.getEntities(qq);
    if (!cl) return ent.removeTag("держит");
    const block = ent.dimension.getBlock(
      SA.Build.entity.locationToBlockLocation(
        new Location(ent.location.x, ent.location.y - 4, ent.location.z)
      )
    );
    const block2 = ent.dimension.getBlock(
      SA.Build.entity.locationToBlockLocation(
        new Location(ent.location.x, ent.location.y - 1, ent.location.z)
      )
    );
    if (block2.id != "minecraft:air") {
      SA.Build.entity.despawn(ent);
      continue;
    }
    for (const clo of cl) {
      if (block.id == "minecraft:air")
        clo.teleport(
          new Location(ent.location.x, ent.location.y - 3, ent.location.z),
          ent.dimension,
          clo.rotation.x,
          clo.rotation.y
        );
      break;
    }
  }
}, 0, 'airdropes');

const kit = new SA.Command(
  {
    name: "drop",
    description: "Управление таблицами дропа",
    tags: ["commands"],
  },
  (ctx) => {
    new airdrope(
      Math.floor(ctx.sender.location.x),
      Math.floor(ctx.sender.location.z),
      ctx.args[0]
    );
  }
);

kit
  .addSubCommand({
    name: "item",
    description: "Опции предмета",
    tags: ["commands"],
  })
  .addOption("mincount", "int")
  .addOption("ench", "boolean", "", true)
  .addOption("maxenchlvl", "int", "", true)
  .addOption("minenchlvl", "int", "", true)

  .addOption("minenchcount", "int", "", true)
  .addOption("maxenchcount", "int", "", true)
  .executes(
    (
      ctx,
      { mincount, maxenchlvl, minenchlvl, maxenchcount, minenchcount, ench }
    ) => {
      let item = SA.Build.entity.getHeldItem(ctx.sender),
        oldtag = item.getLore(),
        lore = [mincount + ""];

      if (ench) {
        [
          minenchlvl + "",
          maxenchlvl + "",
          minenchcount + "",
          maxenchcount + "",
        ].forEach((e) => lore.push(e));
      }
      item.setLore(lore);
      ctx.sender
        .getComponent("minecraft:inventory")
        .container.setItem(ctx.sender.selectedSlot, item);
      ctx.reply(`§a► §f${oldtag ?? ""} ► ${item.getLore()}§r`);
    }
  );

kit
  .addSubCommand({ name: "add", description: "Добавляет", tags: ["commands"] })
  .addOption("number", "int", "")
  .executes((ctx, { number }) => {
    if (number > 3 || number < 0) return ctx.reply("§сМн");
    const wb = ctx.sender.dimension.getBlock(
      new BlockLocation(
        Math.floor(ctx.sender.location.x),
        Math.floor(ctx.sender.location.y),
        Math.floor(ctx.sender.location.z)
      )
    );
    const b = wb.getComponent("inventory")?.container;
    if (!b)
      return ctx.reply("§cВстань на сундук с дропом! (блок: " + wb.id + ")");
    let inv = [];
    for (let i = 0; i < b.size; i++) {
      /**
       * @type {ItemStack}
       */
      const item = b.getItem(i);
      if (item)
        inv.push({
          id: item.id,
          amount: item.amount,
          data: item.data,
          name: item.name ?? " ",
          lore: item.getLore(),
        });
    }
    ctx.reply(
      `§fДобавлен  дроп с такими предметами:\n  §7` +
        SA.Utilities.format.stringifyEx(inv, " ")
    );
    SA.tables.drops.set("drop:" + number, inv);
  });

kit
  .addSubCommand({ name: "del", description: "ДЦт", tags: ["commands"] })
  .addOption("number", "string", "")
  .executes((ctx, { number }) => {
    const n = SA.tables.drops.keys().find((e) => e.endsWith(number));
    if (!n)
      return ctx.reply(
        `§cАирдропа с номером '§f${number}§c' не существует. \n§fДоступные дропы: \n  §7` +
          SA.tables.drops.keys().join("\n  ")
      );
    ctx.reply(`§7Удален дроп с таким названием: §6${n}`); //§r
    SA.tables.drops.delete(n);
  });
kit
  .addSubCommand({ name: "red", description: "Редактирует кит" })
  .addOption("name", "int", "")
  .executes((ctx, { name }) => {
    const kits = SA.tables.drops.keys();
    if (kits.length < 1) return ctx.reply("§cНет дропов");
    const n = kits.find((e) => e.split(":")[1].endsWith(name));
    if (!n)
      return ctx.reply(
        `§cДропа с номером '§f${name}§c' не существует. \n§fДоступные дропы: \n  §7` +
          SA.tables.drops.keys().join("\n  ")
      );
    const kit = SA.tables.drops.get(n);
    ctx.sender.runCommand("setblock ~~~ chest");
    /** * @type {BlockInventoryComponentContainer} */ const inv =
      ctx.sender.dimension
        .getBlock(SA.Build.entity.locationToBlockLocation(ctx.sender.location))
        .getComponent("inventory").container;
    for (const [i, k] of kit.entries()) {
      const st = new ItemStack(
        Items.get(k.id),
        k.amount,
        k.data
      );
      if (k.name) st.nameTag = k.name
      if (k.lore) st.setLore(k.lore)
      inv.setItem(i, st);
    }
    ctx.reply(
      `§7Редактирование кита §6${name}§7! Когда закончишь, встань на сундук и пропиши §f-drop add ${name}`
    );
  });
