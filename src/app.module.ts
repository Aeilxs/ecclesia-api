import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        MONGODB_URI: Joi.string().required(),
        REFRESH_JWT_SECRET: Joi.string().required(),
        JWT_TOKEN_EXPIRATION: Joi.string().required(),
        REFRESH_JWT_EXPIRATION: Joi.string().required(),
      }),
      validationOptions: { abortEarly: false },
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGODB_URI }),
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
