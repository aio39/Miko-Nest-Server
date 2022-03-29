//  string인 경우는 UUID (PeerId === User.uuid)
//  number는 자동 증가 BigInt

// 특정 콘서트(티켓)에 소속된 방마다 몇명의 유저가 들어 있는지
export const rkConTicketPublicRoom = (ticketId: number) =>
  `PublicRoom-${ticketId}`;

//  특정 콘서트(티켓)의 스코어 랭킹
//  user.name : score
export const rkConTicketScoreRanking = (ticketId: number) =>
  `ScoreRanking-${ticketId}`;

// 콘서트(티켓)마다 N분 마다 추가된 점수
export const rkConTicketAddedScoreForM = () => `TiCoAddedScoreForM`;
export const createRpConTicketAddedScoreForM = (
  concertId: number,
  ticketId: number,
  addedScore: number,
): [string, string, number] => [
  rkConTicketAddedScoreForM(),
  concertId + '/' + ticketId,
  addedScore,
];

// 콘서트(티켓)마다 N분 마다 받은 도네이션 액수
export const rkConTicketAmountDoneForM = () => `TiCoAmDoneForM`;
export const createRpConTicketAmountDoneForM = (
  concertId: number,
  ticketId: number,
  amount: number,
): [string, string, number] => [
  rkConTicketAmountDoneForM(),
  concertId + '/' + ticketId,
  amount,
];

// 콘서트(티켓)마다 N분 마다 받은 슈퍼챗 액수
export const rkConTicketAmountSuChatForM = () => `TiCoAmSuChatForM`;
export const createRpConTicketAmountSuChatForM = (
  concertId: number,
  ticketId: number,
  amount: number,
): [string, string, number] => [
  rkConTicketAmountSuChatForM(),
  concertId + '/' + ticketId,
  amount,
];

// 콘서트(티켓)마다 N분 마다 온 챗팅
export const rkConTicketAddedChatForM = () => `TiCoAmChatForM`;
export const createRpConTicketAddedChatForM = (
  concertId: number,
  ticketId: number,
  addedCount: number = 1,
): [string, string, number] => [
  rkConTicketAddedChatForM(),
  concertId + '/' + ticketId,
  addedCount,
];

// 콘서트(티켓)마다 현재 존재하는 유저수
export const rkConTicketEnterUserNum = () => `TiCoEnterUser`;
export const createRpConTicketEnterUserNum = (
  concertId: number,
  ticketId: number,
  addedCount: number = 1,
): [string, string, number] => [
  rkConTicketEnterUserNum(),
  concertId + '/' + ticketId,
  addedCount,
];

// 특정 Quiz(설문)의 각 항문에 대한 응답 횟수
export const rkQuiz = (quizId: number) => `Quiz-${quizId}`;
