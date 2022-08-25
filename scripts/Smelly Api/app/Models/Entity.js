import {
  world,
  BlockLocation,
  EntityQueryOptions,
  Entity,
  Location,
  ItemStack,
  Player,
  PlayerInventoryComponentContainer,
} from "mojang-minecraft";
import { SHAPES } from "../../vendor/World Edit/modules/definitions/shapes.js";

export function getPlace(place, text) {
  //Place, prefix symbol color, rotation
  let P, C, rot;
  if (place == "anarch") (P = "§cАнархия"), (C = "4")
  if (place == "spawn") (P = "§aСпавн"), (C = "2"), (rot = "0 0");
  if (place == "br") (P = "§6Батл рояль"), (C = "e"), (rot = "0 0");
  if (place == "minigames" || place == "currentpos")
    (P = "§dМиниигры§r"), (C = "5"), (rot = "0 0");
  if (!P) (P = place), (C = text);
  return {P, C, rot}
}

export class EntityBuilder {
  /**
   * Get entitie(s) at a position
   * @param {number} x X position of the entity
   * @param {number} y Y position of the entity
   * @param {number} z Z position of the entity
   * @param {String} dimension Dimesion of the entity
   * @returns {Array<Entity>}
   * @example EntityBuilder.getEntityAtPos({0, 5, 0} 'nether');
   */
  getAtPos({ x, y, z }, dimension = "overworld") {
    try {
      return world
        .getDimension(dimension)
        .getEntitiesAtBlockLocation(new BlockLocation(x, y, z));
    } catch (error) {
      return [];
    }
  }
  /**
   * Returns a location of the inputed aguments
   * @param {Entity} entity your using
   * @param {number} n how many you want to get
   * @param {number} maxDistance max distance away
   * @param {String} type type of entity you want to get
   * @returns {Array<Entity>}
   * @example getClosetsEntitys(Entity, n=1, maxDistance = 10, type = Entity.type)
   */
  getCClosetsEntitys(
    entity,
    maxDistance = null,
    ex = null,
    type = false,
    n = 2
  ) {
    let q = new EntityQueryOptions();
    q.location = entity.location;
    if (n) q.closest = n;
    if (type) q.type = type;
    if (ex) q.excludeTypes = ex;
    if (maxDistance) q.maxDistance = maxDistance;
    let entitys = [...world.getDimension("overworld").getEntities(q)];
    return entitys;
  }
  /**
   * Returns a location of the inputed aguments
   * @param {Entity} entity your using
   * @param {number} n how many you want to get
   * @param {number} maxDistance max distance away
   * @param {String} type type of entity you want to get
   * @returns {Array<Entity>}
   * @example getClosetsEntitys(Entity, n=1, maxDistance = 10, type = Entity.type)
   */
  getClosetsEntitys(
    entity,
    maxDistance = null,
    type = false,
    n = 2,
    shift = true
  ) {
    let q = new EntityQueryOptions();
    q.location = entity.location;
    if (n) q.closest = n;
    if (type) q.type = type;

    if (maxDistance) q.maxDistance = maxDistance;
    let entitys = [...world.getDimension("overworld").getEntities(q)];
    if (shift) entitys.shift();
    return entitys;
  }
  /**
   * Returns a location of the inputed aguments
   * @param {Entity} entity your using
   * @param {string} value what you want to search for
   * @example getTagStartsWith(Entity, "stuff:")
   */
  getTagStartsWith(entity, value) {
    const tags = entity.getTags();
    if (tags.length === 0) return null;
    const tag = tags.find((tag) => tag.startsWith(value));
    if (!tag) return null;
    if (tag.length < value.length) return null;
    return tag.substring(value.length);
  }
  /**
   * Returns a location of the inputed aguments
   * @param {Entity} entity your using
   * @param {string} value what you want to search for
   * @example getTagStartsWith(Entity, "stuff:")
   */
  removeTagsStartsWith(entity, value) {
    const tags = entity.getTags();
    if (tags.length === 0) return null;
    tags.forEach((tag) => (tag.startsWith(value) ? entity.removeTag(tag) : ""));
  }
  /**
   * Get score of an entity
   * @param {Entity} entity you want to test
   * @param {string} objective Objective name you want to search
   * @returns {number} 0
   * @example getScore(Entity, 'Money');
   */
  getScore(entity, objective) {
    try {
      const command = entity.runCommand(
        `scoreboard players test @s "${objective}" * *`
      );
      return parseInt(String(command.statusMessage?.split(" ")[1]), 10);
    } catch (error) {
      return 0;
    }
  }
  /**
   * Gets the entitys dimension
   * @param {Entity} entity entity you want to search
   * @returns "overworld" | "the end" | "nether"
   * @example getDimension('Smell of curry');
   */
  getDimension(entity) {
    for (const dimension of ["overworld", "nether", "the end"]) {
      if (entity.dimension == world.getDimension(dimension)) return dimension;
    }
    return "overworld";
  }
  /**
   * Tests if a entity is dead
   * @param {Entity} entity entity you want to test
   * @returns {Boolean}
   * @example isDead(Entity);
   */
  isDead(entity) {
    return (
      entity.hasComponent("minecraft:health") &&
      entity.getComponent("minecraft:health").current <= 0
    );
  }
  /**
   * Gets the name of a entity after : in id
   * @param {String} entityName entity you want to test
   * @returns {String}
   * @example getGenericName(Entity);
   */
  getGenericName(entityName) {
    return entityName.split(":")[1].replace(/_/g, " ");
  }
  /**
   * Gets the inventory of a entity
   * @param {Entity} entity entity you want to get
   * @returns {Array<ItemStack>}
   * @example getGenericName(Entity);
   */
  getInventory(entity) {
    const inventory = entity.getComponent("minecraft:inventory").container;
    let items = [];
    for (let i = 0; i < inventory.size; i++) {
      items.push(
        inventory.getItem(i) ?? { id: "minecraft:air", amount: 0, data: 0 }
      );
    }
    return items;
  }
  /**
   * Gets the inventory of a entity
   * @param {Entity} entity entity you want to get
   * @returns {Number}
   */
  getItemsCount(entity, id) {
    const inventory = entity.getComponent("minecraft:inventory").container;
    let count = 0;
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item) continue;
      if (item.id == id) count = count + item.amount;
    }
    return count;
  }
  /**
   * Gets the inventory of a entity
   * @param {Entity} entity entity you want to get
   * @returns {Number}
   */
  getItemsCountClear(entity, id) {
    const count = entity
      .runCommand(`clear @s ${id}`)
      .statusMessage.split(": ")[1]
      .replace(/\D/gi, "");
    entity.runCommand(`give @s ${id} ${count}`);
    return count;
  }
  /**
   * Gets the inventory of a entity
   * @param {Entity} entity entity you want to get
   * @returns {Number}
   */
  itemsCountClear(entity, id, count) {
    const countt = entity
      .runCommand(`clear @s ${id} -1 ${count}`)
      .statusMessage.split(": ")[1]
      .replace(/\D/gi, "");
    return countt;
  }
  /**
   *
   * @param {Player} entity
   * @param {String} location armor | armor.chest | armor.feet | armor.legs | slot.enderchest | weapon.mainhand | weapon.offhand
   * @param {*} itemId
   * @returns
   */
  hasItem(entity, location, itemId) {
    try {
      entity.runCommand(
        `testfor @s[hasitem={location=slot.${location},item=${itemId}}]`
      );
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   *
   * @param {Player} entity
   * @param {*} itemId
   * @returns
   */
  hasItemm(entity, itemId) {
    try {
      entity.runCommand(`testfor @s[hasitem={item=${itemId}}]`);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * Gets the inventory of a entity
   * @param {Entity} entity entity you want to get
   * @returns {PlayerInventoryComponentContainer}
   * @example getGenericName(Entity);
   */
  getI(entity) {
    return entity.getComponent("minecraft:inventory").container;
  }
  /**
   * Gets a players held item
   * @param {Player} player player you want to get
   * @returns {Array<ItemStack, Number>}
   */
  findItem(entity, id, loreFirst = null) {
    const inventory = entity.getComponent("minecraft:inventory").container;
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item || item.id != id) continue;
      if (loreFirst && item.getLore()[0] != loreFirst) continue;
      return [item, i];
    }
  }
  /**
   * Gets a players held item
   * @param {Player} player player you want to get
   * @returns {ItemStack}
   * @example getHeldItem(Player);
   */
  getHeldItem(player) {
    try {
      const inventory = player.getComponent("minecraft:inventory").container;
      return inventory.getItem(player.selectedSlot);
    } catch (error) {
      return null;
    }
  }
  /**
   *
   * @param {Player} player
   * @param {String} pos
   * @param {String} place
   * @param {Boolean} resultActionbar
   * @returns void
   * @example tp(player, '0 0 0', 'spawn', po.Q('tp', player))
   */
  tp(player, pos, place, resultActionbar = false, obj, text) {
    try {
      player.runCommand("effect @s clear");
    } catch (e) {}
    let befplace
    if (obj && obj.on) {
      let {P, C} = getPlace(obj.place, '')
      befplace = `§${C}◙ §3${P}§r > `
    }
    
    let {P, C, rot} = getPlace(place, text)
    player.runCommand(`tp ${pos}${rot != undefined ? ` ${rot}` : ''}`);
    if (resultActionbar)
      player.runCommand(`title @s actionbar §${C}◙ §3${P} §${C}◙§r`);
    player.runCommand(`tellraw @s {"rawtext":[{"translate":"${befplace?befplace:''}§${C}◙ §3${P}"}]}`);
  }
  /**
   * Gets the inventory of a entity
   * @param {Entity} entity entity you want to get
   * @param {ItemStack} item item you want to add
   * @returns {void}
   * @example giveItem(Entity, itemstack);
   */
  giveItem(entity, item) {
    const inventory = entity.getComponent("minecraft:inventory").container;
    inventory.addItem(item);
  }
  /**
   * Get the current chunk of a entity
   * @param {Entity} entity entity to check
   * @returns {Object}
   * @example getCurrentChunk(Entity);
   */
  getCurrentChunk(entity) {
    return {
      x: Math.floor(entity.location.x / 16),
      z: Math.floor(entity.location.z / 16),
    };
  }
  /**
   * Gets the cuboid positions of a entitys chunk
   * @param {Entity} entity entity to check
   * @returns {Object}
   * @example getChunkCuboidPositions(Entity);
   */
  getChunkCuboidPositions(entity) {
    const chunk = this.getCurrentChunk(entity);
    const pos1 = new BlockLocation(chunk.x * 16, -63, chunk.z * 16);
    const pos2 = pos1.offset(16, 383, 16);
    return {
      pos1: pos1,
      pos2: pos2,
    };
  }
  /**
   * Converts a location to a block location
   * @param {Location} loc a location to convert
   * @returns {BlockLocation}
   */
  locationToBlockLocation(loc) {
    return new BlockLocation(
      Math.floor(loc.x),
      Math.floor(loc.y),
      Math.floor(loc.z)
    );
  }
  locationToBlockLocationn(loc) {
    return new BlockLocation(
      Math.round(loc.x),
      Math.round(loc.y),
      Math.round(loc.z)
    );
  }

  getChunkBorderOutline(entity) {
    const { pos1, pos2 } = this.getChunkCuboidPositions(entity);
    const values = {
      xmin: Math.min(pos1.x, pos2.x),
      xmax: Math.max(pos1.x, pos2.x),
      ymin: Math.min(pos1.y, pos2.y),
      ymax: Math.max(pos1.y, pos2.y),
      zmin: Math.min(pos1.z, pos2.z),
      zmax: Math.max(pos1.z, pos2.z),
      get rada() {
        return (this.xmax - this.xmin) / 2;
      },
      get radb() {
        return (this.ymax - this.ymin) / 2;
      },
      get radc() {
        return (this.zmax - this.zmin) / 2;
      },
      get cx() {
        return (this.xmax + this.xmin) / 2;
      },
      get cy() {
        return (this.ymax + this.ymin) / 2;
      },
      get cz() {
        return (this.zmax + this.zmin) / 2;
      },
    };
    const condition = new Function(
      "x, y, z, {xmin, xmax, ymin, ymax, zmin, zmax, cx, cy, cz}, rad",
      `return ${SHAPES.border_line}`
    );
    const locations = [];
    for (let x = values.xmin - values.cx; x <= values.xmax - values.cx; x++) {
      for (let y = values.ymin - values.cy; y <= values.ymax - values.cy; y++) {
        for (
          let z = values.zmin - values.cz;
          z <= values.zmax - values.cz;
          z++
        ) {
          if (!condition(x, y, z, values, 8)) continue;
          let X = values.cx + x;
          let Y = values.cy + y;
          let Z = values.cz + z;
          locations.push(new BlockLocation(X, Y, Z));
        }
      }
    }
    return locations;
  }
  /**
   * Despawns a entity
   * @param {Entity} entity entity to despawn
   */
  despawn(entity) {
    entity.teleport(new Location(0, -64, 0), entity.dimension, 0, 0);
    entity.kill();
  }
  /**
   * Despawns a entity
   * @param {string} name entity to despawn
   * @return {Player}
   */
  fetch(name) {
    for (const p of world.getPlayers()) {
      if (p.name == name) return p;
    }
  }
}
export const EntityBuild = new EntityBuilder();
