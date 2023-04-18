import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection } from 'amqplib';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class RmqConfigService {
  private logger = new Logger('PmqConfigService');

  constructor(private configService: ConfigService) {}
  createConnection() {
    const host = this.configService.get('IY_RMQ_HOST');
    const port = this.configService.get('IY_RMQ_PORT');
    return connect(`amqp://${host}:${port}`);
  }

  getUri() {
    const uri = this.configService.get('IY_RMQ_URI');
    if (uri) {
      return uri;
    }

    const host = this.configService.get('IY_RMQ_HOST');
    const port = this.configService.get('IY_RMQ_PORT');
    return `amqp://${host}:${port}`;
  }

  async createConnectionObservable(onClose?: () => void, reconnect = 3000) {
    const connectSubject = new BehaviorSubject<Connection>(null);
    const createConnection = async () => {
      try {
        const con = await connect(this.getUri());
        con.once('error', (e) => {
          this.logger.error(e);
        });
        con.once('close', () => {
          this.logger.warn(`${this.getUri()} rmq closed!`);
          onClose?.();
          setTimeout(() => createConnection(), reconnect);
        });
        connectSubject.next(con);
        this.logger.log(`${this.getUri()} rmq connected!`);
      } catch (e) {
        this.logger.error(e);
        setTimeout(() => createConnection(), reconnect);
      }
    };

    await createConnection();
    return connectSubject.asObservable();
  }
}
