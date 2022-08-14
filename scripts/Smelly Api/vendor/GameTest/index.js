import * as GameTest from "mojang-gametest";
import {
  BlockLocation,
} from "mojang-minecraft";
import { SA } from "../../index.js";

let name = "Simulated"


GameTest.registerAsync("sim", "spawn", async (test) => {
  let suc = false, time = 1000
  const spawnLoc = new BlockLocation(1, 5, 1);
  const pl = test.spawnSimulatedPlayer(spawnLoc, name);
  test.idle(999).then(e=>{suc=true})
  test.succeedWhen(() => {
    if (suc) test.succeed()
    pl.nameTag = name + '\n' + time
    time--
  });
})
.maxTicks(1000)
.structureName("ComponentTests:platform")
  .tag(GameTest.Tags.suiteDebug);


const cmd = new SA.Command({name: 'suc'}, (ctx) => {
  ctx.reply(suc)
  suc = !suc
})
cmd.addSubCommand({name: 'name'}).addOption('aname', 'string').executes((ctx, {aname}) => {
  ctx.reply(name + ' > ' + aname)
  name = aname
})