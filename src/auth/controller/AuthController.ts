import { Body, Controller, Post, Req, Res, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../service/AuthService";
import { LoginDto } from "../dto/LoginDto";

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: any) {
    const result = await this.authService.login(loginDto, res);
    res.setHeader('Authorization', `${result.access_token}`);
    return res.status(200).json({ message: 'Login successful' });
  }

  @Post('refresh')
  async refresh(@Req() req,@Res() res) {
    if(!req.cookies) throw new UnauthorizedException('Cookies not found');
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    const newAccessToken = await this.authService.refreshToken(refreshToken);
    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
    return res.status(200).json({ message: 'Token refreshed' });
  }

  @Post('oauth/kakao')
  async kakaoLogin(@Req() req: any, @Res() res: any) {
    const accessToken = req.headers.authorization;
    if (!accessToken) throw new UnauthorizedException('No Kakao access token found in headers');

    const kakaoProfile = await this.authService.getKakaoUserProfile(accessToken);
    const user = await this.authService.createOrLoginUserFromKakao(kakaoProfile);
    const result = await this.authService.generateJwtToken(user, res);
    res.setHeader('Authorization', `${result.access_token}`);
    return res.status(200).json({ message: 'Login successful' });
  }

  @Post('oauth/google')
  async googleLogin(@Req() req: any, @Res() res: any) {
    const accessToken = req.headers.authorization;
    if (!accessToken) throw new UnauthorizedException('No Google access token found in headers');

    const googleProfile = await this.authService.getGoogleUserProfile(accessToken);
    const user = await this.authService.createOrLoginUserFromGoogle(googleProfile);
    const result = await this.authService.generateJwtToken(user, res);
    res.setHeader('Authorization', `${result.access_token}`);
    return res.status(200).json({ message: 'Login successful' });
  }

}