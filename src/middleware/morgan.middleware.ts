import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

//미들웨어는 router보다 더 먼저 실행이 된다.
//그래서 라우터 시작할 때 요청을 기록하고, next()로 라우터 쪽으로 갔다가 라우터 끝나고 실행되기 때문에
//response.on 비동기를 사용한거임

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  //implements -> 반드시 구현하도록 강제하는거임
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || ''; //header에서 user-agent 있으면 가져오고 없으면 빈 문자열

    response.on('finish', () => {
      //응답이 끝난 경우 실행
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      this.logger.log(
        //console.log가 아니라 Logger.log or this.logger.log 사용함(후자는 new Logger(context)에서 context를 넣어준 경우 사용)
        //-> 이 로그가 어떤거랑 연관돼서 발생한 것인지 모르기 때문에 context로 구분하는거임
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}
