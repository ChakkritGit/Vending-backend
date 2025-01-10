import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { JwtMiddleware } from './middleware/jwt.middleware'
import { DrugsModule } from './drugs/drugs.module'
import { MachineModule } from './machine/machine.module'
import { InventoryModule } from './inventory/inventory.module'
import { PrescriptionsModule } from './prescriptions/prescriptions.module'
import { LoggerMiddleware } from './utils/logger.middleware'
import { OrdersModule } from './orders/orders.module'
import { DispenseModule } from './dispense/dispense.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    UsersModule,
    AuthModule,
    DrugsModule,
    MachineModule,
    InventoryModule,
    PrescriptionsModule,
    OrdersModule,
    DispenseModule,
  ],
})
export class AppModule implements NestModule {
  configure (consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes(
      { path: 'users', method: RequestMethod.GET },
      { path: 'users', method: RequestMethod.POST },
      // { path: 'dispense/:id', method: RequestMethod.GET },
    )
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
