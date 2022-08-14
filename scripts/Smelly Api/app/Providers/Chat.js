import { Player, world } from "mojang-minecraft";


export class Chat {
  /**
   * Отправьте сообщение в чат
   * @param {string} текстовое сообщение или код языка
   * @param {string} player Игрок, которому вы хотите транслировать
   * @param {Array<string>} args аргументы языка
   * @returns {any} Для команд, возвращающих данные, возвращает структуру JSON со значениями ответа команды.
   * @example broadcast('Текст', player.name)
   */
  broadcast(text, player, args = []) {
    try {
      args = args.map(String).filter((n) => n);
      text = text.toString().replace(/["]/g, '\\"');
      return this.runCommand(
        `tellraw ${
          player ? `"${player}"` : "@a"
        } {"rawtext":[{"translate":"${text}","with":${JSON.stringify(args)}}]}`
      );
    } catch (error) {
      return { error: true };
    }
  }
  /**
   *Запускает команду
   * @param {string} команда minecraft /command
   * @param {string} размерность: "overworld" | "нижний" | "конец"
   * @param {boolean} debug: true консоль регистрирует команду, иначе она запускает команду
   * @returns {Object}
   * @example runCommand(`say test`)
   */
  runCommand( command,  dimension = "overworld", debug = false, deepdebug = false ) {
    try {
      return debug
        ? console.warn(JSON.stringify(this.runCommand(command)))
        : world.getDimension(dimension).runCommand(command);
    } catch (error) {
      if (deepdebug) {
        console.warn(error);
      }
      return { error: true };
    }
  }
  newCommand(command, dimension = "overworld") {
    try {
      world.getDimension(dimension).runCommand(command);
      return false;
    } catch (error) {
      return true;
    }
  }
  /**
   * Запукает массив команд
   * @param {Array<string>} cmds
   * @returns {Boolean} возврат всех команд выполнен успешно
   * @example rcs([
   * 'clear "Smell of curry" diamond 0 0',
   * 'say Smell of curry has a Diamond!'
   * ]);
   * @author Smell of curry
   */
  rcs(cmds) {
    for (const cmd of cmds) {
      this.runCommand(cmd);
    }
  }
  /**
   * Запускает массив команд на игроке
   * @param {Array<String>} cmds 
   * @param {Player} player 
   */
  debug(cmds, player) {
    for (const cmd of cmds) {
      try {
        player.runCommand(cmd);
      } catch (error) {}
    }
  }
}
