import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import {UserService} from "../../modules/user/service/UserService";
import * as bcrypt from 'bcrypt';
import {LoginDto} from "../dto/LoginDto";
import {JwtService} from '@nestjs/jwt';
import {User} from "../../modules/user/entity/User";
import axios from "axios";


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
  async validateUserByTokenWithInterests(token: string): Promise<string | null> {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET_KEY });
      return await this.userService.findWithMostInterest(decoded.sub);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getKakaoUserProfile(accessToken: string): Promise<any> {
    const url = 'https://kapi.kakao.com/v2/user/me';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Error getting Kakao user profile:', error.response?.data || error.message);
      throw new UnauthorizedException('Failed to retrieve Kakao user profile');
    }
  }

  async createOrLoginUserFromKakao(profile: any): Promise<User> {
    const provider = 'kakao';
    const providerAccountId = profile.id;

    try {
      let user = await this.userService.findByOAuthIdentifier(provider, providerAccountId);
      if (!user) {
        user = await this.userService.createUserFromKakaoProfile(provider, profile);
      }
      return user;
    } catch (error) {
      console.error('Error creating or logging in user from Kakao profile:', error.message);
      throw new InternalServerErrorException('Failed to create or login user from Kakao profile');
    }
  }

  async getGoogleUserProfile(accessToken: string): Promise<any> {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo';
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Error getting Google user profile:', error.response?.data || error.message);
      throw new UnauthorizedException('Failed to retrieve Google user profile');
    }
  }

  async createOrLoginUserFromGoogle(profile: any): Promise<User> {
    const provider = 'google';
    const providerAccountId = profile.id;

    try {
      let user = await this.userService.findByOAuthIdentifier(provider, providerAccountId);
      if (!user) {
        user = await this.userService.createUserFromGoogleProfile(provider, profile);
      }
      return user;
    } catch (error) {
      console.error('Error creating or logging in user from Google profile:', error.message);
      throw new InternalServerErrorException('Failed to create or login user from Google profile');
    }
  }


  async generateJwtToken(user: User, response: any) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user.id.toString());

    AuthService.setCookie(response, refreshToken);

    return {
      access_token: `Bearer ${accessToken}`,
    };
  }
}