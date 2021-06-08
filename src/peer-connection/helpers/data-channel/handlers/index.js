import MESSAGEProtocolHandler from './MESSAGEProtocolHandler';
import WRQProtocolHandler from './WRQProtocolHandler';
import ACKProtocolHandler from './ACKProtocolHandler';
import dataChunkHandler from './dataChunkHandler';
import CANCELProtocolHandler from './CANCELProtocolHandler';
import ERRORProtocolHandler from './ERRORProtocolHandler';

const dataChannelHandlers = {
  MESSAGEProtocolHandler,
  WRQProtocolHandler,
  ACKProtocolHandler,
  dataChunkHandler,
  CANCELProtocolHandler,
  ERRORProtocolHandler,
};

export default dataChannelHandlers;
