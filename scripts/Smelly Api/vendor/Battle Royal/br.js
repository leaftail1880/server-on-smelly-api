import {
  BlockInventoryComponentContainer,
  BlockLocation,
  EntityQueryOptions,
  ItemStack,
  Location,
  MinecraftBlockTypes,
  MinecraftItemTypes,
  Player,
  world,
} from "mojang-minecraft";
import { wo } from "../../app/Models/Options.js";
import { SA } from "../../index.js";
import { rd } from "../Airdrops/index.js";
import { Atp } from "../Portals/index.js";
import { LootChest } from "./loot.js";
import { rtp } from "./rtp.js";
import { zone } from "./zone.js";

class BattleRoyal {
  constructor() {
    /**
     * @type {Array<Player>}
     */
    this.players = [];
    this.reward = 0;
    this.pos = { x: 256, z: 256 };
    this.time = {
      min: 0,
      sec: 0,
      tick: 20,
    };
    this.game = {
      started: false,
      rad: 0,
      startrad: 0,
      minrad: 0,
    };
    this.center = {
      x: 0,
      z: 0,
    };
    this.quene = {
      open: false,
      time: 0,
    };
    this.events = {};
    this.tags = ["lockpvp:br", "locktp:br", "br:alive", "br:inGame"];
  }
  async waitToRespawn(name, event) {
    let C = 0;
    while (SA.Build.chat.runCommand("testfor " + name)?.error && C < 100) {
      await SA.Utilities.time.sleep(5);
      C++;
    }
    SA.Exceptions.E.triggerEvent(event, {
      player: SA.Build.entity.fetch(name),
    });
  }

  //СТАРТ

  start(players) {
    try {
      // Ресет
      this.quene.open = false;
      this.quene.time = 0;
      // Варн
      if (!wo.Q("br:gamepos") || !wo.Q("br:time"))
        return this.end(
          "error",
          "§cТребуемые для запуска значения (br:time, br:gamepos) не выставлены."
        );
      // Значения из настроек
      this.time.min = Number(wo.Q("br:time").split(":")[0]);
      this.time.sec = Number(wo.Q("br:time").split(":")[1]);
      this.pos.z = Number(wo.Q("br:gamepos").split(" ")[1]);
      this.pos.x = Number(wo.Q("br:gamepos").split(" ")[0]);
      this.game.started = true;
      this.reward = 0;

      // Значения, зависящие от кол-ва игроков
      /**
       * @type {Array<String>}
       */
      const a = players.filter((e) => SA.Build.entity.fetch(e));
      if (a.length < 1) {
        return this.end("error", "§cЗапуск без игроков невозможен");
      }
      a.forEach(
        () => (
          (this.reward = this.reward + 100),
          (this.game.rad = Math.min(this.game.rad + 60, 128)),
          (this.game.startrad = this.game.rad),
          (this.game.minrad = Math.min(this.game.minrad + 15, 40))
        )
      );

      // Центр
      this.center.z = rd(
        this.pos.z + 128 + 50,
        this.pos.z + 128 - 50,
        "centerZ"
      );
      this.center.x = rd(
        this.pos.x + 128 + 50,
        this.pos.x + 128 - 50,
        "centerX"
      );

      /** Сундуки (для удаления в будущем)
       * @type {Array<String>}
       */
      let chest = [];
      let poses = [];
      let debug = false;
      if (debug) {
        SA.Build.chat.broadcast(
          `Pos1: ${this.pos.x} ${this.pos.z}\nCenter: ${this.center.x} ${
            this.center.z
          }\nPos2: ${this.pos.x + 256} ${this.pos.z + 256}`
        );
      }

      // Для каждого игрока
      for (const e of a) {
        // Тэги
        const p = SA.Build.entity.fetch(e);
        this.tags.forEach((e) => p.addTag(e));

        // Список
        this.players.push(p);

        // Инфо
        SA.Build.chat.broadcast(
          SA.Lang.lang["br.start"](
            this.reward,
            players.join("§r, "),
            this.game.rad
          ),
          e
        );

        // Очистка, звук
        try {
          p.runCommand("clear @s");
        } catch (error) {}
        p.playSound("note.pling");

        // Ртп
        const pos = rtp(
          p,
          this.center.x,
          this.center.z,
          this.game.rad - 15,
          this.game.rad - 30,
          poses
        );
        poses.push(pos);
        SA.Build.chat.runCommand(
          `kill @e[x=${pos.x},z=${pos.z},y=${pos.y},r=100,type=item]`
        );

        //Стартовый сундук
        // const ps = new LootChest(pos.x, pos.z, 0, 10).pos;
        // if (ps) chest.push(ps);
      }

      SA.tables.chests.set("br:" + Date.now(), chest);
      this.events = {
        tick: world.events.tick.subscribe(() => {
          //Таймер
          this.time.tick--;
          if (this.time.tick <= 0) {
            this.time.sec--, (this.time.tick = 20);
            for (const val of SA.tables.chests.values()) {
              for (const pos of val) {
                SA.Build.chat.runCommand(
                  `particle minecraft:campfire_smoke_particle ${pos}`
                );
              }
            }
          }
          //   if (this.time.min == 14 && this.time.sec == 50 && sp ) {
          //       sp = false
          // //Средние сундуки
          // for (let c = 0; c <= a.length * 60; c++) {
          //   let x = rd(
          //       this.center.x + this.game.rad,
          //       this.center.x + this.game.minrad
          //     ),
          //     z = rd(
          //       this.center.z + this.game.rad,
          //       this.center.z + this.game.minrad
          //     );
          //   if (Math.round(Math.random())) x = !x;
          //   if (Math.round(Math.random())) z = !z;
          //   const pos = new LootChest(x, z, 1, 0).pos;
          //   if (pos) chest.push(pos);
          // }

          // let cc = 0
          // //Топовые сундуки
          // for (let c = 0; c <= a.length * 3; c++) {
          //   const pos = new LootChest(
          //     this.center.x,
          //     this.center.z,
          //     2,
          //     this.game.minrad
          //   ).pos;
          //   if (pos) chest.push(pos);
          //   if (pos) cc++
          // }
          // console.warn(chest.length);
          // console.warn(cc);
          //     }
          if (this.time.sec <= 0) this.time.min--, (this.time.sec = 59);

          //Зона
          for (const p of world.getPlayers()) {
            const rmax = new BlockLocation(
                this.center.x + this.game.rad,
                0,
                this.center.z + this.game.rad
              ),
              rmin = new BlockLocation(
                this.center.x - this.game.rad,
                0,
                this.center.z - this.game.rad
              );
            const l = SA.Build.entity.locationToBlockLocation(p.location);
            if (
              l.x >= rmax.x &&
              l.x <= rmax.x + 10 &&
              l.z <= rmax.z &&
              l.z >= rmin.z
            )
              zone.ret(p, true, rmax);
            if (
              l.x >= rmax.x - 10 &&
              l.x <= rmax.x &&
              l.z <= rmax.z &&
              l.z >= rmin.z
            )
              zone.pret(p, true, rmax);

            if (
              l.z >= rmax.z &&
              l.z <= rmax.z + 10 &&
              l.x <= rmax.x &&
              l.x >= rmin.x
            )
              zone.ret(p, false, rmax);
            if (
              l.z >= rmax.z - 10 &&
              l.z <= rmax.z &&
              l.x <= rmax.x &&
              l.x >= rmin.x
            )
              zone.pret(p, false, rmax);

            if (
              l.x <= rmin.x &&
              l.x >= rmin.x - 10 &&
              l.z <= rmax.z &&
              l.z >= rmin.z
            )
              zone.ret(p, true, rmin, true);
            if (
              l.x <= rmin.x + 10 &&
              l.x >= rmin.x &&
              l.z <= rmax.z &&
              l.z >= rmin.z
            )
              zone.pret(p, true, rmin, true);

            if (
              l.z <= rmin.z &&
              l.z >= rmin.z - 10 &&
              l.x <= rmax.x &&
              l.x >= rmin.x
            )
              zone.ret(p, false, rmin, true);
            if (
              l.z <= rmin.z + 10 &&
              l.z >= rmin.z &&
              l.x <= rmax.x &&
              l.x >= rmin.x
            )
              zone.pret(p, false, rmin, true);
          }

          //Отображение таймера и игроков
          SA.Build.chat.runCommand(
            `title @a[tag="br:inGame"] actionbar §6${
              this.players.filter((e) => e.hasTag("br:alive")).length
            } §g○ §6${this.time.min}:${
              `${this.time.sec}`.length < 2
                ? `0${this.time.sec}`
                : this.time.sec
            } §g○ §6${this.game.rad}`
          );

          //Конец игры
          if (this.time.min <= -1) this.end("time");
          if (this.players.filter((e) => e.hasTag("br:alive")).length <= 1)
            this.end(
              "last",
              this.players.find((e) => e && e.hasTag("br:alive"))
            );
        }),
        playerLeave: world.events.playerLeave.subscribe((pl) => {
          if (this.players.find((e) => e.name == pl.playerName))
            delete this.players[pl.playerName];
        }),
        beforeDataDrivenEntityTriggerEvent:
          world.events.beforeDataDrivenEntityTriggerEvent.subscribe((data) => {
            if (
              data.id != "binocraft:on_death" ||
              !data.entity.hasTag("br:alive")
            )
              return;
            this.tags.forEach((e) => data.entity.removeTag(e));
            this.waitToRespawn(data.entity.name, "br:ded");
          }),
        buttonPush: world.events.buttonPush.subscribe((data) => {
          if (!data.source.hasTag("br:alive")) return;
          const block = data.dimension.getBlock(
            block.location.offset(0, -1, 0)
          );
          if (block.id != "minecraft:barrel") return;
          const id = `${block.location.x} ${block.location.y} ${block.location.z}`;
          if (SA.tables.chests.get(id)) return;
          SA.tables.chests.set(id, true);
          LootChest.set(
            block.getComponent("inventory").container,
            LootChest.getTable(1)
          );
          SA.Build.chat.debug(
            [`title @s title §r`, `title @s subtitle Открыто.`],
            data.source
          );
        }),
      };
    } catch (e) {
      this.end("error", e);
    }
  }

  /**
   *
   * @param {String} reason
   * @param {*} ex
   */
  end(reason, ex) {
    this.game.started = false;
    //Причины и соответствующие выводы
    if (reason == "time") {
      this.players.forEach((e) => {
        SA.Build.chat.broadcast(
          SA.Lang.lang["br.end.time"](
            this.players
              .filter((e) => e.hasTag("br:alive"))
              .map((e) => e.name)
              .join("§r, ")
          ),
          e.name
        );
      });
    }
    if (reason == "error") {
      SA.Build.chat.broadcast(
        `§cБатл рояль> §c\n${ex} ${ex.stack ? "" : `\n§f${ex.stack}`}`
      );
    }
    if (reason == "specially") {
      SA.Build.chat.broadcast(SA.Lang.lang["br.end.spec"](ex));
    }
    if (reason == "last") {
      /**
       * @type {Player}
       */
      const winner = ex;
      if (typeof winner == "object" && SA.Build.entity.fetch(winner.name)) {
        SA.Build.chat.broadcast(
          SA.Lang.lang["br.end.winner"](this.reward),
          winner.name
        );
        SA.Build.chat.runCommand(`title "${winner.name}" title §6Ты победил!`);
        SA.Build.chat.runCommand(
          `title "${winner.name}" subtitle §gНаграда: §f${this.reward} §gмонет`
        );
        this.players
          .filter((e) => e.name != winner.name)
          .forEach((e) => {
            SA.Build.chat.broadcast(
              SA.Lang.lang["br.end.looser"](winner.name, this.reward),
              e.name
            );
          });
      } else {
        this.players.forEach((e) => {
          SA.Build.chat.broadcast(SA.Lang.lang["br.end.draw"], e.name);
        });
      }
    }

    //Общие функции конца

    for (const e of world.getPlayers()) {
      // Eсли у игрока был хоть один тэг из батл рояля - он играл.

      let ingame = false;
      this.tags.forEach((t) => {
        if (e.removeTag(t)) ingame = true;
      });
      // Если играл нужно его вернуть на спавн батл рояля
      if (ingame) Atp(e, "br", true, true, true, true);
    }
    for (const key of Object.keys(this.events)) {
      world.events[key].unsubscribe(this.events[key]);
    }
    // Чепуха
    // SA.tables.chests.values().forEach((e) => {
    //   for (const p of e) {
    //     if (typeof p == "string") {
    //       const loc = new BlockLocation(
    //         Number(p.split(" ")[0]),
    //         Number(p.split(" ")[1]),
    //         Number(p.split(" ")[2])
    //       );
    //       world
    //         .getDimension("overworld")
    //         .getBlock(loc)
    //         .setType(MinecraftBlockTypes.air);
    //       const q = new EntityQueryOptions();
    //       (q.type = "minecraft:item"),
    //         (q.location = new Location(loc.x, loc.y, loc.z));
    //       q.maxDistance = 2;
    //       [...world.getDimension("overworld").getEntities(q)].forEach((e) =>
    //         e.kill()
    //       );
    //     }
    //   }
    // });

    //Альтернативная чепуха
    SA.tables.chests.clear()

    const q = new EntityQueryOptions();
    q.type = "minecraft:item";
    for (const p of world.getDimension("overworld").getEntities(q)) {
      const rmax = new BlockLocation(
          this.center.x + this.game.startrad,
          0,
          this.center.z + this.game.startrad
        ),
        rmin = new BlockLocation(
          this.center.x - this.game.startrad,
          0,
          this.center.z - this.game.startrad
        );
      const l = SA.Build.entity.locationToBlockLocation(p.location);
      if (l.z <= rmin.z && l.x <= rmin.x && l.x <= rmax.x && l.x >= rmin.x)
        p.kill();
    }
    // SA.tables.chests.keys().forEach((e) => {
    //   const l = e.split(" ").map((e) => Number(e));
    //   /**
    //    * @type {BlockInventoryComponentContainer}
    //    */
    //   const inv = world
    //     .getDimension("overworld")
    //     .getBlock(new BlockLocation(l[0], l[1], l[2]))
    //     .getComponent("inventory").container;
    //   for (let i = 0; i <= inv.size; i++) {
    //     inv.setItem(i, new ItemStack(MinecraftItemTypes.air, 1, 0));
    //   }
    //   SA.tables.chests.set(e, false);
    // });
    this.players = [];
    this.reward = 0;
    this.pos = { x: 256, z: 256 };
    this.time = {
      min: 0,
      sec: 0,
      tick: 20,
    };
    this.game = {
      started: false,
      rad: 0,
      minrad: 0,
    };
    this.center = {
      x: 0,
      z: 0,
    };
    this.quene = {
      open: false,
      time: 0,
    };
    this.events = {};
    this.tags = ["lockpvp:br", "locktp:br", "br:alive", "br:inGame"];
  }
}

export const br = new BattleRoyal();
