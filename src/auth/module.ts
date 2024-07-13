import { Module } from '@nestjs/common';
import { AuthController} from "./controller/AuthController";
import { UserModule } from "../modules/user/module";
import { AuthService } from "./service/AuthService";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import * as process from "node:process";


@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
