import {Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {UserService} from "../../modules/user/service/UserService";
import * as bcrypt from 'bcrypt';
import {LoginDto} from "../dto/LoginDto";
import {JwtService} from '@nestjs/jwt';
import {User} from "../../modules/user/entity/User";


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);

    if(!user) throw new NotFoundException('User with email not found')

    if (user && await bcrypt.compare(password, user.password))  return user;
    else throw new UnauthorizedException('Incorrect Password');
  }

  async login(loginDto: LoginDto, response: any) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id);

    AuthService.setCookie(response, refreshToken);

    return {
      access_token: `Bearer ${accessToken}`,
    };
  }

  private generateAccessToken(user:User) {
    const payload = {email: user.email, nickname: user.nickname, sub: user.id, role: user.role};
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '60m',
    });
  }

  generateRefreshToken(userId: string) {
    const payload = { userId };
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      expiresIn: '1d',
    });
  }

  private static setCookie(response: any, refreshToken: string) {
    response.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000
    });
  }

  async refreshToken(refreshToken: string) {

      const { userId } = this.jwtService.verify(refreshToken, { secret:  process.env.JWT_SECRET_KEY });
      const user = await this.userService.findByIdForJwt(userId);

    try {
      return this.generateAccessToken(user);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  getTokenFromRequest(req: Request): string | null {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    return authHeader ? authHeader.split(' ')[1] : null;
  }

  async validateUserByToken(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
      return await this.userService.findByToken(decoded.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

}