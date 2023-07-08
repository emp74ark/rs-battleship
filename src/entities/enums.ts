export enum ServerType {
  http = 'HTTP',
  ws = 'WS',
}

export enum Color {
  Reset = '\x1b[0m',
  Bright = '\x1b[1m',
  Dim = '\x1b[2m',
  Underscore = '\x1b[4m',
  Blink = '\x1b[5m',
  Reverse = '\x1b[7m',
  Hidden = '\x1b[8m',
  FgBlack = '\x1b[30m',
  FgRed = '\x1b[31m',
  FgGreen = '\x1b[32m',
  FgYellow = '\x1b[33m',
  FgBlue = '\x1b[34m',
  FgMagenta = '\x1b[35m',
  FgCyan = '\x1b[36m',
  FgWhite = '\x1b[37m',
  FgGray = '\x1b[90m',
  BgBlack = '\x1b[40m',
  BgRed = '\x1b[41m',
  BgGreen = '\x1b[42m',
  BgYellow = '\x1b[43m',
  BgBlue = '\x1b[44m',
  BgMagenta = '\x1b[45m',
  BgCyan = '\x1b[46m',
  BgWhite = '\x1b[47m',
  BgGray = '\x1b[100m',
}

export enum WsAction {
  reg = 'reg', // player registration/login
  create_room = 'create_room',
  single_play = 'single_play',
  add_user_to_room = 'add_user_to_room',
  create_game = 'create_game', // game id and enemy id
  add_ships = 'add_ships',
  start_game = 'start_game', // information about game and player's ships positions
  turn = 'turn', // who is shooting now
  attack = 'attack', // coordinates of shot and status
  finish = 'finish', // id of the winner
  update_room = 'update_room', // list of rooms and players in rooms
  update_winners = 'update_winners', // send score table to players
}

export enum BroadcastType {
  personal = 'personal',
  opposer = 'opposer',
  public = 'public',
}
