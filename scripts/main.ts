import { system, Player, ScriptEventCommandMessageAfterEvent, Vector3, world } from "@minecraft/server";
import {
  VECTOR3_DOWN,
  VECTOR3_EAST,
  VECTOR3_NORTH,
  VECTOR3_SOUTH,
  VECTOR3_UP,
  VECTOR3_WEST,
  Vector3Utils,
} from "@minecraft/math";
import { MinecraftBlockTypes, MinecraftDimensionTypes } from "@minecraft/vanilla-data";

system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
  //コマンド名チェック
  if (ev.id != "mming:numline") return;

  //要素:1:開始位置x, 2:開始位置y, 3:開始位置z, 4:方向, 5:長さ
  const args: string[] = ev.message.split(/ +/);

  //発行者を取得
  const プレイヤー = ev.sourceEntity instanceof Player ? ev.sourceEntity : world.getPlayers()[0];

  //要素数に誤りがある場合は終了
  if (args.length != 5 && args.length != 6) {
    プレイヤー.sendMessage(
      "§c引数の数が正しくありません。使用方法: /numline <x> <y> <z> <direction> <length> [dimension]"
    );
    return;
  }

  //開始位置を取得
  for (let i = 0; i < 3; i++) {
    if (!Number.isInteger(Number(args[i]))) {
      プレイヤー.sendMessage("§c開始位置の値は整数で指定してください。");
      return;
    }
  }
  const 開始座標: Vector3 = { x: Number(args[0]), y: Number(args[1]), z: Number(args[2]) };

  //方向取得 CardinalDirection
  if (!Number.isInteger(Number(args[3]))) {
    プレイヤー.sendMessage("§c方向の値は整数で指定してください。");
    return;
  }
  const 方向 = Number(args[3]);
  if (方向 < 0 || 方向 > 5) {
    プレイヤー.sendMessage("§c方向の値が無効です。");
    return;
  }

  //方向ベクトル取得
  //0:下Down(y-), 1:上Up(y+), 2:北North(z-), 3:南South(z+), 4:西West(x-), 5:東Eastx+)
  const 方向ベクトル: Vector3 =
    方向 == 0
      ? VECTOR3_DOWN
      : 方向 == 1
        ? VECTOR3_UP
        : 方向 == 2
          ? VECTOR3_NORTH
          : 方向 == 3
            ? VECTOR3_SOUTH
            : 方向 == 4
              ? VECTOR3_WEST
              : VECTOR3_EAST;

  //長さ
  if (!Number.isInteger(Number(args[4]))) {
    プレイヤー.sendMessage("§c長さの値は整数で指定してください。");
    return;
  }
  const 長さ = Number(args[4]);
  if (長さ <= 0 || 長さ > 10) {
    プレイヤー.sendMessage("§c長さの値が無効です。");
    return;
  }

  //次元取得
  const 次元 =
    args.length == 5
      ? プレイヤー.dimension
      : args[5].toLowerCase() === "overworld"
        ? world.getDimension(MinecraftDimensionTypes.Overworld)
        : args[5].toLowerCase() === "nether"
          ? world.getDimension(MinecraftDimensionTypes.Nether)
          : args[5].toLowerCase() === "the_end"
            ? world.getDimension(MinecraftDimensionTypes.TheEnd)
            : null;
  //次元チェック
  if (次元 == null) {
    プレイヤー.sendMessage("§c次元の値が無効です。");
    return;
  }

  //抵抗器のカラーコードに対応
  const 数字ブロック配列: MinecraftBlockTypes[] = [
    MinecraftBlockTypes.BlackWool, // No0
    MinecraftBlockTypes.BrownWool, // No1
    MinecraftBlockTypes.RedWool, // No2
    MinecraftBlockTypes.OrangeWool, // No3
    MinecraftBlockTypes.YellowWool, // No4
    MinecraftBlockTypes.GreenWool, // No5
    MinecraftBlockTypes.BlueWool, // No6
    MinecraftBlockTypes.PurpleWool, // No7
    MinecraftBlockTypes.GrayWool, // No8
    MinecraftBlockTypes.WhiteWool, // No9
  ];

  //数字ブロック配列をシャッフルして長さ分取得
  for (let i = 数字ブロック配列.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [数字ブロック配列[i], 数字ブロック配列[j]] = [数字ブロック配列[j], 数字ブロック配列[i]];
  }
  const ランダム数字ブロック配列 = 数字ブロック配列.slice(0, 長さ);

  //ブロック設置ループ
  for (let i = 0; i < ランダム数字ブロック配列.length; i++) {
    const 置換座標: Vector3 = Vector3Utils.add(開始座標, Vector3Utils.scale(方向ベクトル, i));
    次元.setBlockType(置換座標, ランダム数字ブロック配列[i] as MinecraftBlockTypes);
  }
});
