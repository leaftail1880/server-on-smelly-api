import {
  world,
  BlockLocation,
  MinecraftBlockTypes,
  Player,
} from "mojang-minecraft";
import { SA } from "../../../../index.js";
import { configuration } from "../config.js";
import { Cuboid } from "../utils/Cuboid.js";
import { WorldEditBuild } from "./WorldEditBuilder.js";

export class Shape {
  /**
   * Sets Pos1 To a new Block Location
   * @param {String} shape shape equation to caculate
   * @param {BlockLocation} pos location to generate shape
   * @param {Array<string>} blocks blocks to use to fill block
   * @param {number} rad size of sphere
   * @returns {void}
   * @example new Shape(DefaultModes.sphere,BlockLocation, ["stone", "wood"], 10);
   */
  constructor(shape, pos, blocks, rad) {
    this.shape = shape;
    this.blocks = blocks;
    this.pos = pos;
    this.rad = rad;
    this.pos1 = pos.offset(-rad, -rad, -rad);
    this.pos2 = pos.offset(rad, rad, rad);

    WorldEditBuild.backup(this.pos1, this.pos2);

    this.values = new Cuboid(this.pos1, this.pos2);

    this.generate();
  }
  /**
   * Generates the shape to location
   */
  async generate() {
    try {
      const blocks = Math.pow(this.rad * 2, 3);
      let blocksSet = 0;
      for (let x = -this.rad; x <= this.rad; x++) {
        for (let y = -this.rad; y <= this.rad; y++) {
          for (let z = -this.rad; z <= this.rad; z++) {
            if (!this.condition(x, y, z)) continue;
            const location = new BlockLocation(
              this.pos.x + x,
              this.pos.y + y,
              this.pos.z + z
            );
            if (this.blocks.find(e => e.split('.')[1])) {
              const block = this.blocks[~~(Math.random() * this.blocks.length)]
              SA.Build.chat.runCommand(`setblock ${location.x} ${location.y} ${location.z} ${block.split('.')[0]} ${block.split('.')[1] ? block.split('.')[1] : ''}`)
            } else {
              const block = MinecraftBlockTypes.get(
                "minecraft:" + this.blocks[~~(Math.random() * this.blocks.length)]
              );
              world.getDimension("overworld").getBlock(location).setType(block);
            }

            blocksSet++;
          }
        }
        if (blocksSet >= configuration.BLOCKS_BEFORE_AWAIT) {
          await SA.Utilities.time.sleep(configuration.TICKS_TO_SLEEP);
          blocksSet = 0;
        }
      }
    } catch (error) {
      console.warn(error + error.stack);
    }
  }
  /**
   * Gets the relavent values for shape generation
   */
  getValues() {
    return {
      xmin: Math.min(this.pos1.x, this.pos2.x),
      xmax: Math.max(this.pos1.x, this.pos2.x),
      ymin: Math.min(this.pos1.y, this.pos2.y),
      ymax: Math.max(this.pos1.y, this.pos2.y),
      zmin: Math.min(this.pos1.z, this.pos2.z),
      zmax: Math.max(this.pos1.z, this.pos2.z),
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
  }
  /**
   * Tests weather the courrent coordinate should have a block there
   * @param {number} x x number to test
   * @param {number} y y number to test
   * @param {number} z z number to test
   */
  condition(x, y, z) {
    return new Function(
      "x, y, z, {xMin, xMax, yMin, yMax, zMin, zMax, xCenter, yCenter, zCenter, xRadius, yRadius, zRadius}, rad",
      `return ${this.shape}`
    )(x, y, z, this.values, this.rad);
  }
}

export class spawn {
  /**
   * @returns {void}
   * @param {boolean} remove
   */
  constructor(pos1x, pos1z, pos2x, pos2z, remove = false) {
    this.x1 = pos1x;
    this.x2 = pos2x;
    this.z1 = pos1z;
    this.z2 = pos2z;
    this.r = remove

    WorldEditBuild.backup(
      new BlockLocation(this.x1, -64, this.z1),
      new BlockLocation(this.x2, -64, this.z2)
    );

    this.generate();
  }
  /**
   * Generates the shape to location
   */
  async generate() {
    try {
      let v = {
        xmin: Math.min(this.x1, this.x2),
        xmax: Math.max(this.x1, this.x2),
        zmin: Math.min(this.z1, this.z2),
        zmax: Math.max(this.z1, this.z2),
      };
      let blocksSet = 0;
      for (let x = v.xmin; x <= v.xmax; x++) {
        for (let z = v.zmin; z <= v.zmax; z++) {
          world
            .getDimension("overworld")
            .getBlock(new BlockLocation(x, -64, z))
            .setType(MinecraftBlockTypes.get(!this.r ? "minecraft:deny" : "minecraft:bedrock"));
          blocksSet++;
        }
        if (blocksSet >= configuration.BLOCKS_BEFORE_AWAIT) {
          await SA.Utilities.time.sleep(configuration.TICKS_TO_SLEEP);
          blocksSet = 0;
        }
      }
    } catch (error) {
      console.warn(error + error.stack);
    }
  }
}
