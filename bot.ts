import { nanoid } from 'nanoid';
import * as io from 'socket.io-client';

// in root
// ts-node bot

const getRandom = (list: any[]) => {
  return list[Math.floor(Math.random() * list.length)];
};

export type MySocket = io.Socket & {
  data: {
    name: string;
  };
};

// 배포 환경에서는 bot 수가 증가하면 끊기네
const BOT_NUM = 20;
const CONCERT_ID = 1;
const TICKET_ID = 1;
const BOT_ID_START = 7;
const SOCKET_URL = 'http://localhost:3001';
// const SOCKET_URL = 'https://nest.mikopj.live';
// 'miko-nest-env-2.eba-wws3vk6p.us-east-1.elasticbeanstalk.com';

const CHAT_INTERVAL_BASE = 1000 * 2;
const DONE_INTERVAL_BASE = 1000 * 0.5;
const SCORE_INTERVAL_BASE = 1000 * 1;

const aList = new Array(BOT_NUM).fill(0);
const socketList: MySocket[] = [];

let roomId = nanoid();

const USER_NAME_LIST = [
  '一歌',
  'K',
  '花里 みのり',
  'ツカサ',
  '咲希',
  'Amia',
  '桐谷 遥',
  'Azusawa',
  'エム',
  '穂波',
  '志歩',
  'enanan',
  'yuki',
  '桃井 愛莉',
  '日野森 志歩',
  'siraishi',
  'shinonome',
  'AOYAMA',
  'ネネ',
  'ルイ',
];

const CHAT_TEXT_LIST = [
  '👏👏👏👏👏👏👏',
  '888888888888888',
  '大好き',
  'おおおおおおおオオオオオオオオオオオオオオオオオ',
  'Y(´▽ `)YY(´▽ `)YY(´▽ `)YY(´▽ `)Y',
  '☆ﾟ+｡☆｡+ﾟ☆ﾟ+｡☆｡+ﾟ☆☆ﾟ+｡☆｡+ﾟ☆ﾟ+｡☆｡+ﾟ☆☆ﾟ+｡☆｡+ﾟ☆ﾟ+｡☆｡+ﾟ☆☆ﾟ+｡☆｡+ﾟ☆ﾟ+｡☆｡+ﾟ☆☆ﾟ+｡☆｡+',
  "└( 'Д')┘ｱﾞｱﾞｱﾞｱﾞｱﾞ",
  'ああああああああああああああああ',
  'あいしてるぞぉぉおおおおおおおお！！！！！！！！！',
  '神神神！！',
  'かわいい(*´ω｀*)',
  '(　ﾟ∀ﾟ)o彡°ﾊｲ！(　ﾟ∀ﾟ)o彡°ﾊｲ！(　ﾟ∀ﾟ)o彡°ﾊｲ！(　ﾟ∀ﾟ)o彡°ﾊｲ！(　ﾟ∀ﾟ)o彡°ﾊｲ',
  '大好き❤❤❤❤❤',
  'やべえ',
  'チキン肌',
  '泣く(´；ω；`)ｳｩｩ',
  '(°∀°")ハイ！(°∀°")ハイ！(°∀°")ハイ！(°∀°")ハイ！(°∀°")ハイ！(°∀°")ハイ！(°∀°")',
  '☆.。.:*・°☆.。.:*・°☆.。.:*・°☆♬✧.｡.☪✦**.｡:✡*✽✪✩..✦:✧♪✡♪*｡✪✩*⋆ *☪⋆♬*゜⋆*✩',
  '☆彡☆彡☆彡☆彡☆彡☆彡☆彡☆彡',
];

const generateChat = () => {
  const chat = {};
  chat['text'] = getRandom(CHAT_TEXT_LIST);
  const random = Math.random();
  if (random < 0.1) {
    chat['amount'] = Math.round(random * 1000) * 100;
  }
  return chat;
};

process.stdin.resume();

aList.forEach((_, idx) => {
  console.log('socket num:', idx);
  const name = USER_NAME_LIST[idx];
  const dbColumnId = BOT_ID_START + idx;
  const uniqueId = nanoid();
  // @ts-ignore
  const aSocket = io.io(SOCKET_URL, {
    autoConnect: true,
    transports: ['polling', 'websocket'],
    secure: true,
  }) as MySocket;
  let score = 0;
  aSocket.data = { name };

  aSocket.on('connect', () => {
    console.log('connected');
    aSocket.emit(
      'fe-new-user-request-join',
      uniqueId,
      roomId, // 4명 마다 바뀜
      { id: dbColumnId, uuid: uniqueId, name },
      CONCERT_ID,
      TICKET_ID,
      dbColumnId, // userTicketId
    );
  });

  aSocket.on('disconnect', (err) => {
    console.log('error', err);
  });

  socketList.push(aSocket);

  setInterval(() => {
    aSocket.emit('fe-send-done', {
      sender: name,
      timestamp: Date.now(),
      ...generateChat(),
      itemId: Math.round(Math.random() * 6),
    });
  }, CHAT_INTERVAL_BASE + Math.floor(Math.random() * 2000));

  setInterval(() => {
    aSocket.emit('fe-send-message', {
      sender: name,
      timestamp: Date.now(),
      ...generateChat(),
    });
  }, DONE_INTERVAL_BASE + Math.floor(Math.random() * 2000));

  setInterval(() => {
    const addedScore = Math.floor(Math.random() * 15);
    score += addedScore;
    // console.log('score', name, score);
    aSocket.emit('fe-update-score', addedScore, score);
  }, SCORE_INTERVAL_BASE + Math.floor(Math.random() * 500));

  if (idx === 0 && idx % 4 === 0) {
    //  4명 마다 방 변경
    roomId = nanoid();
  }
});

function exitHandler(code) {
  console.log('exit', code);
  socketList.forEach((socket) => {
    console.log(socket.data.name, ' left');
    socket.emit('fe-user-left');
  });

  process.exit(1);
}
process.on('SIGINT', exitHandler);
process.on('uncaughtException', exitHandler);
