import { BeforeChatEvent, ItemStack } from "mojang-minecraft";
import { SA } from "../../../index.js";

export class CommandCallback {
  /**
   * Returns a commands callback
   * @param {BeforeChatEvent} data chat data that was used
   * @param {Array<string>} args aguments used this will exclude command name and subcommand name
   * @param {Object<any>} options same object names as input
   * @example new CommandCallback(BeforeChatEvent, ["2", "sd"], ["size"])
   */
  constructor(data, args, options) {
    this.data = data;
    this.args = args;
    this.sender = data.sender;
  }
  /**
   * Replys to the sender of a command callback
   * @param {string} text Message or a lang code
   * @param {Array<string>} args lang arguments
   * @example ctx.reply('Hello World!');
   */
  reply(text, args = []) {
    SA.Providers.chat.broadcast(text, this.sender.name, args);
  }
  /**
   * Runs a command on player
   * @param {string} command Message or a lang code
   * @example ctx.run('say hey');
   */
  run(command, debug) {
    SA.Providers.chat.runCommand(
      `execute as "${this.sender.name}" run ${command}`
    );
    if (debug) console.warn(command);
   }
  /**
   * Replys to the sender that a error has occured
   * @param {string} arg Parameter that was invalid
   * @example ctx.invalidArg('player');
   */
  invalidArg(arg) {
    let a = arg ?? ''
    if (arg == NaN || arg == undefined) a = ''
    SA.Providers.chat.broadcast(`§4► §c"},{"translate":"` +
      `commands.generic.parameter.invalid`,
      this.sender.name,
      [`§f${a}§c`]
    );
  }
  /**
   * Replys to the sender that a error has occured
   * @param {string} arg Parameter that was invalid
   * @example ctx.invalidPermission();
   */
  invalidPermission() {
    SA.Providers.chat.broadcast(
      `commands.generic.permission.selector`,
      this.sender.name
    );
  }
  /**
   * Gives the sender a item
   * @param {ItemStack} item Item to give
   * @example ctx.give(ItemStack);
   */
  give(item) {
    SA.Models.entity.giveItem(this.sender, item);
  }
}
